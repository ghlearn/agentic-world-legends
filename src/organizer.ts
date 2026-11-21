import "./organizer.css";

const apiInput = document.querySelector<HTMLInputElement>("#api-url");
const keyInput = document.querySelector<HTMLInputElement>("#admin-key");
const eventInput = document.querySelector<HTMLInputElement>("#event-id");
const boothsInput = document.querySelector<HTMLInputElement>("#booths");
const status = document.querySelector<HTMLParagraphElement>("#status");
const result = document.querySelector<HTMLPreElement>("#result");

const queryApi = new URLSearchParams(window.location.search).get("api");
if (apiInput && queryApi) apiInput.value = queryApi;

function values() {
  if (!apiInput || !keyInput || !eventInput || !boothsInput || !status || !result) {
    throw new Error("Organizer controls are unavailable");
  }
  const apiUrl = apiInput.value.trim().replace(/\/$/, "");
  const adminKey = keyInput.value;
  const eventId = eventInput.value.trim();
  if (!apiUrl || !adminKey || !eventId) throw new Error("API URL, admin key, and event ID are required");
  return { apiUrl, adminKey, eventId, booths: boothsInput.value.split(",").map((value) => value.trim()).filter(Boolean) };
}

async function adminRequest(path: string, init?: RequestInit): Promise<Response> {
  const { apiUrl, adminKey } = values();
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-admin-key": adminKey,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: `Request failed (${response.status})` })) as { error?: string };
    throw new Error(payload.error ?? `Request failed (${response.status})`);
  }
  return response;
}

async function run(action: () => Promise<void>) {
  if (!status || !result) return;
  status.textContent = "Working...";
  result.hidden = true;
  try {
    await action();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Request failed";
  }
}

document.querySelector("#create")?.addEventListener("click", () => void run(async () => {
  const { eventId, booths } = values();
  const response = await adminRequest("/admin/events", {
    method: "POST",
    body: JSON.stringify({ eventId, booths }),
  });
  const payload = await response.json() as { pairingCodes: Record<string, string> };
  status!.textContent = "Event created. Pair each booth with its single-use code.";
  result!.textContent = Object.entries(payload.pairingCodes)
    .map(([booth, code]) => `${booth}: ${code}`)
    .join("\n");
  result!.hidden = false;
}));

document.querySelector("#close")?.addEventListener("click", () => void run(async () => {
  const { eventId } = values();
  await adminRequest(`/admin/events/${encodeURIComponent(eventId)}/close`, { method: "POST" });
  status!.textContent = "Event closed. New score submissions are now blocked.";
}));

document.querySelector("#export")?.addEventListener("click", () => void run(async () => {
  const { eventId } = values();
  const response = await adminRequest(`/admin/events/${encodeURIComponent(eventId)}/scores.csv`);
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${eventId}-scores.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  status!.textContent = "Score export downloaded.";
}));
