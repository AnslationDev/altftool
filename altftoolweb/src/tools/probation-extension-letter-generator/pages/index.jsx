"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, FileSignature, RotateCcw } from "lucide-react";
import {
  DEFAULT_REVIEW_LEAD_DAYS,
  EXTENSION_PRESETS,
  buildProbationExtensionLetter,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  company: "Northwind Technologies Private Limited",
  companyAddress: "Plot 21, Hitec City, Hyderabad 500081",
  employeeName: "Priya Menon",
  employeeId: "NW-2291",
  designation: "Associate Engineer",
  department: "Platform",
  managerName: "S. Rao",
  managerTitle: "Head of Human Resources",
  joiningDate: "2026-01-05",
  originalEndDate: "2026-04-04",
  letterDate: "2026-03-28",
  extensionMonths: "3",
  reviewLeadDays: String(DEFAULT_REVIEW_LEAD_DAYS),
  tone: "supportive",
  reasons:
    "Code review turnaround is still above the agreed 48-hour service level\nTwo sprint commitments were missed in the first quarter",
  supportSteps:
    "Weekly one-to-one with the tech lead every Tuesday\nPaired onboarding on the billing service for four weeks\nWritten feedback at the end of every sprint",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildProbationExtensionLetter({
        ...form,
        extensionMonths: Number(form.extensionMonths),
        reviewLeadDays: Number(form.reviewLeadDays),
      }),
    [form],
  );

  const dash = "—";

  const copyResult = async () => {
    if (!result.letter) return;
    try {
      await navigator.clipboard.writeText(result.letter);
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
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          HR letters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Probation Extension Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write a probation extension letter with the reasons on record, a revised end date worked
          out from the original one, and a review meeting booked before the extension expires.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Parties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-company">
              Employer name
            </label>
            <input id="pe-company" className={`mt-2 ${INPUT_CLASS}`} value={form.company} onChange={setField("company")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-address">
              Employer address
            </label>
            <input id="pe-address" className={`mt-2 ${INPUT_CLASS}`} value={form.companyAddress} onChange={setField("companyAddress")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-name">
              Employee name
            </label>
            <input id="pe-name" className={`mt-2 ${INPUT_CLASS}`} value={form.employeeName} onChange={setField("employeeName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-id">
              Employee ID
            </label>
            <input id="pe-id" className={`mt-2 ${INPUT_CLASS}`} value={form.employeeId} onChange={setField("employeeId")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-designation">
              Designation
            </label>
            <input id="pe-designation" className={`mt-2 ${INPUT_CLASS}`} value={form.designation} onChange={setField("designation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-department">
              Department
            </label>
            <input id="pe-department" className={`mt-2 ${INPUT_CLASS}`} value={form.department} onChange={setField("department")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-manager">
              Signed by
            </label>
            <input id="pe-manager" className={`mt-2 ${INPUT_CLASS}`} value={form.managerName} onChange={setField("managerName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-manager-title">
              Signatory title
            </label>
            <input id="pe-manager-title" className={`mt-2 ${INPUT_CLASS}`} value={form.managerTitle} onChange={setField("managerTitle")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-joining">
              Date of joining
            </label>
            <input id="pe-joining" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.joiningDate} onChange={setField("joiningDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-original">
              Original probation end date
            </label>
            <input id="pe-original" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.originalEndDate} onChange={setField("originalEndDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-letter-date">
              Letter date
            </label>
            <input id="pe-letter-date" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.letterDate} onChange={setField("letterDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-months">
              Extension length (months)
            </label>
            <input id="pe-months" type="number" min="1" max="12" className={`mt-2 ${INPUT_CLASS}`} value={form.extensionMonths} onChange={setField("extensionMonths")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-lead">
              Review meeting this many days before the new end date
            </label>
            <input id="pe-lead" type="number" min="0" max="90" className={`mt-2 ${INPUT_CLASS}`} value={form.reviewLeadDays} onChange={setField("reviewLeadDays")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-tone">
              Tone
            </label>
            <select id="pe-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.tone} onChange={setField("tone")}>
              <option value="supportive">Supportive</option>
              <option value="formal">Formal</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXTENSION_PRESETS.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, extensionMonths: String(months) }));
                setCopied(false);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              +{months} month{months === 1 ? "" : "s"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Content</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-reasons">
              Reasons for the extension (one per line)
            </label>
            <textarea id="pe-reasons" rows={4} className={`mt-2 ${TEXTAREA_CLASS}`} value={form.reasons} onChange={setField("reasons")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pe-support">
              Support and expectations (one per line)
            </label>
            <textarea id="pe-support" rows={4} className={`mt-2 ${TEXTAREA_CLASS}`} value={form.supportSteps} onChange={setField("supportSteps")} />
          </div>
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Revised probation ends
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {result.error ? dash : result.summary[2][1]}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? dash : `Review meeting by ${result.summary[3][1]}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the probation extension letter" className={GHOST_BTN} disabled={!result.letter}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the letter fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(result.error
            ? [
                ["Original probation end", dash],
                ["Extension length", dash],
                ["Revised probation end", dash],
                ["Review meeting on or before", dash],
                ["Total probation served", dash],
              ]
            : result.summary
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
            Before you send it
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Letter</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-4 text-xs leading-6 text-[var(--foreground)]">
              {result.letter}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Probation length, notice and confirmation
        rules depend on the employment contract, any certified standing orders and the state Shops
        and Establishments Act that applies — have HR or counsel review the letter before issuing it.
      </p>
    </main>
  );
}
