"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, RotateCcw } from "lucide-react";

import {
  FREQUENCY_OPTIONS,
  INTENSITY_OPTIONS,
  SYMPTOMS,
  blankAnswers,
  scoreQuestionnaire,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [answers, setAnswers] = useState(() => blankAnswers());
  const [screenHours, setScreenHours] = useState("8");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const hours = Number(String(screenHours).trim());
    return scoreQuestionnaire({
      answers,
      screenHours: Number.isFinite(hours) ? hours : NaN,
    });
  }, [answers, screenHours]);

  const hasError = Boolean(result.error);

  const setAnswer = (id, key, value) => {
    setAnswers((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }));
    setCopied(false);
  };

  const reset = () => {
    setAnswers(blankAnswers());
    setScreenHours("8");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Digital Eye Strain Self-Check (CVS-Q method)",
      `Total score: ${result.total} of ${result.maxScore}`,
      `Published cut-off: ${result.cutoff} — ${result.aboveCutoff ? "at or above" : "below"}`,
      `Band: ${result.band.label}`,
      `Symptoms reported: ${result.symptomsReported} of ${SYMPTOMS.length}`,
      result.topSymptoms.length > 0
        ? `Highest scoring: ${result.topSymptoms.map((row) => `${row.label} (${row.score})`).join(", ")}`
        : "No symptoms scored above zero.",
      "",
      result.band.advice,
    ].join("\n");
  }, [result, hasError]);

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

  const rows = hasError
    ? [
        ["Published cut-off", DASH],
        ["Result against the cut-off", DASH],
        ["Band", DASH],
        ["Symptoms reported", DASH],
        ["Share of the maximum", DASH],
        ["Highest scoring symptoms", DASH],
      ]
    : [
        ["Published cut-off", `${result.cutoff} of ${result.maxScore}`],
        ["Result against the cut-off", result.aboveCutoff ? "At or above the cut-off" : "Below the cut-off"],
        ["Band", result.band.label],
        ["Symptoms reported", `${result.symptomsReported} of ${SYMPTOMS.length}`],
        ["Share of the maximum", `${NUM.format(result.percentOfMax)}%`],
        [
          "Highest scoring symptoms",
          result.topSymptoms.length > 0
            ? result.topSymptoms.map((row) => `${row.label} (${row.score})`).join(", ")
            : "None",
        ],
      ];

  const progress = hasError ? 0 : Math.min(100, (result.total / result.maxScore) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Digital Eye Strain Self-Check</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rate 16 screen-related eye symptoms for how often you get them and how strongly. Scoring
          follows the published Computer Vision Syndrome Questionnaire method — frequency times
          intensity, recoded, out of 32, with a cut-off at 6.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div>
          <label className={LABEL_CLASS} htmlFor="des-hours">
            Screen hours per day (for context)
          </label>
          <input
            id="des-hours"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            type="number"
            inputMode="decimal"
            min="0"
            max="24"
            step="0.5"
            value={screenHours}
            onChange={(event) => setScreenHours(event.target.value)}
          />
        </div>

        <div className="mt-6 space-y-4">
          {SYMPTOMS.map((symptom) => {
            const answer = answers[symptom.id] || { frequency: 0, intensity: 1 };
            return (
              <div
                key={symptom.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">{symptom.label}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`freq-${symptom.id}`}>
                      How often
                    </label>
                    <select
                      id={`freq-${symptom.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      value={String(answer.frequency)}
                      onChange={(event) => setAnswer(symptom.id, "frequency", Number(event.target.value))}
                    >
                      {FREQUENCY_OPTIONS.map((option) => (
                        <option key={option.id} value={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`int-${symptom.id}`}>
                      How strong
                    </label>
                    <select
                      id={`int-${symptom.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      value={String(answer.intensity)}
                      onChange={(event) => setAnswer(symptom.id, "intensity", Number(event.target.value))}
                      disabled={answer.frequency === 0}
                    >
                      {INTENSITY_OPTIONS.map((option) => (
                        <option key={option.id} value={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              CVS-Q total score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.total} / ${result.maxScore}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a score." : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the eye strain questionnaire result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the questionnaire" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Score is ${result.total} out of ${result.maxScore}, cut-off ${result.cutoff}`}
            >
              <span
                className={`block h-full ${result.aboveCutoff ? "bg-[var(--danger)]" : "bg-[var(--success)]"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Cut-off sits at {result.cutoff} of {result.maxScore}.
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
            {result.band.advice}
          </p>
        )}

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && result.symptomsReported > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Symptom breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Symptom
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Frequency
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Intensity
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows
                  .filter((row) => row.frequency > 0)
                  .map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {FREQUENCY_OPTIONS.find((option) => option.value === row.frequency)?.label}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {INTENSITY_OPTIONS.find((option) => option.value === row.intensity)?.label}
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums">{row.score}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational screening only — this questionnaire measures how much symptom burden you carry,
        not what is causing it, and it is not a diagnosis. Double vision, eye pain, coloured halos,
        sudden blur, flashes or new floaters need an eye examination promptly rather than a change of
        screen habits.
      </p>
    </main>
  );
}
