"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSignature, RotateCcw } from "lucide-react";

import {
  BREACH_NOTICE_HOUR_OPTIONS,
  JURISDICTIONS,
  MAX_DELETION_DAYS,
  MAX_SURVIVAL_YEARS,
  MIN_DELETION_DAYS,
  MIN_SURVIVAL_YEARS,
  NON_SOLICIT_MONTH_OPTIONS,
  PORTFOLIO_OPTIONS,
  buildFreelancerNda,
  findJurisdiction,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium";

const DEFAULTS = {
  clientName: "Northwind Media Private Limited",
  clientAddress: "22 Residency Road, Bengaluru 560025",
  contractorName: "Priya Raman",
  contractorAddress: "18 Anna Salai, Chennai 600002",
  projectName: "Q4 brand refresh microsite",
  projectScope:
    "design and build a five-page marketing microsite, including copy, illustration and analytics setup",
  startDate: "2026-08-01",
  endDate: "2026-10-15",
  survivalYears: "3",
  deletionDays: "14",
  jurisdictionKey: "india",
  city: "Bengaluru",
  portfolioKey: "afterLaunch",
  assignIp: true,
  allowSubcontractors: false,
  handlesPersonalData: true,
  breachNoticeHours: "24",
  includeNonSolicit: true,
  nonSolicitMonths: "12",
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

  const doc = useMemo(
    () =>
      buildFreelancerNda({
        ...form,
        survivalYears: Number(form.survivalYears),
        deletionDays: Number(form.deletionDays),
        breachNoticeHours: Number(form.breachNoticeHours),
        nonSolicitMonths: Number(form.nonSolicitMonths),
      }),
    [form],
  );

  const failed = Boolean(doc.error);

  const reset = () => {
    setForm(DEFAULTS);
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
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          Contractor template
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Freelancer NDA Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A contractor engagement needs more than secrecy: it needs to say who owns the deliverables,
          whether the work can go in a portfolio, how credentials and personal data are handled, and
          what gets deleted at the end. This builds that agreement around your project dates.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Parties and project</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-client">
              Client name
            </label>
            <input id="fn-client" className={`mt-2 ${INPUT_CLASS}`} value={form.clientName} onChange={set("clientName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-client-address">
              Client address
            </label>
            <input id="fn-client-address" className={`mt-2 ${INPUT_CLASS}`} value={form.clientAddress} onChange={set("clientAddress")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-contractor">
              Freelancer / contractor name
            </label>
            <input id="fn-contractor" className={`mt-2 ${INPUT_CLASS}`} value={form.contractorName} onChange={set("contractorName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-contractor-address">
              Freelancer address
            </label>
            <input id="fn-contractor-address" className={`mt-2 ${INPUT_CLASS}`} value={form.contractorAddress} onChange={set("contractorAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fn-project">
              Project name
            </label>
            <input id="fn-project" className={`mt-2 ${INPUT_CLASS}`} value={form.projectName} onChange={set("projectName")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fn-scope">
              What the project covers
            </label>
            <textarea id="fn-scope" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.projectScope} onChange={set("projectScope")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-start">
              Start date
            </label>
            <input id="fn-start" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.startDate} onChange={set("startDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-end">
              Expected end date
            </label>
            <input id="fn-end" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.endDate} onChange={set("endDate")} />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Terms</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-portfolio">
              Portfolio and publicity
            </label>
            <select id="fn-portfolio" className={`mt-2 ${INPUT_CLASS}`} value={form.portfolioKey} onChange={set("portfolioKey")}>
              {PORTFOLIO_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-survival">
              Confidentiality survives for (years)
            </label>
            <input id="fn-survival" type="number" inputMode="numeric" min={MIN_SURVIVAL_YEARS} max={MAX_SURVIVAL_YEARS} step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.survivalYears} onChange={set("survivalYears")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-deletion">
              Delete everything within (days of project end)
            </label>
            <input id="fn-deletion" type="number" inputMode="numeric" min={MIN_DELETION_DAYS} max={MAX_DELETION_DAYS} step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.deletionDays} onChange={set("deletionDays")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-breach">
              Data breach notice to client (hours)
            </label>
            <select id="fn-breach" className={`mt-2 ${INPUT_CLASS}`} value={form.breachNoticeHours} onChange={set("breachNoticeHours")} disabled={!form.handlesPersonalData}>
              {BREACH_NOTICE_HOUR_OPTIONS.map((hours) => (
                <option key={hours} value={String(hours)}>
                  {hours} hours
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-jurisdiction">
              Governing law
            </label>
            <select id="fn-jurisdiction" className={`mt-2 ${INPUT_CLASS}`} value={form.jurisdictionKey} onChange={setJurisdiction}>
              {JURISDICTIONS.map((j) => (
                <option key={j.key} value={j.key}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-city">
              Forum city or country
            </label>
            <input id="fn-city" className={`mt-2 ${INPUT_CLASS}`} value={form.city} onChange={set("city")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fn-solicit">
              Non-solicitation period (months)
            </label>
            <select id="fn-solicit" className={`mt-2 ${INPUT_CLASS}`} value={form.nonSolicitMonths} onChange={set("nonSolicitMonths")} disabled={!form.includeNonSolicit}>
              {NON_SOLICIT_MONTH_OPTIONS.map((months) => (
                <option key={months} value={String(months)}>
                  {months} months
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Clauses to include</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="fn-ip">
              <input id="fn-ip" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.assignIp} onChange={set("assignIp")} />
              Assign deliverable IP to the client
            </label>
            <label className={CHECK_ROW} htmlFor="fn-subs">
              <input id="fn-subs" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.allowSubcontractors} onChange={set("allowSubcontractors")} />
              Allow subcontractors (with consent)
            </label>
            <label className={CHECK_ROW} htmlFor="fn-data">
              <input id="fn-data" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.handlesPersonalData} onChange={set("handlesPersonalData")} />
              Contractor will touch personal data
            </label>
            <label className={CHECK_ROW} htmlFor="fn-nonsolicit">
              <input id="fn-nonsolicit" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.includeNonSolicit} onChange={set("includeNonSolicit")} />
              Non-solicitation of the client&apos;s customers
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
              Draft agreement
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${doc.clauseCount} clauses`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Complete the required fields to generate the draft."
                : `${int(doc.wordCount)} words for a ${int(doc.projectDays)}-day project`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the full freelancer NDA text" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
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
            ["Project window", failed ? DASH : `${doc.startDateLong} → ${doc.endDateLong}`],
            ["Project length", failed ? DASH : `${int(doc.projectDays)} days`],
            ["Delete everything by", failed ? DASH : doc.deletionDeadlineLong],
            ["Confidentiality runs until", failed ? DASH : doc.survivalEndLong],
            ["Portfolio rights", failed ? DASH : doc.portfolio.label],
            ["Governing law", failed ? DASH : doc.jurisdiction.law],
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
          <h2 className="text-base font-semibold">Worth a second look</h2>
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
        A template, not legal advice, and no lawyer-client relationship arises from using it. IP
        assignment formalities, moral rights waivers, worker-status rules and data protection duties
        differ significantly by country. This agreement covers confidentiality and deliverables only
        — fees, scope and timelines belong in a separate statement of work. Have a lawyer review it
        before signing.
      </p>
    </main>
  );
}
