// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
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
  const { user, isAuthenticated } = useAuthStore();

  // 1. Não autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // 2. Role incorreto para esta rota
  if (requiredRole && !user.roles.includes(requiredRole) && !user.roles.includes("ADMIN")) {
    const fallback =
      user.roles.includes("GERENTE") ? "/Dashboard" : "/DashboardFuncionario";
    return <Navigate to={fallback} replace />;
  }

  // 3. Autorizado
  return children;
};

export default ProtectedRoute;