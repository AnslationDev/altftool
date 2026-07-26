"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Copy, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numInt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = { attended: "62", held: "80", target: "75", remaining: "20" };

export default function ToolHome() {
  const [attended, setAttended] = useState(DEFAULTS.attended);
  const [held, setHeld] = useState(DEFAULTS.held);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [remaining, setRemaining] = useState(DEFAULTS.remaining);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const a = Number(attended);
    const h = Number(held);
    const t = Number(target);
    const r = remaining === "" ? 0 : Number(remaining);

    if (attended === "" || held === "" || target === "")
      return { error: "Enter classes attended, classes held and your target percentage." };
    if (![a, h, t, r].every(Number.isFinite))
      return { error: "All fields must be valid numbers." };
    if (h <= 0) return { error: "Classes held must be greater than 0." };
    if (a < 0 || r < 0) return { error: "Class counts cannot be negative." };
    if (a > h) return { error: "Classes attended cannot exceed classes held." };
    if (t < 0 || t > 100) return { error: "Target attendance must be between 0 and 100." };

    const current = (a / h) * 100;
    const ratio = t / 100;
    const meetsTarget = current + 1e-9 >= t;

    // Consecutive classes you must attend from now to reach the target.
    let mustAttend = 0;
    let unreachable = false;
    if (!meetsTarget) {
      if (ratio >= 1) {
        unreachable = true;
      } else {
        mustAttend = Math.ceil((ratio * h - a) / (1 - ratio) - 1e-9);
        if (mustAttend < 0) mustAttend = 0;
      }
    }

    // Consecutive classes you can miss while still holding the target.
    let canSkip = 0;
    if (meetsTarget) {
      canSkip = ratio > 0 ? Math.floor(a / ratio - h + 1e-9) : Infinity;
      if (!Number.isFinite(canSkip)) canSkip = null; // target 0% => unlimited
      else if (canSkip < 0) canSkip = 0;
    }

    // Projection over the remaining classes in the term.
    const totalIfAllAttended = h + r;
    const bestPossible = totalIfAllAttended > 0 ? ((a + r) / totalIfAllAttended) * 100 : current;
    const worstPossible = totalIfAllAttended > 0 ? (a / totalIfAllAttended) * 100 : current;
    let missAllowedInTerm = Math.floor(a + r - ratio * totalIfAllAttended + 1e-9);
    missAllowedInTerm = Math.max(0, Math.min(r, missAllowedInTerm));
    const targetReachableInTerm = bestPossible + 1e-9 >= t;

    return {
      current,
      meetsTarget,
      mustAttend,
      unreachable,
      canSkip,
      remainingCount: r,
      bestPossible,
      worstPossible,
      missAllowedInTerm,
      targetReachableInTerm,
      attendedCount: a,
      heldCount: h,
      missedCount: h - a,
      targetPercent: t,
    };
  }, [attended, held, target, remaining]);

  const reset = () => {
    setAttended(DEFAULTS.attended);
    setHeld(DEFAULTS.held);
    setTarget(DEFAULTS.target);
    setRemaining(DEFAULTS.remaining);
  };

  const copyResult = async () => {
    if (result.error) return;
    const lines = [
      "Attendance Percentage Calculator",
      `Attended: ${numInt.format(result.attendedCount)} of ${numInt.format(result.heldCount)} classes`,
      `Current attendance: ${num2.format(result.current)}%`,
      `Target: ${num2.format(result.targetPercent)}%`,
      result.meetsTarget
        ? `You can miss ${result.canSkip === null ? "any number of" : numInt.format(result.canSkip)} consecutive classes and stay at or above target.`
        : result.unreachable
          ? "A 100% target cannot be recovered once a class has been missed."
          : `Attend ${numInt.format(result.mustAttend)} classes in a row to reach the target.`,
    ];
    if (result.remainingCount > 0) {
      lines.push(
        `Classes left in term: ${numInt.format(result.remainingCount)}`,
        `If you attend all of them: ${num2.format(result.bestPossible)}%`,
        `You may still miss ${numInt.format(result.missAllowedInTerm)} of them and finish on target.`
      );
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const headline = result.error ? "--" : `${num2.format(result.current)}%`;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Attendance tracker
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Attendance Percentage Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            See your current attendance, how many classes you must attend in a row to reach the
            required percentage, and how many you can safely skip once you are above it.
          </p>
        </header>

        <section
          aria-label="Attendance inputs"
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="attended" className="mb-1 block text-sm font-medium">
                Classes attended
              </label>
              <input
                id="attended"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={attended}
                onChange={(e) => setAttended(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="held" className="mb-1 block text-sm font-medium">
                Total classes held
              </label>
              <input
                id="held"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={held}
                onChange={(e) => setHeld(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="target" className="mb-1 block text-sm font-medium">
                Required attendance (%)
              </label>
              <input
                id="target"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="remaining" className="mb-1 block text-sm font-medium">
                Classes left this term (optional)
              </label>
              <input
                id="remaining"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={remaining}
                onChange={(e) => setRemaining(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[65, 70, 75, 80].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTarget(String(preset))}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  Number(target) === preset
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {preset}%
              </button>
            ))}
            <button
              type="button"
              onClick={reset}
              aria-label="Reset attendance inputs"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        {result.error && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </div>
        )}

        <section
          aria-label="Attendance result"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Current attendance
              </p>
              <p
                className={`mt-1 text-5xl font-semibold ${
                  result.error
                    ? "text-[var(--primary)]"
                    : result.meetsTarget
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]"
                }`}
              >
                {headline}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.error
                  ? "Fix the inputs above to see a result."
                  : result.meetsTarget
                    ? `At or above your ${num2.format(result.targetPercent)}% requirement.`
                    : `Short of your ${num2.format(result.targetPercent)}% requirement.`}
              </p>
            </div>
            <button
              type="button"
              onClick={copyResult}
              disabled={Boolean(result.error)}
              aria-label="Copy attendance result to clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          {!result.error && (
            <>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className={`h-full rounded-full ${
                    result.meetsTarget ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, result.current))}%` }}
                />
              </div>

              <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  What to do next
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {result.meetsTarget
                    ? result.canSkip === null
                      ? "No minimum attendance set, so nothing is at risk."
                      : `You can miss ${numInt.format(result.canSkip)} more class${result.canSkip === 1 ? "" : "es"} in a row.`
                    : result.unreachable
                      ? "A 100% requirement cannot be recovered after a missed class."
                      : `Attend the next ${numInt.format(result.mustAttend)} class${result.mustAttend === 1 ? "" : "es"} without a break.`}
                </p>
              </div>

              <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)] text-sm">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Classes attended</dt>
                  <dd className="font-semibold">
                    {numInt.format(result.attendedCount)} of {numInt.format(result.heldCount)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Classes missed so far</dt>
                  <dd className="font-semibold">{numInt.format(result.missedCount)}</dd>
                </div>
                {result.remainingCount > 0 && (
                  <>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">
                        If you attend all {numInt.format(result.remainingCount)} remaining
                      </dt>
                      <dd className="font-semibold">{num2.format(result.bestPossible)}%</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">If you attend none of them</dt>
                      <dd className="font-semibold">{num2.format(result.worstPossible)}%</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <dt className="text-[var(--muted-foreground)]">
                        Remaining classes you may still miss
                      </dt>
                      <dd
                        className={`font-semibold ${
                          result.targetReachableInTerm
                            ? "text-[var(--foreground)]"
                            : "text-[var(--danger)]"
                        }`}
                      >
                        {result.targetReachableInTerm
                          ? numInt.format(result.missAllowedInTerm)
                          : "Target no longer reachable"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                Attendance = classes attended / classes held x 100. Colleges count labs, tutorials
                and medical leave differently, so treat this as a planning estimate and confirm with
                your department register.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
