import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../components/Layouts/dashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// ── placeholders — serão substituídos pelas páginas reais ──────────────────
const DashboardHome = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
    <p className="text-slate-400 mt-2">Visão geral do negócio</p>
  </div>
);

const Pedidos = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Pedidos</h1>
    <p className="text-slate-400 mt-2">Gerenciamento de pedidos</p>
  </div>
);

const Produtos = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Produtos</h1>
    <p className="text-slate-400 mt-2">Cadastro e gestão de produtos</p>
  </div>
);

const Ingredientes = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Ingredientes</h1>
    <p className="text-slate-400 mt-2">Controle de estoque</p>
  </div>
);

const Combos = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Combos</h1>
    <p className="text-slate-400 mt-2">Gestão de combos</p>
  </div>
);

const Funcionarios = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Funcionários</h1>
    <p className="text-slate-400 mt-2">Equipe e acessos</p>
  </div>
);

const Metricas = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Métricas</h1>
    <p className="text-slate-400 mt-2">Análise de desempenho</p>
  </div>
);

// ── placeholder do dashboard do atendente ──────────────────────────────────
const DashboardFuncionario = () => (
  <div>
    <h1 className="text-2xl font-bold text-white">Dashboard — Atendente</h1>
    <p className="text-slate-400 mt-2">Gestão de pedidos</p>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────

const AppRoutes = () => {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/" element={<Login />} />

      {/* Dashboard do GERENTE — todas as sub-rotas compartilham o DashboardLayout */}
      <Route
        path="/Dashboard"
        element={
          <ProtectedRoute requiredRole="GERENTE">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="ingredientes" element={<Ingredientes />} />
        <Route path="combos" element={<Combos />} />
        <Route path="funcionarios" element={<Funcionarios />} />
        <Route path="metricas" element={<Metricas />} />
      </Route>

      {/* Dashboard do ATENDENTE */}
      <Route
        path="/DashboardFuncionario"
        element={
          <ProtectedRoute requiredRole="ATENDENTE">
            <DashboardFuncionario />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;