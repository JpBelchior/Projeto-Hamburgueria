import { Router } from "express";
import * as GastoController from "../../controllers/gasto.controller";

const router = Router();

router.get("/",      GastoController.getAll);
router.post("/",     GastoController.create);
router.put("/:id",   GastoController.update);
router.delete("/:id", GastoController.remove);

export default router;
