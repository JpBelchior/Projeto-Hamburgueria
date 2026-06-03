import api from "./api";

export const categoriaMixService = {
  getCategoriaMix: async (periodo) => {
    const response = await api.get(`/pedidos/categoria-mix?periodo=${periodo}`);
    return response.data;
  },
};
