import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  username: string | null;
  expiresAt: string | null;
  setSession: (session: { token: string; username: string; expiresAt: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      expiresAt: null,
      setSession: ({ token, username, expiresAt }) => set({ token, username, expiresAt }),
      logout: () => set({ token: null, username: null, expiresAt: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token) return false;
        if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
          set({ token: null, username: null, expiresAt: null });
          return false;
        }
        return true;
      },
    }),
    { name: 'event-manager-admin-auth' }
  )
);
