"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  BURNOUT_ITEMS,
  DIMENSIONS,
  FREQUENCY_OPTIONS,
  scoreBurnoutCheck,
  summariseTrend,
} from "../lib";

const DASH = "—";
const DEFAULT_RATING = 3; // "A few times a month" - a realistic mid-scale first paint

const buildDefaults = () =>
  Object.fromEntries(BURNOUT_ITEMS.map((item) => [item.id, DEFAULT_RATING]));

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toneFor = (dimension) => {
  if (dimension.concerning) return "text-[var(--danger)]";
  if (dimension.healthy) return "text-[var(--success)]";
  return "text-[var(--foreground)]";
};

const DIRECTION_TEXT = {
  none: "",
  first: "First entry saved. Save another check later to see the direction of travel.",
  steady: "Broadly unchanged since the previous saved check.",
  improving: "Lower burnout risk than your previous saved check.",
  worsening: "Higher burnout risk than your previous saved check.",
};

export default function ToolHome() {
  const [answers, setAnswers] = useState(buildDefaults);
  const [log, setLog] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreBurnoutCheck(answers), [answers]);
  const ok = !result.error;
  const trend = useMemo(() => summariseTrend(log), [log]);

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
      "Burnout Self-Check",
      `Profile: ${result.profileLabel}`,
      `Burnout risk score: ${result.riskScore} of 6 (${result.riskPercent}%)`,
      "",
      ...result.dimensionOrder.map((key) => {
        const dim = result.scores[key];
        return `${dim.label}: mean ${dim.mean}/6 (${dim.level}) - ${dim.sum} of ${dim.max} points`;
      }),
      "",
      "Suggested actions:",
      ...result.actions.map((action) => `- ${action}`),
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

  const saveToLog = () => {
    if (!ok) return;
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;
    setLog((prev) => [
      ...prev,
      {
        id: `${date}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date,
        exhaustion: result.scores.exhaustion.mean,
        cynicism: result.scores.cynicism.mean,
        efficacy: result.scores.efficacy.mean,
        riskScore: result.riskScore,
        profileLabel: result.profileLabel,
      },
    ]);
  };

  const removeEntry = (id) => setLog((prev) => prev.filter((entry) => entry.id !== id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Mental wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Burnout Self-Check</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Twelve statements about your working life, rated by how often they are true. They score
          the three dimensions ICD-11 uses to describe burnout — exhaustion, mental distance from
          the job, and reduced professional efficacy — and combine into a profile you can log over
          time.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Over the last few weeks at work, how often have you…</h2>
        <div className="mt-4 grid gap-4">
          {BURNOUT_ITEMS.map((item, index) => (
            <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_13rem] sm:items-center">
              <label
                className="block text-sm font-medium text-[var(--foreground)]"
                htmlFor={`burnout-${item.id}`}
              >
                <span className="mr-1 font-semibold text-[var(--muted-foreground)]">
                  {index + 1}.
                </span>
                {item.text}?
              </label>
              <select
                id={`burnout-${item.id}`}
                className={SELECT_CLASS}
                value={answers[item.id] === undefined ? "" : String(answers[item.id])}
                onChange={(event) => setAnswer(item.id, event.target.value)}
              >
                <option value="">Not answered</option>
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Statements 9 to 12 are about {DIMENSIONS.efficacy.label.toLowerCase()}, where answering
          more often is the healthier direction.
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Burnout profile
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.profileLabel : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Composite risk ${result.riskScore} of 6 (${result.riskPercent}%)`
                : "Answer every statement to see a profile"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the burnout self-check result"
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
            <button type="button" onClick={reset} aria-label="Reset every answer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok ? result.dimensionOrder : ["exhaustion", "cynicism", "efficacy"]).map((key) => {
            const dim = ok ? result.scores[key] : null;
            return (
              <div key={key} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold">{DIMENSIONS[key].label}</dt>
                  <dd className={`text-right font-semibold ${dim ? toneFor(dim) : ""}`}>
                    {dim ? `${dim.mean} / 6 · ${dim.level}` : DASH}
                  </dd>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {DIMENSIONS[key].blurb}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className={`block h-full ${dim && dim.concerning ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                    style={{ width: `${dim ? Math.max(2, dim.percent) : 0}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </dl>

        {ok ? <p className="mt-4 text-sm leading-6">{result.profileSummary}</p> : null}
        {ok ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {result.concerningCount} of 3 dimensions are in the concerning range.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to do about this profile</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.actions.map((action) => (
              <li key={action} className="flex gap-2">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                  aria-hidden="true"
                />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Trend log</h2>
          <button
            type="button"
            onClick={saveToLog}
            aria-label="Save today's scores to the trend log"
            className={PRIMARY_BTN}
            disabled={!ok}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Save today
          </button>
        </div>

        {log.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Nothing saved yet. Entries stay in this browser tab only — copy the result if you want
            to keep it.
          </p>
        ) : (
          <>
            {trend.deltas ? (
              <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium">
                {DIRECTION_TEXT[trend.direction]} Risk change {trend.deltas.riskScore >= 0 ? "+" : ""}
                {trend.deltas.riskScore} on a 0-6 scale.
              </p>
            ) : (
              <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium">
                {DIRECTION_TEXT.first}
              </p>
            )}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Exh.</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Cyn.</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Effic.</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Risk</th>
                    <th scope="col" className="py-2 text-right font-semibold">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {trend.sorted.map((entry) => (
                    <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{entry.date}</td>
                      <td className="py-2 pr-3 text-right">{entry.exhaustion}</td>
                      <td className="py-2 pr-3 text-right">{entry.cynicism}</td>
                      <td className="py-2 pr-3 text-right">{entry.efficacy}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{entry.riskScore}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          aria-label={`Remove the entry saved on ${entry.date}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Burnout is classified in ICD-11 as an occupational phenomenon rather
        than a medical condition, and no questionnaire can diagnose it. Persistent exhaustion, low
        mood or changes in sleep and appetite deserve a conversation with a doctor or occupational
        health professional.
      </p>
    </main>
  );
}
