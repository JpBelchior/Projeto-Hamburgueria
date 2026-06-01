import api from "./api";

export const gastoIngredienteService = {
  getAll: async (mes, ano) => {
    const response = await api.get(`/gasto-ingredientes?mes=${mes}&ano=${ano}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/gasto-ingredientes", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/gasto-ingredientes/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    await api.delete(`/gasto-ingredientes/${id}`);
  },
};
