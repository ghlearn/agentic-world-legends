# Local development

This guide covers local play in GitHub Copilot App canvas and direct browser
development.

## Local dev in GitHub Copilot App canvas

1. Open this repo in GitHub Copilot App (terminal panel available).
2. In the Copilot App terminal, run:

   ```bash
   pnpm install
   pnpm run assets
   pnpm run dev
   ```

   This starts the dev server on `http://localhost:5173/` (leave it running).
3. Restart GitHub Copilot App to reload extensions.
4. Once restarted, reload extensions: **Extensions** -> **Reload extensions**.
5. Open canvas `agentic-world-launcher` with `{ "mode": "local" }`.
6. Play. The canvas iframes your local dev server.

Keep the dev server terminal active while playing in local mode.

## Run locally without canvas

```bash
pnpm install
pnpm run assets
pnpm run dev
```

Default dev URL: <http://localhost:5173/>

## Local quality checks (CI-equivalent)

Run these before opening or updating a pull request:

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

## Build and preview production output

```bash
pnpm run build
pnpm run preview
```
