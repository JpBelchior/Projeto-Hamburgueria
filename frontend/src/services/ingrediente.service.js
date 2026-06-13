import api from "./api";

export const ingredienteService = {
  getAll: () => api.get("/ingredientes").then((r) => r.data),
};
