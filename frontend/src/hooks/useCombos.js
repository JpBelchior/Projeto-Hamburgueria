import { useState, useEffect, useCallback } from "react";
import { comboService } from "../services/combo.service";

export function useCombos() {
  const [dados,   setDados]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    comboService.getAll("", true)
      .then(setDados)
      .catch((e) => setErro(e.message ?? "Erro ao carregar combos"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { dados, loading, erro, refetch: fetch };
}
