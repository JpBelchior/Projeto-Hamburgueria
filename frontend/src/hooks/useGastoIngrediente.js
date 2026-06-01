import { useState, useEffect, useCallback } from "react";
import { gastoIngredienteService } from "../services/gasto_ingrediente.service";

export const useGastoIngrediente = (mes, ano, onAlterado) => {
  const [gastos,   setGastos]   = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await gastoIngredienteService.getAll(mes, ano);
      setGastos(resultado.gastos);
      setTotal(resultado.total);
    } catch {
      setGastos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const add = async (valor, descricao) => {
    setSaving(true);
    try {
      await gastoIngredienteService.create({ valor: Number(valor), descricao, mes, ano });
      await fetchGastos();
      onAlterado?.();
    } finally {
      setSaving(false);
    }
  };

  const edit = async (id, valor, descricao) => {
    setSaving(true);
    try {
      await gastoIngredienteService.update(id, { valor: Number(valor), descricao });
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
      await gastoIngredienteService.remove(id);
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
  };
};
