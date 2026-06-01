import { Router } from "express";
import * as PedidoController from "../../controllers/pedido.controller";

const router = Router();

router.get("/metricas", PedidoController.getMetricas);
router.get("/vendas",   PedidoController.getVendas);

export default router;
