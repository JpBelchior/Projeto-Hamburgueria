import { Router } from "express";
import * as ComboController from "../../controllers/combo.controller";

const router = Router();

router.get("/",                    ComboController.listarCombos);
router.get("/:id",                 ComboController.buscarCombo);
router.get("/:id/desempenho",      ComboController.getDesempenhoCombo);
router.post("/",       ComboController.criarCombo);
router.put("/:id",     ComboController.atualizarCombo);
router.patch("/:id/toggle", ComboController.toggleAtivo);
router.delete("/:id",  ComboController.deletarCombo);

export default router;
