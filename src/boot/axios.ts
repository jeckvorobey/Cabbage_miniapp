import { defineBoot } from '@quasar/app-vite/wrappers';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { client } from 'src/api/client';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Boot файл только для настройки глобальных свойств Vue
export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = client;
});
