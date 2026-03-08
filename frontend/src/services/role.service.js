// services/role.service.js
import api from "./api";

export const roleService = {
  getAll: async () => {
    const { data } = await api.get("/roles");
    return data;
  },
};