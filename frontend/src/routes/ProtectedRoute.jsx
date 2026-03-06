import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — guarda rotas por autenticação e role.
 *
 * Props:
 *   - requiredRole: "GERENTE" | "ATENDENTE" (opcional — se omitido, só verifica token)
 *   - children: o elemento a renderizar se autorizado
 *
 * Lógica:
 *   1. Sem token → redireciona para "/"
 *   2. Com token mas role errado → redireciona para o dashboard correto do usuário
 *   3. Tudo ok → renderiza children
 */
const ProtectedRoute = ({ requiredRole, children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 1. Não autenticado
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // 2. Role incorreto para esta rota
  if (requiredRole && user.role !== requiredRole) {
    const fallback =
      user.role === "GERENTE" ? "/Dashboard" : "/DashboardFuncionario";
    return <Navigate to={fallback} replace />;
  }

  // 3. Autorizado
  return children;
};

export default ProtectedRoute;