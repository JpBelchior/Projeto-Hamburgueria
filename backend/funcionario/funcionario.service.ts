import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CreateFuncionarioDTO, UpdateFuncionarioDTO } from "./funcionario.dto";
import { RequestContext } from "../shared/context/request-context";

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// SELECT padrão — shape de retorno do Prisma
// ─────────────────────────────────────────

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
        select: { role: { select: { name: true } } }
      },
      active: true,
    },
  },
};

// ─────────────────────────────────────────
// LISTAR TODOS
// ─────────────────────────────────────────

export const findAll = async () => {
  return prisma.funcionario.findMany({
    select: funcionarioSelect,
    orderBy: { createdAt: "desc" },
  });
};

// ─────────────────────────────────────────
// BUSCAR POR ID
// ─────────────────────────────────────────

export const findById = async (id: number) => {
  return prisma.funcionario.findUnique({
    where: { id },
    select: funcionarioSelect,
  });
};

// ─────────────────────────────────────────
// CRIAR — cria User + Funcionario em transação
// ─────────────────────────────────────────

export const create = async (data: CreateFuncionarioDTO) => {
  const currentUser = RequestContext.getUser();
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
          assignedBy: currentUser?.name ?? "system"
        }))
      },
      funcionario: {
        create: {
          cargo: data.cargo,
          salario: data.salario,
          ...(data.dataAdmissao && {
            dataAdmissao: new Date(data.dataAdmissao),
          }),
        },
      },
    },
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true,
      roles: {
        select: { role: { select: { name: true } } }
      },
      funcionario: {
        select: {
          id: true,
          cargo: true,
          salario: true,
          dataAdmissao: true,
          active: true,
        },
      },
    },
  });
};

// ─────────────────────────────────────────
// ATUALIZAR — atualiza User e/ou Funcionario
// ─────────────────────────────────────────

export const update = async (funcionarioId: number, data: UpdateFuncionarioDTO) => {
  // Busca o userId vinculado
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { userId: true },
  });

  if (!funcionario) return null;

  const { name, cpf, email,telefone, password, cargo, salario } = data;

  // Atualiza User se veio algum campo
  if (name || cpf || email || password) {
    const userUpdate: Record<string, unknown> = {};
    if (name) userUpdate.name = name;
    if (cpf) userUpdate.cpf = cpf;
    if (email) userUpdate.email = email;
    if (password) userUpdate.password = await bcrypt.hash(password, 10);
    if (telefone) userUpdate.telefone = telefone;
    await prisma.user.update({
      where: { id: funcionario.userId },
      data: userUpdate,
    });
  }

  // Atualiza Funcionario se veio algum campo
  if (cargo || salario !== undefined) {
    const funcUpdate: Record<string, unknown> = {};
    if (cargo) funcUpdate.cargo = cargo;
    if (salario !== undefined) funcUpdate.salario = salario;

    await prisma.funcionario.update({
      where: { id: funcionarioId },
      data: funcUpdate,
    });
  }

  return findById(funcionarioId);
};

// ─────────────────────────────────────────
// SOFT DELETE — alterna active do Funcionario e User
// ─────────────────────────────────────────

export const toggleActive = async (funcionarioId: number) => {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { active: true, userId: true },
  });

  if (!funcionario) return null;

  const newActive = !funcionario.active;

  // Atualiza os dois registros em transação
  await prisma.$transaction([
    prisma.funcionario.update({
      where: { id: funcionarioId },
      data: { active: newActive },
    }),
    prisma.user.update({
      where: { id: funcionario.userId },
      data: { active: newActive },
    }),
  ]);

  return findById(funcionarioId);
};

// ─────────────────────────────────────────
// HARD DELETE — remove Funcionario e User permanentemente
// ─────────────────────────────────────────

export const hardDelete = async (funcionarioId: number) => {
  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    select: { userId: true },
  });

  if (!funcionario) return null;

  // Deleta em transação — Funcionario antes, depois User (respeita FK)
  await prisma.$transaction([
    prisma.funcionario.delete({ where: { id: funcionarioId } }),
    prisma.user.delete({ where: { id: funcionario.userId } }),
  ]);

  return { deleted: true };
};