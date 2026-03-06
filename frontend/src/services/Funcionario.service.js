import api from "./api";

export const funcionarioService = {
  getAll: async () => {
    const response = await api.get("/funcionarios");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/funcionarios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/funcionarios", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/funcionarios/${id}`, data);
    return response.data;
  },

  toggleActive: async (id) => {
    const response = await api.patch(`/funcionarios/${id}/toggle`);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/funcionarios/${id}`);
    return response.data;
  },
};