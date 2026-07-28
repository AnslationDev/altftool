"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserCheck } from "lucide-react";

import {
  JURISDICTIONS,
  MATERIAL_OPTIONS,
  MAX_DELETION_DAYS,
  MAX_TERM_YEARS,
  MIN_DELETION_DAYS,
  MIN_TERM_YEARS,
  buildCandidateNda,
  findJurisdiction,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium";

const DEFAULTS = {
  companyName: "Lumen Systems Private Limited",
  companyAddress: "5 Church Street, Bengaluru 560001",
  candidateName: "Arjun Mehta",
  roleTitle: "Senior Backend Engineer",
  interviewDate: "2026-08-10",
  materials: ["codebase", "architecture", "roadmap"],
  termYears: "2",
  deletionDays: "14",
  jurisdictionKey: "india",
  city: "Bengaluru",
  includeTakeHome: true,
  takeHomeHours: "4",
  includeDtsaNotice: false,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const setJurisdiction = (event) => {
    const key = event.target.value;
    setForm((current) => ({ ...current, jurisdictionKey: key, city: findJurisdiction(key).defaultCity }));
    setCopied(false);
  };

  const toggleMaterial = (id) => {
    setForm((current) => ({
      ...current,
      materials: current.materials.includes(id)
        ? current.materials.filter((m) => m !== id)
        : [...current.materials, id],
    }));
    setCopied(false);
  };

  const doc = useMemo(
    () =>
      buildCandidateNda({
        ...form,
        termYears: Number(form.termYears),
        deletionDays: Number(form.deletionDays),
        takeHomeHours: Number(form.takeHomeHours),
      }),
    [form],
  );

  const failed = Boolean(doc.error);

  const reset = () => {
    setForm({ ...DEFAULTS, materials: [...DEFAULTS.materials] });
    setCopied(false);
  };

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(doc.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          Hiring template
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Interview Candidate NDA Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A candidate NDA should be short, scoped to what the person will actually be shown, and
          obviously not a non-compete — otherwise good candidates walk. Tick the materials involved
          and this drafts a agreement built for that, with the take-home exercise owned by the
          candidate and protected disclosures preserved.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who and what</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-company">
              Company name
            </label>
            <input id="ic-company" className={`mt-2 ${INPUT_CLASS}`} value={form.companyName} onChange={set("companyName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-company-address">
              Company address
            </label>
            <input id="ic-company-address" className={`mt-2 ${INPUT_CLASS}`} value={form.companyAddress} onChange={set("companyAddress")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-candidate">
              Candidate name
            </label>
            <input id="ic-candidate" className={`mt-2 ${INPUT_CLASS}`} value={form.candidateName} onChange={set("candidateName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-role">
              Role being interviewed for
            </label>
            <input id="ic-role" className={`mt-2 ${INPUT_CLASS}`} value={form.roleTitle} onChange={set("roleTitle")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-date">
              Interview or start-of-process date
            </label>
            <input id="ic-date" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.interviewDate} onChange={set("interviewDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-term">
              Confidentiality lasts (years)
            </label>
            <input id="ic-term" type="number" inputMode="numeric" min={MIN_TERM_YEARS} max={MAX_TERM_YEARS} step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.termYears} onChange={set("termYears")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-deletion">
              Delete materials within (days)
            </label>
            <input id="ic-deletion" type="number" inputMode="numeric" min={MIN_DELETION_DAYS} max={MAX_DELETION_DAYS} step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.deletionDays} onChange={set("deletionDays")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-hours">
              Take-home time limit (hours)
            </label>
            <input id="ic-hours" type="number" inputMode="numeric" min="1" max="40" step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.takeHomeHours} onChange={set("takeHomeHours")} disabled={!form.includeTakeHome} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-jurisdiction">
              Governing law
            </label>
            <select id="ic-jurisdiction" className={`mt-2 ${INPUT_CLASS}`} value={form.jurisdictionKey} onChange={setJurisdiction}>
              {JURISDICTIONS.map((j) => (
                <option key={j.key} value={j.key}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ic-city">
              Forum city
            </label>
            <input id="ic-city" className={`mt-2 ${INPUT_CLASS}`} value={form.city} onChange={set("city")} />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What will the candidate actually be shown?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {MATERIAL_OPTIONS.map((material) => (
              <label key={material.id} className={CHECK_ROW} htmlFor={`ic-mat-${material.id}`}>
                <input
                  id={`ic-mat-${material.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={form.materials.includes(material.id)}
                  onChange={() => toggleMaterial(material.id)}
                />
                {material.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Optional clauses</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="ic-takehome">
              <input id="ic-takehome" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.includeTakeHome} onChange={set("includeTakeHome")} />
              There is a take-home exercise
            </label>
            <label className={CHECK_ROW} htmlFor="ic-dtsa">
              <input id="ic-dtsa" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.includeDtsaNotice} onChange={set("includeDtsaNotice")} />
              US trade secret immunity notice
            </label>
          </div>
        </fieldset>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {doc.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Time to read
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${doc.readingMinutes} min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Complete the required fields to generate the draft."
                : `${int(doc.wordCount)} words across ${doc.clauseCount} clauses, covering ${doc.materialCount} material type(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the candidate NDA text" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Effective from", failed ? DASH : doc.interviewDateLong],
            ["Confidentiality runs until", failed ? DASH : doc.termEndLong],
            ["Candidate deletes materials by", failed ? DASH : doc.deletionDeadlineLong],
            ["Materials in scope", failed ? DASH : doc.materials.map((m) => m.label).join(", ")],
            ["Governing law", failed ? DASH : doc.jurisdiction.law],
            ["Jurisdiction", failed ? DASH : doc.jurisdiction.courts],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && doc.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you send it</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {doc.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{doc.title}</h2>
          <div className="mt-4 grid gap-5">
            {doc.sections.map((section) => (
              <article key={section.heading}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--primary)]">{section.heading}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A template, not legal advice, and no lawyer-client relationship is created by using it. Rules
        on restrictive covenants, unpaid work and data protection differ sharply between countries
        and US states. Have a lawyer review the draft, and never treat an NDA as a substitute for
        simply not showing a candidate real personal data.
      </p>
    </main>
  );
}
