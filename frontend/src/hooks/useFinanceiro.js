import { useCallback } from "react";
import { financeiroService } from "../services/financeiro.service";
import { usePeriodFetch } from "./usePeriodFetch";

export const useFinanceiro = (tipo, mes, ano) => {
  const fn = useCallback(() => financeiroService.getMetricas(tipo, mes, ano), [tipo, mes, ano]);
  return usePeriodFetch(fn, "Não foi possível carregar os dados financeiros.", null);
};
