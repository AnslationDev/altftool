"use client";

import { useMemo, useState } from "react";
import { Brain, Check, Copy, RotateCcw } from "lucide-react";

import {
  DELEGATION_SCALE,
  FLAG_THRESHOLD,
  MAX_CONFIDENCE,
  SKILL_DOMAINS,
  scoreDependencyCheck,
} from "../lib";

const DASH = "—";

const DEFAULT_DOMAINS = Object.fromEntries(
  SKILL_DOMAINS.map((domain) => [
    domain.id,
    { delegation: 2, confidenceNow: 7, confidenceBefore: 8 },
  ]),
);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [domains, setDomains] = useState(DEFAULT_DOMAINS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreDependencyCheck({ domains }), [domains]);
  const hasError = Boolean(result.error);

  const setField = (domainId, field, value) => {
    setDomains((current) => ({
      ...current,
      [domainId]: { ...current[domainId], [field]: value },
    }));
    setCopied(false);
  };

  const reset = () => {
    setDomains(DEFAULT_DOMAINS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AI Dependency Self Check",
      `Overall reliance risk: ${result.overallRisk}% (${result.band.label})`,
      `Average delegation: ${result.overallReliance}%`,
      `Average unaided confidence change: ${result.averageDrop > 0 ? "-" : "+"}${Math.abs(result.averageDrop)} points`,
      "",
      ...result.ranked.map(
        (row) =>
          `${row.label}: risk ${row.atrophyRisk}% (delegation ${row.reliance}%, confidence ${row.confidenceBefore} to ${row.confidenceNow})`,
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

  const rows = [
    ["Domains filled in", hasError ? DASH : `${result.answered} of ${result.totalDomains}`],
    ["Average delegation", hasError ? DASH : `${result.overallReliance}%`],
    [
      "Average confidence change",
      hasError
        ? DASH
        : `${result.averageDrop > 0 ? "-" : "+"}${Math.abs(result.averageDrop)} of ${MAX_CONFIDENCE} points`,
    ],
    [
      "Domains above the flag line",
      hasError ? DASH : `${result.flagged.length} (risk ${FLAG_THRESHOLD}% or more)`,
    ],
    ["Highest risk domain", hasError ? DASH : result.ranked[0].label],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Brain className="h-4 w-4" aria-hidden="true" />
          AI wellbeing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI Dependency Self Check</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          For six skills, say how often the work goes to AI first and how confident you would feel
          doing it unaided now compared with before. Risk is only flagged where heavy delegation and
          lost confidence overlap.
        </p>
      </header>

      {SKILL_DOMAINS.map((domain) => {
        const entry = domains[domain.id];
        return (
          <section
            key={domain.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 first:mt-0"
          >
            <h2 className="text-base font-semibold">{domain.label}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{domain.prompt}</p>

            <div className="mt-4 grid gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor={`${domain.id}-delegation`}>
                  How often does this go to AI first?
                </label>
                <select
                  id={`${domain.id}-delegation`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={String(entry.delegation)}
                  onChange={(event) =>
                    setField(domain.id, "delegation", Number(event.target.value))
                  }
                >
                  {DELEGATION_SCALE.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${domain.id}-before`}>
                    Unaided confidence before AI (0-{MAX_CONFIDENCE})
                  </label>
                  <input
                    id={`${domain.id}-before`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={MAX_CONFIDENCE}
                    step="1"
                    value={String(entry.confidenceBefore)}
                    onChange={(event) =>
                      setField(domain.id, "confidenceBefore", Number(event.target.value))
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`${domain.id}-now`}>
                    Unaided confidence today (0-{MAX_CONFIDENCE})
                  </label>
                  <input
                    id={`${domain.id}-now`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={MAX_CONFIDENCE}
                    step="1"
                    value={String(entry.confidenceNow)}
                    onChange={(event) =>
                      setField(domain.id, "confidenceNow", Number(event.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overall reliance risk
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.overallRisk}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs above to see a result." : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the self check summary"
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
              aria-label="Reset every domain"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Domain
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Delegation
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Confidence lost
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{row.reliance}%</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.relativeDrop}%
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.atrophyRisk >= FLAG_THRESHOLD
                          ? "text-[var(--danger)]"
                          : "text-[var(--success)]"
                      }`}
                    >
                      {row.atrophyRisk}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]">
            {result.band.guidance}
            {result.improved.length > 0
              ? ` You rated your unaided confidence higher than before in ${result.improved.length} domain${
                  result.improved.length === 1 ? "" : "s"
                }, which scores zero risk by design.`
              : ""}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not a psychological assessment. Risk here is a simple product of two
        self-ratings: how much you delegate multiplied by how much unaided confidence you say you
        have lost. Everything stays in your browser.
      </p>
    </main>
  );
}
