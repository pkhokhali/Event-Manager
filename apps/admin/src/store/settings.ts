import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  apiUrl: string;
  adminKey: string;
  setApiUrl: (url: string) => void;
  setAdminKey: (key: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8787/api/v1',
      adminKey: '',
      setApiUrl: (apiUrl) => set({ apiUrl }),
      setAdminKey: (adminKey) => set({ adminKey }),
    }),
    { name: 'event-manager-admin-settings' }
  )
);
