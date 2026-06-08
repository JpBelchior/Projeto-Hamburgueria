import { useCallback } from "react";
import { produtoService } from "../services/produto.service";
import { usePeriodFetch } from "./usePeriodFetch";

export const useProdutosMetricas = (periodo) => {
  const fn = useCallback(() => produtoService.getMetricas(periodo), [periodo]);
  return usePeriodFetch(fn, "Não foi possível carregar as métricas de produtos.", null);
};
