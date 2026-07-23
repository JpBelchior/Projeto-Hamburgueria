import api from "./api";

export const userService = {
  updateMe: async (name) => {
    const { data } = await api.put("/users/me", { name });
    return data;
  },

  changePassword: async (novaSenha) => {
    const { data } = await api.put("/users/me/senha", { novaSenha });
    return data;
  },
};
