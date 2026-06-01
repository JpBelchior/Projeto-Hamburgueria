import { Router } from "express";
import * as GastoIngredienteController from "../../controllers/gasto_ingrediente.controller";

const router = Router();

router.get("/",      GastoIngredienteController.getAll);
router.post("/",     GastoIngredienteController.create);
router.put("/:id",   GastoIngredienteController.update);
router.delete("/:id", GastoIngredienteController.remove);

export default router;
