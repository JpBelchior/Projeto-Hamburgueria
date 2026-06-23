import { useCallback } from "react";
import { comboService } from "../services/combo.service";
import { usePeriodFetch } from "./usePeriodFetch";

export function useCombos() {
  const fn = useCallback(() => comboService.getAll("", true), []);
  return usePeriodFetch(fn, "Erro ao carregar combos", []);
}
