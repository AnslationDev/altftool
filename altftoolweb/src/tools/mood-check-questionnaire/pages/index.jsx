"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smile } from "lucide-react";
import {
  DIFFICULTY_OPTIONS,
  FREQUENCY_OPTIONS,
  MOOD_BANDS,
  MOOD_ITEMS,
  MOOD_MAX,
  RECALL_DAYS,
  computeMoodScore,
} from "../lib";

const BLANK_RESPONSES = MOOD_ITEMS.map(() => 0);

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [responses, setResponses] = useState(BLANK_RESPONSES);
  const [difficulty, setDifficulty] = useState("none");
  const [copied, setCopied] = useState(false);

  const setAnswer = (index, value) => {
    setResponses((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const result = useMemo(() => computeMoodScore({ responses, difficulty }), [responses, difficulty]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mood Check Questionnaire",
      `Total: ${result.total} of ${result.max}`,
      `Band: ${result.band}`,
      `Statements present more than half the days: ${result.frequentItemCount}`,
      `Impact on daily life: ${result.difficultyLabel}`,
      "",
      ...result.breakdown.map((row) => `${row.statement}: ${row.answer} (${row.points})`),
      "",
      "Informational self-check only — not a diagnosis.",
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
    setResponses(BLANK_RESPONSES);
    setDifficulty("none");
    setCopied(false);
  };

  const barPct = hasError ? 0 : Math.round((result.total / MOOD_MAX) * 100);
  const raised = !hasError && result.aboveAssessmentThreshold;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smile className="h-4 w-4" aria-hidden="true" />
          Self-check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Mood Check Questionnaire</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Over the last {RECALL_DAYS} days, how often has each statement applied to you? Nine
          statements, each rated 0 to 3, give a total out of {MOOD_MAX}. Nothing you enter leaves
          your browser.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">The last two weeks</h2>
        <div className="mt-4 grid gap-4">
          {MOOD_ITEMS.map((item, index) => (
            <fieldset key={item.id} className="rounded-lg border border-[var(--border)] p-3">
              <legend className="px-1 text-sm font-semibold">
                {index + 1}. {item.statement}
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {FREQUENCY_OPTIONS.map((option) => {
                  const inputId = `mood-${item.id}-${option.value}`;
                  const selected = responses[index] === option.value;
                  return (
                    <label
                      key={option.value}
                      htmlFor={inputId}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 font-semibold text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={`mood-${item.id}`}
                        className="h-4 w-4 accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        value={option.value}
                        checked={selected}
                        onChange={() => setAnswer(index, option.value)}
                      />
                      <span>
                        {option.value} · {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="mood-difficulty">
            If any of these applied, how difficult have they made daily life? (not scored)
          </label>
          <select
            id="mood-difficulty"
            className={FIELD}
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      {!hasError && result.safetyFlag && (
        <div
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm font-medium text-[var(--danger)]"
        >
          You answered above zero on the question about thoughts of self-harm. Please talk to someone
          today — a doctor, a crisis line, or a person you trust. In India you can call Tele-MANAS on
          14416; in the US and Canada, call or text 988. If you are in immediate danger, use your
          local emergency number.
        </div>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total score
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.total}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Answer every statement to see a score." : `out of ${result.max} · ${result.band}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy mood check result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className={`block h-full ${raised ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Severity band", hasError ? DASH : result.band],
            [
              "Statements present more than half the days",
              hasError ? DASH : `${result.frequentItemCount} of ${result.breakdown.length}`,
            ],
            ["At or above the 10-point mark", hasError ? DASH : result.aboveAssessmentThreshold ? "Yes" : "No"],
            ["Impact on daily life", hasError ? DASH : result.difficultyLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.bandNote && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.bandNote}
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Score bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Total</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">Reading</th>
              </tr>
            </thead>
            <tbody>
              {MOOD_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min}-{band.max}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This questionnaire is a structured way to notice how you have been
        feeling; it is not a diagnostic test, it cannot tell you whether you have depression, and a
        low score does not mean nothing is wrong. If your mood is affecting daily life, or you are
        worried about yourself or someone else, speak to a doctor or mental health professional.
      </p>
    </main>
  );
}
