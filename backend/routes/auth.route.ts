import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// POST /api/auth/login → Realiza o login e retorna token + dados do usuário
router.post("/login", login);

// GET /api/auth/me → Retorna os dados do usuário autenticado (requer token)
router.get("/me", authenticate, me);

export default router;