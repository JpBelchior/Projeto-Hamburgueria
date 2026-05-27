import { Router } from "express";
import * as FuncionarioController from "../controllers/funcionario.controller";

const router = Router();

router.get("/", FuncionarioController.getAll);
router.get("/:id", FuncionarioController.getById);
router.post("/", FuncionarioController.create);
router.put("/:id", FuncionarioController.update);
router.patch("/:id/toggle", FuncionarioController.toggleActive);
router.delete("/:id", FuncionarioController.hardDelete);

export default router;
