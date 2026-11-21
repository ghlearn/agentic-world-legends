import { describe, expect, it } from "vitest";
import { calculateScore, csvCell, rankScores } from "../src/ranking.js";

describe("leaderboard ranking", () => {
  it("calculates the same bounded score as the game client", () => {
    expect(calculateScore(6, 0, 1_000)).toBe(6_999);
    expect(calculateScore(6, 8, 700_000)).toBe(6_000);
  });

  it("breaks score ties by accuracy, speed, then acceptance time", () => {
    const common = {
      nickname: "Player",
      eventId: "demo",
      boothId: "A",
      credentialsCompleted: 6,
      score: 6_500,
    };
    const ranked = rankScores([
      { ...common, runId: "late", wrongAnswers: 1, elapsedMs: 10_000, acceptedAt: "2026-01-02T00:00:00Z" },
      { ...common, runId: "accurate", wrongAnswers: 0, elapsedMs: 20_000, acceptedAt: "2026-01-03T00:00:00Z" },
      { ...common, runId: "early", wrongAnswers: 1, elapsedMs: 10_000, acceptedAt: "2026-01-01T00:00:00Z" },
    ]);
    expect(ranked.map(({ runId, rank }) => [runId, rank])).toEqual([
      ["accurate", 1],
      ["early", 2],
      ["late", 3],
    ]);
  });

  it("neutralizes formula-leading CSV values before quoting", () => {
    expect(csvCell("=1+1")).toBe("\"'=1+1\"");
    expect(csvCell("@SUM(A1:A2)")).toBe("\"'@SUM(A1:A2)\"");
    expect(csvCell("Player \"One\"")).toBe("\"Player \"\"One\"\"\"");
    expect(csvCell(42)).toBe("\"42\"");
  });
});
