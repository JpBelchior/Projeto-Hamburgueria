import { useState, useEffect, useCallback } from "react";
import { promocaoService } from "../services/promocao.service";

export function usePromocoes() {
  const [dados,   setDados]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    promocaoService.getAll("", true)
      .then(setDados)
      .catch((e) => setErro(e.message ?? "Erro ao carregar promoções"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { dados, loading, erro, refetch: fetch };
}
