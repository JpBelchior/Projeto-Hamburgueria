import { Request, Response } from "express";
import * as GastoIngredienteService from "../services/gasto_ingrediente.service";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const mes = Number(req.query.mes);
    const ano = Number(req.query.ano);
    if (!mes || !ano || mes < 1 || mes > 12) {
      res.status(400).json({ message: "Parâmetros mes (1-12) e ano são obrigatórios." });
      return;
    }
    const resultado = await GastoIngredienteService.findByMesAno(mes, ano);
    res.json(resultado);
  } catch (error) {
    console.error("Erro ao listar gastos de ingredientes:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { valor, descricao, mes, ano } = req.body;
    if (!valor || !mes || !ano) {
      res.status(400).json({ message: "Campos obrigatórios: valor, mes, ano." });
      return;
    }
    const gasto = await GastoIngredienteService.create({
      valor: Number(valor),
      descricao,
      mes: Number(mes),
      ano: Number(ano),
    });
    res.status(201).json(gasto);
  } catch (error) {
    console.error("Erro ao criar gasto de ingrediente:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { valor, descricao } = req.body;
    const gasto = await GastoIngredienteService.update(id, { valor: valor !== undefined ? Number(valor) : undefined, descricao });
    if (!gasto) {
      res.status(404).json({ message: "Gasto não encontrado." });
      return;
    }
    res.json(gasto);
  } catch (error) {
    console.error("Erro ao atualizar gasto de ingrediente:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await GastoIngredienteService.remove(id);
    if (!result) {
      res.status(404).json({ message: "Gasto não encontrado." });
      return;
    }
    res.json({ message: "Gasto excluído." });
  } catch (error) {
    console.error("Erro ao excluir gasto de ingrediente:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
