import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { CreatePromocaoDTO, UpdatePromocaoDTO } from "../dto/promocao.dto";
import { Periodo, getRanges } from "../utils/dateRange";
import { StatusPedido } from "@prisma/client";
import { validateCombosDoRestaurante, validateProdutosDoRestaurante } from "../utils/validate-ownership";

const promocaoSelect = {
  id:           true,
  nome:         true,
  ativo:        true,
  descricao:    true,
  desconto:     true,
  tempoPreparo: true,
  createdAt:    true,
  updatedAt:    true,
  combos: {
    select: {
      quantidade: true,
      combo: {
        select: {
          id: true, nome: true, preco: true, ativo: true, tempoPreparo: true,
          produtos: {
            select: {
              quantidade: true,
              produto: { select: { id: true, nome: true, precoVenda: true, precoProducao: true, categoria: true } },
            },
          },
        },
      },
    },
  },
  produtos: {
    select: {
      quantidade: true,
      produto: {
        select: { id: true, nome: true, precoVenda: true, precoProducao: true, ativo: true, categoria: true },
      },
    },
  },
};

function calcPrecos(p: {
  desconto:  number | null;
  combos:    { quantidade: number; combo: { preco: number } }[];
  produtos:  { quantidade: number; produto: { precoVenda: number } }[];
}) {
  const precoTotal =
    p.combos.reduce((s, c) => s + c.combo.preco * c.quantidade, 0) +
    p.produtos.reduce((s, pr) => s + pr.produto.precoVenda * pr.quantidade, 0);
  const precoReal =
    p.desconto != null ? precoTotal * (1 - p.desconto / 100) : null;
  return { precoTotal, precoReal };
}

function withPrecos<T extends { desconto: number | null; combos: { quantidade: number; combo: { preco: number } }[]; produtos: { quantidade: number; produto: { precoVenda: number } }[] }>(p: T) {
  return { ...p, ...calcPrecos(p) };
}

export const listarPromocoes = async (busca?: string, incluirInativos = false) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const rows = await prisma.promocao.findMany({
    where: {
      restauranteId,
      ...(!incluirInativos && { ativo: true }),
      ...(busca && { nome: { contains: busca } }),
    },
    select:  promocaoSelect,
    orderBy: { nome: "asc" },
  });
  return rows.map(withPrecos);
};

export const buscarPromocao = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const row = await prisma.promocao.findFirst({
    where:  { id, restauranteId },
    select: promocaoSelect,
  });
  return row ? withPrecos(row) : null;
};

export const criarPromocao = async (dto: CreatePromocaoDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  await Promise.all([
    dto.combos?.length   ? validateCombosDoRestaurante(dto.combos.map(c => c.id), restauranteId)   : Promise.resolve(),
    dto.produtos?.length ? validateProdutosDoRestaurante(dto.produtos.map(p => p.id), restauranteId) : Promise.resolve(),
  ]);

  const row = await prisma.promocao.create({
    data: {
      nome:          dto.nome,
      desconto:      dto.desconto,
      descricao:     dto.descricao,
      tempoPreparo:  dto.tempoPreparo,
      restauranteId,
      ...(dto.combos?.length && {
        combos: { create: dto.combos.map(({ id, quantidade }) => ({ comboId: id, quantidade })) },
      }),
      ...(dto.produtos?.length && {
        produtos: { create: dto.produtos.map(({ id, quantidade }) => ({ produtoId: id, quantidade })) },
      }),
    },
    select: promocaoSelect,
  });
  return withPrecos(row);
};

export const atualizarPromocao = async (promocaoId: number, dto: UpdatePromocaoDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.promocao.findFirst({ where: { id: promocaoId, restauranteId } });
  if (!existe) return null;

  const { combos, produtos, ...campos } = dto;

  await Promise.all([
    combos?.length   ? validateCombosDoRestaurante(combos.map(c => c.id), restauranteId)     : Promise.resolve(),
    produtos?.length ? validateProdutosDoRestaurante(produtos.map(p => p.id), restauranteId) : Promise.resolve(),
  ]);

  await prisma.$transaction(async (tx) => {
    await tx.promocao.update({ where: { id: promocaoId, restauranteId }, data: campos as any });

    if (combos !== undefined) {
      await tx.promocaoCombo.deleteMany({ where: { promocaoId } });
      if (combos.length) {
        await tx.promocaoCombo.createMany({
          data: combos.map(({ id: comboId, quantidade }) => ({ promocaoId, comboId, quantidade })),
        });
      }
    }

    if (produtos !== undefined) {
      await tx.promocaoProduto.deleteMany({ where: { promocaoId } });
      if (produtos.length) {
        await tx.promocaoProduto.createMany({
          data: produtos.map(({ id: produtoId, quantidade }) => ({ promocaoId, produtoId, quantidade })),
        });
      }
    }
  });

  return buscarPromocao(promocaoId);
};

export const toggleAtivo = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.promocao.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  const row = await prisma.promocao.update({
    where:  { id, restauranteId },
    data:   { ativo: !existe.ativo },
    select: promocaoSelect,
  });
  return withPrecos(row);
};

export const deletarPromocao = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.promocao.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  await prisma.promocao.delete({ where: { id, restauranteId } });
  return true;
};

export const getDesempenho = async (id: number, periodo: Periodo) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { atual } = getRanges(periodo);
  const status = StatusPedido.FINALIZADO;
  type Row = { qtd: bigint | number; receita: number | string };
  const [rows] = await prisma.$queryRaw<Row[]>`
    SELECT SUM(pi.quantidade) AS qtd,
           CAST(SUM(pi.quantidade * pi.precoUnitario) AS DECIMAL(10,2)) AS receita
    FROM pedido_itens pi
    JOIN pedidos ped ON ped.id = pi.pedidoId
    WHERE ped.restauranteId = ${restauranteId}
      AND ped.status        = ${status}
      AND ped.createdAt    >= ${atual.inicio}
      AND ped.createdAt     < ${atual.fim}
      AND pi.promocaoId     = ${id}
  `;
  return { qtdVendida: Number(rows?.qtd ?? 0), receita: Number(rows?.receita ?? 0) };
};
