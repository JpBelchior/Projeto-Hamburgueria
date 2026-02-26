import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../helpers/jtw.helper"

const prisma = new PrismaClient();

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

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
      res.status(401).json({ message: "Credenciais inválidas." });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Credenciais inválidas." });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Gera ambos os tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(user.id);

    // Persiste o refresh token no banco (invalida o anterior automaticamente)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      token: accessToken,           // expira em 30min
      refreshToken,                  // expira em 7 dias
      expiresIn: 30 * 60,           // segundos → frontend usa para agendar renovação
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// REFRESH — renova o access token silenciosamente
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
      res.status(401).json({ message: "Refresh token inválido ou expirado. Faça login novamente." });
      return;
    }

    // Busca usuário e verifica se o refresh token bate com o salvo no banco
    // (Isso garante que apenas 1 sessão ativa por usuário — ao fazer novo login,
    //  o token antigo é invalidado automaticamente)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.active || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: "Sessão inválida. Faça login novamente." });
      return;
    }

    // Gera novo access token
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

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
// LOGOUT — invalida o refresh token no banco
// ─────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (userId) {
      // Remove o refresh token do banco — sessão encerrada
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
// ME — retorna dados do usuário logado
// ─────────────────────────────────────────

export const me = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  res.json({ user });
};