import { useCallback } from "react";
import { ingredienteService } from "../services/ingrediente.service";
import { usePeriodFetch } from "./usePeriodFetch";

export function useIngredientes() {
  const fn = useCallback(() => ingredienteService.getAll(true), []);
  return usePeriodFetch(fn, "Erro ao carregar ingredientes", []);
}
