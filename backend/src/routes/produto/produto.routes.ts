import { Router } from "express";
import * as ProdutoController from "../../controllers/produto.controller";

const router = Router();

router.get("/",                  ProdutoController.listarProdutos);
router.get("/metricas",          ProdutoController.getMetricas);
router.get("/top-por-categoria", ProdutoController.getTopPorCategoria);
router.get("/:id/desempenho",    ProdutoController.getDesempenho);
router.get("/:id",               ProdutoController.buscarProduto);
router.put("/:id",               ProdutoController.atualizarProduto);
router.patch("/:id/toggle",      ProdutoController.toggleAtivo);
router.delete("/:id",            ProdutoController.deletarProduto);

export default router;
