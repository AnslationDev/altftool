"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import { computeRequiredExternal } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  internalScored: "18",
  internalMax: "30",
  externalMax: "70",
  externalMinPercent: "35",
  aggregatePassPercent: "40",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => computeRequiredExternal(form), [form]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `External marks needed to pass: ${result.required} / ${result.externalMax} (${result.requiredPercentOfExternal}% of the paper)`,
      `Internal: ${result.internalScored} / ${result.internalMax}`,
      `External-only minimum (${result.externalMinPercent}%): ${result.needByExternalRule} marks`,
      `Aggregate minimum (${result.aggregatePassPercent}% of ${result.totalMax}): needs ${result.needByAggregateRule} external marks`,
      `Binding rule: ${result.bindingRule === "external-minimum" ? "external-only minimum" : "aggregate minimum"}`,
      result.achievable ? "Achievable within the paper." : "NOT achievable with this internal score.",
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Needed by external-only rule", DASH],
        ["Needed by aggregate rule", DASH],
        ["Binding rule", DASH],
        ["Headroom above the requirement", DASH],
      ]
    : [
        [
          `Needed by external-only rule (${result.externalMinPercent}% of ${result.externalMax})`,
          `${result.needByExternalRule} marks`,
        ],
        [
          `Needed by aggregate rule (${result.aggregatePassPercent}% of ${result.totalMax} = ${result.aggregateTarget}, minus internal ${result.internalScored})`,
          `${result.needByAggregateRule} marks`,
        ],
        [
          "Binding rule",
          result.bindingRule === "external-minimum" ? "External-only minimum" : "Aggregate minimum",
        ],
        [
          "Headroom above the requirement",
          result.achievable ? `${result.headroom} marks` : "None — requirement exceeds the paper",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          University Exams
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Passing Marks Requirement Tool
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Universities usually apply two minima at once — a floor in the external paper alone and a
          floor in the subject aggregate. This tool applies both and shows the higher requirement.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pmr-scored">
              Internal marks scored
            </label>
            <input id="pmr-scored" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" value={form.internalScored} onChange={set("internalScored")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmr-imax">
              Internal maximum
            </label>
            <input id="pmr-imax" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" value={form.internalMax} onChange={set("internalMax")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmr-emax">
              External paper maximum
            </label>
            <input id="pmr-emax" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="1" value={form.externalMax} onChange={set("externalMax")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmr-extpct">
              External-only pass minimum (%)
            </label>
            <input id="pmr-extpct" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" value={form.externalMinPercent} onChange={set("externalMinPercent")} />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Commonly 35–40%. Set 0 if your scheme has no separate external floor.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pmr-aggpct">
              Aggregate pass minimum (%)
            </label>
            <input id="pmr-aggpct" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" value={form.aggregatePassPercent} onChange={set("aggregatePassPercent")} />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Commonly 40–50% of internal + external together.
            </p>
          </div>
        </div>
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
              External marks you need
            </p>
            <p className={`mt-1 text-4xl font-semibold ${!hasError && !result.achievable ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}>
              {hasError ? DASH : `${result.required} / ${result.externalMax}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the requirement."
                : result.achievable
                  ? `That is ${result.requiredPercentOfExternal}% of the external paper.`
                  : "The requirement exceeds the external paper — the subject cannot be passed with this internal score. Check your scheme for grace-marks or re-assessment provisions."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the passing requirement result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Pass percentages differ by university, programme and even subject type (theory vs
        practical) — take the exact figures from your scheme of examination or ordinance. Grace
        marks, moderation and re-evaluation rules are outside this calculation. Informational only.
      </p>
    </main>
  );
}
