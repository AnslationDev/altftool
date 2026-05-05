import { useStreak } from "../hooks/useStreak.js";
import { Flame, BookCheck, Target } from "lucide-react";

export default function ProgressDashboard({ savedWords }) {
  const { streak, bestStreak } = useStreak();

  // Words stats — useVocab se aata hai
  const learnedCount  = savedWords.filter((w) => w.status === "learned").length;
  const learningCount = savedWords.filter((w) => w.status === "learning").length;
  const newCount      = savedWords.filter((w) => w.status === "new").length;

  // Quiz score — localStorage se
  const bestScore = typeof window !== "undefined"
    ? parseInt(localStorage.getItem("quiz_best_score") || "0")
    : 0;
  const bestTotal = typeof window !== "undefined"
    ? parseInt(localStorage.getItem("quiz_best_total") || "0")
    : 0;

  const stats = [
    {
      icon: BookCheck,
      label: "Words Learned",
      value: learnedCount,
      sub: `${learningCount} learning · ${newCount} new`,
      color: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-200",
    },
    {
      icon: Flame,
      label: "Daily Streak",
      value: `${streak} 🔥`,
      sub: `Best: ${bestStreak} days`,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      icon: Target,
      label: "Quiz Best",
      value: bestTotal > 0 ? `${bestScore}/${bestTotal}` : "—",
      sub: bestTotal > 0
        ? `${Math.round((bestScore / bestTotal) * 100)}% accuracy`
        : "Take a quiz first!",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="px-4 sm:px-6 mb-6">

      {/* Header */}
      <h3 className="text-sm font-semibold text-(--foreground) uppercase tracking-wide mb-3">
        Your Progress
      </h3>

      {/* 3 stat cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map(({ icon: Icon, label, value, sub, color, bg, border }) => (
          <div
            key={label}
            className={`flex flex-col gap-1.5 p-3 sm:p-4 rounded-xl border ${bg} ${border}`}
          >
            <div className={`flex items-center gap-1.5 ${color}`}>
              <Icon size={15} />
              <span className="text-xs font-medium hidden sm:inline">{label}</span>
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${color}`}>
              {value}
            </p>
            <p className="text-xs text-(--muted-foreground) leading-tight">
              {sub}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}