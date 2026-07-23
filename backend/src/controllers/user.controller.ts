import { Request, Response } from "express";
import * as UserService from "../services/user.service";

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: "Informe um nome válido." });
      return;
    }

    const user = await UserService.updateMe(req.user!.id, { name });
    res.json(user);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    await UserService.changePassword(req.user!.id, novaSenha);
    res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
