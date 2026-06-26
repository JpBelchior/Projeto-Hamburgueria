import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { Periodo, getRanges } from "../utils/dateRange";
import { StatusPedido } from "@prisma/client";
import { validateProdutosDoRestaurante } from "../utils/validate-ownership";

const comboSelect = {
  id:           true,
  nome:         true,
  descricao:    true,
  preco:        true,
  ativo:        true,
  tempoPreparo: true,
  createdAt:    true,
  produtos: {
    select: {
      quantidade: true,
      produto: { select: { id: true, nome: true, precoVenda: true, precoProducao: true } },
    },
  },
};

export const listarCombos = async (busca?: string, incluirInativos = false) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  return prisma.combo.findMany({
    where: {
      restauranteId,
      ...(!incluirInativos && { ativo: true }),
      ...(busca && { nome: { contains: busca } }),
    },
    select:  comboSelect,
    orderBy: { nome: "asc" },
  });
};

export const buscarCombo = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const combo = await prisma.combo.findFirst({
    where:  { id, restauranteId },
    select: comboSelect,
  });
  if (!combo) return null;

  const [promocoesQueContem, promocoesAExcluir] = await Promise.all([
    // todas as promoções que contêm este combo
    prisma.promocaoCombo.findMany({
      where:  { comboId: id },
      select: { promocao: { select: { nome: true } } },
    }),
    // promoções onde este combo é o único item — serão excluídas junto
    prisma.$queryRaw<{ nome: string }[]>`
      SELECT pr.nome
      FROM promocoes pr
      JOIN promocao_combos pc ON pc.promocaoId = pr.id
      GROUP BY pr.id, pr.nome
      HAVING COUNT(*) = 1
        AND SUM(CASE WHEN pc.comboId = ${id} THEN 1 ELSE 0 END) = 1
        AND (SELECT COUNT(*) FROM promocao_produtos pp WHERE pp.promocaoId = pr.id) = 0
    `,
  ]);

  return {
    ...combo,
    promocoesQueContem: promocoesQueContem.map((pc) => pc.promocao.nome),
    promocoesAExcluir:  promocoesAExcluir.map((p) => p.nome),
  };
};

export const criarCombo = async (data: {
  nome:          string;
  descricao?:    string | null;
  preco:         number;
  tempoPreparo?: number | null;
  produtos?:     { produtoId: number; quantidade: number }[];
}) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  const duplicado = await prisma.combo.findFirst({ where: { nome: data.nome, restauranteId } });
  if (duplicado) {
    const err = Object.assign(new Error("Já existe um combo com esse nome."), { statusCode: 409 });
    throw err;
  }

  const { produtos, ...campos } = data;
  if (produtos?.length) await validateProdutosDoRestaurante(produtos.map(p => p.produtoId), restauranteId);
  const novo = await prisma.combo.create({
    data: {
      ...campos,
      restauranteId,
      ...(produtos?.length && {
        produtos: { create: produtos },
      }),
    },
    select: { id: true },
  });
  return buscarCombo(novo.id);
};

export const atualizarCombo = async (
  id: number,
  data: {
    nome?:          string;
    descricao?:     string | null;
    preco?:         number;
    tempoPreparo?:  number | null;
    produtos?:      { produtoId: number; quantidade: number }[];
  }
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.combo.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  if (data.nome && data.nome !== existe.nome) {
    const duplicado = await prisma.combo.findFirst({ where: { nome: data.nome, restauranteId, NOT: { id } } });
    if (duplicado) {
      const err = Object.assign(new Error("Já existe um combo com esse nome."), { statusCode: 409 });
      throw err;
    }
  }

  const { produtos, ...campos } = data;

  await prisma.$transaction(async (tx) => {
    await tx.combo.update({ where: { id, restauranteId }, data: campos });

    if (produtos !== undefined) {
      if (produtos.length) await validateProdutosDoRestaurante(produtos.map(p => p.produtoId), restauranteId);
      await tx.comboProduto.deleteMany({ where: { comboId: id } });
      if (produtos.length) {
        await tx.comboProduto.createMany({
          data: produtos.map((p) => ({ comboId: id, produtoId: p.produtoId, quantidade: p.quantidade })),
        });
      }
    }
  });

  return buscarCombo(id);
};

export const toggleAtivo = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.combo.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  return prisma.combo.update({
    where:  { id, restauranteId },
    data:   { ativo: !existe.ativo },
    select: comboSelect,
  });
};

export const deletarCombo = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.combo.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  // promoções onde este combo é o único item (sem outros combos e sem produtos)
  const promocoesUnicas = await prisma.$queryRaw<{ id: number }[]>`
    SELECT pr.id
    FROM promocoes pr
    JOIN promocao_combos pc ON pc.promocaoId = pr.id
    GROUP BY pr.id
    HAVING COUNT(*) = 1
      AND SUM(CASE WHEN pc.comboId = ${id} THEN 1 ELSE 0 END) = 1
      AND (SELECT COUNT(*) FROM promocao_produtos pp WHERE pp.promocaoId = pr.id) = 0
  `;
  const idsPromocoesAExcluir = promocoesUnicas.map((p) => Number(p.id));

  await prisma.$transaction(async (tx) => {
    if (idsPromocoesAExcluir.length > 0) {
      await tx.pedidoItem.updateMany({ where: { promocaoId: { in: idsPromocoesAExcluir } }, data: { promocaoId: null } });
      await tx.promocao.deleteMany({ where: { id: { in: idsPromocoesAExcluir } } });
      // PromocaoCombo e PromocaoProduto cascadeiam via onDelete: Cascade em promocaoId
    }
    // deleta o combo — PromocaoCombo das promoções restantes cascadeia via comboId
    await tx.combo.delete({ where: { id, restauranteId } });
    // ComboProduto cascadeia via onDelete: Cascade em comboId
  });

  return true;
};

export const getDesempenho = async (id: number, periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual } = getRanges(periodo);
  const status = StatusPedido.FINALIZADO;

  type Row = { qtd: bigint | number; receita: number | string };

  const [rows] = await prisma.$queryRaw<Row[]>`
    SELECT
      SUM(pi.quantidade)                                             AS qtd,
      CAST(SUM(pi.quantidade * pi.precoUnitario) AS DECIMAL(10,2))  AS receita
    FROM pedido_itens pi
    JOIN pedidos ped ON ped.id = pi.pedidoId
    WHERE ped.restauranteId = ${restauranteId}
      AND ped.status        = ${status}
      AND ped.createdAt    >= ${atual.inicio}
      AND ped.createdAt     < ${atual.fim}
      AND pi.comboId        = ${id}
  `;

  return {
    qtdVendida: Number(rows?.qtd     ?? 0),
    receita:    Number(rows?.receita ?? 0),
  };
};
