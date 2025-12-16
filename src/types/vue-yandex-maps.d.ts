declare module 'vue-yandex-maps' {
  import type { DefineComponent, Plugin } from 'vue';

  export const YandexMap: DefineComponent<any, any, any>;
  export const YandexMapDefaultSchemeLayer: DefineComponent<any, any, any>;
  export const YandexMapDefaultFeaturesLayer: DefineComponent<any, any, any>;
  export const YandexMapDefaultMarker: DefineComponent<any, any, any>;
  export function createYmaps(options?: Record<string, unknown>): Plugin;
}
