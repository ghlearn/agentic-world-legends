declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_LEADERBOARD_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
