import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL ??
  'https://event-manager-api.prabinkhokhali89.workers.dev/api/v1';

function resolveApiUrl(stored?: string): string {
  const url = (stored || '').trim();
  const onPages =
    typeof window !== 'undefined' && window.location.hostname.endsWith('pages.dev');
  if (!url) return DEFAULT_API_URL;
  // Stale local URL from earlier Settings breaks production login with a silent network error
  if (onPages && /localhost|127\.0\.0\.1/.test(url)) return DEFAULT_API_URL;
  return url;
}

type SettingsState = {
  apiUrl: string;
  setApiUrl: (url: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiUrl: DEFAULT_API_URL,
      setApiUrl: (apiUrl) => set({ apiUrl: apiUrl.trim() || DEFAULT_API_URL }),
    }),
    {
      name: 'event-manager-admin-settings',
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<SettingsState>;
        return {
          ...current,
          ...p,
          apiUrl: resolveApiUrl(p.apiUrl ?? current.apiUrl),
        };
      },
    }
  )
);
