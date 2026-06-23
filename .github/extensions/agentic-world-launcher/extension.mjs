import { createServer } from "node:http";
import { joinSession, createCanvas } from "@github/copilot-sdk/extension";

const servers = new Map();
const stateByInstance = new Map();

const DEFAULT_LOCAL_URL = "http://127.0.0.1:5173/";
const DEFAULT_PAGES_URL = "https://ghlearn.github.io/agentic-world-legends/";

function safeUrl(input, fallback) {
  try {
    return new URL(input).toString();
  } catch {
    return fallback;
  }
}

function renderHtml(targetUrl) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agentic World Launcher</title>
    <style>
      :root { color-scheme: dark; }
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        background: #0d1117;
        color: #e6edf3;
        font-family: system-ui, sans-serif;
      }
      .frame-wrap {
        position: fixed;
        inset: 0;
        border-top: 1px solid #30363d;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: 0;
        background: #0d1117;
      }
    </style>
  </head>
  <body>
    <div class="frame-wrap">
      <iframe src="${targetUrl}" allow="fullscreen; autoplay; gamepad"></iframe>
    </div>
  </body>
</html>`;
}

async function startServer(instanceId) {
  const server = createServer((req, res) => {
    const state = stateByInstance.get(instanceId) ?? {};
    const targetUrl = safeUrl(state.targetUrl ?? DEFAULT_PAGES_URL, DEFAULT_PAGES_URL);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(renderHtml(targetUrl));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return { server, url: `http://127.0.0.1:${port}/` };
}

function setTargetFromMode(instanceId, mode, customUrl) {
  const targetUrl = mode === "pages"
    ? safeUrl(customUrl ?? DEFAULT_PAGES_URL, DEFAULT_PAGES_URL)
    : safeUrl(customUrl ?? DEFAULT_LOCAL_URL, DEFAULT_LOCAL_URL);
  stateByInstance.set(instanceId, { mode, targetUrl });
  return targetUrl;
}

await joinSession({
  canvases: [
    createCanvas({
      id: "agentic-world-launcher",
      displayName: "Agentic World Launcher",
      description: "Launch Agentic World of Legends in canvas from local dev or GitHub Pages.",
      inputSchema: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["local", "pages"] },
          url: { type: "string" },
        },
      },
      actions: [
        {
          name: "set_target",
          description: "Switch the game target URL (local dev server or GitHub Pages).",
          inputSchema: {
            type: "object",
            properties: {
              mode: { type: "string", enum: ["local", "pages"] },
              url: { type: "string" },
            },
          },
          handler: async (ctx) => {
            const mode = ctx.input?.mode === "local" ? "local" : "pages";
            const targetUrl = setTargetFromMode(ctx.instanceId, mode, ctx.input?.url);
            return { ok: true, mode, targetUrl };
          },
        },
      ],
      open: async (ctx) => {
        const mode = ctx.input?.mode === "local" ? "local" : "pages";
        setTargetFromMode(ctx.instanceId, mode, ctx.input?.url);
        let entry = servers.get(ctx.instanceId);
        if (!entry) {
          entry = await startServer(ctx.instanceId);
          servers.set(ctx.instanceId, entry);
        }
        return {
          title: "Agentic World of Legends",
          url: entry.url,
        };
      },
      onClose: async (ctx) => {
        const entry = servers.get(ctx.instanceId);
        stateByInstance.delete(ctx.instanceId);
        if (entry) {
          servers.delete(ctx.instanceId);
          await new Promise((resolve) => entry.server.close(() => resolve()));
        }
      },
    }),
  ],
});
