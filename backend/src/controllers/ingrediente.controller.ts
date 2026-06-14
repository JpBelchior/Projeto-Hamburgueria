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

export const buscarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const ingrediente = await IngredienteService.buscarIngrediente(id);
    if (!ingrediente) {
      res.status(404).json({ message: "Ingrediente não encontrado." });
      return;
    }
    res.json(ingrediente);
  } catch (error) {
    console.error("Erro ao buscar ingrediente:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const criarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingrediente = await IngredienteService.criarIngrediente(req.body);
    res.status(201).json(ingrediente);
  } catch (error) {
    console.error("Erro ao criar ingrediente:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const atualizarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const ingrediente = await IngredienteService.atualizarIngrediente(id, req.body);
    if (!ingrediente) {
      res.status(404).json({ message: "Ingrediente não encontrado." });
      return;
    }
    res.json(ingrediente);
  } catch (error) {
    console.error("Erro ao atualizar ingrediente:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deletarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await IngredienteService.deletarIngrediente(id);
    if (!result) {
      res.status(404).json({ message: "Ingrediente não encontrado." });
      return;
    }
    res.json(result);
  } catch (error) {
    console.error("Erro ao deletar ingrediente:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getMetricas = async (req: Request, res: Response): Promise<void> => {
  try {
    const dados = await IngredienteService.getMetricas();
    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar métricas de ingredientes:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
