import api from "./api";

export const ingredienteService = {
  getAll:      ()           => api.get("/ingredientes").then((r) => r.data),
  getMetricas: ()           => api.get("/ingredientes/metricas").then((r) => r.data),
  getById:     (id)         => api.get(`/ingredientes/${id}`).then((r) => r.data),
  criar:       (data)       => api.post("/ingredientes", data).then((r) => r.data),
  update:      (id, data)   => api.put(`/ingredientes/${id}`, data).then((r) => r.data),
  remove:      (id)         => api.delete(`/ingredientes/${id}`).then((r) => r.data),
};
