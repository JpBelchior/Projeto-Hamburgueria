import { useCallback } from "react";
import { funcionarioService } from "../services/funcionario.service";
import { usePeriodFetch } from "./usePeriodFetch";

export const useFuncionariosMetricas = () => {
  const fn = useCallback(() => funcionarioService.getMetricas(), []);
  return usePeriodFetch(fn, "Não foi possível carregar as métricas.", null);
};
