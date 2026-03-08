// src/services/auth.service.js
import api from "./api";

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });

    // Persiste tudo aqui — ninguém mais precisa saber do localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user)); // inclui permissions

    return data.user;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.clear();
    }
  },

  me: async () => {
    const { data } = await api.get("/auth/me");
    localStorage.setItem("user", JSON.stringify(data.user)); // atualiza permissions
    return data.user;
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  hasPermission: (permission) => {
    const user = authService.getUser();
    return user?.permissions?.includes(permission) ?? false;
  },
};