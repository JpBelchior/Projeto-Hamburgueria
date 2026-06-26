import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { StatusPedido } from "@prisma/client";
import { DateRange, Periodo, getRanges } from "../utils/dateRange";
import { validateIngredientesDoRestaurante } from "../utils/validate-ownership";

const produtoSelect = {
  id:                   true,
  nome:                 true,
  descricao:            true,
  categoria:            true,
  precoVenda:           true,
  precoProducao:        true,
  tempoPreparoEstimado: true,
  ativo:                true,
  imagem:               true,
};

export const listarProdutos = async (busca?: string, categoria?: string, incluirInativos = false) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  return prisma.produto.findMany({
    where: {
      restauranteId,
      ...(!incluirInativos && { ativo: true }),
      ...(categoria && { categoria: categoria as any }),
      ...(busca && { nome: { contains: busca } }),
    },
    select:  produtoSelect,
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });
};

export const buscarProduto = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const produto = await prisma.produto.findFirst({
    where:  { id, restauranteId },
    select: {
      ...produtoSelect,
      ingredientes: {
        select: {
          ingredienteId:   true,
          quantidadeUsada: true,
          ingrediente: { select: { nome: true, unidade: true } },
        },
      },
    },
  });
  if (!produto) return null;

  const [combosQueContem, promocoesQueContem, combosAExcluir, promocoesAExcluir] = await Promise.all([
    // todos os combos que contêm este produto
    prisma.comboProduto.findMany({
      where:  { produtoId: id },
      select: { combo: { select: { nome: true } } },
    }),
    // todas as promoções que contêm este produto diretamente
    prisma.promocaoProduto.findMany({
      where:  { produtoId: id },
      select: { promocao: { select: { nome: true } } },
    }),
    // combos onde este é o único produto — serão excluídos junto
    prisma.$queryRaw<{ nome: string }[]>`
      SELECT c.nome
      FROM combos c
      JOIN combo_produtos cp ON cp.comboId = c.id
      GROUP BY c.id, c.nome
      HAVING COUNT(*) = 1
        AND SUM(CASE WHEN cp.produtoId = ${id} THEN 1 ELSE 0 END) = 1
    `,
    // promoções onde este produto é o único item (sem outros produtos e sem combos)
    prisma.$queryRaw<{ nome: string }[]>`
      SELECT pr.nome
      FROM promocoes pr
      JOIN promocao_produtos pp ON pp.promocaoId = pr.id
      GROUP BY pr.id, pr.nome
      HAVING COUNT(*) = 1
        AND SUM(CASE WHEN pp.produtoId = ${id} THEN 1 ELSE 0 END) = 1
        AND (SELECT COUNT(*) FROM promocao_combos pc WHERE pc.promocaoId = pr.id) = 0
    `,
  ]);

  return {
    ...produto,
    combosQueContem:    combosQueContem.map((cp) => cp.combo.nome),
    promocoesQueContem: promocoesQueContem.map((pp) => pp.promocao.nome),
    combosAExcluir:     combosAExcluir.map((c) => c.nome),
    promocoesAExcluir:  promocoesAExcluir.map((p) => p.nome),
  };
};

export const getDesempenho = async (id: number, periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual } = getRanges(periodo);
  const status = StatusPedido.FINALIZADO;

  type Row = { qtd: bigint | number; receita: number | string };

  const [rows] = await prisma.$queryRaw<Row[]>`
    SELECT SUM(qtd) AS qtd, CAST(SUM(receita) AS DECIMAL(10,2)) AS receita
    FROM (
      SELECT SUM(pi.quantidade)                                          AS qtd,
             CAST(SUM(pi.quantidade * pi.precoUnitario) AS DECIMAL(10,2)) AS receita
      FROM pedido_itens pi
      JOIN pedidos ped ON ped.id = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${atual.inicio}
        AND ped.createdAt     < ${atual.fim}
        AND pi.produtoId      = ${id}

      UNION ALL

      SELECT SUM(pi.quantidade * cp.quantidade)                                          AS qtd,
             CAST(SUM(pi.quantidade * cp.quantidade * p.precoVenda) AS DECIMAL(10,2))   AS receita
      FROM pedido_itens  pi
      JOIN combo_produtos cp  ON cp.comboId = pi.comboId
      JOIN produtos       p   ON p.id       = cp.produtoId
      JOIN pedidos        ped ON ped.id     = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${atual.inicio}
        AND ped.createdAt     < ${atual.fim}
        AND cp.produtoId      = ${id}
    ) combined
  `;

  return {
    qtdVendida: Number(rows?.qtd    ?? 0),
    receita:    Number(rows?.receita ?? 0),
  };
};

