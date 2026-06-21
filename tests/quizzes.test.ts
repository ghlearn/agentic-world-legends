import { describe, it, expect } from "vitest";
import { QUIZZES } from "../src/data/quizzes";

describe("QUIZZES dataset", () => {
  it("has one question for each of the six credential levels", () => {
    expect(Object.keys(QUIZZES).sort()).toEqual([
      "LevelGH100Admin",
      "LevelGH200Actions",
      "LevelGH300Copilot",
      "LevelGH500AdvancedSecurity",
      "LevelGH600AgenticAI",
      "LevelGH900Foundations",
    ]);
  });

  for (const [key, q] of Object.entries(QUIZZES)) {
    describe(key, () => {
      it("has a non-empty prompt", () => {
        expect(q.prompt.trim().length).toBeGreaterThan(10);
      });
      it("has at least two distinct options", () => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(new Set(q.options).size).toBe(q.options.length);
      });
      it("correctIndex points to a real option", () => {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      });
      it("provides success and failure feedback", () => {
        expect(q.successMessage.length).toBeGreaterThan(0);
        expect(q.failureMessage.length).toBeGreaterThan(0);
      });
      it("does not mention Applied Skills", () => {
        expect(q.prompt.toLowerCase()).not.toContain("applied skills");
        expect(q.successMessage.toLowerCase()).not.toContain("applied skills");
        expect(q.failureMessage.toLowerCase()).not.toContain("applied skills");
      });
    });
  }

  it("uses the expected canonical answers", () => {
    expect(
      QUIZZES.LevelGH100Admin.options[QUIZZES.LevelGH100Admin.correctIndex],
    ).toBe("Repository rules / branch protection");
    expect(
      QUIZZES.LevelGH900Foundations.options[QUIZZES.LevelGH900Foundations.correctIndex],
    ).toBe("Code review and discussion before merging changes");
    expect(
      QUIZZES.LevelGH500AdvancedSecurity.options[QUIZZES.LevelGH500AdvancedSecurity.correctIndex],
    ).toBe("Secret scanning push protection");
    expect(
      QUIZZES.LevelGH300Copilot.options[QUIZZES.LevelGH300Copilot.correctIndex],
    ).toBe("Specific intent, constraints, and desired output format");
    expect(
      QUIZZES.LevelGH200Actions.options[QUIZZES.LevelGH200Actions.correctIndex],
    ).toBe("GitHub encrypted secrets");
    expect(
      QUIZZES.LevelGH600AgenticAI.options[QUIZZES.LevelGH600AgenticAI.correctIndex],
    ).toBe("6");
  });
});
