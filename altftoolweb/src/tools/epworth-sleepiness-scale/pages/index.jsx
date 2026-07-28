"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";
import {
  CHANCE_OPTIONS,
  ESS_BANDS,
  ESS_ITEMS,
  ESS_MAX,
  computeEpworth,
} from "../lib";

const DEFAULT_RESPONSES = [1, 2, 1, 2, 2, 0, 1, 0];

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [responses, setResponses] = useState(DEFAULT_RESPONSES);
  const [copied, setCopied] = useState(false);

  const setAnswer = (index, value) => {
    setResponses((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const result = useMemo(() => computeEpworth({ responses }), [responses]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Epworth Sleepiness Scale",
      `Total: ${result.total} of ${result.max}`,
      `Band: ${result.band}`,
      `Above the excessive-sleepiness threshold of ${result.threshold}: ${result.excessive ? "yes" : "no"}`,
      "",
      ...result.breakdown.map((row) => `${row.situation}: ${row.answer} (${row.points})`),
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
    setResponses(DEFAULT_RESPONSES);
    setCopied(false);
  };

  const clearAll = () => {
    setResponses(ESS_ITEMS.map(() => 0));
    setCopied(false);
  };

  const barPct = hasError ? 0 : Math.round((result.total / ESS_MAX) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Sleep questionnaire
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Epworth Sleepiness Scale</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          For each of the eight situations below, rate how likely you are to doze off — not just feel
          tired — thinking about your usual life over the past few weeks. The eight ratings add up to
          a score out of 24.
        </p>
      </header>

      <section className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Chance of dozing</h2>
          <button type="button" onClick={clearAll} className={GHOST_BTN} aria-label="Set every situation to never">
            Set all to never
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {ESS_ITEMS.map((item, index) => (
            <fieldset key={item.id} className="rounded-lg border border-[var(--border)] p-3">
              <legend className="px-1 text-sm font-semibold">
                {index + 1}. {item.situation}
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CHANCE_OPTIONS.map((option) => {
                  const inputId = `ess-${item.id}-${option.value}`;
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
                        name={`ess-${item.id}`}
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
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Epworth score
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.total}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Answer every situation to see a score." : `out of ${result.max} · ${result.band}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Epworth Sleepiness Scale result"
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
            className={`block h-full ${hasError || !result.excessive ? "bg-[var(--primary)]" : "bg-[var(--danger)]"}`}
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sleepiness band", hasError ? DASH : result.band],
            [
              "Above the excessive-sleepiness threshold",
              hasError ? DASH : result.excessive ? `Yes — over ${result.threshold}` : `No — ${result.threshold} or below`,
            ],
            ["Average points per situation", hasError ? DASH : NUM2.format(result.averagePerItem)],
            [
              "Situation with the highest rating",
              hasError ? DASH : `${result.highestSituation.situation} (${result.highestSituation.points})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">How the total is read</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {ESS_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min}-{band.max}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The Epworth Sleepiness Scale measures how easily you fall asleep during
        the day; it does not identify the cause and does not diagnose obstructive sleep apnoea,
        narcolepsy or any other condition. Take a raised score, and any dozing while driving, to a
        doctor or sleep clinic.
      </p>
    </main>
  );
}
