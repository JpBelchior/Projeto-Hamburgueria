// hooks/useLogin.js
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export const useLogin = () => {
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const user = await login(email, password); // authService já persiste

    if (!user) return; // erro já está no store

    // roles agora é array — verifica se contém o role esperado
    
    const destination = user.roles.includes("GERENTE") ? "/Dashboard" : "/DashboardFuncionario";
    navigate(destination);
  };

  return { login: handleLogin, isLoading: loading, error };
};