import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import funcionarioRoutes from "./funcionario/funcionario.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Segurança e parsing
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);

app.use("/api/funcionarios", funcionarioRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

export default app;