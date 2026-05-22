import axios from 'axios';
import Constants from 'expo-constants';
import { getDeviceId } from '../store/device';

const baseURL =
  (Constants.expoConfig?.extra as { apiUrl?: string })?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:4000/api/v1';

export const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  config.headers['X-Device-Id'] = getDeviceId();
  return config;
});
