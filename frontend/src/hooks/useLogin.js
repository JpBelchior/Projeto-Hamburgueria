import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

      // Verifica se o nível de acesso bate com o botão selecionado
      // O role vem do banco em maiúsculas (GERENTE / ATENDENTE)
      const expectedRole = userType === "funcionario" ? "ATENDENTE" : "GERENTE";
      if (user.role !== expectedRole) {
        setError("Nível de acesso incorreto para o tipo de usuário selecionado.");
        return;
      }

      // Persiste a sessão completa
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken); // ← novo
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/Dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
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