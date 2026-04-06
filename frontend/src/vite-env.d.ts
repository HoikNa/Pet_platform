/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AWS_S3_REGION: string
  readonly VITE_AWS_S3_BUCKET: string
  readonly VITE_KAKAO_APP_KEY: string
  readonly VITE_DEMO_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
