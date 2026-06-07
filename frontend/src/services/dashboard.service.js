import api from "./api";

export const dashboardService = {
  getMetricas: async (periodo) => {
    const response = await api.get(`/pedidos/metricas?periodo=${periodo}`);
    return response.data;
  },
  getVendas: async (periodo) => {
    const response = await api.get(`/pedidos/vendas?periodo=${periodo}`);
    return response.data;
  },
  getTopItens: async (periodo) => {
    const response = await api.get(`/pedidos/top-itens?periodo=${periodo}`);
    return response.data;
  },
  getCategoriaMix: async (periodo) => {
    const response = await api.get(`/pedidos/categoria-mix?periodo=${periodo}`);
    return response.data;
  },
};
