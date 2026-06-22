# Agentic World of Legends

A browser-based side-scrolling platformer built with [Phaser 3](https://phaser.io)
+ Vite + TypeScript.

> Traverse six credential realms, restore the sacred Mainline, and become a
> legend of the Agentic World.

## Quick links

- **GitHub Pages URL:** <https://ghlearn.github.io/agentic-world-legends/>
- **Pages deploy workflow:** `.github/workflows/deploy.yml`
- **Actions runs:** <https://github.com/ghlearn/agentic-world-legends/actions>

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

## Play in GitHub Copilot App (recommended)

This repo includes `.github/extensions/agentic-world-launcher/extension.mjs` so
you can play inside a Copilot App canvas.

### Prerequisites

- GitHub Copilot App installed and running.
- Repository opened in a Copilot workspace session.

### Fastest path (play from GitHub Pages)

1. Open this repository in the GitHub Copilot App.
2. In your Copilot workspace, select **Extensions** → **Reload extensions** (or restart the session).
3. Open canvas `agentic-world-launcher` with `{ "mode": "pages" }`.
4. Play! 🎮

Default published URL: <https://ghlearn.github.io/agentic-world-legends/>

### Play from GitHub Pages in a browser extension or browser tab

Use the published URL directly:

- <https://ghlearn.github.io/agentic-world-legends/>

If your browser extension supports opening a URL/webview panel, set it to the
same GitHub Pages URL above.

#### Switching between modes

You can switch between local dev and GitHub Pages at any time without restarting:

- Open the same canvas and run action `set_target` with `{ "mode": "pages" }` or `{ "mode": "local" }`.

#### Custom deployment URLs

If you're running the game on a custom domain (e.g., staging or production):

- Open canvas with `{ "mode": "pages", "url": "https://your-custom-domain.com/" }`

## Copy to your namespace (secondary path)

Use this flow when you want your own copy of the game repo (e.g., `https://github.com/your-username/agentic-world-legends`);
gameplay is still intended in the GitHub Copilot App canvas.

### Copy as a template

1. Click **Use this template** → **Create a new repository**.
2. Name it (e.g., `agentic-world-legends`) and choose your namespace.
3. Enable GitHub Pages (source: GitHub Actions).
4. Push to `main` to trigger `.github/workflows/deploy.yml`.
5. Open that repo in GitHub Copilot App and open canvas `agentic-world-launcher` with `{ "mode": "pages", "url": "https://<owner>.github.io/<repo>/" }` (or run action `set_target` with the same `url`).

**Note:** `vite.config.ts` and deployment workflows are template-friendly: base path is
computed from repository name in CI, so copied repos deploy
under `/<your-repo-name>/` without hardcoding.

### Contributing back

If you'd like to contribute improvements back to the main repo:

1. Fork this repository.
2. Make changes in your fork.
3. Open a pull request to the upstream repository.

### Troubleshooting

- **Canvas not loading?** Ensure extensions are reloaded in your Copilot workspace
  and that you're using a valid `mode` (`"local"` or `"pages"`).
- **Local dev not working?** Check that `pnpm run dev` is running on <http://localhost:5173/> and
  refresh the canvas.
- **GitHub Pages not live?** Verify that GitHub Pages is enabled (source: GitHub Actions)
  and that `.github/workflows/deploy.yml` has completed successfully.

## Local development instructions

For local canvas mode, local browser run, and local CI-equivalent checks, see:
[`docs/local-development.md`](docs/local-development.md).

## Deploy

Successful pushes to `main` are built and published to GitHub Pages by
`.github/workflows/deploy.yml`.

To enable and use deployment in a copied repo:

1. Go to **Settings -> Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`.
4. Open the latest run in **Actions** and verify `Deploy to GitHub Pages` succeeds.

## Release structure

Releases follow Semantic Versioning (major/minor/patch). See
[`docs/release-process.md`](docs/release-process.md) for the exact bump rules and
the required version + changelog + tag + release flow.

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
