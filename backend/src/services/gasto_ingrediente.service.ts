import { RequestContext } from "../utils/request-context";
import prisma from "../config/prisma";

export const findByMesAno = async (mes: number, ano: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gastos = await prisma.gastoIngrediente.findMany({
    where: { restauranteId, mes, ano },
    orderBy: { createdAt: "desc" },
  });
  const total = gastos.reduce((acc, g) => acc + g.valor, 0);
  return { gastos, total };
};

export const create = async (data: {
  valor: number;
  descricao?: string;
  mes: number;
  ano: number;
}) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  const gasto = await prisma.gastoIngrediente.create({
    data: { ...data, restauranteId },
  });

  // Cria snapshot de salários se ainda não existe GastoMensal para este mês/ano
  const existe = await prisma.gastoMensal.findUnique({
    where: { mes_ano_restauranteId: { mes: data.mes, ano: data.ano, restauranteId } },
  });

  if (!existe) {
    const agg = await prisma.funcionario.aggregate({
      where: { restauranteId, active: true },
      _sum: { salario: true },
    });
    await prisma.gastoMensal.create({
      data: {
        mes: data.mes,
        ano: data.ano,
        totalSalarios: agg._sum.salario ?? 0,
        restauranteId,
      },
    });
  }

  return gasto;
};

export const update = async (
  id: number,
  data: { valor?: number; descricao?: string }
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gasto = await prisma.gastoIngrediente.findFirst({
    where: { id, restauranteId },
  });
  if (!gasto) return null;

  return prisma.gastoIngrediente.update({ where: { id }, data });
};

export const remove = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gasto = await prisma.gastoIngrediente.findFirst({
    where: { id, restauranteId },
  });
  if (!gasto) return null;

  await prisma.gastoIngrediente.delete({ where: { id } });
  return { deleted: true };
};
