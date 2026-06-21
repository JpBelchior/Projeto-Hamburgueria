import api from "./api";

const buildParams = (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.mes != null) params.set("mes", filtros.mes);
  if (filtros.ano != null) params.set("ano", filtros.ano);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const gastoService = {
  getAll: async (filtros) => {
    const { data } = await api.get(`/gastos${buildParams(filtros)}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/gastos", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/gastos/${id}`, payload);
    return data;
  },

  remove: async (id, reverterEstoque = false) => {
    await api.delete(`/gastos/${id}?reverterEstoque=${reverterEstoque}`);
  },
};
