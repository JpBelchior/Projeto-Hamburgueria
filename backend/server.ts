import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { authenticate } from "./src/middleware/auth.middleware";
import { contextMiddleware } from "./src/middleware/context.middleware";
import { requireTenant } from "./src/middleware/tenant.middleware";
import { publicRoutes, protectedRoutes } from "./src/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "5mb" }));

// Rotas públicas — sem autenticação
app.use("/api", publicRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Middleware de autenticação e contexto aplicado apenas às rotas protegidas
app.use(authenticate);
app.use(contextMiddleware);
app.use(requireTenant);

// Rotas protegidas
app.use("/api", protectedRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
