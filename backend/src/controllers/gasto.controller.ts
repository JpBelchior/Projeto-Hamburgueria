import { Request, Response } from "express";
import * as GastoService from "../services/gasto.service";
import { TipoGasto } from "../dto/gasto.dto";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const tipo = req.query.tipo as TipoGasto | undefined;
    const mes  = req.query.mes ? Number(req.query.mes) : undefined;
    const ano  = req.query.ano ? Number(req.query.ano) : undefined;

    if ((mes !== undefined || ano !== undefined) && (!mes || !ano || mes < 1 || mes > 12)) {
      res.status(400).json({ message: "Parâmetros mes (1-12) e ano são obrigatórios quando informados." });
      return;
    }

    const resultado = await GastoService.findAll({ tipo, mes, ano });
    res.json(resultado);
  } catch (error) {
    console.error("Erro ao listar gastos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, nome, valor, descricao, mes, ano, ingredientes, funcionarioIds } = req.body;

    if (!tipo || !nome || valor == null || !mes || !ano) {
      res.status(400).json({ message: "Campos obrigatórios: tipo, nome, valor, mes, ano." });
      return;
    }

    const gasto = await GastoService.create({
      tipo,
      nome,
      valor:          Number(valor),
      descricao,
      mes:            Number(mes),
      ano:            Number(ano),
      ingredientes:   Array.isArray(ingredientes)
        ? ingredientes.map((i: any) => ({ id: Number(i.id), quantidade: Number(i.quantidade) }))
        : undefined,
      funcionarioIds: Array.isArray(funcionarioIds) ? funcionarioIds.map(Number) : undefined,
    });

    res.status(201).json(gasto);
  } catch (error) {
    console.error("Erro ao criar gasto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { nome, valor, descricao, ingredientes, funcionarioIds } = req.body;

    const gasto = await GastoService.update(id, {
      nome,
      valor:          valor !== undefined ? Number(valor) : undefined,
      descricao,
      ingredientes:   Array.isArray(ingredientes)
        ? ingredientes.map((i: any) => ({ id: Number(i.id), quantidade: Number(i.quantidade) }))
        : undefined,
      funcionarioIds: Array.isArray(funcionarioIds) ? funcionarioIds.map(Number) : undefined,
    });

    if (!gasto) {
      res.status(404).json({ message: "Gasto não encontrado." });
      return;
    }
    res.json(gasto);
  } catch (error) {
    console.error("Erro ao atualizar gasto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id              = Number(req.params.id);
    const reverterEstoque = req.query.reverterEstoque === "true";
    const result          = await GastoService.remove(id, reverterEstoque);

    if (!result) {
      res.status(404).json({ message: "Gasto não encontrado." });
      return;
    }
    res.json({ message: "Gasto excluído." });
  } catch (error) {
    console.error("Erro ao excluir gasto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
