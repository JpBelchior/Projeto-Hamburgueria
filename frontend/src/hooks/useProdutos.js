import { useCallback } from "react";
import { produtoService } from "../services/produto.service";
import { usePeriodFetch } from "./usePeriodFetch";

export function useProdutos(incluirInativos = false) {
  const fn = useCallback(() => produtoService.getAll("", "", incluirInativos), [incluirInativos]);
  return usePeriodFetch(fn, "Erro ao carregar produtos", []);
}
