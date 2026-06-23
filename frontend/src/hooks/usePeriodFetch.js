import { useState, useEffect, useCallback } from "react";

/**
 * Hook genérico para buscar dados que dependem de um período.
 *
 * @param {() => Promise<any>} fetchFn  Função estável (memoizada com useCallback no caller)
 * @param {string}             errMsg   Mensagem exibida em caso de erro
 */
export const usePeriodFetch = (fetchFn, errMsg, initialValue = []) => {
  const [dados,   setDados]   = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      setDados(await fetchFn());
    } catch {
      setErro(errMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, errMsg]);

  useEffect(() => { run(); }, [run]);

  return { dados, setDados, loading, erro, refetch: run };
};
