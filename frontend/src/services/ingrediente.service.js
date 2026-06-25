import api from "./api";

export const ingredienteService = {
  getAll:       (incluirInativos = false) => api.get("/ingredientes", { params: { incluirInativos } }).then((r) => r.data),
  getMetricas:  ()                        => api.get("/ingredientes/metricas").then((r) => r.data),
  getById:      (id)                      => api.get(`/ingredientes/${id}`).then((r) => r.data),
  criar:        (data)                    => api.post("/ingredientes", data).then((r) => r.data),
  update:       (id, data)                => api.put(`/ingredientes/${id}`, data).then((r) => r.data),
  toggleAtivo:  (id)                      => api.patch(`/ingredientes/${id}/toggle-ativo`).then((r) => r.data),
  remove:       (id)                      => api.delete(`/ingredientes/${id}`).then((r) => r.data),
};
