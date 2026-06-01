import api from "./api";

export const salesService = {
  getVendas: async (periodo) => {
    const response = await api.get(`/pedidos/vendas?periodo=${periodo}`);
    return response.data;
  },
};
