import { Router } from "express";
import { cadastrarRestaurante } from "../controllers/restaurante.controller";

const router = Router();

router.post("/onboarding", cadastrarRestaurante);

export default router;
