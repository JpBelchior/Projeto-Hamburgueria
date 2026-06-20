import api from "./api";

export const restauranteService = {
  getMe: () => api.get("/restaurantes/me"),
  update: (data) => api.put("/restaurantes/me", data),
};
