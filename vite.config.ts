import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = process.env.VITE_BASE_PATH ?? (repoName ? `/${repoName}/` : "/");

export default defineConfig({
  base,
  server: { port: 5173, host: true },
  build: { target: 'es2020', sourcemap: true },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
