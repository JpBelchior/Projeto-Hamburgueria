import { Router } from "express";
import authRoutes from "./auth.routes";
import funcionarioRoutes from "./funcionario.routes";
import restauranteRoutes from "./restaurante.routes";
import rolesRoutes from "./roles.routes";

export const publicRoutes = Router();
publicRoutes.use("/auth", authRoutes);
publicRoutes.use("/roles", rolesRoutes);
publicRoutes.use("/restaurantes", restauranteRoutes);

export const protectedRoutes = Router();
protectedRoutes.use("/funcionarios", funcionarioRoutes);
