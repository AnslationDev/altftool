export const DIVISION_TYPES = [
  { id: "basic", label: "Basic Division", description: "Simple division facts", difficulty: "beginner" },
  { id: "long", label: "Long Division", description: "Multi-digit division", difficulty: "medium" },
  { id: "remainder", label: "Division with Remainders", description: "Quotient and remainder", difficulty: "easy" },
  { id: "decimal", label: "Decimal Division", description: "Division with decimal results", difficulty: "hard" },
  { id: "large", label: "Large Number Division", description: "Divide large numbers", difficulty: "expert" },
  { id: "mixed", label: "Mixed Practice", description: "All types combined", difficulty: "medium" },
];

export const DIFFICULTY_LEVELS = [
  { id: "beginner", label: "Beginner", range: [1, 10], desc: "Divisors 1-10" },
  { id: "easy", label: "Easy", range: [2, 12], desc: "Divisors 2-12" },
  { id: "medium", label: "Medium", range: [5, 25], desc: "Divisors 5-25" },
  { id: "hard", label: "Hard", range: [10, 50], desc: "Divisors 10-50" },
  { id: "expert", label: "Expert", range: [12, 99], desc: "Divisors 12-99" },
];

export const QUESTION_COUNTS = [10, 15, 20, 30, 50];

export const ACHIEVEMENTS = [
  { id: "first-correct", label: "First Step", description: "Answer your first question correctly", icon: "star" },
  { id: "streak-5", label: "Hot Streak", description: "Get 5 correct in a row", icon: "flame" },
  { id: "streak-10", label: "On Fire", description: "Get 10 correct in a row", icon: "zap" },
  { id: "accuracy-100", label: "Perfect Score", description: "Finish with 100% accuracy", icon: "trophy" },
  { id: "accuracy-90", label: "Excellent", description: "Finish with 90%+ accuracy", icon: "award" },
  { id: "speed-demon", label: "Speed Demon", description: "Average under 5 seconds per question", icon: "timer" },
  { id: "no-hints", label: "Independent", description: "Complete a session without using hints", icon: "shield" },
  { id: "long-division-master", label: "Long Division Master", description: "Complete 20 long division problems", icon: "graduation-cap" },
];

export const HINTS = {
  basic: [
    "Think about how many times the divisor fits into the dividend.",
    "Try multiplying the divisor by different numbers.",
    "Start with estimates and adjust.",
  ],
  long: [
    "Start from the leftmost digit of the dividend.",
    "Divide one digit at a time, bringing down the next.",
    "Write the quotient digit above the dividend.",
  ],
  remainder: [
    "Divide as normal, then find what's left over.",
    "The remainder must be less than the divisor.",
    "Check: divisor × quotient + remainder = dividend.",
  ],
  decimal: [
    "Add a decimal point and zeros to continue dividing.",
    "Place the decimal point in the quotient directly above its position in the dividend.",
    "Keep dividing until you get a remainder of 0 or a repeating pattern.",
  ],
  large: [
    "Break the dividend into smaller, manageable parts.",
    "Use estimation to find approximate quotient digits.",
    "Work left to right, one section at a time.",
  ],
};
