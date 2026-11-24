/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GENCAND_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
