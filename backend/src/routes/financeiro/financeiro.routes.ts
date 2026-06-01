import { Router } from "express";
import * as FinanceiroController from "../../controllers/financeiro.controller";

const router = Router();

router.get("/metricas", FinanceiroController.getMetricas);

export default router;
