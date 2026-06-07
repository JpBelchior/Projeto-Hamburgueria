import api from "./api";

export const pedidoService = {
  getAll: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.periodo)        params.set("periodo",        filtros.periodo);
    if (filtros.status)         params.set("status",         filtros.status);
    if (filtros.formaPagamento) params.set("formaPagamento", filtros.formaPagamento);
    return api.get(`/pedidos?${params.toString()}`).then((r) => r.data);
  },

  getById: (id) =>
    api.get(`/pedidos/${id}`).then((r) => r.data),

  create: (data) =>
    api.post("/pedidos", data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/pedidos/${id}`, data).then((r) => r.data),

  updateStatus: (id, status) =>
    api.patch(`/pedidos/${id}/status`, { status }).then((r) => r.data),

  cancel: (id) =>
    api.patch(`/pedidos/${id}/cancel`).then((r) => r.data),

  remove: (id) =>
    api.delete(`/pedidos/${id}`),
};
