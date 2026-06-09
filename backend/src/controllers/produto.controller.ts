import { Request, Response } from "express";
import * as ProdutoService from "../services/produto.service";

export const listarProdutos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busca, categoria } = req.query as Record<string, string>;
    const dados = await ProdutoService.listarProdutos(busca, categoria);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const buscarProduto = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const produto = await ProdutoService.buscarProduto(id);
    if (!produto) {
      res.status(404).json({ message: "Produto não encontrado." });
      return;
    }
    res.json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getMetricas = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodo = (req.query.periodo as string) || "hoje";
    const dados = await ProdutoService.getMetricas(periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar métricas de produtos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getTopPorCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodo = (req.query.periodo as string) || "hoje";
    const dados = await ProdutoService.getTopPorCategoria(periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar top por categoria:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