export const getMetricas = async (periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual, anterior } = getRanges(periodo);
  const status = StatusPedido.FINALIZADO;

  // 1. Cardápio
  const [total, ativos] = await Promise.all([
    prisma.produto.count({ where: { restauranteId } }),
    prisma.produto.count({ where: { restauranteId, ativo: true } }),
  ]);

  // 2. Margem média — (precoVenda - precoProducao) / precoProducao * 100
  const produtosComMargem = await prisma.produto.findMany({
    where:  { restauranteId, ativo: true, precoProducao: { not: null } },
    select: { precoVenda: true, precoProducao: true },
  });
  const margemMedia =
    produtosComMargem.length > 0
      ? produtosComMargem.reduce(
          (sum, p) => (sum) + ((p.precoVenda - p.precoProducao!) / p.precoProducao! * 100),
          0,
        ) / produtosComMargem.length
      : 0;

  // 3. Mais lucrativo — maior (precoVenda - precoProducao) por unidade
  type LucrativoRow = { nome: string; lucro: number | string };
  const [maisLucrativoRow] = await prisma.$queryRaw<LucrativoRow[]>`
    SELECT nome,
           CAST(precoVenda - precoProducao AS DECIMAL(10,2)) AS lucro
    FROM   produtos
    WHERE  restauranteId = ${restauranteId}
      AND  ativo         = true
      AND  precoProducao IS NOT NULL
    ORDER  BY lucro DESC
    LIMIT  1
  `;

  // 4. Campeão de vendas — combo explosion incluída
  type CampeaoRow = { id: bigint | number; nome: string; qtd: bigint | number };

  const getCampeao = (range: DateRange) => prisma.$queryRaw<CampeaoRow[]>`
    SELECT id, nome, SUM(qtd) AS qtd FROM (
      SELECT p.id, p.nome, SUM(pi.quantidade) AS qtd
      FROM pedido_itens pi
      JOIN produtos     p   ON p.id   = pi.produtoId
      JOIN pedidos      ped ON ped.id = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${range.inicio}
        AND ped.createdAt     < ${range.fim}
        AND pi.produtoId IS NOT NULL
        AND p.categoria       = 'PRINCIPAL'
      GROUP BY p.id, p.nome

      UNION ALL

      SELECT p.id, p.nome, SUM(pi.quantidade * cp.quantidade) AS qtd
      FROM pedido_itens   pi
      JOIN combo_produtos  cp  ON cp.comboId  = pi.comboId
      JOIN produtos        p   ON p.id        = cp.produtoId
      JOIN pedidos         ped ON ped.id      = pi.pedidoId
      WHERE ped.restauranteId = ${restauranteId}
        AND ped.status        = ${status}
        AND ped.createdAt    >= ${range.inicio}
        AND ped.createdAt     < ${range.fim}
        AND pi.comboId IS NOT NULL
        AND p.categoria       = 'PRINCIPAL'
      GROUP BY p.id, p.nome
    ) combined
    GROUP BY id, nome
    ORDER BY qtd DESC
    LIMIT 1
  `;

  const [campeaoAtual, campeaoAnterior] = await Promise.all([
    getCampeao(atual),
    getCampeao(anterior),
  ]);

  const qtdAtual    = Number(campeaoAtual[0]?.qtd    ?? 0);
  const qtdAnterior = Number(campeaoAnterior[0]?.qtd ?? 0);
  const variacao    =
    qtdAnterior === 0 ? 0
    : Math.round(((qtdAtual - qtdAnterior) / qtdAnterior) * 1000) / 10;

  return {
    cardapio:      { total, ativos },
    margemMedia:   { valor: Math.round(margemMedia * 10) / 10 },
    maisLucrativo: { nome: maisLucrativoRow?.nome ?? "—", lucro: Number(maisLucrativoRow?.lucro ?? 0) },
    campeaoVendas: { nome: campeaoAtual[0]?.nome ?? "—", qtd: qtdAtual, variacao },
  };
};

