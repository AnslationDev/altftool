"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Check, Copy, RotateCcw } from "lucide-react";

import { REASON_OPTIONS, assessGap } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  gapStart: "2024-06",
  gapEnd: "2025-07",
  reasonId: "entrance-prep",
  customReason: "",
  candidateName: "",
  parentName: "",
  lastQualification: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => assessGap(form), [form]);
  const hasError = Boolean(result.error);

  const copyAffidavit = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.draftAffidavit);
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Document Vault
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gap Certificate Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your gap period and reason to see whether admissions offices will expect a gap
          affidavit, what it must contain, and a draft ready for the notary.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gce-start">
              Gap started (last course ended)
            </label>
            <input id="gce-start" className={`mt-2 ${INPUT_CLASS}`} type="month" value={form.gapStart} onChange={set("gapStart")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gce-end">
              Gap ends (new admission month)
            </label>
            <input id="gce-end" className={`mt-2 ${INPUT_CLASS}`} type="month" value={form.gapEnd} onChange={set("gapEnd")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gce-reason">
              Reason for the gap
            </label>
            <select id="gce-reason" className={`mt-2 ${INPUT_CLASS}`} value={form.reasonId} onChange={set("reasonId")}>
              {REASON_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.reasonId === "other" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="gce-custom">
                Describe the reason
              </label>
              <input id="gce-custom" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.customReason} onChange={set("customReason")} />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="gce-name">
              Your full name (optional, for the draft)
            </label>
            <input id="gce-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.candidateName} onChange={set("candidateName")} autoComplete="name" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gce-parent">
              Parent/guardian name (optional)
            </label>
            <input id="gce-parent" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.parentName} onChange={set("parentName")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gce-qual">
              Last qualification passed (optional)
            </label>
            <input
              id="gce-qual"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. Class 12 (CBSE), 2024, Roll No. 4152873"
              value={form.lastQualification}
              onChange={set("lastQualification")}
            />
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
              Your gap
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.gapText}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasError ? "Fix the input above to see the assessment." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAffidavit}
              disabled={hasError}
              aria-label="Copy the draft gap affidavit"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy draft affidavit"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Gap period</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.startLabel} to ${result.endLabel}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Supporting evidence worth keeping</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.evidenceSuggestion}
            </dd>
          </div>
        </dl>

        {hasError ? null : (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {result.guidance}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a gap affidavit must contain</h2>
        {hasError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            {result.contents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Draft gap affidavit</h2>
        {hasError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 font-sans text-sm leading-6 text-[var(--foreground)]">
            {result.draftAffidavit}
          </pre>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Thresholds shown reflect common institutional practice in India; individual universities,
        boards and professional councils set their own rules and some cap the permissible gap.
        Always follow the admission brochure of the institution you are joining. Informational
        only — not legal advice.
      </p>
    </main>
  );
}
