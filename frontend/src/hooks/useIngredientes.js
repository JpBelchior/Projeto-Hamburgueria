import { useState, useEffect, useCallback } from "react";
import { ingredienteService } from "../services/ingrediente.service";

export const useIngredientes = () => {
  const [dados,   setDados]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    ingredienteService.getAll()
      .then(setDados)
      .catch((e) => setErro(e.message ?? "Erro ao carregar ingredientes"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { dados, setDados, loading, erro, refetch: fetch };
};
