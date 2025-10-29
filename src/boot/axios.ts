import { defineBoot } from '@quasar/app-vite/wrappers';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://example.com/',
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
