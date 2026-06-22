import { useDrawer } from "./useDrawer";
import { comboService } from "../services/combo.service";

export function useComboDrawer(id, periodo, { onAtualizado, onDeletado } = {}) {
  const { item: combo, ...rest } = useDrawer(comboService, id, periodo, { onAtualizado, onDeletado });
  return { combo, ...rest };
}
