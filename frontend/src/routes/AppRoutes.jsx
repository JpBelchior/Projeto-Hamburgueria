import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";

// Componente temporário para o dashboard (criaremos depois)
const Dashboard = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
    <p className="text-gray-600 mt-4">Bem-vindo ao sistema da hamburgueria!</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default AppRoutes;
