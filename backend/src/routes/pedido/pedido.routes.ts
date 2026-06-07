import { Router } from "express";
import * as PedidoController from "../../controllers/pedido.controller";

const router = Router();

// Analytics (existentes)
router.get("/metricas",      PedidoController.getMetricas);
router.get("/vendas",        PedidoController.getVendas);
router.get("/top-itens",     PedidoController.getTopItens);
router.get("/categoria-mix", PedidoController.getCategoriaMix);

// CRUD
router.get("/",              PedidoController.listarPedidos);
router.get("/:id",           PedidoController.buscarPedido);
router.post("/",             PedidoController.criarPedido);
router.put("/:id",           PedidoController.editarPedido);
router.patch("/:id/status",  PedidoController.atualizarStatus);
router.patch("/:id/cancel",  PedidoController.cancelarPedido);
router.delete("/:id",        PedidoController.deletarPedido);

export default router;
