import { Request, Response } from "express";
import * as PedidoService from "../services/pedido.service";

const PERIODOS_VALIDOS = ["hoje", "7dias", "30dias", "anual"];

export const getVendas = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodo = (req.query.periodo as string) ?? "hoje";
    if (!PERIODOS_VALIDOS.includes(periodo)) {
      res.status(400).json({ message: "Período inválido. Use: hoje, 7dias, 30dias ou anual." });
      return;
    }
    const dados = await PedidoService.getVendas(periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getCategoriaMix = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodo = (req.query.periodo as string) ?? "hoje";
    if (!PERIODOS_VALIDOS.includes(periodo)) {
      res.status(400).json({ message: "Período inválido. Use: hoje, 7dias, 30dias ou anual." });
      return;
    }
    const dados = await PedidoService.getCategoriaMix(periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar mix de categorias:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getTopItens = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodo = (req.query.periodo as string) ?? "hoje";
    if (!PERIODOS_VALIDOS.includes(periodo)) {
      res.status(400).json({ message: "Período inválido. Use: hoje, 7dias, 30dias ou anual." });
      return;
    }
    const dados = await PedidoService.getTopItens(periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar top itens:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getMetricas = async (req: Request, res: Response): Promise<void> => {
  try {
    const periodo = (req.query.periodo as string) ?? "hoje";

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      res.status(400).json({ message: "Período inválido. Use: hoje, 7dias, 30dias ou anual." });
      return;
    }

    const dados = await PedidoService.getMetricas(periodo as any);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar métricas de pedidos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
