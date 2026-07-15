export default function OverallScore({ score, trait, message }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  function getScoreColor(s) {
    if (s >= 80) return "var(--anslation-ds-success, #16A34A)";
    if (s >= 60) return "var(--primary)";
    if (s >= 40) return "var(--anslation-ds-warning, #F59E0B)";
    return "var(--anslation-ds-danger, #EF4444)";
  }

  const color = getScoreColor(score);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-[var(--anslation-ds-shadow-sm)] text-center">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Overall Compatibility</h3>

      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width="130" height="130" className="-rotate-90">
          <circle cx="65" cy="65" r="54" fill="none" stroke="var(--muted)" strokeWidth="10" />
          <circle
            cx="65" cy="65" r="54" fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
          <span className="text-xs text-[var(--muted-foreground)]">Score</span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--muted)] text-sm font-semibold text-[var(--primary)] mb-3">
        {trait}
      </div>

      <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">{message}</p>
    </div>
  );
}
