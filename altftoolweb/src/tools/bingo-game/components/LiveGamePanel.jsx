import { Timer, Hash, BarChart3 } from "lucide-react";

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}

export default function LiveGamePanel({
  gameStarted,
  currentNumber,
  calledNumbers,
  timer,
  markedCount,
  nextNumber,
}) {
  const totalNumbers = 75;
  const progress = calledNumbers.length > 0 ? (calledNumbers.length / totalNumbers) * 100 : 0;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--primary)]">Live Game</p>
      <h2 className="mt-1 text-xl font-semibold">Game Status</h2>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {formatTime(timer)}
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>{calledNumbers.length} / {totalNumbers} called</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-0">
        <StatRow label="Game Status" value={gameStarted ? "In Progress" : "Not Started"} />
        <StatRow label="Numbers Called" value={calledNumbers.length} />
        <StatRow label="Numbers Remaining" value={totalNumbers - calledNumbers.length} />
        <StatRow label="Cells Marked" value={markedCount} />
        {nextNumber && (
          <StatRow label="Last Called" value={`${nextNumber}`} />
        )}
      </div>

      {calledNumbers.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Recent Calls</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {calledNumbers.slice(-10).reverse().map((num, i) => (
              <span
                key={`${num}-${i}`}
                className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs font-semibold text-[var(--foreground)]"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {calledNumbers.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">All Called Numbers</p>
          <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
            <div className="flex flex-wrap gap-1">
              {calledNumbers.map((num, i) => (
                <span
                  key={`all-${num}-${i}`}
                  className="inline-flex h-6 min-w-[24px] items-center justify-center rounded bg-[var(--muted)] px-1.5 text-[11px] font-semibold text-[var(--foreground)]"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
