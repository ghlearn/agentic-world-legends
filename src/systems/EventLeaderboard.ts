export interface EventConfig {
  eventId: string;
  boothId: string;
  apiUrl: string;
}

export interface RunSummary {
  runId: string;
  nickname: string;
  eventId: string;
  boothId: string;
  credentialsCompleted: number;
  wrongAnswers: number;
  elapsedMs: number;
}

export interface LeaderboardEntry extends RunSummary {
  rank: number;
  score: number;
}

interface StoredRun extends RunSummary {
  startedAt: number;
}

interface PendingScore {
  config: EventConfig;
  summary: RunSummary;
}

export type ScoreSubmissionUpdate =
  | { status: "submitted"; entries: LeaderboardEntry[] }
  | { status: "rejected"; error: LeaderboardRequestError }
  | { status: "pending" };

export class LeaderboardRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const RUN_KEY = "agentic-world:event-run";
const LEVEL_COUNT = 6;
const TOKEN_PREFIX = "agentic-world:booth-token:";
const PENDING_PREFIX = "agentic-world:pending-score:";
const listeners = new Map<string, Set<(update: ScoreSubmissionUpdate) => void>>();
const submissionsInFlight = new Set<string>();
let replayStarted = false;

export function eventConfigFromLocation(
  location: Pick<Location, "search"> = window.location,
  apiUrl = import.meta.env.VITE_LEADERBOARD_API_URL ?? "",
): EventConfig | undefined {
  const params = new URLSearchParams(location.search);
  const eventId = params.get("event")?.trim();
  const boothId = params.get("booth")?.trim();
  const configuredApiUrl = params.get("api")?.trim() || apiUrl.trim();
  if (!eventId || !boothId || !configuredApiUrl) return undefined;
  return { eventId, boothId, apiUrl: configuredApiUrl.replace(/\/$/, "") };
}

export function calculateScore(summary: Pick<RunSummary, "credentialsCompleted" | "wrongAnswers" | "elapsedMs">): number {
  const credentialPoints = Math.min(summary.credentialsCompleted, LEVEL_COUNT) * 1_000;
  const accuracyPoints = Math.max(0, 500 - summary.wrongAnswers * 100);
  const speedPoints = Math.max(0, 500 - Math.floor(summary.elapsedMs / 1_000));
  return credentialPoints + accuracyPoints + speedPoints;
}

export function beginRun(config: EventConfig | undefined, nickname: string, now = Date.now()): void {
  if (!config) {
    sessionStorage.removeItem(RUN_KEY);
    return;
  }
  const safeNickname = nickname.trim().slice(0, 32) || "Guest";
  const run: StoredRun = {
    runId: crypto.randomUUID(),
    nickname: safeNickname,
    eventId: config.eventId,
    boothId: config.boothId,
    credentialsCompleted: 0,
    wrongAnswers: 0,
    elapsedMs: 0,
    startedAt: now,
  };
  sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
}

export function recordWrongAnswer(now = Date.now()): void {
  const run = readStoredRun();
  if (!run) return;
  run.wrongAnswers += 1;
  run.elapsedMs = Math.max(0, now - run.startedAt);
  sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
}

export function recordCredential(now = Date.now()): void {
  const run = readStoredRun();
  if (!run) return;
  run.credentialsCompleted = Math.min(LEVEL_COUNT, run.credentialsCompleted + 1);
  run.elapsedMs = Math.max(0, now - run.startedAt);
  sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
}

export function currentRun(now = Date.now()): RunSummary | undefined {
  const run = readStoredRun();
  if (!run) return undefined;
  return {
    runId: run.runId,
    nickname: run.nickname,
    eventId: run.eventId,
    boothId: run.boothId,
    credentialsCompleted: run.credentialsCompleted,
    wrongAnswers: run.wrongAnswers,
    elapsedMs: Math.max(0, now - run.startedAt),
  };
}

export async function submitRun(config: EventConfig, summary: RunSummary): Promise<LeaderboardEntry[]> {
  const token = boothToken(config);
  if (!token) throw new Error("Booth is not paired");
  const response = await fetch(`${config.apiUrl}/events/${encodeURIComponent(config.eventId)}/scores`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(summary),
  });
  if (!response.ok) {
    throw new LeaderboardRequestError(`Leaderboard submission failed (${response.status})`, response.status);
  }
  const payload = (await response.json()) as { entries?: LeaderboardEntry[] };
  return payload.entries ?? [];
}

