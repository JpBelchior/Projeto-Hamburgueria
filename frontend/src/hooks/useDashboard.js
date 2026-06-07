import { useCallback } from "react";
import { dashboardService } from "../services/dashboard.service";
import { usePeriodFetch } from "./usePeriodFetch";

export const useDashboard = (periodo) => {
  const fn = useCallback(() => dashboardService.getMetricas(periodo), [periodo]);
  return usePeriodFetch(fn, "Não foi possível carregar os dados.", null);
};
