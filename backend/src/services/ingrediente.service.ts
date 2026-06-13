import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";

export const listarIngredientes = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.ingrediente.findMany({
    where:   { restauranteId },
    select:  { id: true, nome: true, unidade: true },
    orderBy: { nome: "asc" },
  });
};
