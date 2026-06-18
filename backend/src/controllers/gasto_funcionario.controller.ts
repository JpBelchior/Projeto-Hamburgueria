import { Request, Response } from "express";
import * as GastoFuncionarioService from "../services/gasto_funcionario.service";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const mes = req.query.mes ? Number(req.query.mes) : undefined;
    const ano = req.query.ano ? Number(req.query.ano) : undefined;

    if ((mes !== undefined || ano !== undefined) && (!mes || !ano || mes < 1 || mes > 12)) {
      res.status(400).json({ message: "Parâmetros mes (1-12) e ano são obrigatórios quando informados." });
      return;
    }

    const resultado = mes && ano
      ? await GastoFuncionarioService.findByMesAno(mes, ano)
      : await GastoFuncionarioService.findAll();
    res.json(resultado);
  } catch (error) {
    console.error("Erro ao listar gastos de funcionários:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, valor, descricao, mes, ano, funcionarioIds } = req.body;
    if (!nome || !valor || !mes || !ano) {
      res.status(400).json({ message: "Campos obrigatórios: nome, valor, mes, ano." });
      return;
    }
    const gasto = await GastoFuncionarioService.create({
      nome,
      valor: Number(valor),
      descricao,
      mes: Number(mes),
      ano: Number(ano),
      funcionarioIds: Array.isArray(funcionarioIds) ? funcionarioIds.map(Number) : undefined,
    });
    res.status(201).json(gasto);
  } catch (error) {
    console.error("Erro ao criar gasto de funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { nome, valor, descricao, funcionarioIds } = req.body;
    const gasto = await GastoFuncionarioService.update(id, {
      nome,
      valor: valor !== undefined ? Number(valor) : undefined,
      descricao,
      funcionarioIds: Array.isArray(funcionarioIds) ? funcionarioIds.map(Number) : undefined,
    });
    if (!gasto) {
      res.status(404).json({ message: "Gasto não encontrado." });
      return;
    }
    res.json(gasto);
  } catch (error) {
    console.error("Erro ao atualizar gasto de funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await GastoFuncionarioService.remove(id);
    if (!result) {
      res.status(404).json({ message: "Gasto não encontrado." });
      return;
    }
    res.json({ message: "Gasto excluído." });
  } catch (error) {
    console.error("Erro ao excluir gasto de funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
