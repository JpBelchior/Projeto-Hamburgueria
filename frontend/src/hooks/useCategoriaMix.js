import { useCallback } from "react";
import { usePeriodFetch } from "./usePeriodFetch";
import { categoriaMixService } from "../services/categoriaMix.service";

export const useCategoriaMix = (periodo) => {
  const fn = useCallback(() => categoriaMixService.getCategoriaMix(periodo), [periodo]);
  return usePeriodFetch(fn, "Não foi possível carregar o mix de categorias.");
};
