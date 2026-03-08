// auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../helpers/jtw.helper";
import { toTokenPayload } from "../dto/auth.dto";

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────

const findUserWithPermissions = (where: { email: string } | { id: number }) =>
  prisma.user.findUnique({
    where,
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: {
                    include: { resource: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "E-mail e senha são obrigatórios." });
      return;
    }

    const user = await findUserWithPermissions({ email }); // ✅ já traz permissões

    if (!user || !user.active) {
      res.status(401).json({ message: "Credenciais inválidas." });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Credenciais inválidas." });
      return;
    }

    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map(
        (rp) => `${rp.permission.resource.name}:${rp.permission.action}`
      )
    );

    const payload = toTokenPayload(user, roles);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      token: accessToken,
      refreshToken,
      expiresIn: 30 * 60,
      user: { ...payload, permissions }, // ✅ ["funcionario:create", ...]
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// REFRESH
// ─────────────────────────────────────────

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token não fornecido." });
      return;
    }

    let decoded: { id: number };

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res
        .status(401)
        .json({ message: "Refresh token inválido ou expirado. Faça login novamente." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { roles: { include: { role: true } } }
    });

    if (!user || !user.active || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: "Sessão inválida. Faça login novamente." });
      return;
    }

    const roles = user.roles.map(ur => ur.role.name);
    const newAccessToken = generateAccessToken(toTokenPayload(user, roles));

    res.json({
      token: newAccessToken,
      expiresIn: 30 * 60,
    });
  } catch (error) {
    console.error("Erro no refresh:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user é AccessTokenPayloadDTO
    const userId = req.user?.id;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    }

    res.json({ message: "Logout realizado com sucesso." });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// ME
// ─────────────────────────────────────────

  export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await findUserWithPermissions({ id: req.user!.id }); // ✅ sempre atualizado

    if (!user || !user.active) {
      res.status(401).json({ message: "Usuário não encontrado." });
      return;
    }

    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map(
        (rp) => `${rp.permission.resource.name}:${rp.permission.action}`
      )
    );

    res.json({ user: { ...toTokenPayload(user, roles), permissions } });
  } catch (error) {
    console.error("Erro no me:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};