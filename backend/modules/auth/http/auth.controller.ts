import { Request, Response } from "express";
import { AuthRepository } from "../infra/auth.repository";
import { LoginUseCase } from "../application/use-cases/login";
import { RefreshUseCase } from "../application/use-cases/refresh";
import { LogoutUseCase } from "../application/use-cases/logout";
import { MeUseCase } from "../application/use-cases/me";

const repo = new AuthRepository();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "E-mail e senha são obrigatórios." });
      return;
    }
    const result = await new LoginUseCase(repo).execute(email, password);
    res.json(result);
  } catch (error: any) {
    const isCredentialError = error.message === "Credenciais inválidas.";
    res.status(isCredentialError ? 401 : 500).json({ message: error.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token não fornecido." });
      return;
    }
    const result = await new RefreshUseCase(repo).execute(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.id) await new LogoutUseCase(repo).execute(req.user.id);
    res.json({ message: "Logout realizado com sucesso." });
  } catch {
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const me = (req: Request, res: Response): void => {
  res.json(new MeUseCase().execute(req.user!));
};