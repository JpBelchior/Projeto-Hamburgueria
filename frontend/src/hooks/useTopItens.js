import { useCallback } from "react";
import { usePeriodFetch } from "./usePeriodFetch";
import { topItensService } from "../services/topItens.service";

export const useTopItens = (periodo) => {
  const fn = useCallback(() => topItensService.getTopItens(periodo), [periodo]);
  return usePeriodFetch(fn, "Não foi possível carregar os itens mais pedidos.");
};
