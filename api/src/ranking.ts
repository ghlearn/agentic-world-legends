export interface RankedScore {
  runId: string;
  nickname: string;
  eventId: string;
  boothId: string;
  credentialsCompleted: number;
  wrongAnswers: number;
  elapsedMs: number;
  score: number;
  acceptedAt: string;
  rank?: number;
}

export function rankScores(scores: RankedScore[]): Array<RankedScore & { rank: number }> {
  return [...scores]
    .sort((a, b) =>
      b.score - a.score ||
      a.wrongAnswers - b.wrongAnswers ||
      a.elapsedMs - b.elapsedMs ||
      a.acceptedAt.localeCompare(b.acceptedAt),
    )
    .map((score, index) => ({ ...score, rank: index + 1 }));
}

export function calculateScore(credentialsCompleted: number, wrongAnswers: number, elapsedMs: number): number {
  const credentialPoints = Math.min(Math.max(credentialsCompleted, 0), 6) * 1_000;
  const accuracyPoints = Math.max(0, 500 - Math.max(wrongAnswers, 0) * 100);
  const speedPoints = Math.max(0, 500 - Math.floor(Math.max(elapsedMs, 0) / 1_000));
  return credentialPoints + accuracyPoints + speedPoints;
}

export function csvCell(value: string | number): string {
  const raw = String(value);
  const neutralized = typeof value === "string" && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${neutralized.replaceAll("\"", "\"\"")}"`;
}
