"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import {
  BUSINESS_TYPES,
  GST_TOPICS,
  OUTPUT_FORMATS,
  RETURN_DUE_RULES,
  SPECIAL_CATEGORY_STATES,
  buildGstPrompt,
  dueDateFor,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MONTH_OPTIONS = [
  [1, "January"],
  [2, "February"],
  [3, "March"],
  [4, "April"],
  [5, "May"],
  [6, "June"],
  [7, "July"],
  [8, "August"],
  [9, "September"],
  [10, "October"],
  [11, "November"],
  [12, "December"],
];

const DEFAULTS = {
  topic: "registration",
  businessType: "services",
  question: "Do I need to register for GST, and what happens if I cross the threshold mid-year?",
  aggregateTurnover: "1800000",
  stateName: "Karnataka",
  specialCategoryState: false,
  outputFormat: "explainer",
  requireCitations: true,
  returnType: "gstr-3b",
  periodMonth: "10",
  periodYear: "2025",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      buildGstPrompt({
        topic: form.topic,
        businessType: form.businessType,
        question: form.question,
        aggregateTurnover:
          form.aggregateTurnover.trim() === "" ? Number.NaN : Number(form.aggregateTurnover),
        stateName: form.stateName,
        specialCategoryState: form.specialCategoryState,
        outputFormat: form.outputFormat,
        requireCitations: form.requireCitations,
      }),
    [form],
  );

  const dueDate = useMemo(
    () =>
      dueDateFor({
        returnType: form.returnType,
        periodMonth: Number(form.periodMonth),
        periodYear: Number(form.periodYear),
      }),
    [form.returnType, form.periodMonth, form.periodYear],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
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

  const regRows = hasError
    ? [
        ["Registration on turnover alone", DASH],
        ["Applicable threshold", DASH],
        ["Threshold used", DASH],
      ]
    : [
        [
          "Registration on turnover alone",
          result.registration.required ? "Required" : "Not yet required",
        ],
        ["Applicable threshold", result.registration.thresholdLabel],
        ["Basis", result.registration.basis],
        [
          "Threshold used",
          `${NUM.format(result.registration.utilisationPct)}%${result.registration.headroomLabel ? ` (headroom ${result.registration.headroomLabel})` : ""}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          India prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">GST Query Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Frame a GST question for AI with citation and non-advisory guardrails baked in — plus a
          section 22/24 registration check against the real Rs 40/20/10 lakh thresholds and the
          statutory return due dates.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-topic">
              GST topic
            </label>
            <select id="gq-topic" className={`mt-2 ${INPUT_CLASS}`} value={form.topic} onChange={set("topic")}>
              {Object.entries(GST_TOPICS).map(([id, spec]) => (
                <option key={id} value={id}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-business">
              Business type
            </label>
            <select
              id="gq-business"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.businessType}
              onChange={set("businessType")}
            >
              {Object.entries(BUSINESS_TYPES).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gq-question">
              Your question
            </label>
            <textarea
              id="gq-question"
              className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              rows={3}
              maxLength={1000}
              value={form.question}
              onChange={set("question")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-turnover">
              Aggregate turnover (INR, PAN-level)
            </label>
            <input
              id="gq-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              value={form.aggregateTurnover}
              onChange={set("aggregateTurnover")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-state">
              State / UT (optional)
            </label>
            <input
              id="gq-state"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={50}
              value={form.stateName}
              onChange={set("stateName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-format">
              Answer format
            </label>
            <select
              id="gq-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.outputFormat}
              onChange={set("outputFormat")}
            >
              {Object.keys(OUTPUT_FORMATS).map((id) => (
                <option key={id} value={id}>
                  {id === "explainer"
                    ? "Plain-language explainer"
                    : id === "checklist"
                      ? "Compliance checklist"
                      : id === "table"
                        ? "Comparison table"
                        : "Notice-reply outline"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="gq-special">
              <input
                id="gq-special"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={form.specialCategoryState}
                onChange={set("specialCategoryState")}
              />
              Special category state ({SPECIAL_CATEGORY_STATES.join(", ")})
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="gq-cite">
              <input
                id="gq-cite"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={form.requireCitations}
                onChange={set("requireCitations")}
              />
              Require a section/rule citation for every statement
            </label>
          </div>
        </div>
      </section>

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
              Registration threshold check
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.registration.thresholdLabel}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the prompt." : result.registration.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the GST query prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {regRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Generated prompt
        </p>
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
          {hasError ? DASH : result.prompt}
        </pre>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Statutory return due date lookup</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-return">
              Return
            </label>
            <select
              id="gq-return"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.returnType}
              onChange={set("returnType")}
            >
              {Object.entries(RETURN_DUE_RULES).map(([id, rule]) => (
                <option key={id} value={id}>
                  {rule.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-month">
              Period month
            </label>
            <select id="gq-month" className={`mt-2 ${INPUT_CLASS}`} value={form.periodMonth} onChange={set("periodMonth")}>
              {MONTH_OPTIONS.map(([value, label]) => (
                <option key={value} value={String(value)}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gq-year">
              Period year
            </label>
            <input
              id="gq-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2017"
              max="2100"
              step="1"
              value={form.periodYear}
              onChange={set("periodYear")}
            />
          </div>
        </div>
        {dueDate.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {dueDate.error}
          </p>
        ) : (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            <span className="text-[var(--muted-foreground)]">{dueDate.label} for {dueDate.periodLabel}: </span>
            <span className="font-semibold">{dueDate.dueDateLabel}</span>
            <span className="text-[var(--muted-foreground)]"> (statutory date; CBIC extensions not modelled)</span>
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Thresholds follow section 22 of the CGST Act read with Notification 10/2019-Central Tax;
        due dates follow rules 59, 61 and 80 of the CGST Rules. This tool and any AI answer it
        produces are informational only — confirm every position with a chartered accountant or on
        cbic-gst.gov.in before acting.
      </p>
    </main>
  );
}
