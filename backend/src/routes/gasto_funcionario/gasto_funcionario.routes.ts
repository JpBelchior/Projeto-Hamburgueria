import { Router } from "express";
import * as GastoFuncionarioController from "../../controllers/gasto_funcionario.controller";

const router = Router();

router.get("/",       GastoFuncionarioController.getAll);
router.post("/",      GastoFuncionarioController.create);
router.put("/:id",    GastoFuncionarioController.update);
router.delete("/:id", GastoFuncionarioController.remove);

export default router;
