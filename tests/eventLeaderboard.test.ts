import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  beginRun,
  calculateScore,
  currentRun,
  eventConfigFromLocation,
  recordCredential,
} from "../src/systems/EventLeaderboard";

describe("EventLeaderboard", () => {
  beforeEach(() => {
    sessionStorage.clear();
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
    recordCredential(2, 2_500);
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
});
