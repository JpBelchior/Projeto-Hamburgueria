import { useCallback } from "react";
import { promocaoService } from "../services/promocao.service";
import { usePeriodFetch } from "./usePeriodFetch";

export function usePromocoes() {
  const fn = useCallback(() => promocaoService.getAll("", true), []);
  return usePeriodFetch(fn, "Erro ao carregar promoções", []);
}
