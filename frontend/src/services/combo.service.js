import api from "./api";

export const comboService = {
  getAll: (busca = "", incluirInativos = false) => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (incluirInativos) params.set("incluirInativos", "true");
    return api.get(`/combos?${params.toString()}`).then((r) => r.data);
  },

  getById: (id) =>
    api.get(`/combos/${id}`).then((r) => r.data),

  getDesempenho: (id, periodo) =>
    api.get(`/combos/${id}/desempenho?periodo=${periodo}`).then((r) => r.data),

  create: (payload) =>
    api.post("/combos", payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/combos/${id}`, payload).then((r) => r.data),

  toggleAtivo: (id) =>
    api.patch(`/combos/${id}/toggle`).then((r) => r.data),

  remove: (id) =>
    api.delete(`/combos/${id}`).then((r) => r.data),
};