export const criarProduto = async (data: {
  nome: string;
  descricao?: string;
  categoria: string;
  precoVenda: number;
  precoProducao?: number;
  tempoPreparoEstimado?: number;
  ingredientes?: { ingredienteId: number; quantidadeUsada: number }[];
}) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  const duplicado = await prisma.produto.findFirst({ where: { nome: data.nome, restauranteId } });
  if (duplicado) {
    const err = Object.assign(new Error("Já existe um produto com esse nome no cardápio."), { statusCode: 409 });
    throw err;
  }

  const { ingredientes, ...campos } = data;
  if (ingredientes?.length) await validateIngredientesDoRestaurante(ingredientes.map(i => i.ingredienteId), restauranteId);
  const novo = await prisma.produto.create({
    data: {
      ...campos as any,
      restauranteId,
      ativo: true,
      ...(ingredientes?.length && {
        ingredientes: { create: ingredientes },
      }),
    },
    select: { id: true },
  });
  return buscarProduto(novo.id);
};

export const atualizarProduto = async (
  id: number,
  data: {
    nome?: string;
    descricao?: string | null;
    categoria?: string;
    precoVenda?: number;
    precoProducao?: number | null;
    tempoPreparoEstimado?: number | null;
    ingredientes?: { ingredienteId: number; quantidadeUsada: number }[];
  }
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.produto.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  if (data.nome && data.nome !== existe.nome) {
    const duplicado = await prisma.produto.findFirst({ where: { nome: data.nome, restauranteId, NOT: { id } } });
    if (duplicado) {
      const err = Object.assign(new Error("Já existe um produto com esse nome no cardápio."), { statusCode: 409 });
      throw err;
    }
  }

  const { ingredientes, ...campos } = data;

  await prisma.produto.update({ where: { id, restauranteId }, data: campos as any });

  if (ingredientes !== undefined) {
    if (ingredientes.length) await validateIngredientesDoRestaurante(ingredientes.map(i => i.ingredienteId), restauranteId);
    await prisma.$transaction([
      prisma.produtoIngrediente.deleteMany({ where: { produtoId: id } }),
      ...ingredientes.map(({ ingredienteId, quantidadeUsada }) =>
        prisma.produtoIngrediente.create({
          data: { produtoId: id, ingredienteId, quantidadeUsada },
        })
      ),
    ]);
  }

  return buscarProduto(id);
};

export const toggleAtivo = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const produto = await prisma.produto.findFirst({ where: { id, restauranteId }, select: { ativo: true } });
  if (!produto) return null;
  return prisma.produto.update({ where: { id, restauranteId }, data: { ativo: !produto.ativo }, select: produtoSelect });
};

