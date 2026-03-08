// backend/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import funcionarioRoutes from "./funcionario/funcionario.routes";
import { authenticate } from "./middleware/auth.middleware";
import { contextMiddleware } from "./shared/middleware/context.middleware";
import rolesRoutes from "./routes/roles.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Segurança e parsing
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());


// Rotas públicas
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolesRoutes);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Middleware global de autenticação e contexto
app.use(authenticate); // Middleware global de autenticação
app.use(contextMiddleware); // Contexto global para logs, etc.

// Rotas protegidas (exigem autenticação)
app.use("/api/funcionarios", funcionarioRoutes);

// Health check
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

export default app;