import api from "./api";

export const promocaoService = {
  getAll: (busca = "", incluirInativos = false) => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (incluirInativos) params.set("incluirInativos", "true");
    return api.get(`/promocoes?${params.toString()}`).then((r) => r.data);
  },

  getById: (id) =>
    api.get(`/promocoes/${id}`).then((r) => r.data),

  create: (payload) =>
    api.post("/promocoes", payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/promocoes/${id}`, payload).then((r) => r.data),

  toggleAtivo: (id) =>
    api.patch(`/promocoes/${id}/toggle`).then((r) => r.data),

  remove: (id) =>
    api.delete(`/promocoes/${id}`).then((r) => r.data),

  getDesempenho: (id, periodo) =>
    api.get(`/promocoes/${id}/desempenho?periodo=${periodo}`).then((r) => r.data),
};
