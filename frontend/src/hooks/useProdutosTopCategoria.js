import { useCallback } from "react";
import { produtoService } from "../services/produto.service";
import { usePeriodFetch } from "./usePeriodFetch";

export const useProdutosTopCategoria = (periodo) => {
  const fn = useCallback(() => produtoService.getTopPorCategoria(periodo), [periodo]);
  return usePeriodFetch(fn, "Não foi possível carregar os campeões por categoria.", []);
};
