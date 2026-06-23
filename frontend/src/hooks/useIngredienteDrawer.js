import { useDrawer } from "./useDrawer";
import { ingredienteService } from "../services/ingrediente.service";

export function useIngredienteDrawer(id, { onIngredienteAtualizado, onIngredienteDeletado } = {}) {
  const { item: ingrediente, ...rest } = useDrawer(ingredienteService, id, null, { onAtualizado: onIngredienteAtualizado, onDeletado: onIngredienteDeletado });
  return { ingrediente, ...rest };
}
