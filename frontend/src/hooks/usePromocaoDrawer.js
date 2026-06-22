import { useDrawer } from "./useDrawer";
import { promocaoService } from "../services/promocao.service";

export function usePromocaoDrawer(id, periodo = "30dias", { onAtualizado, onDeletado } = {}) {
  const { item: promocao, ...rest } = useDrawer(promocaoService, id, periodo, { onAtualizado, onDeletado });
  return { promocao, ...rest };
}