export const deletarProduto = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.produto.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  // combos onde este é o único produto → excluir o combo inteiro
  const combosUnicos = await prisma.$queryRaw<{ id: number }[]>`
    SELECT c.id
    FROM combos c
    JOIN combo_produtos cp ON cp.comboId = c.id
    GROUP BY c.id
    HAVING COUNT(*) = 1
      AND SUM(CASE WHEN cp.produtoId = ${id} THEN 1 ELSE 0 END) = 1
  `;
  const idsCombosAExcluir = combosUnicos.map((c) => Number(c.id));

  // promoções onde este produto é o único item (sem outros produtos e sem combos)
  const promocoesUnicas = await prisma.$queryRaw<{ id: number }[]>`
    SELECT pr.id
    FROM promocoes pr
    JOIN promocao_produtos pp ON pp.promocaoId = pr.id
    GROUP BY pr.id
    HAVING COUNT(*) = 1
      AND SUM(CASE WHEN pp.produtoId = ${id} THEN 1 ELSE 0 END) = 1
      AND (SELECT COUNT(*) FROM promocao_combos pc WHERE pc.promocaoId = pr.id) = 0
  `;
  const idsPromocoesAExcluir = promocoesUnicas.map((p) => Number(p.id));

  await prisma.$transaction(async (tx) => {
    // exclui combos que ficariam vazios (remove PromocaoCombo primeiro para evitar FK)
    if (idsCombosAExcluir.length > 0) {
      await tx.promocaoCombo.deleteMany({ where: { comboId: { in: idsCombosAExcluir } } });
      await tx.combo.deleteMany({ where: { id: { in: idsCombosAExcluir } } });
      // ComboProduto cascadeia via onDelete: Cascade em comboId
      // PedidoItem.comboId vira null via SetNull automático do MySQL
    }
    // exclui promoções que ficariam vazias
    if (idsPromocoesAExcluir.length > 0) {
      await tx.pedidoItem.updateMany({ where: { promocaoId: { in: idsPromocoesAExcluir } }, data: { promocaoId: null } });
      await tx.promocao.deleteMany({ where: { id: { in: idsPromocoesAExcluir } } });
      // PromocaoCombo e PromocaoProduto cascadeiam via onDelete: Cascade em promocaoId
    }
    // remove o produto dos combos e promoções restantes
    await tx.comboProduto.deleteMany({ where: { produtoId: id } });
    await tx.promocaoProduto.deleteMany({ where: { produtoId: id } });
    // nulifica referências em pedidos
    await tx.pedidoItem.updateMany({ where: { produtoId: id }, data: { produtoId: null } });
    // deleta o produto
    await tx.produto.delete({ where: { id, restauranteId } });
  });

  return { deleted: true };
};

export const getTopPorCategoria = async (periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual } = getRanges(periodo);
  const status = StatusPedido.FINALIZADO;

  type Row = { id: bigint | number; nome: string; categoria: string; precoVenda: number | string; imagem: string | null; qtd: bigint | number; receita: number | string };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT id, nome, categoria, precoVenda, imagem, qtd, receita
    FROM (
      SELECT id, nome, categoria, precoVenda, imagem, qtd, receita,
             ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY qtd DESC) AS rn
      FROM (
        SELECT p.id, p.nome, p.categoria, p.precoVenda, p.imagem,
               SUM(qtd)     AS qtd,
               CAST(SUM(receita) AS DECIMAL(10,2)) AS receita
        FROM (
          SELECT pi.produtoId AS id,
                 SUM(pi.quantidade)                                   AS qtd,
                 CAST(SUM(pi.quantidade * pi.precoUnitario) AS DECIMAL(10,2)) AS receita
          FROM pedido_itens pi
          JOIN pedidos ped ON ped.id = pi.pedidoId
          WHERE ped.restauranteId = ${restauranteId}
            AND ped.status        = ${status}
            AND ped.createdAt    >= ${atual.inicio}
            AND ped.createdAt     < ${atual.fim}
            AND pi.produtoId IS NOT NULL
          GROUP BY pi.produtoId

          UNION ALL

          SELECT cp.produtoId AS id,
                 SUM(pi.quantidade * cp.quantidade)                              AS qtd,
                 CAST(SUM(pi.quantidade * cp.quantidade * p2.precoVenda) AS DECIMAL(10,2)) AS receita
          FROM pedido_itens   pi
          JOIN combo_produtos  cp  ON cp.comboId  = pi.comboId
          JOIN produtos        p2  ON p2.id       = cp.produtoId
          JOIN pedidos         ped ON ped.id       = pi.pedidoId
          WHERE ped.restauranteId = ${restauranteId}
            AND ped.status        = ${status}
            AND ped.createdAt    >= ${atual.inicio}
            AND ped.createdAt     < ${atual.fim}
            AND pi.comboId IS NOT NULL
          GROUP BY cp.produtoId
        ) combined
        JOIN produtos p ON p.id = combined.id
        GROUP BY p.id, p.nome, p.categoria, p.precoVenda, p.imagem
      ) aggregated
    ) ranked
    WHERE rn = 1
    ORDER BY FIELD(categoria, 'PRINCIPAL', 'ACOMPANHAMENTO', 'BEBIDA', 'SOBREMESA')
  `;

  return rows.map((r) => ({
    id:         Number(r.id),
    nome:       r.nome,
    categoria:  r.categoria,
    precoVenda: Number(r.precoVenda),
    imagem:     r.imagem ?? null,
    qtd:        Number(r.qtd),
    receita:    Number(r.receita),
  }));
};
