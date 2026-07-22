export const QUESTION_TYPES = [
  { id: "find-percent", label: "Find X% of Y", description: "Calculate a percentage of a number" },
  { id: "find-number", label: "Find X when Y% of X is Z", description: "Reverse percentage calculation" },
  { id: "find-what-percent", label: "What % is X of Y?", description: "Find what percentage one number is of another" },
  { id: "increase", label: "Percentage Increase", description: "Calculate new value after increase" },
  { id: "decrease", label: "Percentage Decrease", description: "Calculate new value after decrease" },
  { id: "discount", label: "Discount Price", description: "Calculate discounted price" },
  { id: "original", label: "Find Original Price", description: "Find price before discount" },
  { id: "mixed", label: "Mixed Practice", description: "All types combined" },
];

export const DIFFICULTY_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "Simple numbers, multiples of 5/10" },
  { id: "easy", label: "Easy", desc: "Clean numbers, easy percentages" },
  { id: "medium", label: "Medium", desc: "Two-step calculations" },
  { id: "hard", label: "Hard", desc: "Complex numbers, decimals" },
  { id: "expert", label: "Expert", desc: "Real-world scenarios, multi-step" },
];

export const GAME_MODES = [
  { id: "practice", label: "Practice", description: "No time pressure, learn at your pace" },
  { id: "timed", label: "Timed Challenge", description: "Answer as many as you can in time" },
  { id: "survival", label: "Survival", description: "3 lives, keep going!" },
];

export const QUESTION_COUNTS = [10, 15, 20, 30, 50];

export const TIMER_OPTIONS = [
  { id: 30, label: "30s" },
  { id: 60, label: "1min" },
  { id: 120, label: "2min" },
  { id: 180, label: "3min" },
];
