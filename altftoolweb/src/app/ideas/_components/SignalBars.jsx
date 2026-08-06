import { SIGNALS } from "@altftool/core/ideas";

/**
 * Six thin bars, one per signal — the compact fingerprint used on cards.
 * Score is never communicated by colour alone: the accessible label carries
 * every value, and the labelled variant below prints the numbers.
 */
export function SignalBars({ scores, className = "" }) {
  return (
    <div
      className={`afi-bars ${className}`}
      role="img"
      aria-label={SIGNALS.map((s) => `${s.label} ${scores?.[s.key] ?? 0}`).join(", ")}
    >
      {SIGNALS.map((signal) => (
        <span key={signal.key} className="afi-bars__item">
          <span
            className="afi-bars__fill"
            style={{
              background: `var(${signal.cssVar})`,
              width: `${Math.max(0, Math.min(100, scores?.[signal.key] ?? 0))}%`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

/** Labelled breakdown for dossiers and the methodology legend. */
export function SignalRows({ scores }) {
  return (
    <div>
      {SIGNALS.map((signal) => {
        const value = Math.max(0, Math.min(100, scores?.[signal.key] ?? 0));
        return (
          <div key={signal.key} className="afi-signal-row">
            <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span
                className="block h-2 w-2 shrink-0 rounded-sm"
                style={{ background: `var(${signal.cssVar})` }}
              />
              {signal.label}
            </span>
            <span className="afi-signal-row__track">
              <span
                className="afi-signal-row__fill"
                style={{ background: `var(${signal.cssVar})`, width: `${value}%` }}
              />
            </span>
            <span className="text-right font-mono text-[0.8125rem] tabular-nums text-foreground">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default SignalBars;
