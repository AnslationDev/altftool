"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, RotateCcw, Target } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DEFAULTS = { current: "72", weight: "40", target: "80", maxScore: "100" };

const TARGET_BANDS = [
  ["A / 90%", 90],
  ["B / 80%", 80],
  ["C / 70%", 70],
  ["D / 60%", 60],
  ["Pass / 40%", 40],
];

const WHAT_IF = [0, 40, 50, 60, 70, 80, 90, 100];

export default function ToolHome() {
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [maxScore, setMaxScore] = useState(DEFAULTS.maxScore);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const result = useMemo(() => {
    if (current === "" || weight === "" || target === "" || maxScore === "")
      return { error: "Fill in your current grade, final exam weight, target grade and max score." };

    const c = Number(current);
    const w = Number(weight);
    const t = Number(target);
    const max = Number(maxScore);

    if (![c, w, t, max].every(Number.isFinite))
      return { error: "All fields must be valid numbers." };
    if (c < 0 || c > 100) return { error: "Current grade must be between 0 and 100." };
    if (t < 0 || t > 100) return { error: "Target grade must be between 0 and 100." };
    if (w <= 0 || w > 100)
      return { error: "Final exam weight must be greater than 0 and at most 100." };
    if (max <= 0) return { error: "Maximum exam score must be greater than 0." };

    const wFrac = w / 100;
    const carried = c * (1 - wFrac);
    const neededPercent = (t - carried) / wFrac;

    const alreadySecured = neededPercent <= 0;
    const impossible = neededPercent > 100;
    const clampedNeeded = Math.min(100, Math.max(0, neededPercent));
    const neededMarks = (clampedNeeded / 100) * max;

    const bands = TARGET_BANDS.map(([label, bandTarget]) => {
      const need = (bandTarget - carried) / wFrac;
      return {
        label,
        bandTarget,
        need,
        secured: need <= 0,
        impossible: need > 100,
        display: Math.min(100, Math.max(0, need)),
      };
    });

    const whatIf = WHAT_IF.map((score) => ({
      score,
      overall: carried + score * wFrac,
    }));

    const bestPossible = carried + 100 * wFrac;
    const worstPossible = carried;

    return {
      currentGrade: c,
      weightPercent: w,
      targetGrade: t,
      maxScoreValue: max,
      carried,
      neededPercent,
      clampedNeeded,
      neededMarks,
      alreadySecured,
      impossible,
      bands,
      whatIf,
      bestPossible,
      worstPossible,
    };
  }, [current, weight, target, maxScore]);

  const reset = () => {
    setCurrent(DEFAULTS.current);
    setWeight(DEFAULTS.weight);
    setTarget(DEFAULTS.target);
    setMaxScore(DEFAULTS.maxScore);
  };

  const copyResult = async () => {
    if (result.error) return;
    const headline = result.alreadySecured
      ? "Target already secured - even a zero in the final keeps you at or above it."
      : result.impossible
        ? "Target is not reachable with a maximum score in the final."
        : `Score at least ${num2.format(result.clampedNeeded)}% (${num2.format(result.neededMarks)} of ${num2.format(result.maxScoreValue)} marks) in the final.`;
    const text = [
      "Exam Score Needed Calculator",
      `Current grade: ${num2.format(result.currentGrade)}%`,
      `Final exam weight: ${num2.format(result.weightPercent)}%`,
      `Target overall grade: ${num2.format(result.targetGrade)}%`,
      headline,
      `Carried forward from coursework: ${num2.format(result.carried)} percentage points`,
      `Best possible overall: ${num2.format(result.bestPossible)}%`,
      `Worst possible overall: ${num2.format(result.worstPossible)}%`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const headlineValue = result.error
    ? "--"
    : result.alreadySecured
      ? `${num2.format(0)}%`
      : result.impossible
        ? "Not reachable"
        : `${num2.format(result.clampedNeeded)}%`;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Target className="h-4 w-4" aria-hidden="true" />
            Final exam planner
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Exam Score Needed Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Enter the grade you carry into the final, how much the final is worth, and the overall
            grade you want. The calculator solves for the minimum score the final exam must earn.
          </p>
        </header>

        <section
          aria-label="Grade inputs"
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="current-grade" className="mb-1 block text-sm font-medium">
                Current grade so far (%)
              </label>
              <input
                id="current-grade"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="final-weight" className="mb-1 block text-sm font-medium">
                Final exam weight (%)
              </label>
              <input
                id="final-weight"
                type="number"
                inputMode="decimal"
                min="1"
                max="100"
                step="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="target-grade" className="mb-1 block text-sm font-medium">
                Target overall grade (%)
              </label>
              <input
                id="target-grade"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="max-score" className="mb-1 block text-sm font-medium">
                Final exam maximum marks
              </label>
              <input
                id="max-score"
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={reset}
              aria-label="Reset grade inputs"
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
          aria-label="Score needed result"
          aria-live="polite"
          aria-atomic="true"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Score needed in the final
              </p>
              <p
                className={`mt-1 text-5xl font-semibold ${
                  !result.error && result.impossible
                    ? "text-[var(--danger)]"
                    : !result.error && result.alreadySecured
                      ? "text-[var(--success)]"
                      : "text-[var(--primary)]"
                }`}
              >
                {headlineValue}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.error
                  ? "Fix the inputs above to see a result."
                  : result.alreadySecured
                    ? "Your target is already locked in, even with a zero in the final."
                    : result.impossible
                      ? `A perfect final gives you ${num2.format(result.bestPossible)}% overall, below your target.`
                      : `That is ${num2.format(result.neededMarks)} out of ${num2.format(result.maxScoreValue)} marks.`}
              </p>
            </div>
            <button
              type="button"
              onClick={copyResult}
              disabled={Boolean(result.error)}
              aria-label="Copy required exam score to clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          {!result.error && (
            <>
              <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)] text-sm">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">
                    Coursework carried into the final
                  </dt>
                  <dd className="font-semibold">{num2.format(result.carried)} percentage points</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Final exam contributes up to</dt>
                  <dd className="font-semibold">{num2.format(result.weightPercent)} percentage points</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Best possible overall</dt>
                  <dd className="font-semibold text-[var(--success)]">
                    {num2.format(result.bestPossible)}%
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Worst possible overall</dt>
                  <dd className="font-semibold">{num2.format(result.worstPossible)}%</dd>
                </div>
              </dl>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Score needed for each grade band
                </p>
                <ul className="space-y-2">
                  {result.bands.map((band) => (
                    <li
                      key={band.label}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <span className="text-[var(--muted-foreground)]">{band.label} overall</span>
                      <span
                        className={`font-semibold ${
                          band.impossible
                            ? "text-[var(--danger)]"
                            : band.secured
                              ? "text-[var(--success)]"
                              : "text-[var(--foreground)]"
                        }`}
                      >
                        {band.impossible
                          ? "Not reachable"
                          : band.secured
                            ? "Already secured"
                            : `${num2.format(band.display)}%`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  What if you score...
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[280px] text-sm">
                    <thead>
                      <tr className="text-left text-[var(--muted-foreground)]">
                        <th scope="col" className="py-2 font-medium">
                          Final exam score
                        </th>
                        <th scope="col" className="py-2 text-right font-medium">
                          Overall grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                      {result.whatIf.map((row) => (
                        <tr key={row.score}>
                          <td className="py-2">{row.score}%</td>
                          <td
                            className={`py-2 text-right font-semibold ${
                              row.overall + 1e-9 >= result.targetGrade
                                ? "text-[var(--success)]"
                                : "text-[var(--foreground)]"
                            }`}
                          >
                            {num2.format(row.overall)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                Formula: needed = (target - current x (1 - weight)) / weight. This assumes your
                current grade already covers every non-final component and that the syllabus has no
                separate minimum in the final paper.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
