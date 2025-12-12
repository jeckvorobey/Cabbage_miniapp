/// <reference types="vite/client" />

// Декларация модулей Vue компонентов
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VUE_ROUTER_MODE?: 'hash' | 'history' | 'abstract';
  readonly VUE_ROUTER_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
