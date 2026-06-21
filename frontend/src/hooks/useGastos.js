import { useState, useEffect, useCallback } from "react";
import { gastoService } from "../services/gasto.service";

export const useGastos = (filtros = {}) => {
  const [gastos,  setGastos]  = useState([]);
  const [totais,  setTotais]  = useState({ ingrediente: 0, funcionario: 0, generico: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await gastoService.getAll(filtros);
      setGastos(resultado.gastos);
      setTotais(resultado.totais);
    } catch {
      setGastos([]);
      setTotais({ ingrediente: 0, funcionario: 0, generico: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.tipo, filtros.mes, filtros.ano]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const add = async (payload) => {
    await gastoService.create(payload);
    await fetchGastos();
  };

  const edit = async (id, payload) => {
    await gastoService.update(id, payload);
    await fetchGastos();
  };

  const remove = async (id, reverterEstoque = false) => {
    await gastoService.remove(id, reverterEstoque);
    await fetchGastos();
  };

  return { gastos, totais, loading, add, edit, remove, refresh: fetchGastos };
};
