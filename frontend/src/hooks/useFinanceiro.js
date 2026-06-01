import { useState, useEffect, useCallback } from "react";
import { financeiroService } from "../services/financeiro.service";

export const useFinanceiro = (tipo, mes, ano) => {
  const [dados,   setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const fetchDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await financeiroService.getMetricas(tipo, mes, ano);
      setDados(data);
    } catch {
      setErro("Não foi possível carregar os dados financeiros.");
    } finally {
      setLoading(false);
    }
  }, [tipo, mes, ano]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  return { dados, loading, erro, refetch: fetchDados };
};
