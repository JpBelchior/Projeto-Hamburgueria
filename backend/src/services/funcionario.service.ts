import bcrypt from "bcryptjs";
import { CreateFuncionarioDTO, UpdateFuncionarioDTO } from "../dto/funcionario.dto";
import { RequestContext } from "../utils/request-context";
import { getRoleRank } from "../utils/role-rank.utils";
import prisma from "../config/prisma";

export class InsufficientRankError extends Error {
  constructor() {
    super("Você não tem autoridade para modificar este funcionário.");
    this.name = "InsufficientRankError";
  }
}

const assertOutranks = async (targetUserId: number): Promise<void> => {
  const actingUser = RequestContext.getUser()!;
  const actingRank = getRoleRank(actingUser.roles);

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { roles: { include: { role: true } } },
  });

  const targetRoles = target?.roles.map((ur) => ur.role.name) ?? [];
  const targetRank = getRoleRank(targetRoles);

  if (actingRank <= targetRank) {
    throw new InsufficientRankError();
  }
};

const funcionarioSelect = {
  id: true,
  cargo: true,
  salario: true,
  dataAdmissao: true,
  active: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true,
      telefone: true,
      roles: {
        select: { role: { select: { name: true } } },
      },
      active: true,
    },
  },
};

export const findAll = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.funcionario.findMany({
    where: { restauranteId },
    select: funcionarioSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const findById = async (id: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.funcionario.findFirst({
    where: { id, restauranteId },
    select: funcionarioSelect,
  });
};

export const create = async (data: CreateFuncionarioDTO) => {
  const currentUser = RequestContext.getUser();
  const restauranteId = RequestContext.getRestauranteId()!;
  const senhaHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      telefone: data.telefone,
      password: senhaHash,
      roles: {
        create: data.roles.map((role) => ({
          role: { connect: { id: role.id } },
          assignedBy: currentUser?.name ?? "system",
        })),
      },
      funcionario: {
        create: {
          cargo: data.cargo,
          salario: data.salario,
          restauranteId,
          ...(data.dataAdmissao && { dataAdmissao: new Date(data.dataAdmissao) }),
        },
      },
    },
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true,
      roles: { select: { role: { select: { name: true } } } },
      funcionario: {
        select: { id: true, cargo: true, salario: true, dataAdmissao: true, active: true },
      },
    },
  });
};

export const update = async (funcionarioId: number, data: UpdateFuncionarioDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const funcionario = await prisma.funcionario.findFirst({
    where: { id: funcionarioId, restauranteId },
    select: { userId: true },
  });

  if (!funcionario) return null;

  await assertOutranks(funcionario.userId);

  const { name, cpf, email, telefone, password, cargo, salario, roles } = data;

  if (name || cpf || email || telefone || password) {
    const userUpdate: Record<string, unknown> = {};
    if (name) userUpdate.name = name;
    if (cpf) userUpdate.cpf = cpf;
    if (email) userUpdate.email = email;
    if (telefone) userUpdate.telefone = telefone;
    if (password) userUpdate.password = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: funcionario.userId }, data: userUpdate });
  }

  if (cargo || salario !== undefined) {
    const funcUpdate: Record<string, unknown> = {};
    if (cargo) funcUpdate.cargo = cargo;
    if (salario !== undefined) funcUpdate.salario = salario;
    await prisma.funcionario.update({ where: { id: funcionarioId }, data: funcUpdate });
  }

  if (roles && roles.length > 0) {
    const actingUser = RequestContext.getUser()!;

    if (funcionario.userId === actingUser.id) {
      throw new InsufficientRankError();
    }

    const actingRank = getRoleRank(actingUser.roles);

    const newRoles = await prisma.role.findMany({
      where: { id: { in: roles.map((r) => r.id) } },
      select: { name: true },
    });

    if (getRoleRank(newRoles.map((r) => r.name)) > actingRank) {
      throw new InsufficientRankError();
    }

    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId: funcionario.userId } }),
      ...roles.map((role) =>
        prisma.userRole.create({
          data: {
            userId: funcionario.userId,
            roleId: role.id,
            assignedBy: actingUser.name ?? "system",
          },
        })
      ),
    ]);
  }

  return findById(funcionarioId);
};

export const toggleActive = async (funcionarioId: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const funcionario = await prisma.funcionario.findFirst({
    where: { id: funcionarioId, restauranteId },
    select: { active: true, userId: true },
  });

  if (!funcionario) return null;

  await assertOutranks(funcionario.userId);

  const newActive = !funcionario.active;

  await prisma.$transaction([
    prisma.funcionario.update({ where: { id: funcionarioId }, data: { active: newActive } }),
    prisma.user.update({ where: { id: funcionario.userId }, data: { active: newActive } }),
  ]);

  return findById(funcionarioId);
};

export const getMetricas = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  const baseWhere = {
    restauranteId,
    user: { roles: { none: { role: { name: "ADMIN_RESTAURANTE" } } } },
  };

  const [funcionarios, gastosMes] = await Promise.all([
    prisma.funcionario.findMany({
      where: baseWhere,
      select: { cargo: true, salario: true, active: true },
    }),
    prisma.gasto.aggregate({ where: { restauranteId, mes, ano }, _sum: { valor: true } }),
  ]);

  const total       = funcionarios.length;
  const ativos      = funcionarios.filter((f) => f.active);
  const ativosCount = ativos.length;
  const salarioTotal = ativos.reduce((acc, f) => acc + f.salario, 0);
  const salarioMedio = ativosCount > 0 ? salarioTotal / ativosCount : 0;

  const CARGOS = ["ATENDENTE", "COZINHEIRO", "CAIXA"] as const;
  const porCargo = Object.fromEntries(
    CARGOS.map((cargo) => {
      const fs = ativos.filter((f) => f.cargo === cargo);
      return [
        cargo,
        {
          count:        fs.length,
          salarioMedio: fs.length > 0 ? fs.reduce((s, f) => s + f.salario, 0) / fs.length : 0,
        },
      ];
    }),
  );

  const gastoMensal = gastosMes._sum.valor ?? 0;

  return { total, ativos: ativosCount, inativos: total - ativosCount, salarioTotal, salarioMedio, porCargo, gastoMensal };
};

export const hardDelete = async (funcionarioId: number) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  const funcionario = await prisma.funcionario.findFirst({
    where: { id: funcionarioId, restauranteId },
    select: { userId: true },
  });

  if (!funcionario) return null;

  await assertOutranks(funcionario.userId);

  const adminFuncionario = await prisma.funcionario.findFirst({
    where: {
      restauranteId,
      user: { roles: { some: { role: { name: "ADMIN_RESTAURANTE" } } } },
    },
    select: { id: true },
  });

  if (!adminFuncionario) {
    throw new Error("Não foi possível encontrar o responsável do restaurante para reassociar os pedidos.");
  }

  await prisma.$transaction([
    prisma.pedido.updateMany({
      where: { funcionarioId, restauranteId },
      data: { funcionarioId: adminFuncionario.id },
    }),
    prisma.gastoFuncionarioFuncionario.deleteMany({ where: { funcionarioId } }),
    prisma.funcionario.delete({ where: { id: funcionarioId } }),
    prisma.user.delete({ where: { id: funcionario.userId } }),
  ]);

  return { deleted: true };
};
