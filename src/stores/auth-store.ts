import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, setToken, clearToken, type User, type Profession } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, profession?: Profession) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  saveInterests: (topics: string[]) => Promise<void>;
  toggleSubscribe: () => Promise<boolean>;
  updateProfile: (body: Parameters<typeof auth.updateProfile>[0]) => Promise<void>;
  completeOnboarding: () => void;
  setInterests: (topics: string[]) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: "",

      login: async (email, password) => {
        set({ loading: true, error: "" });
        try {
          const { token, user } = await auth.login(email, password);
          setToken(token);
          set({ user, isAuthenticated: true, loading: false });
          return true;
        } catch (e: any) {
          set({ error: e.message, loading: false });
          return false;
        }
      },

      register: async (fullName, email, password, profession = "student") => {
        set({ loading: true, error: "" });
        try {
          const { token, user } = await auth.signup({ full_name: fullName, email, password, profession });
          setToken(token);
          set({ user, isAuthenticated: true, loading: false });
          return true;
        } catch (e: any) {
          set({ error: e.message, loading: false });
          return false;
        }
      },

      logout: () => {
        clearToken();
        set({ user: null, isAuthenticated: false, error: "" });
      },

      fetchMe: async () => {
        const token = localStorage.getItem("steami_token");
        if (!token) return;
        set({ loading: true });
        try {
          const user = await auth.me();
          set({ user, isAuthenticated: true, loading: false });
        } catch {
          clearToken();
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },

      saveInterests: async (topics) => {
        const { user } = get();
        if (!user) return;
        try {
          const res = await auth.saveInterests(topics);
          set({ user: { ...user, interests: res.interests, onboarded: true } });
        } catch { /* ignore */ }
      },

      toggleSubscribe: async () => {
        const { user } = get();
        if (!user) return false;
        try {
          const res = await auth.toggleSubscribe();
          set({ user: { ...user, subscribe_email: res.subscribe_email } });
          return res.subscribe_email;
        } catch { return user.subscribe_email; }
      },

      updateProfile: async (body) => {
        set({ loading: true, error: "" });
        try {
          const res = await auth.updateProfile(body);
          set({ user: res.user, loading: false });
        } catch (e: any) {
          set({ error: e.message, loading: false });
          throw e;
        }
      },

      completeOnboarding: () => {
        const { user } = get();
        if (user) set({ user: { ...user, onboarded: true } });
      },

      setInterests: (topics) => {
        const { user } = get();
        if (user) set({ user: { ...user, interests: topics } });
      },

      clearError: () => set({ error: "" }),
    }),
    {
      name: "steami_auth_v2",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);