import { useDrawer } from "./useDrawer";
import { produtoService } from "../services/produto.service";

export function useProdutoDrawer(id, periodo, { onProdutoAtualizado, onProdutoDeletado } = {}) {
  const { item: produto, ...rest } = useDrawer(produtoService, id, periodo, { onAtualizado: onProdutoAtualizado, onDeletado: onProdutoDeletado });
  return { produto, ...rest };
}
