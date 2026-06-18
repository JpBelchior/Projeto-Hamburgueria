import { useState, useEffect, useCallback } from "react";

export const useGasto = (service, mes, ano, onAlterado) => {
  const [gastos,     setGastos]     = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await service.getAll(mes, ano);
      setGastos(resultado.gastos);
      setTotal(resultado.total);
    } catch {
      setGastos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [service, mes, ano]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const add = async (nome, valor, descricao, idsPayload = {}) => {
    setSaving(true);
    try {
      await service.create({ nome, valor: Number(valor), descricao, mes, ano, ...idsPayload });
      await fetchGastos();
      onAlterado?.();
    } finally {
      setSaving(false);
    }
  };

  const edit = async (id, nome, valor, descricao, idsPayload = {}) => {
    setSaving(true);
    try {
      await service.update(id, { nome, valor: Number(valor), descricao, ...idsPayload });
      setEditandoId(null);
      await fetchGastos();
      onAlterado?.();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setSaving(true);
    try {
      await service.remove(id);
      await fetchGastos();
      onAlterado?.();
    } finally {
      setSaving(false);
    }
  };

  return {
    gastos, total, loading, saving,
    editandoId, setEditandoId,
    add, edit, remove,
    refresh: fetchGastos,
  };
};
