import api from "./api";

export const produtoService = {
  getAll: (busca = "", categoria = "", incluirInativos = false) => {
    const params = new URLSearchParams();
    if (busca)           params.set("busca",          busca);
    if (categoria)       params.set("categoria",       categoria);
    if (incluirInativos) params.set("incluirInativos", "true");
    return api.get(`/produtos?${params.toString()}`).then((r) => r.data);
  },

  getById: (id) =>
    api.get(`/produtos/${id}`).then((r) => r.data),

  getMetricas: (periodo) =>
    api.get(`/produtos/metricas?periodo=${periodo}`).then((r) => r.data),

  getTopPorCategoria: (periodo) =>
    api.get(`/produtos/top-por-categoria?periodo=${periodo}`).then((r) => r.data),

  getDesempenho: (id, periodo) =>
    api.get(`/produtos/${id}/desempenho?periodo=${periodo}`).then((r) => r.data),

  criar: (data) =>
    api.post("/produtos", data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/produtos/${id}`, data).then((r) => r.data),

  toggleAtivo: (id) =>
    api.patch(`/produtos/${id}/toggle`).then((r) => r.data),

  deletar: (id) =>
    api.delete(`/produtos/${id}`).then((r) => r.data),
};
