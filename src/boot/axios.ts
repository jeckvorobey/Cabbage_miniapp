import { defineBoot } from '@quasar/app-vite/wrappers';
import type { AxiosInstance } from 'axios';
import axios from 'axios';

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
    const token = localStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
  }

  return request;
});

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = client;
});

export { client };
