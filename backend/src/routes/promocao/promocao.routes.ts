import { Router } from "express";
import * as PromocaoController from "../../controllers/promocao.controller";

const router = Router();

router.get("/",                   PromocaoController.listarPromocoes);
router.get("/:id/desempenho",     PromocaoController.getDesempenhoPromocao);
router.get("/:id",                PromocaoController.buscarPromocao);
router.post("/",          PromocaoController.criarPromocao);
router.put("/:id",        PromocaoController.atualizarPromocao);
router.patch("/:id/toggle", PromocaoController.toggleAtivo);
router.delete("/:id",     PromocaoController.deletarPromocao);

export default router;
