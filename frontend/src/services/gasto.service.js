import api from "./api";

const createGastoService = (endpoint) => ({
  getAll: async (mes, ano) => {
    const url = mes != null && ano != null ? `${endpoint}?mes=${mes}&ano=${ano}` : endpoint;
    const { data } = await api.get(url);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post(endpoint, payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`${endpoint}/${id}`, payload);
    return data;
  },
  remove: async (id, reverterEstoque = false) => {
    await api.delete(`${endpoint}/${id}?reverterEstoque=${reverterEstoque}`);
  },
});

export const gastoIngredienteService = createGastoService("/gasto-ingredientes");
export const gastoFuncionarioService  = createGastoService("/gasto-funcionarios");
