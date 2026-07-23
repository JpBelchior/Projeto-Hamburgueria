import { Router } from "express";
import * as CardapioController from "../../controllers/cardapio.controller";

const router = Router();

router.get("/pdf", CardapioController.gerarPDF);

export default router;
