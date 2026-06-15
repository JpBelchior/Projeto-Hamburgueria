import { useState, useEffect, useMemo } from "react";
import { funcionarioService } from "../services/funcionario.service";

export const useFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const stats = useMemo(() => {
    const total = funcionarios.length;
    const ativos = funcionarios.filter((f) => f.active).length;
    const inativos = total - ativos;
    return { total, ativos, inativos };
  }, [funcionarios]);

  const fetchFuncionarios = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await funcionarioService.getAll();
      setFuncionarios(data);
    } catch {
      setError("Não foi possível carregar os funcionários.");
    } finally {
      setIsLoading(false);
    }
  };

  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((f) => {
      const matchSearch = f.user.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "todos" ||
        (filterStatus === "ativo" && f.active) ||
        (filterStatus === "inativo" && !f.active);
      return matchSearch && matchStatus;
    });
  }, [funcionarios, search, filterStatus]);

  return {
    funcionarios: funcionariosFiltrados,
    setFuncionarios,
    stats,
    isLoading,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    refetch: fetchFuncionarios,
  };
};
