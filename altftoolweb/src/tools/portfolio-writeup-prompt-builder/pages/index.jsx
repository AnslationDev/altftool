"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutTemplate, RotateCcw } from "lucide-react";
import { AUDIENCES, METRIC_DIRECTIONS, STRUCTURES, buildPortfolioPrompt } from "../lib";

const DEFAULTS = {
  projectName: "Checkout redesign",
  discipline: "product design",
  role: "Lead product designer",
  structure: "star",
  audience: "hiring-manager",
  metricName: "Checkout completion rate",
  metricUnit: "%",
  beforeValue: "61",
  afterValue: "74",
  metricDirection: "higher-better",
  durationWeeks: "9",
  teamSize: "4",
  constraints: "No backend changes allowed; shipped behind a 50/50 experiment.",
  targetWords: "500",
};

const AUDIENCE_LABELS = {
  recruiter: "Recruiter skimming",
  "hiring-manager": "Hiring manager",
  client: "Prospective client",
  peer: "Senior peer in your field",
};

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildPortfolioPrompt({
        projectName: form.projectName,
        discipline: form.discipline,
        role: form.role,
        structure: form.structure,
        audience: form.audience,
        metricName: form.metricName,
        metricUnit: form.metricUnit,
        beforeValue: form.beforeValue === "" ? Number.NaN : Number(form.beforeValue),
        afterValue: form.afterValue === "" ? Number.NaN : Number(form.afterValue),
        metricDirection: form.metricDirection,
        durationWeeks: form.durationWeeks === "" ? 0 : Number(form.durationWeeks),
        teamSize: form.teamSize === "" ? 0 : Number(form.teamSize),
        constraints: form.constraints,
        targetWords: form.targetWords === "" ? 0 : Number(form.targetWords),
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const headline = failed || result.outcome.improvementPct === null
    ? DASH
    : `${result.outcome.improvementPct > 0 ? "+" : ""}${result.outcome.improvementPct}%`;

  const rows = [
    ["Absolute change", failed ? DASH : `${result.outcome.delta > 0 ? "+" : ""}${Math.round(result.outcome.delta * 100) / 100}${form.metricUnit ? ` ${form.metricUnit}` : ""}`],
    ["Multiple", failed || result.outcome.factor === null ? DASH : `${result.outcome.factor}x`],
    ["Structure", failed ? DASH : result.structureLabel],
    ["Words per section", failed ? DASH : `~${result.wordsPerSection}`],
    ["Estimated reading time", failed ? DASH : `${result.readMinutes} min at 238 wpm`],
    ["Prompt length", failed ? DASH : `${result.wordCount} words · ~${result.tokenEstimate} tokens`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          Career prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Portfolio Writeup Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the project, the role you played and the one number that moved. The tool works out
          the real change and writes a case-study prompt around a named structure.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="pw-project">Project name</label>
            <input id="pw-project" className={`mt-2 ${INPUT}`} value={form.projectName} onChange={set("projectName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-role">Your role on it</label>
            <input id="pw-role" className={`mt-2 ${INPUT}`} value={form.role} onChange={set("role")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-discipline">Discipline</label>
            <input id="pw-discipline" className={`mt-2 ${INPUT}`} value={form.discipline} onChange={set("discipline")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-audience">Who will read it</label>
            <select id="pw-audience" className={`mt-2 ${INPUT}`} value={form.audience} onChange={set("audience")}>
              {Object.keys(AUDIENCES).map((key) => (
                <option key={key} value={key}>{AUDIENCE_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="pw-structure">Case-study structure</label>
            <select id="pw-structure" className={`mt-2 ${INPUT}`} value={form.structure} onChange={set("structure")}>
              {Object.entries(STRUCTURES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-metric">Headline metric</label>
            <input id="pw-metric" className={`mt-2 ${INPUT}`} value={form.metricName} onChange={set("metricName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-unit">Unit (optional)</label>
            <input id="pw-unit" className={`mt-2 ${INPUT}`} value={form.metricUnit} onChange={set("metricUnit")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-before">Before</label>
            <input id="pw-before" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" step="any" value={form.beforeValue} onChange={set("beforeValue")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-after">After</label>
            <input id="pw-after" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" step="any" value={form.afterValue} onChange={set("afterValue")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-direction">Which way is good?</label>
            <select id="pw-direction" className={`mt-2 ${INPUT}`} value={form.metricDirection} onChange={set("metricDirection")}>
              {Object.entries(METRIC_DIRECTIONS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-weeks">Duration (weeks)</label>
            <input id="pw-weeks" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="0" value={form.durationWeeks} onChange={set("durationWeeks")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-team">Team size (including you)</label>
            <input id="pw-team" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" value={form.teamSize} onChange={set("teamSize")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pw-words">Target length (words)</label>
            <input id="pw-words" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="150" max="3000" step="50" value={form.targetWords} onChange={set("targetWords")} />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="pw-constraints">Constraints you worked under</label>
          <textarea id="pw-constraints" rows={2} className={`mt-2 ${TEXTAREA}`} value={form.constraints} onChange={set("constraints")} />
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Change on the headline metric
            </p>
            <p className={`mt-1 text-4xl font-semibold ${failed || result.outcome.improved ? "text-[var(--primary)]" : "text-[var(--danger)]"}`}>
              {headline}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed ? "Fix the highlighted input to generate your prompt." : result.outcome.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={failed} aria-label="Copy the portfolio case study prompt" className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The reading-time estimate uses 238 words per minute, the mean silent reading rate for English
        non-fiction reported by Brysbaert (2019). Only publish figures you are allowed to share — check
        any NDA before putting client numbers in a public portfolio.
      </p>
    </main>
  );
}
