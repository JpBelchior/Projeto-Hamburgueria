import { Router } from "express";
import * as ProdutoController from "../../controllers/produto.controller";

const router = Router();

router.get("/",    ProdutoController.listarProdutos);
router.get("/:id", ProdutoController.buscarProduto);

export default router;
