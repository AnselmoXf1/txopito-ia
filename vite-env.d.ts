/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_ENABLED: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_SYNC_INTERVAL: string;
  readonly VITE_OFFLINE_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}