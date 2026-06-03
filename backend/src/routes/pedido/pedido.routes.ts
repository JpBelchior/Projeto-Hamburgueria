import { Router } from "express";
import * as PedidoController from "../../controllers/pedido.controller";

const router = Router();

router.get("/metricas",      PedidoController.getMetricas);
router.get("/vendas",        PedidoController.getVendas);
router.get("/top-itens",     PedidoController.getTopItens);
router.get("/categoria-mix", PedidoController.getCategoriaMix);

export default router;
