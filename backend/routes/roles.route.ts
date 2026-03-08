// src/roles/roles.route.ts
import { Router } from "express";
import * as RoleController from "../controllers/roles.controller";

const router = Router();

router.get("/", RoleController.getAll);

export default router;