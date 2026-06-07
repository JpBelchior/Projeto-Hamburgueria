import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";

const comboSelect = {
  id:    true,
  nome:  true,
  preco: true,
  ativo: true,
  produtos: {
    select: {
      quantidade: true,
      produto: { select: { id: true, nome: true } },
    },
  },
};

export const listarCombos = async (busca?: string) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  return prisma.combo.findMany({
    where: {
      restauranteId,
      ativo: true,
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
