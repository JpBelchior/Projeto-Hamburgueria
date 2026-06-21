import { RequestContext } from "../utils/request-context";
import prisma from "../config/prisma";
import { TipoGasto, CreateGastoDTO, UpdateGastoDTO, ListGastosDTO } from "../dto/gasto.dto";

const includeGasto = {
  ingrediente: {
    include: {
      ingredientes: {
        include: {
          ingrediente: { select: { id: true, nome: true, unidade: true } },
        },
      },
    },
  },
  funcionario: {
    include: {
      funcionarios: {
        include: {
          funcionario: {
            select: {
              id:     true,
              cargo:  true,
              salario: true,
              user:   { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
};

export const findAll = async (filtros: ListGastosDTO = {}) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const where: Record<string, unknown> = { restauranteId };

  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.mes && filtros.ano) {
    where.mes = filtros.mes;
    where.ano = filtros.ano;
  }

  const gastos = await prisma.gasto.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: includeGasto,
  });

  const totais = {
    ingrediente: 0,
    funcionario: 0,
    generico:    0,
    total:       0,
  };

  for (const g of gastos) {
    totais.total += g.valor;
    if (g.tipo === "INGREDIENTE") totais.ingrediente += g.valor;
    else if (g.tipo === "FUNCIONARIO") totais.funcionario += g.valor;
    else totais.generico += g.valor;
  }

  return { gastos, totais };
};

export const findById = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.gasto.findFirst({
    where:   { id, restauranteId },
    include: includeGasto,
  });
};

export const create = async (dto: CreateGastoDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const { tipo, ingredientes, funcionarioIds, ...base } = dto;

  if (tipo === "INGREDIENTE") {
    return prisma.$transaction(async (tx) => {
      const gasto = await tx.gasto.create({
        data: {
          ...base,
          tipo,
          restauranteId,
          ingrediente: {
            create: {
              ingredientes: ingredientes?.length
                ? {
                    create: ingredientes.map(({ id, quantidade }) => ({
                      ingredienteId: id,
                      quantidade,
                    })),
                  }
                : undefined,
            },
          },
        },
        include: includeGasto,
      });

      if (ingredientes?.length) {
        await Promise.all(
          ingredientes.map(({ id, quantidade }) =>
            tx.ingrediente.update({
              where: { id },
              data:  { quantidadeAtual: { increment: quantidade } },
            }),
          ),
        );
      }

      return gasto;
    });
  }

  if (tipo === "FUNCIONARIO") {
    return prisma.gasto.create({
      data: {
        ...base,
        tipo,
        restauranteId,
        funcionario: {
          create: {
            funcionarios: funcionarioIds?.length
              ? { create: funcionarioIds.map((id) => ({ funcionarioId: id })) }
              : undefined,
          },
        },
      },
      include: includeGasto,
    });
  }

  // GENERICO
  return prisma.gasto.create({
    data:    { ...base, tipo, restauranteId },
    include: includeGasto,
  });
};

export const update = async (id: number, dto: UpdateGastoDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gasto = await prisma.gasto.findFirst({ where: { id, restauranteId } });
  if (!gasto) return null;

  const { ingredientes, funcionarioIds, ...base } = dto;

  if (gasto.tipo === "INGREDIENTE" && ingredientes !== undefined) {
    return prisma.$transaction(async (tx) => {
      const antigas = await tx.gastoIngredienteIngrediente.findMany({
        where: { gastoIngredienteId: id },
      });

      if (antigas.length) {
        await Promise.all(
          antigas.map((a) =>
            tx.ingrediente.update({
              where: { id: a.ingredienteId },
              data:  { quantidadeAtual: { decrement: a.quantidade } },
            }),
          ),
        );
      }

      await tx.gastoIngredienteIngrediente.deleteMany({ where: { gastoIngredienteId: id } });

      if (ingredientes.length) {
        await tx.gastoIngredienteIngrediente.createMany({
          data: ingredientes.map(({ id: ingId, quantidade }) => ({
            gastoIngredienteId: id,
            ingredienteId:      ingId,
            quantidade,
          })),
        });

        await Promise.all(
          ingredientes.map(({ id: ingId, quantidade }) =>
            tx.ingrediente.update({
              where: { id: ingId },
              data:  { quantidadeAtual: { increment: quantidade } },
            }),
          ),
        );
      }

      return tx.gasto.update({ where: { id }, data: base, include: includeGasto });
    });
  }

  if (gasto.tipo === "FUNCIONARIO" && funcionarioIds !== undefined) {
    await prisma.gastoFuncionarioFuncionario.deleteMany({ where: { gastoFuncionarioId: id } });

    if (funcionarioIds.length) {
      await prisma.gastoFuncionarioFuncionario.createMany({
        data: funcionarioIds.map((fid) => ({ gastoFuncionarioId: id, funcionarioId: fid })),
      });
    }
  }

  return prisma.gasto.update({ where: { id }, data: base, include: includeGasto });
};

export const remove = async (id: number, reverterEstoque = false) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const gasto = await prisma.gasto.findFirst({ where: { id, restauranteId } });
  if (!gasto) return null;

  if (reverterEstoque && gasto.tipo === "INGREDIENTE") {
    return prisma.$transaction(async (tx) => {
      const juncoes = await tx.gastoIngredienteIngrediente.findMany({
        where: { gastoIngredienteId: id },
      });

      if (juncoes.length) {
        await Promise.all(
          juncoes.map((j) =>
            tx.ingrediente.update({
              where: { id: j.ingredienteId },
              data:  { quantidadeAtual: { decrement: j.quantidade } },
            }),
          ),
        );
      }

      await tx.gasto.delete({ where: { id } });
      return { deleted: true };
    });
  }

  await prisma.gasto.delete({ where: { id } });
  return { deleted: true };
};
