import { Request, Response } from "express";
import * as PedidoService from "../services/pedido.service";
import { FormaPagamento, StatusPedido } from "@prisma/client";

const PERIODOS_VALIDOS = ["hoje", "7dias", "30dias", "anual"];

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const listarPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodo, status, formaPagamento } = req.query as Record<string, string>;

    if (periodo && !PERIODOS_VALIDOS.includes(periodo)) {
      res.status(400).json({ message: "Período inválido. Use: hoje, 7dias, 30dias ou anual." });
      return;
    }

    const dados = await PedidoService.listarPedidos({
      periodo:        periodo ?? "hoje",
      status:         status as StatusPedido | undefined,
      formaPagamento: formaPagamento as FormaPagamento | undefined,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const buscarPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const pedido = await PedidoService.buscarPedido(id);
    if (!pedido) {
      res.status(404).json({ message: "Pedido não encontrado." });
      return;
    }
    res.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const criarPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const pedido = await PedidoService.criarPedido(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const editarPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const pedido = await PedidoService.editarPedido(id, req.body);
    if (!pedido) {
      res.status(404).json({ message: "Pedido não encontrado." });
      return;
    }
    res.json(pedido);
  } catch (error) {
    console.error("Erro ao editar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const atualizarStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body as { status: StatusPedido };

    const validos: StatusPedido[] = ["ABERTO", "EM_PREPARO", "FINALIZADO", "CANCELADO"];
    if (!validos.includes(status)) {
      res.status(400).json({ message: "Status inválido." });
      return;
    }

    const pedido = await PedidoService.atualizarStatus(id, { status });
    if (!pedido) {
      res.status(404).json({ message: "Pedido não encontrado." });
      return;
    }
    res.json(pedido);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const cancelarPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const pedido = await PedidoService.cancelarPedido(id);
    if (!pedido) {
      res.status(404).json({ message: "Pedido não encontrado." });
      return;
    }
    res.json(pedido);
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deletarPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const resultado = await PedidoService.deletarPedido(id);
    if (!resultado) {
      res.status(404).json({ message: "Pedido não encontrado." });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

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
