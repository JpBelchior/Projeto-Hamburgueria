import { Router } from "express";
import * as RolesController from "../controllers/roles.controller";

const router = Router();

router.get("/", RolesController.getAll);

export default router;
