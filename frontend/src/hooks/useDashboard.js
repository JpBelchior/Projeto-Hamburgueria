import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../services/dashboard.service";

export const useDashboard = (periodo) => {
  const [dados,   setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const fetchDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await dashboardService.getMetricas(periodo);
      setDados(data);
    } catch {
      setErro("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  return { dados, loading, erro, refetch: fetchDados };
};
