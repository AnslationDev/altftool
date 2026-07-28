"use client";

import { useMemo, useState } from "react";
import { Brain, Check, Copy, Eraser, RotateCcw } from "lucide-react";
import { RESPONSE_OPTIONS, STRESS_ITEMS, scoreStressCheck } from "../lib";

const DASH = "—";

const DEFAULT_RATING = 2; // "Sometimes" - gives a real, mid-range result at first paint

const buildDefaults = () =>
  Object.fromEntries(STRESS_ITEMS.map((item) => [item.id, DEFAULT_RATING]));

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAND_TONE = {
  low: "text-[var(--success)]",
  moderate: "text-[var(--primary)]",
  high: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [answers, setAnswers] = useState(buildDefaults);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreStressCheck(answers), [answers]);
  const ok = !result.error;

  const setAnswer = (id, value) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === "") delete next[id];
      else next[id] = Number(value);
      return next;
    });
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Stress Level Self-Check (10 items, last month)",
      `Score: ${result.total} of ${result.maxTotal}`,
      `Band: ${result.bandLabel} (${result.bandRange})`,
      `Feeling out of control: ${result.helplessness} of ${result.helplessnessMax}`,
      `Low sense of coping: ${result.coping} of ${result.copingMax}`,
      "",
      "Suggested next steps:",
      ...result.steps.map((step) => `- ${step}`),
      "",
      "Informational self-check only, not a diagnosis.",
    ].join("\n");
  }, [ok, result]);

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
    setAnswers(buildDefaults());
    setCopied(false);
  };

  const clearAll = () => {
    setAnswers({});
    setCopied(false);
  };

  const barWidth = ok ? Math.max(2, Math.min(100, result.percent)) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Brain className="h-4 w-4" aria-hidden="true" />
          Mental wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stress Level Self-Check</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Ten questions about the last month, each rated from never to very often. Four positively
          worded items are reverse scored, giving a 0-40 perceived stress total with low, moderate
          and high bands. This is a self-check, not a diagnosis.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">In the last month, how often have you…</h2>
        <div className="mt-4 grid gap-4">
          {STRESS_ITEMS.map((item, index) => (
            <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_11rem] sm:items-center">
              <label
                className="block text-sm font-medium text-[var(--foreground)]"
                htmlFor={`stress-${item.id}`}
              >
                <span className="mr-1 font-semibold text-[var(--muted-foreground)]">
                  {index + 1}.
                </span>
                {item.text}?
              </label>
              <select
                id={`stress-${item.id}`}
                className={SELECT_CLASS}
                value={answers[item.id] === undefined ? "" : String(answers[item.id])}
                onChange={(event) => setAnswer(item.id, event.target.value)}
              >
                <option value="">Not answered</option>
                {RESPONSE_OPTIONS.map((option) => (
                  <option key={option.value} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={reset} aria-label="Reset every answer" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={clearAll}
            aria-label="Clear every answer"
            className={GHOST_BTN}
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            Clear answers
          </button>
        </div>
      </section>

      {result.error ? (
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
              Perceived stress score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${ok ? BAND_TONE[result.bandKey] : "text-[var(--muted-foreground)]"}`}
            >
              {ok ? `${result.total} / ${result.maxTotal}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.bandLabel} (${result.bandRange})` : "Answer every question to see a score"}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the stress self-check result"
            className={GHOST_BTN}
            disabled={!ok}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${barWidth}%` }}
            aria-hidden="true"
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Feeling out of control (6 items)",
              ok ? `${result.helplessness} / ${result.helplessnessMax}` : DASH,
            ],
            ["Low sense of coping (4 items)", ok ? `${result.coping} / ${result.copingMax}` : DASH],
            [
              "Bigger contributor",
              ok
                ? result.dominantFactor === "helplessness"
                  ? "Feeling out of control"
                  : "Low sense of coping"
                : DASH,
            ],
            ["Share of the maximum", ok ? `${result.percent}%` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? <p className="mt-4 text-sm leading-6">{result.summary}</p> : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Next steps for this band</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.steps.map((step) => (
              <li key={step} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                <span>{step}</span>
              </li>
            ))}
          </ul>

          {result.topDrivers.length > 0 ? (
            <>
              <h3 className="mt-5 text-sm font-semibold">What is pushing the score up</h3>
              <ul className="mt-2 grid gap-2 text-sm">
                {result.topDrivers.map((driver) => (
                  <li
                    key={driver.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2"
                  >
                    <span className="text-[var(--muted-foreground)]">{driver.text}</span>
                    <span className="shrink-0 font-semibold">{driver.points} pts</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This questionnaire measures how unpredictable and overloaded life has
        felt recently — it does not diagnose an anxiety disorder, depression or any other condition.
        Speak to a doctor or a qualified mental health professional if stress is affecting your
        sleep, work or relationships, and contact emergency services or a crisis helpline
        immediately if you feel unsafe.
      </p>
    </main>
  );
}
