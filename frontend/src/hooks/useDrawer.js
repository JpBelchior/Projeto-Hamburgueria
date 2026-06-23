import { useState, useEffect, useCallback } from "react";

export function useDrawer(service, id, periodo, { onAtualizado, onDeletado } = {}) {
  const [item,       setItem]       = useState(null);
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
      service.getById(id),
      service.getDesempenho ? service.getDesempenho(id, periodo) : Promise.resolve(null),
    ])
      .then(([data, desemp]) => { setItem(data); setDesempenho(desemp); })
      .catch((e) => setErro(e.message ?? "Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, [id, periodo, service]);

  useEffect(() => { refetch(); }, [refetch]);

  const handleToggleAtivo = async () => {
    if (!item || !service.toggleAtivo) return;
    const novoAtivo = !item.ativo;
    setItem((prev) => ({ ...prev, ativo: novoAtivo }));
    try {
      const atualizado = await service.toggleAtivo(id);
      setItem(atualizado);
      onAtualizado?.(atualizado);
    } catch {
      setItem((prev) => ({ ...prev, ativo: !novoAtivo }));
    }
  };

  const handleSalvar = async (data) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      const atualizado = await service.update(id, data);
      setItem(atualizado);
      onAtualizado?.(atualizado);
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao salvar.");
      throw e;
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    try {
      await service.remove(id);
      onDeletado?.(id);
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao excluir.");
      throw e;
    }
  };

  return { item, desempenho, loading, erro, salvando, erroSalvar, handleToggleAtivo, handleSalvar, handleDelete };
}
