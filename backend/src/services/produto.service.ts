import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";

const produtoSelect = {
  id:                   true,
  nome:                 true,
  descricao:            true,
  categoria:            true,
  precoVenda:           true,
  desconto:             true,
  tempoPreparoEstimado: true,
  ativo:                true,
  disponivel:           true,
  imagem:               true,
};

export const listarProdutos = async (busca?: string, categoria?: string) => {
  const restauranteId = RequestContext.getRestauranteId()!;

  return prisma.produto.findMany({
    where: {
      restauranteId,
      ativo:      true,
      disponivel: true,
      ...(categoria && { categoria: categoria as any }),
      ...(busca && {
        nome: { contains: busca },
      }),
    },
    select:  produtoSelect,
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });
};

export const buscarProduto = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.produto.findFirst({
    where:  { id, restauranteId },
    select: produtoSelect,
  });
};
