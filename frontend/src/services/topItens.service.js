import api from "./api";

export const topItensService = {
  getTopItens: async (periodo) => {
    const response = await api.get(`/pedidos/top-itens?periodo=${periodo}`);
    return response.data;
  },
};
