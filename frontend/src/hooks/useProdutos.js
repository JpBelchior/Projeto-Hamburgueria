import { useState, useEffect, useCallback } from "react";
import { produtoService } from "../services/produto.service";

export function useProdutos(incluirInativos = false) {
  const [dados,   setDados]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    produtoService.getAll("", "", incluirInativos)
      .then(setDados)
      .catch((e) => setErro(e.message ?? "Erro ao carregar produtos"))
      .finally(() => setLoading(false));
  }, [incluirInativos]);

  useEffect(() => { fetch(); }, [fetch]);

  return { dados, setDados, loading, erro, refetch: fetch };
}
