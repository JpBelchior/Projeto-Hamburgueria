import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// ─────────────────────────────────────────
// REQUEST — injeta o token em toda requisição
// ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────
// RESPONSE — captura 401 e redireciona para login
// ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Token expirado — tenta renovar uma vez
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(
          "http://localhost:3001/api/auth/refresh",
          { refreshToken }
        );

        localStorage.setItem("token", data.token);
        original.headers.Authorization = `Bearer ${data.token}`;

        // Refaz a requisição original com o novo token
        return api(original);
      } catch {
        // Refresh expirado ou inválido — desloga
        localStorage.clear();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;