/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VUE_ROUTER_MODE?: 'hash' | 'history' | 'abstract'
  readonly VUE_ROUTER_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
