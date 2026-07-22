export const CATEGORIES = [
  { id: "logical-reasoning", label: "Logical Reasoning", icon: "Binary" },
  { id: "pattern-recognition", label: "Pattern Recognition", icon: "Grid3X3" },
  { id: "mathematics", label: "Mathematics", icon: "Calculator" },
  { id: "memory", label: "Memory", icon: "Brain" },
  { id: "sequence-completion", label: "Sequence Completion", icon: "ArrowRight" },
  { id: "verbal-reasoning", label: "Verbal Reasoning", icon: "Type" },
  { id: "problem-solving", label: "Problem Solving", icon: "Puzzle" },
];

export const DIFFICULTY_LEVELS = [
  { id: "easy", label: "Easy", color: "emerald", timeLimit: 30 },
  { id: "medium", label: "Medium", color: "amber", timeLimit: 25 },
  { id: "hard", label: "Hard", color: "orange", timeLimit: 20 },
  { id: "expert", label: "Expert", color: "rose", timeLimit: 15 },
];

export const PHASES = {
  SETUP: "setup",
  RUNNING: "running",
  FEEDBACK: "feedback",
  REPORT: "report",
  LEADERBOARD: "leaderboard",
};

export const TOTAL_QUESTIONS = 10;
export const STORAGE_KEY = "altft_iq_quiz_history";
