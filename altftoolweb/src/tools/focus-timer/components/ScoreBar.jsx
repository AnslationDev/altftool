import { Flame, Star } from "lucide-react";

export default function ScoreBar({ score, streak, lastEvent }) {
  const scorePercent = Math.min(Math.max(score, 0), 100);

  return (
    <div className="grid sm:grid-cols-2 gap-3 mb-4">

      {/* Score Card */}
      <div className="bg-(--background) border border-(--border) rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star size={16} className="text-(--primary) shrink-0" />
          <span className="text-xs font-bold font-primary text-(--muted-foreground) uppercase tracking-wide leading-tight">
            Focus Score
          </span>
        </div>
        <p className="font-black font-primary text-(--primary) text-2xl mb-2">
          {scorePercent}
          <span className="text-sm font-semibold text-(--muted-foreground)">/100</span>
        </p>
        <div className="w-full bg-(--muted) rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${scorePercent}%`,
              background:
                scorePercent >= 80 ? "#22c55e"
                : scorePercent >= 50 ? "var(--primary)"
                : "#f97316",
            }}
          />
        </div>
        {lastEvent && (
          <p className={`text-xs font-secondary mt-2 font-semibold
            ${lastEvent.includes("+") ? "text-green-500" : "text-orange-500"}`}>
            {lastEvent}
          </p>
        )}
      </div>

      {/* Streak Card */}
      <div className="bg-(--background) border border-(--border) rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={16} className="text-orange-500 shrink-0" />
          <span className="text-xs font-bold font-primary text-(--muted-foreground) uppercase tracking-wide leading-tight">
            Streak
          </span>
        </div>
        <p className="font-black font-primary text-2xl mb-1">
          <span className="text-orange-500">{streak}</span>
          <span className="text-sm font-semibold text-(--muted-foreground) ml-1">sessions</span>
        </p>
        <p className="text-xs text-(--muted-foreground) font-secondary">
          {streak === 0 && "Start your first session!"}
          {streak >= 1 && streak < 3 && "Good start"}
          {streak >= 3 && streak < 5 && "You're on fire"}
          {streak >= 5 && streak < 10 && "Deep worker"}
          {streak >= 10 && "Focus Master"}
        </p>
      </div>

    </div>
  );
}