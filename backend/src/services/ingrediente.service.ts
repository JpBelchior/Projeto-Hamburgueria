import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";

const ingredienteSelect = {
  id:              true,
  nome:            true,
  unidade:         true,
  essencial:       true,
  quantidadeAtual: true,
  estoqueMinimo:   true,
  imagem:          true,
};

export const listarIngredientes = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.ingrediente.findMany({
    where:   { restauranteId },
    select:  ingredienteSelect,
    orderBy: { nome: "asc" },
  });
};

export const buscarIngrediente = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.ingrediente.findFirst({
    where:  { id, restauranteId },
    select: {
      ...ingredienteSelect,
      produtos: {
        select: {
          quantidadeUsada: true,
          produto: { select: { id: true, nome: true, categoria: true } },
        },
      },
    },
  });
};

export const criarIngrediente = async (data: {
  nome:            string;
  unidade:         string;
  quantidadeAtual: number;
  essencial?:      boolean;
  estoqueMinimo?:  number;
  imagem?:         string;
}) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  const existentes = await prisma.ingrediente.findMany({
    where:  { restauranteId },
    select: { nome: true },
  });

  const nomeLower = data.nome?.trim().toLowerCase();
  if (existentes.some(i => i.nome.trim().toLowerCase() === nomeLower)) {
    const err = new Error("Esse ingrediente já está presente no estoque.") as any;
    err.statusCode = 409;
    throw err;
  }

  return prisma.ingrediente.create({
    data:   { ...(data as any), restauranteId },
    select: ingredienteSelect,
  });
};

export const atualizarIngrediente = async (
  id: number,
  data: {
    nome?:            string;
    unidade?:         string;
    quantidadeAtual?: number;
    essencial?:       boolean;
    estoqueMinimo?:   number | null;
    imagem?:          string | null;
  },
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.ingrediente.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  if (data.nome && data.nome.trim().toLowerCase() !== existe.nome.trim().toLowerCase()) {
    const existentes = await prisma.ingrediente.findMany({
      where:  { restauranteId, NOT: { id } },
      select: { nome: true },
    });
    if (existentes.some(i => i.nome.trim().toLowerCase() === data.nome!.trim().toLowerCase())) {
      throw Object.assign(new Error("Esse ingrediente já está presente no estoque."), { statusCode: 409 });
    }
  }

  return prisma.ingrediente.update({
    where:  { id },
    data:   data as any,
    select: ingredienteSelect,
  });
};

export const deletarIngrediente = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.ingrediente.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;
  await prisma.$transaction([
    prisma.produtoIngrediente.deleteMany({ where: { ingredienteId: id } }),
    prisma.ingrediente.delete({ where: { id } }),
  ]);
  return { deleted: true };
};

export const getMetricas = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  const [total, essenciais, gastoMes, gastoAno, abaixoResult] = await Promise.all([
    prisma.ingrediente.count({ where: { restauranteId } }),

    prisma.ingrediente.count({ where: { restauranteId, essencial: true } }),

    prisma.gastoIngrediente.aggregate({
      where: { restauranteId, mes, ano },
      _sum:  { valor: true },
      _count: { _all: true },
    }),

    prisma.gastoIngrediente.aggregate({
      where: { restauranteId, ano },
      _sum:  { valor: true },
      _count: { _all: true },
    }),

    // Prisma não suporta comparação campo < campo na mesma linha — usa raw SQL
    prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(*) AS cnt FROM ingredientes
      WHERE restauranteId = ${restauranteId}
        AND essencial     = true
        AND estoqueMinimo IS NOT NULL
        AND quantidadeAtual < estoqueMinimo
    `,
  ]);

  return {
    total,
    essenciais,
    abaixoDoMinimo: Number(abaixoResult[0].cnt),
    gastoMes: { total: gastoMes._sum.valor  ?? 0, compras: gastoMes._count._all  ?? 0 },
    gastoAno: { total: gastoAno._sum.valor  ?? 0, compras: gastoAno._count._all  ?? 0 },
  };
};
