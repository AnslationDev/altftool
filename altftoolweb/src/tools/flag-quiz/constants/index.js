export const DIFFICULTIES = [
  { id: "easy", label: "Easy", description: "Common flags", color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "medium", label: "Medium", description: "Lesser-known flags", color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "hard", label: "Hard", description: "Obscure flags", color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "mixed", label: "Mixed", description: "All difficulties", color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

export const QUESTION_TYPES = [
  { id: "identify", label: "Identify Flag", description: "See a flag, pick the country" },
  { id: "reverse", label: "Pick the Flag", description: "See a country name, pick its flag" },
  { id: "capital", label: "Flag → Capital", description: "Identify capital from a flag" },
  { id: "continent", label: "Flag → Continent", description: "Identify continent from a flag" },
  { id: "currency", label: "Flag → Currency", description: "Identify currency from a flag" },
  { id: "language", label: "Flag → Language", description: "Identify language from a flag" },
  { id: "region", label: "Flag → Region", description: "Identify region from a flag" },
  { id: "area", label: "Flag → Size", description: "Guess country size from a flag" },
  { id: "random", label: "Random Mix", description: "Mixed flag challenges" },
];

export const QUESTION_COUNTS = [10, 15, 20, 30, 50];

export const TIME_OPTIONS = [
  { id: 0, label: "No Limit" },
  { id: 10, label: "10s" },
  { id: 15, label: "15s" },
  { id: 20, label: "20s" },
  { id: 30, label: "30s" },
  { id: 45, label: "45s" },
];

export const ACHIEVEMENTS = [
  { id: "first_quiz", label: "First Flag", description: "Complete your first flag quiz", icon: "🏁" },
  { id: "perfect_score", label: "Perfect Round", description: "Score 100% on any quiz", icon: "🏆" },
  { id: "speed_demon", label: "Speed Runner", description: "Average under 3 seconds per flag", icon: "⚡" },
  { id: "streak_10", label: "Flag Master", description: "10 correct answers in a row", icon: "🔥" },
  { id: "euro_expert", label: "European Expert", description: "Perfect score on European flags", icon: "🇪🇺" },
  { id: "asia_expert", label: "Asian Explorer", description: "Perfect score on Asian flags", icon: "🌏" },
  { id: "daily_player", label: "Daily Explorer", description: "Play 7 days in a row", icon: "📅" },
  { id: "veteran", label: "Flag Veteran", description: "Complete 50 quizzes", icon: "🎖️" },
];
