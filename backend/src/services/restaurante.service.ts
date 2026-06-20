import { Cargo } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";
import { toTokenPayload } from "../dto/auth.dto";
import { OnboardingDTO, UpdateRestauranteDTO } from "../dto/restaurante.dto";
import { RequestContext } from "../utils/request-context";
import prisma from "../config/prisma";

export const onboarding = async (data: OnboardingDTO) => {
  const senhaHash = await bcrypt.hash(data.gerente.password, 10);

  const roleAdminRestaurante = await prisma.role.findUnique({
    where: { name: "ADMIN_RESTAURANTE" },
  });

  if (!roleAdminRestaurante) {
    throw new Error("Role ADMIN_RESTAURANTE não encontrada. Execute o seed.");
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const restaurante = await tx.restaurante.create({
      data: {
        nome: data.restaurante.nome,
        cnpj: data.restaurante.cnpj,
        email: data.restaurante.email,
        telefone: data.restaurante.telefone,
        endereco: data.restaurante.endereco,
      },
    });

    const user = await tx.user.create({
      data: {
        name: data.gerente.name,
        cpf: data.gerente.cpf,
        email: data.gerente.email,
        telefone: data.gerente.telefone,
        password: senhaHash,
        roles: {
          create: { roleId: roleAdminRestaurante.id, assignedBy: "onboarding" },
        },
        funcionario: {
          create: { cargo: Cargo.CAIXA, salario: 0, restauranteId: restaurante.id },
        },
      },
      include: {
        funcionario: { select: { restauranteId: true } },
        roles: { include: { role: true } },
      },
    });

    return { restaurante, user };
  });

  const { user } = resultado;
  const roles = user.roles.map((ur) => ur.role.name);
  const restauranteId = user.funcionario?.restauranteId ?? 0;

  const payload = toTokenPayload(user, roles, restauranteId);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return {
    token: accessToken,
    refreshToken,
    expiresIn: 30 * 60,
    user: { ...payload, permissions: [] },
  };
};

export const getMe = async () => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.restaurante.findUnique({
    where: { id: restauranteId },
    select: { id: true, nome: true, cnpj: true, email: true, telefone: true, endereco: true, logo: true },
  });
};

export const update = async (data: UpdateRestauranteDTO) => {
  const restauranteId = RequestContext.getRestauranteId()!;
  return prisma.restaurante.update({
    where: { id: restauranteId },
    data: {
      ...(data.nome !== undefined && { nome: data.nome }),
      ...(data.telefone !== undefined && { telefone: data.telefone }),
      ...(data.endereco !== undefined && { endereco: data.endereco }),
      ...(data.logo !== undefined && { logo: data.logo }),
    },
    select: { id: true, nome: true, cnpj: true, email: true, telefone: true, endereco: true, logo: true },
  });
};
