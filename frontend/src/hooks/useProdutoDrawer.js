import { useState, useEffect, useCallback } from "react";
import { produtoService } from "../services/produto.service";

export function useProdutoDrawer(id, periodo, { onProdutoAtualizado, onProdutoDeletado } = {}) {
  const [produto,    setProduto]    = useState(null);
  const [desempenho, setDesempenho] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState(null);
  const [salvando,   setSalvando]   = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);

  const refetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setErro(null);
    Promise.all([
      produtoService.getById(id),
      produtoService.getDesempenho(id, periodo),
    ])
      .then(([p, d]) => { setProduto(p); setDesempenho(d); })
      .catch((e) => setErro(e.message ?? "Erro ao carregar produto"))
      .finally(() => setLoading(false));
  }, [id, periodo]);

  useEffect(() => { refetch(); }, [refetch]);

  const handleToggleAtivo = async () => {
    if (!produto) return;
    const novoAtivo = !produto.ativo;
    setProduto((p) => ({ ...p, ativo: novoAtivo }));
    try {
      const atualizado = await produtoService.toggleAtivo(id);
      setProduto(atualizado);
      onProdutoAtualizado?.(atualizado);
    } catch {
      setProduto((p) => ({ ...p, ativo: !novoAtivo }));
    }
  };

  const handleSalvar = async (data) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      const atualizado = await produtoService.update(id, data);
      setProduto(atualizado);
      onProdutoAtualizado?.(atualizado);
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao salvar produto.");
      throw e;
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    await produtoService.deletar(id);
    onProdutoDeletado?.(id);
  };

  return { produto, desempenho, loading, erro, salvando, erroSalvar, handleToggleAtivo, handleSalvar, handleDelete };
}
