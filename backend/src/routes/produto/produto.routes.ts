import { Router } from "express";
import * as ProdutoController from "../../controllers/produto.controller";

const router = Router();

router.get("/",                  ProdutoController.listarProdutos);
router.get("/metricas",          ProdutoController.getMetricas);
router.get("/top-por-categoria", ProdutoController.getTopPorCategoria);
router.get("/:id",               ProdutoController.buscarProduto);

export default router;
