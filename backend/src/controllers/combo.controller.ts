import { Request, Response } from "express";
import * as ComboService from "../services/combo.service";

export const listarCombos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busca } = req.query as Record<string, string>;
    const dados = await ComboService.listarCombos(busca);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao listar combos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const buscarCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const combo = await ComboService.buscarCombo(id);
    if (!combo) {
      res.status(404).json({ message: "Combo não encontrado." });
      return;
    }
    res.json(combo);
  } catch (error) {
    console.error("Erro ao buscar combo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
