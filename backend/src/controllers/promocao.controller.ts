import { Request, Response } from "express";
import * as PromocaoService from "../services/promocao.service";

export const listarPromocoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busca, incluirInativos } = req.query as Record<string, string>;
    const dados = await PromocaoService.listarPromocoes(busca, incluirInativos === "true");
    res.json(dados);
  } catch (error) {
    console.error("Erro ao listar promoções:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const buscarPromocao = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const promocao = await PromocaoService.buscarPromocao(id);
    if (!promocao) {
      res.status(404).json({ message: "Promoção não encontrada." });
      return;
    }
    res.json(promocao);
  } catch (error) {
    console.error("Erro ao buscar promoção:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const criarPromocao = async (req: Request, res: Response): Promise<void> => {
  try {
    const promocao = await PromocaoService.criarPromocao(req.body);
    res.status(201).json(promocao);
  } catch (error) {
    console.error("Erro ao criar promoção:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const atualizarPromocao = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const promocao = await PromocaoService.atualizarPromocao(id, req.body);
    if (!promocao) {
      res.status(404).json({ message: "Promoção não encontrada." });
      return;
    }
    res.json(promocao);
  } catch (error) {
    console.error("Erro ao atualizar promoção:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const toggleAtivo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const promocao = await PromocaoService.toggleAtivo(id);
    if (!promocao) {
      res.status(404).json({ message: "Promoção não encontrada." });
      return;
    }
    res.json(promocao);
  } catch (error) {
    console.error("Erro ao alternar status da promoção:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deletarPromocao = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const resultado = await PromocaoService.deletarPromocao(id);
    if (!resultado) {
      res.status(404).json({ message: "Promoção não encontrada." });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar promoção:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getDesempenhoPromocao = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const periodo = (req.query.periodo as string) || "30dias";
    const dados = await PromocaoService.getDesempenho(id, periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar desempenho da promoção:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
