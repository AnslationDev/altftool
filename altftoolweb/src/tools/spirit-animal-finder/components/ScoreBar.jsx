import { BarChart3, Trophy } from "lucide-react";

export default function ScoreBar({ allScores }) {
  if (!allScores || allScores.length === 0) return null;

  const top6 = allScores.slice(0, 6);
  const maxScore = top6[0]?.score || 1;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Top Spirit Animals</h3>
      </div>

      <div className="space-y-3">
        {top6.map(({ animal, score }, idx) => {
          const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

          return (
            <div key={animal.id} className="flex items-center gap-3">
              <div className="w-6 text-center shrink-0">
                {idx === 0 ? (
                  <Trophy className="h-4 w-4 text-amber-500" />
                ) : (
                  <span className="text-xs font-bold text-[var(--muted-foreground)]">{idx + 1}</span>
                )}
              </div>
              <div className="text-2xl shrink-0 w-8 text-center">{animal.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{animal.name}</span>
                  <span className="text-xs font-bold text-[var(--primary)]">{score} pts</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
