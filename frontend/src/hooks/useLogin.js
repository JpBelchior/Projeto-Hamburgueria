import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (email, password, userType) => {
    setIsLoading(true);
    setError("");

    try {
      const { token, refreshToken, user } = await authService.login(email, password);

      // Verifica se o role bate com o botão selecionado na tela
      const expectedRole = userType === "funcionario" ? "ATENDENTE" : "GERENTE";
      if (user.role !== expectedRole) {
        setError("Nível de acesso incorreto para o tipo de usuário selecionado.");
        return;
      }

      // Persiste a sessão
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redireciona para o dashboard correto de acordo com o role
      const destination =
        user.role === "GERENTE" ? "/Dashboard" : "/DashboardFuncionario";
      navigate(destination);
    } catch (err) {
      // O interceptor do api.js já trata 401 globalmente
      if (err.response) {
        setError(err.response.data.message || "Erro ao realizar login.");
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};