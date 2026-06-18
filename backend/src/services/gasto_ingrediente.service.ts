import { RequestContext } from "../utils/request-context";
import prisma from "../config/prisma";

const includeIngredientes = {
  ingredientes: {
    include: {
      ingrediente: { select: { id: true, nome: true, unidade: true } },
    },
  },
};

export const findAll = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gastos = await prisma.gastoIngrediente.findMany({
    where: { restauranteId },
    orderBy: { createdAt: "desc" },
    include: includeIngredientes,
  });
  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  return { gastos, total };
};

export const findByMesAno = async (mes: number, ano: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gastos = await prisma.gastoIngrediente.findMany({
    where: { restauranteId, mes, ano },
    orderBy: { createdAt: "desc" },
    include: includeIngredientes,
  });
  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  return { gastos, total };
};

export const create = async (data: {
  nome: string;
  valor: number;
  descricao?: string;
  mes: number;
  ano: number;
  ingredientes?: { id: number; quantidade: number }[];
}) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { ingredientes, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const gasto = await tx.gastoIngrediente.create({
      data: {
        ...rest,
        restauranteId,
        ingredientes: ingredientes?.length
          ? {
              create: ingredientes.map(({ id, quantidade }) => ({
                ingredienteId: id,
                quantidade,
              })),
            }
          : undefined,
      },
      include: includeIngredientes,
    });

    if (ingredientes?.length) {
      await Promise.all(
        ingredientes.map(({ id, quantidade }) =>
          tx.ingrediente.update({
            where: { id },
            data: { quantidadeAtual: { increment: quantidade } },
          })
        )
      );
    }

    return gasto;
  });
};

export const update = async (
  id: number,
  data: {
    nome?: string;
    valor?: number;
    descricao?: string;
    ingredientes?: { id: number; quantidade: number }[];
  }
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { ingredientes, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const gasto = await tx.gastoIngrediente.findFirst({
      where: { id, restauranteId },
    });
    if (!gasto) return null;

    if (ingredientes !== undefined) {
      const antigas = await tx.gastoIngredienteIngrediente.findMany({
        where: { gastoIngredienteId: id },
      });

      if (antigas.length) {
        await Promise.all(
          antigas.map((a) =>
            tx.ingrediente.update({
              where: { id: a.ingredienteId },
              data: { quantidadeAtual: { decrement: a.quantidade } },
            })
          )
        );
      }

      await tx.gastoIngredienteIngrediente.deleteMany({
        where: { gastoIngredienteId: id },
      });

      if (ingredientes.length) {
        await tx.gastoIngredienteIngrediente.createMany({
          data: ingredientes.map(({ id: ingId, quantidade }) => ({
            gastoIngredienteId: id,
            ingredienteId: ingId,
            quantidade,
          })),
        });

        await Promise.all(
          ingredientes.map(({ id: ingId, quantidade }) =>
            tx.ingrediente.update({
              where: { id: ingId },
              data: { quantidadeAtual: { increment: quantidade } },
            })
          )
        );
      }
    }

    return tx.gastoIngrediente.update({
      where: { id },
      data: rest,
      include: includeIngredientes,
    });
  });
};

export const remove = async (id: number, reverterEstoque = false) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  return prisma.$transaction(async (tx) => {
    const gasto = await tx.gastoIngrediente.findFirst({
      where: { id, restauranteId },
    });
    if (!gasto) return null;

    if (reverterEstoque) {
      const juncoes = await tx.gastoIngredienteIngrediente.findMany({
        where: { gastoIngredienteId: id },
      });
      if (juncoes.length) {
        await Promise.all(
          juncoes.map((j) =>
            tx.ingrediente.update({
              where: { id: j.ingredienteId },
              data: { quantidadeAtual: { decrement: j.quantidade } },
            })
          )
        );
      }
    }

    await tx.gastoIngrediente.delete({ where: { id } });
    return { deleted: true };
  });
};
