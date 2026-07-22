import { CheckCircle, XCircle, AlertTriangle, Sparkles } from "lucide-react";

export default function ScoreSummary({ result }) {
  const { totalScore, totalMax, matchPercent, isCompatible, person1, person2 } = result;

  const status = isCompatible
    ? { icon: CheckCircle, label: "Compatible", color: "text-emerald-600", bg: "bg-emerald-500/10" }
    : { icon: XCircle, label: "Needs Review", color: "text-amber-600", bg: "bg-amber-500/10" };

  const ringColor = isCompatible ? "border-emerald-500 text-emerald-600" : "border-amber-500 text-amber-600";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className={`flex items-center gap-2 border-b border-[var(--border)] px-6 py-4 ${status.bg}`}>
        <status.icon className={`h-5 w-5 ${status.color}`} />
        <h3 className="text-base font-bold text-[var(--foreground)]">{status.label} — {matchPercent}% Match</h3>
      </div>

      <div className="p-6">
        <div className="mb-6 flex flex-col items-center">
          <div className={`relative flex h-28 w-28 items-center justify-center rounded-full border-4 ${ringColor}`}>
            <span className="text-3xl font-extrabold">{totalScore}</span>
            <span className="absolute -bottom-1 text-xs text-[var(--muted-foreground)]">/{totalMax}</span>
          </div>
          <p className="mt-2 text-sm font-bold text-[var(--foreground)]">
            {totalScore >= 30 ? "Excellent Match" : totalScore >= 24 ? "Very Good Match" : totalScore >= 18 ? "Good Match" : "Low Compatibility"}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {totalScore >= 18
              ? "Minimum 18/36 required — this match qualifies for marriage consideration."
              : "Below the 18-guna threshold — consider spiritual remedies for matching."}
          </p>
          {totalScore >= 30 && (
            <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <Sparkles className="h-3.5 w-3.5" /> Highly Auspicious
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">{person1.name}</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{person1.nakshatra.name} ({person1.pada})</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Moon: {person1.rashi.english} ({person1.rashi.name}) · Sun: {person1.sunRashi.english}
            </p>
            {person1.manglik.hasDosha && (
              <p className="mt-1 text-xs font-bold text-rose-600">⚠ Manglik</p>
            )}
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">{person2.name}</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{person2.nakshatra.name} ({person2.pada})</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Moon: {person2.rashi.english} ({person2.rashi.name}) · Sun: {person2.sunRashi.english}
            </p>
            {person2.manglik.hasDosha && (
              <p className="mt-1 text-xs font-bold text-rose-600">⚠ Manglik</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
