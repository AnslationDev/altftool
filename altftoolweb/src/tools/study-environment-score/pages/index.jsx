"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LampDesk, RotateCcw } from "lucide-react";

import { FACTORS, RATING_MAX, scoreEnvironment } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_RATINGS = {
  phone: "2",
  noise: "3",
  desk: "4",
  lighting: "4",
  clutter: "3",
  climate: "4",
};

export default function ToolHome() {
  const [ratings, setRatings] = useState(DEFAULT_RATINGS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      scoreEnvironment({
        ratings: Object.fromEntries(
          Object.entries(ratings).map(([id, value]) => [
            id,
            String(value).trim() === "" ? Number.NaN : Number(value),
          ]),
        ),
      }),
    [ratings],
  );
  const hasError = Boolean(result.error);

  const setRating = (id, value) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Study environment score",
      `Score: ${NUM.format(result.score)}/100 — ${result.bandLabel}`,
      ...result.breakdown.map(
        (f) => `${f.label}: ${f.rating}/${RATING_MAX} (${NUM.format(f.points)}/${f.weight} pts)`,
      ),
      result.priorities.length > 0
        ? `Fix first: ${result.priorities.map((p) => p.label).join(", ")}`
        : "Nothing to fix — perfect setup.",
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRatings(DEFAULT_RATINGS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LampDesk className="h-4 w-4" aria-hidden="true" />
          Study habits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Study Environment Score
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rate six factors of your study setup from 0 to {RATING_MAX}. Each factor carries a
          weight — phone placement the most — and the weighted total gives your environment a
          score out of 100 with the top fixes ranked.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {FACTORS.map((factor) => (
            <div key={factor.id}>
              <div className="flex items-center justify-between gap-2">
                <label className={LABEL_CLASS} htmlFor={`env-${factor.id}`}>
                  {factor.label}
                </label>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  weight {factor.weight}
                </span>
              </div>
              <input
                id={`env-${factor.id}`}
                className="mt-3 h-11 w-full accent-[var(--primary)] focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                type="range"
                min="0"
                max={RATING_MAX}
                step="1"
                value={ratings[factor.id] ?? "0"}
                onChange={(event) => setRating(factor.id, event.target.value)}
                aria-valuetext={`${ratings[factor.id]} out of ${RATING_MAX}`}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--muted-foreground)]">{factor.hint}</p>
                <span className="ml-2 shrink-0 rounded-md bg-[var(--muted)] px-2 py-0.5 text-sm font-bold text-[var(--foreground)]">
                  {ratings[factor.id] ?? "0"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Environment score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.score)}/100`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the ratings above to see the score." : result.bandLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the environment score breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all ratings to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {result.breakdown.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">
                    {factor.label} ({factor.rating}/{RATING_MAX})
                  </dt>
                  <dd className="text-right font-semibold">
                    {NUM.format(factor.points)}/{factor.weight} pts
                  </dd>
                </div>
              ))}
            </dl>

            {result.priorities.length > 0 ? (
              <div className="mt-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Fix these first (most points recovered)
                </h2>
                <ol className="mt-3 space-y-3">
                  {result.priorities.map((priority, index) => (
                    <li
                      key={priority.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                    >
                      <p className="text-sm font-semibold">
                        {index + 1}. {priority.label} — recover up to{" "}
                        {NUM.format(priority.lost)} points
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{priority.tip}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The weights are this tool's rubric: distraction factors (phone, noise) carry more
        than comfort factors because they end sessions outright. Re-score after each change
        to see which fix bought the most points.
      </p>
    </main>
  );
}
