"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Receipt, RotateCcw, Trash2 } from "lucide-react";

import { COST_HEADS, trackAttemptCosts } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_ATTEMPTS = [
  {
    id: 1,
    label: "First attempt",
    applicationFee: "1600",
    coaching: "30000",
    testSeries: "3000",
    books: "2000",
    travel: "1500",
    stay: "2000",
    other: "0",
  },
  {
    id: 2,
    label: "Second attempt",
    applicationFee: "1600",
    coaching: "0",
    testSeries: "3500",
    books: "500",
    travel: "1500",
    stay: "2000",
    other: "0",
  },
];

export default function ToolHome() {
  const [attempts, setAttempts] = useState(DEFAULT_ATTEMPTS);
  const [nextId, setNextId] = useState(3);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      trackAttemptCosts({
        attempts: attempts.map((attempt) => {
          const entry = { label: attempt.label };
          for (const head of COST_HEADS) {
            entry[head.id] = attempt[head.id] === "" ? 0 : Number(attempt[head.id]);
          }
          return entry;
        }),
      }),
    [attempts],
  );

  const hasError = Boolean(result.error);

  const updateAttempt = (id, patch) => {
    setAttempts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const addAttempt = () => {
    const blank = { id: nextId, label: "" };
    for (const head of COST_HEADS) blank[head.id] = "";
    setAttempts((prev) => [...prev, blank]);
    setNextId((id) => id + 1);
  };

  const removeAttempt = (id) => {
    setAttempts((prev) => prev.filter((a) => a.id !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Exam attempt costs",
      `Attempts: ${result.attempts.length}`,
      `Grand total: ${money(result.grandTotal)}`,
      `Average per attempt: ${money(result.averagePerAttempt)}`,
      "",
    ];
    for (const attempt of result.attempts) {
      lines.push(`- ${attempt.label}: ${money(attempt.total)}`);
    }
    if (result.costliestHead) {
      lines.push("", `Biggest cost head: ${result.costliestHead.label} (${money(result.costliestHead.total)})`);
    }
    return lines.join("\n");
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
    setAttempts(DEFAULT_ATTEMPTS);
    setNextId(3);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Student Finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Attempt Cost Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log what every attempt cost — form fee, coaching, test series, books, travel and stay —
          and see the total, the average per attempt and where the money actually went.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="space-y-5">
          {attempts.map((attempt, index) => (
            <fieldset
              key={attempt.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Attempt {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`eac-label-${attempt.id}`}>
                    Label
                  </label>
                  <input
                    id={`eac-label-${attempt.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder={`Attempt ${index + 1}`}
                    value={attempt.label}
                    onChange={(event) => updateAttempt(attempt.id, { label: event.target.value })}
                  />
                </div>
                {COST_HEADS.map((head) => (
                  <div key={head.id}>
                    <label className={LABEL_CLASS} htmlFor={`eac-${head.id}-${attempt.id}`}>
                      {head.label} (INR)
                    </label>
                    <input
                      id={`eac-${head.id}-${attempt.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="100"
                      value={attempt[head.id]}
                      onChange={(event) =>
                        updateAttempt(attempt.id, { [head.id]: event.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => removeAttempt(attempt.id)}
                aria-label={`Remove ${attempt.label || `attempt ${index + 1}`}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove attempt
              </button>
            </fieldset>
          ))}
        </div>
        <button type="button" onClick={addAttempt} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add attempt
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total spent across attempts
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.grandTotal)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see totals."
                : `${result.attempts.length} attempt${result.attempts.length === 1 ? "" : "s"}, averaging ${money(result.averagePerAttempt)} each.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the attempt cost summary"
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
              aria-label="Reset all attempts to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [["Per-attempt totals", DASH]]
            : result.attempts.map((attempt) => [attempt.label, money(attempt.total)])
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.grandTotal > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Cost head
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Total
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.headTotals
                  .filter((head) => head.total > 0)
                  .map((head) => (
                    <tr key={head.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{head.label}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{money(head.total)}</td>
                      <td className="py-2 text-right">
                        {head.share === null ? DASH : `${PCT.format(head.share)}%`}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Figures stay on this page — nothing is uploaded. Knowing the real cost per attempt helps
        you decide between another self-study attempt, a test-series-only plan, or a full coaching
        repeat.
      </p>
    </main>
  );
}
