import { Request, Response } from "express";
import * as FuncionarioService from "./funcionario.service";

// ─────────────────────────────────────────
// GET /api/funcionarios
// ─────────────────────────────────────────

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const funcionarios = await FuncionarioService.findAll();
    res.json(funcionarios);
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// GET /api/funcionarios/:id
// ─────────────────────────────────────────

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const funcionario = await FuncionarioService.findById(id);

    if (!funcionario) {
      res.status(404).json({ message: "Funcionário não encontrado." });
      return;
    }

    res.json(funcionario);
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// POST /api/funcionarios
// ─────────────────────────────────────────

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, cpf, email, password, roles, cargo, salario, dataAdmissao } =
      req.body;

    // Validação básica
    if (!name || !cpf || !email || !password || !roles || !cargo || !salario) {
      res.status(400).json({
        message: "Campos obrigatórios: name, cpf, email, password, role, cargo, salario.",
      });
      return;
    }

    const funcionario = await FuncionarioService.create({
      name,
      cpf,
      email,
      password,
      roles,
      cargo,
      salario: Number(salario),
      dataAdmissao,
    });

    res.status(201).json(funcionario);
  } catch (error: any) {
    // Captura violação de unique (email ou CPF duplicado)
    if (error.code === "P2002") {
      const field = error.meta?.target?.includes("email") ? "e-mail" : "CPF";
      res.status(409).json({ message: `Este ${field} já está cadastrado.` });
      return;
    }

    console.error("Erro ao criar funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// PUT /api/funcionarios/:id
// ─────────────────────────────────────────

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const funcionario = await FuncionarioService.update(id, req.body);

    if (!funcionario) {
      res.status(404).json({ message: "Funcionário não encontrado." });
      return;
    }

    res.json(funcionario);
  } catch (error: any) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.includes("email") ? "e-mail" : "CPF";
      res.status(409).json({ message: `Este ${field} já está cadastrado.` });
      return;
    }

    console.error("Erro ao atualizar funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// PATCH /api/funcionarios/:id/toggle
// ─────────────────────────────────────────

export const toggleActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const funcionario = await FuncionarioService.toggleActive(id);

    if (!funcionario) {
      res.status(404).json({ message: "Funcionário não encontrado." });
      return;
    }

    res.json(funcionario);
  } catch (error) {
    console.error("Erro ao alternar status do funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ─────────────────────────────────────────
// DELETE /api/funcionarios/:id
// ─────────────────────────────────────────

export const hardDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await FuncionarioService.hardDelete(id);

    if (!result) {
      res.status(404).json({ message: "Funcionário não encontrado." });
      return;
    }

    res.json({ message: "Funcionário excluído permanentemente." });
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};