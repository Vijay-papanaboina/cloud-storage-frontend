import { create } from "zustand";
import { authApi } from "@/lib/auth";
import type { User } from "@/lib/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  initAuth: async () => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        set({ user: JSON.parse(storedUser), isLoading: false });
        // Optionally verify token is still valid
        await authApi.getCurrentUser();
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        set({ user: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (username: string, password: string) => {
    const response = await authApi.login({
      username,
      password,
    });
    localStorage.setItem("accessToken", response.accessToken);
    // Refresh token is now in httpOnly cookie, not stored in localStorage
    localStorage.setItem("user", JSON.stringify(response.user));
    set({ user: response.user });
  },

  register: async (username: string, email: string, password: string) => {
    await authApi.register({ username, email, password });
    // Auto-login after registration
    await get().login(username, password);
  },

  logout: async () => {
    try {
      // Refresh token is in httpOnly cookie, backend will read it from cookie
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    set({ user: null });
  },

  refreshUser: async () => {
    try {
      const user = await authApi.getCurrentUser();
      set({ user });
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  },
}));
