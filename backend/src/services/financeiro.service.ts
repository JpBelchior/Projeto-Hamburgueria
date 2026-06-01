import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";
import { StatusPedido } from "@prisma/client";

type TipoFinanceiro = "mensal" | "anual";

interface DateRange { inicio: Date; fim: Date }

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
  tipo: TipoFinanceiro,
  mes: number,
  ano: number,
): Promise<number> {
  const where =
    tipo === "mensal"
      ? { restauranteId, mes, ano }
      : { restauranteId, ano };

  const agg = await prisma.gastoIngrediente.aggregate({
    where,
    _sum: { valor: true },
  });
  return agg._sum.valor ?? 0;
}

async function calcCustoSalarios(
  restauranteId: number,
  tipo: TipoFinanceiro,
  mes: number,
  ano: number,
): Promise<number> {
  if (tipo === "mensal") {
    const gasto = await prisma.gastoMensal.findUnique({
      where: { mes_ano_restauranteId: { mes, ano, restauranteId } },
    });
    return gasto?.totalSalarios ?? 0;
  }

  const gastos = await prisma.gastoMensal.findMany({
    where: { restauranteId, ano },
  });
  return gastos.reduce((acc, g) => acc + g.totalSalarios, 0);
}

export const getMetricasFinanceiro = async (
  tipo: TipoFinanceiro,
  mes: number,
  ano: number,
) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const range = getRange(tipo, mes, ano);

  const [receita, custoIngredientes, custoSalarios] = await Promise.all([
    calcReceita(restauranteId, range),
    calcCustoIngredientes(restauranteId, tipo, mes, ano),
    calcCustoSalarios(restauranteId, tipo, mes, ano),
  ]);

  const custoTotal = Math.round((custoIngredientes + custoSalarios) * 100) / 100;
  const margem     = Math.round((receita - custoTotal) * 100) / 100;

  // Verifica se há dados de custo registrados para o período
  const gastoCadastrado = custoIngredientes > 0 || custoSalarios > 0;

  return {
    receita:           Math.round(receita           * 100) / 100,
    custoIngredientes: Math.round(custoIngredientes * 100) / 100,
    custoSalarios:     Math.round(custoSalarios     * 100) / 100,
    custoTotal,
    margem,
    gastoCadastrado,
  };
};
