export const DIFFICULTIES = [
  { id: "easy", label: "Easy", description: "Well-known countries", color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "medium", label: "Medium", description: "Moderate challenge", color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "hard", label: "Hard", description: "Obscure facts", color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "mixed", label: "Mixed", description: "All difficulties", color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-500/20" },
];

export const QUESTION_TYPES = [
  { id: "capital", label: "Capitals", icon: "building", description: "Identify countries by their capitals" },
  { id: "continent", label: "Continents", icon: "map", description: "Match countries to continents" },
  { id: "region", label: "Regions", icon: "map-pin", description: "Subregion identification" },
  { id: "currency", label: "Currencies", icon: "banknote", description: "Identify currencies and countries" },
  { id: "language", label: "Languages", icon: "languages", description: "Language identification" },
  { id: "borders", label: "Borders", icon: "map-pin", description: "Neighboring countries" },
  { id: "area", label: "Area", icon: "ruler", description: "Country size comparisons" },
  { id: "tld", label: "Domains", icon: "globe", description: "Top-level domain questions" },
  { id: "flag", label: "Flags", icon: "flag", description: "Flag identification" },
  { id: "random", label: "Random Mix", icon: "shuffle", description: "Mixed question types" },
];

export const QUESTION_COUNTS = [10, 15, 20, 30, 50];

export const TIME_OPTIONS = [
  { id: 0, label: "No Limit" },
  { id: 15, label: "15s" },
  { id: 20, label: "20s" },
  { id: 30, label: "30s" },
  { id: 45, label: "45s" },
  { id: 60, label: "60s" },
];

export const ACHIEVEMENTS = [
  { id: "first_quiz", label: "First Steps", description: "Complete your first quiz", icon: "🎯" },
  { id: "perfect_score", label: "Perfect Score", description: "Score 100% on a quiz", icon: "🏆" },
  { id: "speed_demon", label: "Speed Demon", description: "Complete a quiz with average time under 5s", icon: "⚡" },
  { id: "streak_5", label: "Hot Streak", description: "Get 5 correct answers in a row", icon: "🔥" },
  { id: "world_traveler", label: "World Traveler", description: "Answer 500 questions correctly", icon: "✈️" },
  { id: "capital_master", label: "Capital Master", description: "Score 100% on a capitals quiz", icon: "🏛️" },
  { id: "daily_player", label: "Daily Player", description: "Play quizzes 7 days in a row", icon: "📅" },
  { id: "quiz_veteran", label: "Quiz Veteran", description: "Complete 50 quizzes", icon: "🎖️" },
];
