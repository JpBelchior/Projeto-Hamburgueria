import api from "./api";

export const produtoService = {
  getAll: (busca = "", categoria = "") => {
    const params = new URLSearchParams();
    if (busca)      params.set("busca",     busca);
    if (categoria)  params.set("categoria", categoria);
    return api.get(`/produtos?${params.toString()}`).then((r) => r.data);
  },

  getById: (id) =>
    api.get(`/produtos/${id}`).then((r) => r.data),

  getMetricas: (periodo) =>
    api.get(`/produtos/metricas?periodo=${periodo}`).then((r) => r.data),
};
