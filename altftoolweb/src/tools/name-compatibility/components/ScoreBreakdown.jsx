import { Heart, Users, Sparkles, Briefcase } from "lucide-react";

const iconMap = { Heart, Users, Sparkles, Briefcase };

export default function ScoreBreakdown({ scores }) {
  const items = [
    { key: "love", label: "Love", value: scores.love, icon: "Heart", color: "text-rose-500" },
    { key: "friendship", label: "Friendship", value: scores.friendship, icon: "Users", color: "text-blue-500" },
    { key: "soulmate", label: "Soulmate", value: scores.soulmate, icon: "Sparkles", color: "text-purple-500" },
    { key: "business", label: "Business", value: scores.business, icon: "Briefcase", color: "text-emerald-500" },
  ];

  function getBarColor(score) {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-[var(--primary)]";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Score Breakdown</h3>

      <div className="space-y-4">
        {items.map(({ key, label, value, icon, color }) => {
          const Icon = iconMap[icon];
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
                </div>
                <span className="text-sm font-bold text-[var(--foreground)]">{value}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[var(--muted)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
