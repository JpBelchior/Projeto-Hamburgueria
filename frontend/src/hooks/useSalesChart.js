import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/sales.service";

export const useSalesChart = (periodo) => {
  const [dados,   setDados]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const fetchDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await salesService.getVendas(periodo);
      setDados(data);
    } catch {
      setErro("Não foi possível carregar os dados de vendas.");
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  return { dados, loading, erro };
};
