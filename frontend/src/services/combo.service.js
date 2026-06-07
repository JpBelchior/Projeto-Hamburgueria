import api from "./api";

export const comboService = {
  getAll: (busca = "") => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    return api.get(`/combos?${params.toString()}`).then((r) => r.data);
  },

  getById: (id) =>
    api.get(`/combos/${id}`).then((r) => r.data),
};
