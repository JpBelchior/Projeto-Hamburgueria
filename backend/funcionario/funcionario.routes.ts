import { Router } from "express";
import * as FuncionarioController from "./funcionario.controller";

const router = Router();

// GET    /api/funcionarios        → listar todos
router.get("/", FuncionarioController.getAll);

// GET    /api/funcionarios/:id    → buscar por id
router.get("/:id", FuncionarioController.getById);

// POST   /api/funcionarios        → criar
router.post("/", FuncionarioController.create);

// PUT    /api/funcionarios/:id    → atualizar
router.put("/:id", FuncionarioController.update);

// PATCH  /api/funcionarios/:id/toggle → ativar / desativar
router.patch("/:id/toggle", FuncionarioController.toggleActive);

// DELETE /api/funcionarios/:id    → excluir permanentemente
router.delete("/:id", FuncionarioController.hardDelete);

export default router;