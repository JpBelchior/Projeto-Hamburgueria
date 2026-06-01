import api from "./api";

export const financeiroService = {
  getMetricas: async (tipo, mes, ano) => {
    const params = new URLSearchParams({ tipo, ano });
    if (tipo === "mensal") params.set("mes", mes);
    const response = await api.get(`/financeiro/metricas?${params}`);
    return response.data;
  },
};
