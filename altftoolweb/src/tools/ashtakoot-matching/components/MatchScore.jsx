import { CheckCircle, XCircle, Sparkles } from "lucide-react";

export default function MatchScore({ result }) {
  const { totalScore, matchPercent, isCompatible, verdict, person1, person2 } = result;

  const color = totalScore >= 24 ? "text-emerald-600 border-emerald-500" : totalScore >= 18 ? "text-blue-600 border-blue-500" : "text-amber-600 border-amber-500";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className={`flex items-center gap-2 border-b border-[var(--border)] px-6 py-4 ${
        totalScore >= 24 ? "bg-emerald-500/5" : totalScore >= 18 ? "bg-blue-500/5" : "bg-amber-500/5"
      }`}>
        {isCompatible ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-600" />}
        <h3 className="text-base font-bold text-[var(--foreground)]">
          {verdict} — {matchPercent}% Match ({totalScore}/36)
        </h3>
      </div>
      <div className="p-6">
        <div className="mb-6 flex flex-col items-center">
          <div className={`relative flex h-28 w-28 items-center justify-center rounded-full border-4 ${color}`}>
            <span className="text-3xl font-extrabold">{totalScore}</span>
            <span className="absolute -bottom-1 text-xs text-[var(--muted-foreground)]">/36</span>
          </div>
          <p className="mt-2 text-sm font-bold text-[var(--foreground)]">
            {totalScore >= 30 ? "Highly Auspicious" : totalScore >= 24 ? "Very Good Match" : totalScore >= 18 ? "Qualifies for Marriage" : "Below Threshold"}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {totalScore >= 18
              ? "Meets the minimum 18/36 guna requirement."
              : "Below the 18-guna threshold — additional remedies may help."}
          </p>
          {totalScore >= 30 && (
            <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <Sparkles className="h-3.5 w-3.5" /> Excellent Compatibility
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">{person1.name}</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{person1.nakshatra.name} ({person1.pada})</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Moon: {person1.rashi.english} · Sun: {person1.sunRashi.english}
            </p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">{person2.name}</p>
            <p className="text-lg font-extrabold text-[var(--foreground)]">{person2.nakshatra.name} ({person2.pada})</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Moon: {person2.rashi.english} · Sun: {person2.sunRashi.english}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
