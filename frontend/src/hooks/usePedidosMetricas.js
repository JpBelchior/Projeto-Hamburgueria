import { useCallback } from "react";
import { dashboardService } from "../services/dashboard.service";
import { usePeriodFetch } from "./usePeriodFetch";

export const usePedidosMetricas = (periodo) => {
  const fn = useCallback(() => dashboardService.getMetricas(periodo), [periodo]);
  return usePeriodFetch(fn, null, null);
};
