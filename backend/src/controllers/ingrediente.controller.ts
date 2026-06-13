import { Request, Response } from "express";
import * as IngredienteService from "../services/ingrediente.service";

export const listarIngredientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const dados = await IngredienteService.listarIngredientes();
    res.json(dados);
  } catch (error) {
    console.error("Erro ao listar ingredientes:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
