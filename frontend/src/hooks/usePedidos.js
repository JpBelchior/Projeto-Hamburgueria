import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { pedidoService } from "../services/pedido.service";

const FILTROS_INICIAIS = { periodo: "hoje", status: "", formaPagamento: "", busca: "" };
const DRAWER_FECHADO   = { aberto: false, modo: "criar", dados: null };

export function usePedidos() {
  const [pedidos,  setPedidos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filters,  setFilters]  = useState(FILTROS_INICIAIS);
  const [drawer,   setDrawer]   = useState(DRAWER_FECHADO);
  const [tick,     setTick]     = useState(0);

  const timerRef   = useRef(null);
  const refreshRef = useRef(null);

  const fetchPedidos = useCallback(async (f = filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidoService.getAll({
        periodo:        f.periodo,
        status:         f.status        || undefined,
        formaPagamento: f.formaPagamento || undefined,
      });
      setPedidos(data);
    } catch {
      setError("Não foi possível carregar os pedidos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Busca inicial + re-fetch quando período muda
  useEffect(() => {
    fetchPedidos(filters);
  }, [filters.periodo]);

  // Cronômetro — tick a cada 1s
  useEffect(() => {
    timerRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Auto-refresh a cada 30s
  useEffect(() => {
    refreshRef.current = setInterval(() => fetchPedidos(filters), 30_000);
    return () => clearInterval(refreshRef.current);
  }, [filters]);

  const filtered = useMemo(() => {
    const busca = (filters.busca ?? "").toLowerCase().trim();
    return pedidos.filter((p) => {
      if (filters.status         && p.status         !== filters.status)         return false;
      if (filters.formaPagamento && p.formaPagamento !== filters.formaPagamento) return false;
      if (busca) {
        const num    = (p.numeroPedido ?? "").toLowerCase();
        const client = (p.nomeCliente  ?? "").toLowerCase();
        if (!num.includes(busca) && !client.includes(busca)) return false;
      }
      return true;
    });
  }, [pedidos, filters.status, filters.formaPagamento, filters.busca]);

  const actions = {
    setFilter: (key, value) =>
      setFilters((prev) => ({ ...prev, [key]: value })),

    resetFilters: () =>
      setFilters(FILTROS_INICIAIS),

    openCreate: () =>
      setDrawer({ aberto: true, modo: "criar", dados: null }),

    openEdit: (pedido) =>
      setDrawer({ aberto: true, modo: "editar", dados: pedido }),

    closeDrawer: () =>
      setDrawer(DRAWER_FECHADO),

    updateStatus: async (id, status) => {
      try {
        const atualizado = await pedidoService.updateStatus(id, status);
        setPedidos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
      } catch {
        setError("Não foi possível atualizar o status.");
      }
    },

    create: async (data) => {
      const novo = await pedidoService.create(data);
      setPedidos((prev) => [novo, ...prev]);
      setDrawer(DRAWER_FECHADO);
    },

    update: async (id, data) => {
      const atualizado = await pedidoService.update(id, data);
      setPedidos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
      setDrawer(DRAWER_FECHADO);
    },

    cancel: async (id) => {
      const atualizado = await pedidoService.cancel(id);
      setPedidos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
    },

    remove: async (id) => {
      await pedidoService.remove(id);
      setPedidos((prev) => prev.filter((p) => p.id !== id));
      setDrawer(DRAWER_FECHADO);
    },
  };

  return {
    pedidos,
    filtered,
    loading,
    error,
    filters,
    drawer,
    tick,
    refetch: () => fetchPedidos(filters),
    actions,
  };
}
