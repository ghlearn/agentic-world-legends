export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  successMessage: string;
  failureMessage: string;
}

export const QUIZZES: Record<string, QuizQuestion> = {
  LevelGH100Admin: {
    prompt:
      "GH-100 — GitHub Administration\n\nWhich setting enforces mandatory pull-request reviews before merging to a protected branch?",
    options: [
      "Repository rules / branch protection",
      "CODEOWNERS by itself",
      "Dependabot security updates",
      "Pinned issues",
    ],
    correctIndex: 0,
    successMessage: "Correct! Branch protection rules enforce required reviewers.",
    failureMessage: "Not quite — required reviews are enforced through branch protection rules.",
  },
  LevelGH900Foundations: {
    prompt: "GH-900 — GitHub Foundations\n\nWhat is a pull request primarily used for?",
    options: [
      "Code review and discussion before merging changes",
      "Deleting stale branches in bulk",
      "Creating encrypted repository secrets",
      "Publishing GitHub Pages with one click",
    ],
    correctIndex: 0,
    successMessage: "Exactly — pull requests enable review, discussion, and safer merges.",
    failureMessage: "Not quite — pull requests are for reviewing and discussing changes before merge.",
  },
  LevelGH500AdvancedSecurity: {
    prompt:
      "GH-500 — GitHub Advanced Security\n\nWhich feature scans pull requests for accidentally committed secrets?",
    options: [
      "Secret scanning push protection",
      "Issue templates",
      "GitHub Projects",
      "Repository topics",
    ],
    correctIndex: 0,
    successMessage: "Correct! Secret scanning push protection blocks known secrets before they land.",
    failureMessage: "Not quite — secret scanning push protection handles exposed credentials in pushes/PRs.",
  },
  LevelGH300Copilot: {
    prompt:
      "GH-300 — GitHub Copilot\n\nWhich prompt style most improves Copilot suggestions?",
    options: [
      "Specific intent, constraints, and desired output format",
      "Very short prompts with no context",
      "Only writing in all caps",
      "Avoiding comments entirely",
    ],
    correctIndex: 0,
    successMessage: "Correct — clear context and constraints produce stronger suggestions.",
    failureMessage: "Not quite — Copilot performs best with explicit intent and constraints.",
  },
  LevelGH200Actions: {
    prompt:
      "GH-200 — GitHub Actions\n\nWhere should reusable credentials be stored for workflow jobs?",
    options: [
      "GitHub encrypted secrets",
      "README.md",
      "Workflow step names",
      "Issue comments",
    ],
    correctIndex: 0,
    successMessage: "Correct — store credentials in encrypted secrets.",
    failureMessage: "Not quite — credentials belong in GitHub encrypted secrets.",
  },
  LevelGH600AgenticAI: {
    prompt:
      "GH-600 — GitHub Agentic AI Developer\n\nHow many domains are on the GH-600 exam?",
    options: ["4", "6", "8", "10"],
    correctIndex: 1,
    successMessage: "Correct! GH-600 includes six exam domains.",
    failureMessage: "Not quite — GH-600 is organized into six domains.",
  },
};
