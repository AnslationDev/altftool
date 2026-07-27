"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScanSearch } from "lucide-react";

import { FACTORS, assessRisk } from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_SELECTIONS = Object.fromEntries(FACTORS.map((f) => [f.id, 0]));

export default function ToolHome() {
  const [selections, setSelections] = useState(DEFAULT_SELECTIONS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => assessRisk(selections), [selections]);
  const hasError = Boolean(result.error);

  const pick = (factorId, optionIndex) => {
    setSelections((prev) => ({ ...prev, [factorId]: optionIndex }));
    setCopied(false);
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      const lines = [
        `AI plagiarism risk: ${result.score}/100 — ${result.band}`,
        result.verdict,
        ...result.recommendations.map((r) => `- ${r}`),
      ];
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSelections(DEFAULT_SELECTIONS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
          AI Governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Plagiarism Risk Worksheet
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer six questions about your AI-assisted draft — verbatim retention, paraphrase depth,
          sourcing, reference checking, disclosure and originality — and get a weighted 0-100 risk
          score with the specific fixes needed.
        </p>
      </header>

      {FACTORS.map((factor, fi) => (
        <fieldset
          key={factor.id}
          className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <legend className="sr-only">{`Question ${fi + 1}`}</legend>
          <p className="text-sm font-semibold leading-6">
            {fi + 1}. {factor.question}
          </p>
          <div className="mt-3 grid gap-2">
            {factor.options.map((option, oi) => {
              const inputId = `${factor.id}-${oi}`;
              const chosen = selections[factor.id] === oi;
              return (
                <label
                  key={inputId}
                  htmlFor={inputId}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    chosen
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                  }`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name={factor.id}
                    checked={chosen}
                    onChange={() => pick(factor.id, oi)}
                    className="h-4 w-4 accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

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
              Risk score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.score}/100`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Answer every question to see your score." : `${result.band} — ${result.verdict}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the risk assessment"
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
              aria-label="Reset the worksheet"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError ? [] : result.breakdown).map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{row.answer}</dt>
              <dd className="shrink-0 text-right font-semibold">
                {row.points}/{row.maxPoints}
              </dd>
            </div>
          ))}
        </dl>

        {!hasError && result.recommendations.length > 0 ? (
          <div className="mt-4">
            <h2 className="text-sm font-semibold">What to fix before submitting</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.recommendations.map((rec) => (
                <li key={rec}>{rec}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {!hasError && result.recommendations.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--success)]">
            No remediation flags — keep your AI usage log with the submission.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Self-assessment aid, not a plagiarism detector and not a guarantee of policy compliance.
        Your institution's or publisher's integrity policy governs; when unsure, ask the unit
        coordinator or editor before submitting.
      </p>
    </main>
  );
}
