import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { StatusPedido } from "@prisma/client";
import { DateRange, Periodo, getRanges } from "../utils/dateRange";

const produtoSelect = {
  id:                   true,
  nome:                 true,
  descricao:            true,
  categoria:            true,
  precoVenda:           true,
  desconto:             true,
  tempoPreparoEstimado: true,
  ativo:                true,
  disponivel:           true,
  imagem:               true,
};

export const listarProdutos = async (busca?: string, categoria?: string) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  return prisma.produto.findMany({
    where: {
      restauranteId,
      ativo:      true,
      disponivel: true,
      ...(categoria && { categoria: categoria as any }),
      ...(busca && {
        nome: { contains: busca },
      }),
    },
    select:  produtoSelect,
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });
};

export const buscarProduto = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.produto.findFirst({
    where:  { id, restauranteId },
    select: produtoSelect,
  });
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
          (sum, p) => sum + (p.precoVenda - p.precoProducao!) / p.precoProducao! * 100,
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
