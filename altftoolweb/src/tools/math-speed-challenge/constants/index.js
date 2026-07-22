export const OPERATIONS = [
  { id: "add", label: "Addition", symbol: "+", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { id: "sub", label: "Subtraction", symbol: "−", color: "text-blue-600", bg: "bg-blue-500/10" },
  { id: "mul", label: "Multiplication", symbol: "×", color: "text-purple-600", bg: "bg-purple-500/10" },
  { id: "div", label: "Division", symbol: "÷", color: "text-amber-600", bg: "bg-amber-500/10" },
];

export const TIME_OPTIONS = [
  { id: 30, label: "30s" },
  { id: 60, label: "60s" },
  { id: 90, label: "90s" },
  { id: 120, label: "120s" },
];

export const STREAK_THRESHOLDS = [
  { streak: 0, label: "Beginner", numberMax: 20, color: "#14B8A6" },
  { streak: 5, label: "Intermediate", numberMax: 50, color: "#3B82F6" },
  { streak: 15, label: "Advanced", numberMax: 100, color: "#8B5CF6" },
  { streak: 30, label: "Expert", numberMax: 200, color: "#F59E0B" },
  { streak: 50, label: "Master", numberMax: 500, color: "#EF4444" },
  { streak: 80, label: "Legend", numberMax: 1000, color: "#EC4899" },
];
