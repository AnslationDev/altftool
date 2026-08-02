export const QUESTION_TYPES = [
  { id: "addition", label: "Addition" },
  { id: "subtraction", label: "Subtraction" },
  { id: "multiplication", label: "Multiplication" },
  { id: "division", label: "Division" },
  { id: "mixed", label: "Mixed Operations" },
  { id: "squares", label: "Squares" },
  { id: "square-roots", label: "Square Roots" },
  { id: "cubes", label: "Cubes" },
  { id: "percentages", label: "Percentages" },
  { id: "fractions", label: "Fractions" },
  { id: "decimals", label: "Decimals" },
  { id: "ratios", label: "Ratios" },
  { id: "average", label: "Average" },
];

export const DIFFICULTY_LEVELS = [
  { id: "beginner", label: "Beginner", description: "Single-digit numbers" },
  { id: "easy", label: "Easy", description: "Small two-digit numbers" },
  { id: "medium", label: "Medium", description: "Two to three-digit numbers" },
  { id: "hard", label: "Hard", description: "Large numbers, complex ops" },
  { id: "expert", label: "Expert", description: "Multi-digit, challenging" },
];

export const GAME_MODES = [
  { id: "practice", label: "Practice", description: "No time pressure, learn at your pace", icon: "book-open" },
  { id: "timed", label: "Timed Challenge", description: "Answer as many as you can in time", icon: "timer" },
  { id: "daily", label: "Daily Challenge", description: "Same fixed set for everyone, today only", icon: "calendar" },
  { id: "survival", label: "Survival Mode", description: "Keep going until you make 3 mistakes", icon: "heart" },
  { id: "speed", label: "Speed Mode", description: "Race against a per-question timer", icon: "zap" },
  { id: "endless", label: "Endless Mode", description: "No limit, how far can you go?", icon: "infinity" },
];

export const QUESTION_COUNTS = [10, 20, 30, 50, 100];

export const TIMER_OPTIONS = [
  { id: 30, label: "30s" },
  { id: 60, label: "1min" },
  { id: 120, label: "2min" },
  { id: 180, label: "3min" },
  { id: 300, label: "5min" },
];

export const SKILL_THRESHOLDS = {
  beginner: 30,
  easy: 50,
  medium: 70,
  hard: 85,
  expert: 95,
};
