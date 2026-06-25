import prisma from "../config/prisma";
import { RequestContext } from "../utils/request-context";

const ingredienteSelect = {
  id:              true,
  nome:            true,
  unidade:         true,
  essencial:       true,
  ativo:           true,
  quantidadeAtual: true,
  estoqueMinimo:   true,
  imagem:          true,
};

export const listarIngredientes = async (incluirInativos = false) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.ingrediente.findMany({
    where:   { restauranteId, ...(!incluirInativos && { ativo: true }) },
    select:  ingredienteSelect,
    orderBy: { nome: "asc" },
  });
};

export const buscarIngrediente = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const ingrediente = await prisma.ingrediente.findFirst({
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
  if (!ingrediente) return null;

  // gastos onde este é o único ingrediente — serão excluídos junto
  const gastosAExcluir = await prisma.$queryRaw<{ nome: string }[]>`
    SELECT g.nome
    FROM gastos g
    INNER JOIN gasto_ingrediente_ingredientes gii ON gii.gastoIngredienteId = g.id
    GROUP BY g.id, g.nome
    HAVING COUNT(*) = 1
      AND SUM(CASE WHEN gii.ingredienteId = ${id} THEN 1 ELSE 0 END) = 1
  `;

  // produtos onde este é o único ingrediente — ficariam sem ficha técnica
  const produtosAExcluir = await prisma.$queryRaw<{ nome: string }[]>`
    SELECT p.nome
    FROM produtos p
    INNER JOIN produto_ingredientes pi ON pi.produtoId = p.id
    GROUP BY p.id, p.nome
    HAVING COUNT(*) = 1
      AND SUM(CASE WHEN pi.ingredienteId = ${id} THEN 1 ELSE 0 END) = 1
  `;

  return {
    ...ingrediente,
    gastosAExcluir:   gastosAExcluir.map((g) => g.nome),
    produtosAExcluir: produtosAExcluir.map((p) => p.nome),
  };
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

export const toggleAtivo = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.ingrediente.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;
  return prisma.ingrediente.update({
    where:  { id },
    data:   { ativo: !existe.ativo },
    select: ingredienteSelect,
  });
};

export const deletarIngrediente = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const existe = await prisma.ingrediente.findFirst({ where: { id, restauranteId } });
  if (!existe) return null;

  // gastos onde este é o único ingrediente → excluir o gasto inteiro
  const gastosUnicos = await prisma.$queryRaw<{ id: number }[]>`
    SELECT g.id
    FROM gastos g
    INNER JOIN gasto_ingrediente_ingredientes gii ON gii.gastoIngredienteId = g.id
    GROUP BY g.id
    HAVING COUNT(*) = 1
      AND SUM(CASE WHEN gii.ingredienteId = ${id} THEN 1 ELSE 0 END) = 1
  `;
  const idsGastosAExcluir = gastosUnicos.map((g) => Number(g.id));

  // produtos onde este é o único ingrediente → excluir o produto inteiro
  const produtosUnicos = await prisma.$queryRaw<{ id: number }[]>`
    SELECT p.id
    FROM produtos p
    INNER JOIN produto_ingredientes pi ON pi.produtoId = p.id
    GROUP BY p.id
    HAVING COUNT(*) = 1
      AND SUM(CASE WHEN pi.ingredienteId = ${id} THEN 1 ELSE 0 END) = 1
  `;
  const idsProdutosAExcluir = produtosUnicos.map((p) => Number(p.id));

  await prisma.$transaction(async (tx) => {
    // exclui os gastos onde era o único ingrediente (cascade limpa GastoIngrediente e GastoIngredienteIngrediente)
    if (idsGastosAExcluir.length > 0) {
      await tx.gasto.deleteMany({ where: { id: { in: idsGastosAExcluir } } });
    }
    // exclui os produtos onde era o único ingrediente (com todas as suas dependências)
    if (idsProdutosAExcluir.length > 0) {
      await tx.pedidoItem.updateMany({ where: { produtoId: { in: idsProdutosAExcluir } }, data: { produtoId: null } });
      await tx.comboProduto.deleteMany({ where: { produtoId: { in: idsProdutosAExcluir } } });
      await tx.promocaoProduto.deleteMany({ where: { produtoId: { in: idsProdutosAExcluir } } });
      await tx.produtoIngrediente.deleteMany({ where: { produtoId: { in: idsProdutosAExcluir } } });
      await tx.produto.deleteMany({ where: { id: { in: idsProdutosAExcluir } } });
    }
    // remove apenas o vínculo nos gastos que têm outros ingredientes
    await tx.gastoIngredienteIngrediente.deleteMany({ where: { ingredienteId: id } });
    // remove da ficha técnica dos produtos restantes
    await tx.produtoIngrediente.deleteMany({ where: { ingredienteId: id } });
    // deleta o ingrediente
    await tx.ingrediente.delete({ where: { id } });
  });

  return { deleted: true };
};

export const getMetricas = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const now = new Date();
  const inicioMes  = new Date(now.getFullYear(), now.getMonth(), 1);
  const fimMes     = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const inicioAno  = new Date(now.getFullYear(), 0, 1);
  const fimAno     = new Date(now.getFullYear() + 1, 0, 1);

  const [total, essenciais, gastoMes, gastoAno, abaixoResult] = await Promise.all([
    prisma.ingrediente.count({ where: { restauranteId, ativo: true } }),

    prisma.ingrediente.count({ where: { restauranteId, ativo: true, essencial: true } }),

    prisma.gasto.aggregate({
      where:  { restauranteId, tipo: "INGREDIENTE", data: { gte: inicioMes, lt: fimMes } },
      _sum:   { valor: true },
      _count: { _all: true },
    }),

    prisma.gasto.aggregate({
      where:  { restauranteId, tipo: "INGREDIENTE", data: { gte: inicioAno, lt: fimAno } },
      _sum:   { valor: true },
      _count: { _all: true },
    }),

    prisma.$queryRaw<[{ cnt: bigint }]>`
      SELECT COUNT(*) AS cnt FROM ingredientes
      WHERE restauranteId = ${restauranteId}
        AND ativo         = true
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
