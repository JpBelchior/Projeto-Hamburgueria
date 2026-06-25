import { Router } from "express";
import * as IngredienteController from "../../controllers/ingrediente.controller";

const router = Router();

router.get("/metricas", IngredienteController.getMetricas);
router.get("/",         IngredienteController.listarIngredientes);
router.post("/",        IngredienteController.criarIngrediente);
router.get("/:id",      IngredienteController.buscarIngrediente);
router.put("/:id",               IngredienteController.atualizarIngrediente);
router.patch("/:id/toggle-ativo", IngredienteController.toggleAtivo);
router.delete("/:id",            IngredienteController.deletarIngrediente);

export default router;
