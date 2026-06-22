import { Request, Response } from "express";
import * as ComboService from "../services/combo.service";

export const listarCombos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busca, incluirInativos } = req.query as Record<string, string>;
    const dados = await ComboService.listarCombos(busca, incluirInativos === "true");
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

export const criarCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const combo = await ComboService.criarCombo(req.body);
    res.status(201).json(combo);
  } catch (error: any) {
    if (error.statusCode === 409) {
      res.status(409).json({ message: error.message });
      return;
    }
    console.error("Erro ao criar combo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const atualizarCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const combo = await ComboService.atualizarCombo(id, req.body);
    if (!combo) {
      res.status(404).json({ message: "Combo não encontrado." });
      return;
    }
    res.json(combo);
  } catch (error: any) {
    if (error.statusCode === 409) {
      res.status(409).json({ message: error.message });
      return;
    }
    console.error("Erro ao atualizar combo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const toggleAtivo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const combo = await ComboService.toggleAtivo(id);
    if (!combo) {
      res.status(404).json({ message: "Combo não encontrado." });
      return;
    }
    res.json(combo);
  } catch (error) {
    console.error("Erro ao alternar status do combo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getDesempenhoCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id     = Number(req.params.id);
    const periodo = (req.query.periodo as string) ?? "30dias";
    const dados  = await ComboService.getDesempenho(id, periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar desempenho do combo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deletarCombo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const ok = await ComboService.deletarCombo(id);
    if (!ok) {
      res.status(404).json({ message: "Combo não encontrado." });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar combo:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
