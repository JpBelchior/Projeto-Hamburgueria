import api from "./api";

export const dashboardService = {
  getMetricas: async (periodo) => {
    const response = await api.get(`/pedidos/metricas?periodo=${periodo}`);
    return response.data;
  },
};
