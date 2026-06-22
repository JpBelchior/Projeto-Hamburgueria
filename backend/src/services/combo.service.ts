import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { Periodo, getRanges } from "../utils/dateRange";
import { StatusPedido } from "@prisma/client";

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
  return prisma.combo.findFirst({
    where:  { id, restauranteId },
    select: comboSelect,
  });
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
    await tx.combo.update({ where: { id }, data: campos });

    if (produtos !== undefined) {
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
    where:  { id },
    data:   { ativo: !existe.ativo },
    select: comboSelect,
  });
};

export const deletarCombo = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.combo.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  await prisma.combo.delete({ where: { id } });
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
