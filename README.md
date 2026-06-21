# Agentic World of Legends

A browser-based side-scrolling platformer built with [Phaser 3](https://phaser.io)
+ Vite + TypeScript.

> Traverse six credential realms, restore the sacred Mainline, and become a
> legend of the Agentic World.

## Credential progression

The campaign now runs through six end-of-level credential gates:

| Level | Credential | Scene key |
| --- | --- | --- |
| 1 | GitHub Administration (GH-100) | `LevelGH100Admin` |
| 2 | GitHub Foundations (GH-900) | `LevelGH900Foundations` |
| 3 | GitHub Advanced Security (GH-500) | `LevelGH500AdvancedSecurity` |
| 4 | GitHub Copilot (GH-300) | `LevelGH300Copilot` |
| 5 | GitHub Actions (GH-200) | `LevelGH200Actions` |
| 6 | GitHub Agentic AI Developer (GH-600) | `LevelGH600AgenticAI` |

Each level ends with a required quiz question before progression continues. The
question set intentionally excludes Applied Skills topics.

## Controls

| Action | Keys |
| --- | --- |
| Move | `←` / `→` or `A` / `D` |
| Run (sprint) | `Shift` (or `X`) |
| Jump | `Space` or `W` |
| Restart current stage | `R` |
| Quit to title | `Q` |
| Pause | `Esc` |
| Mute / unmute | `M` |
| Continue dialog | `Space` / `Enter` / click |

## Run locally

```bash
pnpm install
pnpm run assets
pnpm run dev
```

Default dev URL: <http://localhost:5173/>

Build + preview:

```bash
pnpm run build
pnpm run preview
```

## Canvas launcher extension (project-scoped)

This repo includes `.github/extensions/agentic-world-launcher/extension.mjs`.
After extensions are reloaded, open/play from canvas with:

- **Local mode** (recommended while developing): run `pnpm run dev`, then open
  canvas `agentic-world-launcher` with `{ "mode": "local" }`
- **Pages mode**: open canvas with `{ "mode": "pages" }`

You can switch targets using action `set_target`.

## Template-repo usage

This project is ready for template copying:

1. Mark the repo as a template in GitHub settings.
2. Click **Use this template** to create your own repo.
3. Enable GitHub Pages (source: GitHub Actions).
4. Push to `main` to trigger `.github/workflows/deploy.yml`.

`vite.config.ts` and deployment workflows are template-friendly: base path is
computed from repository name in CI via `VITE_BASE_PATH`, so copied repos deploy
under `/<your-repo-name>/` without hardcoding.

## Deploy

Pushes to `main` are built and published to GitHub Pages by
`.github/workflows/deploy.yml`.

## Project layout

```
agentic-world-legends/
├── assets-src/raw/
├── scripts/optimize-assets.ts
├── src/
│   ├── main.ts
│   ├── data/quizzes.ts
│   ├── scenes/
│   │   ├── LevelGH100AdminScene.ts
│   │   ├── LevelGH900FoundationsScene.ts
│   │   ├── LevelGH500AdvancedSecurityScene.ts
│   │   ├── LevelGH300CopilotScene.ts
│   │   ├── LevelGH200ActionsScene.ts
│   │   └── LevelGH600AgenticAIScene.ts
│   └── systems/
├── .github/workflows/
└── .github/extensions/agentic-world-launcher/
```

## License

&copy; 2026 Ari LiVigni &bull; [MIT License](https://gh.io/mit)