export function queueRunSubmission(config: EventConfig, summary: RunSummary): void {
  const key = pendingKey(config, summary.runId);
  localStorage.setItem(key, JSON.stringify({ config, summary } satisfies PendingScore));
  void replayPendingScore(key);
}

export function subscribeToScoreSubmission(
  runId: string,
  listener: (update: ScoreSubmissionUpdate) => void,
): () => void {
  const runListeners = listeners.get(runId) ?? new Set();
  runListeners.add(listener);
  listeners.set(runId, runListeners);
  return () => {
    runListeners.delete(listener);
    if (runListeners.size === 0) listeners.delete(runId);
  };
}

export function startPendingScoreReplay(): void {
  if (replayStarted) return;
  replayStarted = true;
  const replay = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PENDING_PREFIX)) void replayPendingScore(key);
    }
  };
  replay();
  window.addEventListener("online", replay);
  window.setInterval(replay, 5_000);
}

export async function pairBooth(config: EventConfig, code: string): Promise<void> {
  const response = await fetch(
    `${config.apiUrl}/events/${encodeURIComponent(config.eventId)}/booths/${encodeURIComponent(config.boothId)}/pair`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    },
  );
  if (!response.ok) throw new Error(`Booth pairing failed (${response.status})`);
  const payload = (await response.json()) as { token?: string };
  if (!payload.token) throw new Error("Booth pairing returned no token");
  localStorage.setItem(tokenKey(config), payload.token);
}

export function boothIsPaired(config: EventConfig): boolean {
  return Boolean(boothToken(config));
}

export async function fetchLeaderboard(config: EventConfig): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${config.apiUrl}/events/${encodeURIComponent(config.eventId)}/scores`);
  if (!response.ok) throw new Error(`Leaderboard request failed (${response.status})`);
  const payload = (await response.json()) as { entries?: LeaderboardEntry[] };
  return payload.entries ?? [];
}

function boothToken(config: EventConfig): string | null {
  return localStorage.getItem(tokenKey(config));
}

function tokenKey(config: EventConfig): string {
  return `${TOKEN_PREFIX}${config.apiUrl}:${config.eventId}:${config.boothId}`;
}

function pendingKey(config: EventConfig, runId: string): string {
  return `${PENDING_PREFIX}${config.apiUrl}:${runId}`;
}

async function replayPendingScore(key: string): Promise<void> {
  if (submissionsInFlight.has(key)) return;
  const pending = readPendingScore(key);
  if (!pending) {
    localStorage.removeItem(key);
    return;
  }
  submissionsInFlight.add(key);
  notify(pending.summary.runId, { status: "pending" });
  try {
    const entries = await submitRun(pending.config, pending.summary);
    localStorage.removeItem(key);
    notify(pending.summary.runId, { status: "submitted", entries });
  } catch (error) {
    if (error instanceof LeaderboardRequestError && error.status < 500) {
      localStorage.removeItem(key);
      notify(pending.summary.runId, { status: "rejected", error });
    }
  } finally {
    submissionsInFlight.delete(key);
  }
}

function readPendingScore(key: string): PendingScore | undefined {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;
  try {
    const pending = JSON.parse(raw) as PendingScore;
    if (
      typeof pending.config?.apiUrl !== "string" ||
      typeof pending.config?.eventId !== "string" ||
      typeof pending.config?.boothId !== "string" ||
      typeof pending.summary?.runId !== "string"
    ) return undefined;
    return pending;
  } catch {
    return undefined;
  }
}

function notify(runId: string, update: ScoreSubmissionUpdate): void {
  listeners.get(runId)?.forEach((listener) => listener(update));
}

function readStoredRun(): StoredRun | undefined {
  const raw = sessionStorage.getItem(RUN_KEY);
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<StoredRun>;
    if (
      typeof value.runId !== "string" ||
      typeof value.nickname !== "string" ||
      typeof value.eventId !== "string" ||
      typeof value.boothId !== "string" ||
      typeof value.startedAt !== "number"
    ) return undefined;
    return {
      runId: value.runId,
      nickname: value.nickname,
      eventId: value.eventId,
      boothId: value.boothId,
      credentialsCompleted: value.credentialsCompleted ?? 0,
      wrongAnswers: value.wrongAnswers ?? 0,
      elapsedMs: value.elapsedMs ?? 0,
      startedAt: value.startedAt,
    };
  } catch {
    return undefined;
  }
}
