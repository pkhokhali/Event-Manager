import axios from 'axios';
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

export const api = axios.create();

api.interceptors.request.use((config) => {
  const { apiUrl } = useSettingsStore.getState();
  const { token } = useAuthStore.getState();
  config.baseURL = apiUrl || '/api/v1';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url || '');
      if (!url.includes('/admin/login')) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getApiBase() {
  return useSettingsStore.getState().apiUrl || '';
}
