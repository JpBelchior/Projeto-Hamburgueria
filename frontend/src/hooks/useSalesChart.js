import { useCallback } from "react";
import { usePeriodFetch } from "./usePeriodFetch";
import { salesService } from "../services/sales.service";

export const useSalesChart = (periodo) => {
  const fn = useCallback(() => salesService.getVendas(periodo), [periodo]);
  return usePeriodFetch(fn, "Não foi possível carregar os dados de vendas.");
};
