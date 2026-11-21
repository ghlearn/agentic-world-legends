import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  beginRun,
  boothIsPaired,
  calculateScore,
  currentRun,
  eventConfigFromLocation,
  pairBooth,
  queueRunSubmission,
  recordCredential,
  recordWrongAnswer,
  startPendingScoreReplay,
  submitRun,
  subscribeToScoreSubmission,
} from "../src/systems/EventLeaderboard";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

describe("EventLeaderboard", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", memoryStorage());
    vi.stubGlobal("localStorage", memoryStorage());
    sessionStorage.clear();
    localStorage.clear();
  });

  it("only enables event mode when URL and API configuration are complete", () => {
    expect(eventConfigFromLocation({ search: "?event=demo&booth=A" }, "https://api.example")).toEqual({
      eventId: "demo",
      boothId: "A",
      apiUrl: "https://api.example",
    });
    expect(eventConfigFromLocation({ search: "?event=demo" }, "https://api.example")).toBeUndefined();
    expect(eventConfigFromLocation({ search: "?event=demo&booth=A&api=https%3A%2F%2Fcustom.example%2F" })).toMatchObject({
      apiUrl: "https://custom.example",
    });
  });

  it("tracks credentials, wrong answers, and elapsed time across scenes", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "run-1" });
    beginRun({ eventId: "demo", boothId: "A", apiUrl: "https://api.example" }, " Player ", 1_000);
    recordWrongAnswer(2_000);
    recordWrongAnswer(2_200);
    recordCredential(2_500);
    expect(currentRun(3_000)).toMatchObject({
      runId: "run-1",
      nickname: "Player",
      credentialsCompleted: 1,
      wrongAnswers: 2,
      elapsedMs: 2_000,
    });
  });

  it("rewards completion and accuracy while capping speed points at zero", () => {
    expect(calculateScore({ credentialsCompleted: 6, wrongAnswers: 0, elapsedMs: 1_000 })).toBe(6_999);
    expect(calculateScore({ credentialsCompleted: 6, wrongAnswers: 8, elapsedMs: 700_000 })).toBe(6_000);
  });

  it("pairs a booth once and authorizes its score submission", async () => {
    const config = { eventId: "demo", boothId: "A", apiUrl: "https://api.example" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: "booth-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ entries: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await pairBooth(config, "PAIR-CODE");
    expect(boothIsPaired(config)).toBe(true);
    await submitRun(config, {
      runId: "run-1",
      nickname: "Player",
      eventId: "demo",
      boothId: "A",
      credentialsCompleted: 6,
      wrongAnswers: 0,
      elapsedMs: 10_000,
    });

    expect(fetchMock.mock.calls[1][1]?.headers).toMatchObject({
      authorization: "Bearer booth-token",
    });
    expect(localStorage.length).toBe(1);
  });

  it("replays a queued score independently and notifies active listeners", async () => {
    const config = { eventId: "demo", boothId: "A", apiUrl: "https://api.example" };
    localStorage.setItem(
      "agentic-world:booth-token:https://api.example:demo:A",
      "booth-token",
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ entries: [{ runId: "run-1", rank: 1 }] }), { status: 200 }),
    ));
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      setInterval: vi.fn(),
    });
    const updates: string[] = [];
    subscribeToScoreSubmission("run-1", (update) => updates.push(update.status));

    queueRunSubmission(config, {
      runId: "run-1",
      nickname: "Player",
      eventId: "demo",
      boothId: "A",
      credentialsCompleted: 6,
      wrongAnswers: 0,
      elapsedMs: 10_000,
    });
    startPendingScoreReplay();
    await vi.waitFor(() => expect(updates).toContain("submitted"));

    expect(updates).toEqual(["pending", "submitted"]);
    expect(localStorage.length).toBe(1);
  });
});
