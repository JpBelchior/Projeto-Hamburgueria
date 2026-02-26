import { Router } from "express";
import { login, me, refresh, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// POST /api/auth/login → Login, retorna access token (30min) + refresh token (7d)
router.post("/login", login);

// POST /api/auth/refresh → Recebe refresh token, devolve novo access token
router.post("/refresh", refresh);

// POST /api/auth/logout → Invalida o refresh token no banco
router.post("/logout", authenticate, logout);

// GET /api/auth/me → Dados do usuário autenticado
router.get("/me", authenticate, me);

export default router;