import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axios from "axios";

export const useAuthenticated = create(
  persist(
    (set) => ({
      loading: false,
      isCheckingAuth: true,
      isAuthenticated: false,
      users: null,
      signup: async (formData) => {
        set({ loading: true });

        try {
          const response = await axios.post(
            "http://localhost:3000/auth/signup",
            formData,
            {
              withCredentials: true,
            }
          );
          set({ loading: false, users: response.data.data.user });
        } catch (err) {
          const message =
            err.response?.data?.message || err.message || "Signup failed";
          set({ loading: false, error: message });
          console.error("Signup error:", message);
          throw new Error(message);
        }
      },
      login: async (formData) => {
        set({ loading: true });
        try {
          const response = await axios.post(
            "http://localhost:3000/auth/login",
            formData,
            {
              withCredentials: true,
            }
          );
          set({
            loading: false,
            isAuthenticated: true,
            users: response.data.data.user,
          });
        } catch (err) {
          const message =
            err.response?.data?.message || err.message || "Login failed";
          set({ loading: false, error: message });
          console.error("Login error:", message);
          throw new Error(message);
        }
      },
      checkAuth: async () => {
        try {
          set({ isCheckingAuth: true });
          const response = await axios.get(
            "http://localhost:3000/auth/checkAuth",
            { withCredentials: true }
          );
          set({
            isCheckingAuth: false,
            isAuthenticated: true,
            users: response.data.user,
          });
        } catch (err) {
          set({ isCheckingAuth: false, isAuthenticated: false });
          console.error("Check auth error:", err);
        }
      },
      logout: async () => {
        try {
          await axios.post("http://localhost:3000/auth/logout", {
            withCredentials: true,
          });
          set({ isAuthenticated: false, users: null });
        } catch (err) {
          console.error("Logout error:", err);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
