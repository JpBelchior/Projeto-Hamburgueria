import { Request, Response } from "express";
import { onboarding, getMe as getMeService, update as updateService } from "../services/restaurante.service";

export const cadastrarRestaurante = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurante, gerente } = req.body;

    if (!restaurante?.nome || !restaurante?.cnpj || !restaurante?.email) {
      res.status(400).json({ message: "Nome, CNPJ e email do restaurante são obrigatórios." });
      return;
    }

    if (!gerente?.name || !gerente?.cpf || !gerente?.email || !gerente?.password) {
      res.status(400).json({ message: "Nome, CPF, email e senha do proprietário são obrigatórios." });
      return;
    }

    const resultado = await onboarding({ restaurante, gerente });
    res.status(201).json(resultado);
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({ message: "CNPJ, email do restaurante ou CPF já cadastrado." });
      return;
    }
    console.error("Erro no onboarding:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getMe = async (_req: Request, res: Response): Promise<void> => {
  try {
    const restaurante = await getMeService();
    if (!restaurante) {
      res.status(404).json({ message: "Restaurante não encontrado." });
      return;
    }
    res.json(restaurante);
  } catch (error) {
    console.error("Erro ao buscar restaurante:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurante = await updateService(req.body);
    res.json(restaurante);
  } catch (error) {
    console.error("Erro ao atualizar restaurante:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
