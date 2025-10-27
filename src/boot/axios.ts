import { defineBoot } from '@quasar/app-vite/wrappers';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}
const BASE_URL = import.meta.env.VITE_API_URL ?? null;
console.log('API BASE_URL:', BASE_URL);
const client = axios.create({
  baseURL: BASE_URL ?? 'https://dev-api-cabbage.sergeywebdev.ru/',
  timeout: 30000,
  withCredentials: true,
});

client.interceptors.request.use((request) => {
  if (!request.headers.SkipAuth) {
    request.headers.Authorization = 'X-Telegram-Id ' + localStorage.getItem('token');
  }

  return request;
});

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = client;
});

export { client };
