import { Router } from "express";
import * as IngredienteController from "../../controllers/ingrediente.controller";

const router = Router();

router.get("/", IngredienteController.listarIngredientes);

export default router;
