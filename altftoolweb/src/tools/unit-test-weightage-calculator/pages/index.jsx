"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, Plus, RotateCcw, Trash2 } from "lucide-react";

import { computeWeightedScore } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_STATE = {
  finalMax: "100",
  tests: [
    { id: 1, name: "Unit Test 1", scored: "18", max: "25", weight: "1" },
    { id: 2, name: "Unit Test 2", scored: "21", max: "25", weight: "1" },
    { id: 3, name: "Half-yearly exam", scored: "58", max: "80", weight: "2" },
  ],
  nextId: 4,
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const { finalMax, tests } = state;

  const setFinalMax = (event) => {
    const { value } = event.target;
    setState((prev) => ({ ...prev, finalMax: value }));
  };

  const setTest = (id, key) => (event) => {
    const { value } = event.target;
    setState((prev) => ({
      ...prev,
      tests: prev.tests.map((test) => (test.id === id ? { ...test, [key]: value } : test)),
    }));
  };

  const addTest = () => {
    setState((prev) => ({
      ...prev,
      tests: [...prev.tests, { id: prev.nextId, name: "", scored: "0", max: "25", weight: "1" }],
      nextId: prev.nextId + 1,
    }));
  };

  const removeTest = (id) => {
    setState((prev) => ({ ...prev, tests: prev.tests.filter((test) => test.id !== id) }));
  };

  const result = useMemo(() => computeWeightedScore({ tests, finalMax }), [tests, finalMax]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Final subject score: ${result.finalScore} / ${result.finalMax} (${result.finalPercent}%)`,
      `Rounded: ${result.roundedFinalScore} / ${result.finalMax}`,
      ...result.breakdown.map(
        (row) =>
          `${row.name}: ${row.scored}/${row.max} (${row.percent}%), weight ${row.weight} (${row.effectiveWeightPercent}% of final) -> ${row.contribution} marks`,
      ),
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
    setState(DEFAULT_STATE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          University Exams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Unit Test Weightage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weights are relative — give the half-yearly weight 2 and each unit test weight 1 and it
          counts double. The final score is the weighted mean of your test percentages.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="utw-final">
              Final score out of
            </label>
            <input
              id="utw-final"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              value={finalMax}
              onChange={setFinalMax}
            />
          </div>
        </div>

        <ul className="mt-4 space-y-4">
          {tests.map((test, index) => (
            <li key={test.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`utw-name-${test.id}`}>
                    Test {index + 1} — name
                  </label>
                  <input
                    id={`utw-name-${test.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. Unit Test 3"
                    value={test.name}
                    onChange={setTest(test.id, "name")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`utw-scored-${test.id}`}>
                    Marks scored
                  </label>
                  <input
                    id={`utw-scored-${test.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={test.scored}
                    onChange={setTest(test.id, "scored")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`utw-max-${test.id}`}>
                    Out of (maximum)
                  </label>
                  <input
                    id={`utw-max-${test.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={test.max}
                    onChange={setTest(test.id, "max")}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`utw-weight-${test.id}`}>
                    Weight (relative)
                  </label>
                  <input
                    id={`utw-weight-${test.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={test.weight}
                    onChange={setTest(test.id, "weight")}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTest(test.id)}
                aria-label={`Remove test ${test.name || index + 1}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>

        <button type="button" onClick={addTest} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add test
        </button>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Final subject score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.finalScore} / ${result.finalMax}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.finalPercent}% — rounds to ${result.roundedFinalScore} / ${result.finalMax}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the weighted score breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the example tests" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            result.breakdown.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  {row.name} — {row.scored}/{row.max} ({row.percent}%), counts{" "}
                  {row.effectiveWeightPercent}% of the final
                </dt>
                <dd className="text-right font-semibold">{row.contribution} marks</dd>
              </div>
            ))
          )}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Formula: final = Σ(weight × scored ÷ max) ÷ Σweight × scale. Your school may instead take
        the best N tests or add absolute marks — adjust the rows to mirror the rule your
        institution publishes.
      </p>
    </main>
  );
}
