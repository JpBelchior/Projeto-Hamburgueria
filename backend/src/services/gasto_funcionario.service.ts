import { RequestContext } from "../utils/request-context";
import prisma from "../config/prisma";

const includeFuncionarios = {
  funcionarios: {
    include: {
      funcionario: {
        select: {
          id: true,
          cargo: true,
          salario: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  },
};

export const findAll = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gastos = await prisma.gastoFuncionario.findMany({
    where: { restauranteId },
    orderBy: { createdAt: "desc" },
    include: includeFuncionarios,
  });
  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  return { gastos, total };
};

export const findByMesAno = async (mes: number, ano: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gastos = await prisma.gastoFuncionario.findMany({
    where: { restauranteId, mes, ano },
    orderBy: { createdAt: "desc" },
    include: includeFuncionarios,
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
  funcionarioIds?: number[];
}) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { funcionarioIds, ...rest } = data;

  return prisma.gastoFuncionario.create({
    data: {
      ...rest,
      restauranteId,
      funcionarios: funcionarioIds?.length
        ? { create: funcionarioIds.map((id) => ({ funcionarioId: id })) }
        : undefined,
    },
    include: includeFuncionarios,
  });
};

export const update = async (
  id: number,
  data: { nome?: string; valor?: number; descricao?: string; funcionarioIds?: number[] }
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gasto = await prisma.gastoFuncionario.findFirst({
    where: { id, restauranteId },
  });
  if (!gasto) return null;

  const { funcionarioIds, ...rest } = data;

  return prisma.gastoFuncionario.update({
    where: { id },
    data: {
      ...rest,
      ...(funcionarioIds !== undefined && {
        funcionarios: {
          deleteMany: {},
          create: funcionarioIds.map((fid) => ({ funcionarioId: fid })),
        },
      }),
    },
    include: includeFuncionarios,
  });
};

export const remove = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gasto = await prisma.gastoFuncionario.findFirst({
    where: { id, restauranteId },
  });
  if (!gasto) return null;

  await prisma.gastoFuncionario.delete({ where: { id } });
  return { deleted: true };
};
