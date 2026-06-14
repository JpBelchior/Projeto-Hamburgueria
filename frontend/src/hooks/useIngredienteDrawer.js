import { useState, useEffect, useCallback } from "react";
import { ingredienteService } from "../services/ingrediente.service";

export function useIngredienteDrawer(id, { onIngredienteAtualizado, onIngredienteDeletado } = {}) {
  const [ingrediente, setIngrediente] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState(null);
  const [salvando,    setSalvando]    = useState(false);
  const [erroSalvar,  setErroSalvar]  = useState(null);

  const refetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setErro(null);
    ingredienteService
      .getById(id)
      .then(setIngrediente)
      .catch((e) => setErro(e.message ?? "Erro ao carregar ingrediente"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  const handleSalvar = async (data) => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      const atualizado = await ingredienteService.update(id, data);
      setIngrediente(atualizado);
      onIngredienteAtualizado?.(atualizado);
    } catch (e) {
      setErroSalvar(e?.response?.data?.message ?? e?.message ?? "Erro ao salvar ingrediente.");
      throw e;
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    await ingredienteService.deletar(id);
    onIngredienteDeletado?.(id);
  };

  return { ingrediente, loading, erro, salvando, erroSalvar, handleSalvar, handleDelete };
}
