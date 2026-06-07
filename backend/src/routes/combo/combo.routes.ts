import { Router } from "express";
import * as ComboController from "../../controllers/combo.controller";

const router = Router();

router.get("/",    ComboController.listarCombos);
router.get("/:id", ComboController.buscarCombo);

export default router;
