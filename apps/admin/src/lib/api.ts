import axios from 'axios';
import { useSettingsStore } from '../store/settings';

export const api = axios.create();

api.interceptors.request.use((config) => {
  const { adminKey, apiUrl } = useSettingsStore.getState();
  config.baseURL = apiUrl || '/api/v1';
  if (adminKey) config.headers['X-Admin-Key'] = adminKey;
  return config;
});

export function getApiBase() {
  return useSettingsStore.getState().apiUrl || '';
}
