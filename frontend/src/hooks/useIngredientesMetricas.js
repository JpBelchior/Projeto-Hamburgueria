import { useCallback } from "react";
import { ingredienteService } from "../services/ingrediente.service";
import { usePeriodFetch } from "./usePeriodFetch";

export const useIngredientesMetricas = () => {
  const fn = useCallback(() => ingredienteService.getMetricas(), []);
  return usePeriodFetch(fn, "Não foi possível carregar as métricas de ingredientes.", null);
};
