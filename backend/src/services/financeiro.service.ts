import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { StatusPedido } from "@prisma/client";
import { DateRange } from "../utils/dateRange";

type TipoFinanceiro = "mensal" | "anual";

function getRange(tipo: TipoFinanceiro, mes: number, ano: number): DateRange {
  if (tipo === "mensal") {
    return {
      inicio: new Date(ano, mes - 1, 1),
      fim:    new Date(ano, mes, 1),
    };
  }
  return {
    inicio: new Date(ano, 0, 1),
    fim:    new Date(ano + 1, 0, 1),
  };
}

async function calcReceita(restauranteId: number, range: DateRange): Promise<number> {
  const agg = await prisma.pedido.aggregate({
    where: {
      restauranteId,
      status:    StatusPedido.FINALIZADO,
      createdAt: { gte: range.inicio, lt: range.fim },
    },
    _sum: { valorTotal: true },
  });
  return agg._sum.valorTotal ?? 0;
}

async function calcCustoIngredientes(
  restauranteId: number,
  range: DateRange,
): Promise<number> {
  const agg = await prisma.gasto.aggregate({
    where: { restauranteId, tipo: "INGREDIENTE", data: { gte: range.inicio, lt: range.fim } },
    _sum:  { valor: true },
  });
  return agg._sum.valor ?? 0;
}

async function calcCustoFuncionarios(
  restauranteId: number,
  range: DateRange,
): Promise<number> {
  const agg = await prisma.gasto.aggregate({
    where: { restauranteId, tipo: "FUNCIONARIO", data: { gte: range.inicio, lt: range.fim } },
    _sum:  { valor: true },
  });
  return agg._sum.valor ?? 0;
}

export const getMetricasFinanceiro = async (
  tipo: TipoFinanceiro,
  mes: number,
  ano: number,
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const range = getRange(tipo, mes, ano);

  const [receita, custoIngredientes, custoFuncionarios] = await Promise.all([
    calcReceita(restauranteId, range),
    calcCustoIngredientes(restauranteId, range),
    calcCustoFuncionarios(restauranteId, range),
  ]);

  const custoTotal = Math.round((custoIngredientes + custoFuncionarios) * 100) / 100;
  const margem     = Math.round((receita - custoTotal) * 100) / 100;
  const gastoCadastrado = custoIngredientes > 0 || custoFuncionarios > 0;

  return {
    receita:            Math.round(receita            * 100) / 100,
    custoIngredientes:  Math.round(custoIngredientes  * 100) / 100,
    custoFuncionarios:  Math.round(custoFuncionarios  * 100) / 100,
    custoTotal,
    margem,
    gastoCadastrado,
  };
};
