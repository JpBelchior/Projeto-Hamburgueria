// store/useAuthStore.js
import { create } from "zustand";
import { authService } from "../services/auth.service";

const useAuthStore = create((set, get) => ({
  user: authService.getUser(),
  loading: false,
  error: null,

  // ─────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await authService.login(email, password);
      set({ user, loading: false });
      return user;
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao fazer login.";
      set({ error: message, loading: false });
      return null;
    }
  },

  // ─────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────
  logout: async () => {
    await authService.logout();
    set({ user: null, error: null });
  },

  // ─────────────────────────────────────────
  // ATUALIZA USUÁRIO (ex: após refresh ou me)
  // ─────────────────────────────────────────
  fetchMe: async () => {
    try {
      const user = await authService.me();
      set({ user });
    } catch {
      get().logout();
    }
  },

  // ─────────────────────────────────────────
  // PERMISSÕES
  // ─────────────────────────────────────────
  hasPermission: (permission) => {
    const { user } = get();
    return user?.permissions?.includes(permission) ?? false;
  },

  isAuthenticated: () => !!get().user,
}));

export default useAuthStore;