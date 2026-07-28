"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileLock, RotateCcw } from "lucide-react";

import {
  ENTITY_TYPES,
  JURISDICTIONS,
  MAX_TERM_YEARS,
  MIN_TERM_YEARS,
  NON_SOLICIT_MONTH_OPTIONS,
  buildOneWayNda,
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
  disclosingName: "Acme Robotics Private Limited",
  disclosingEntity: "a private limited company",
  disclosingAddress: "12 MG Road, Bengaluru 560001",
  receivingName: "Nimbus Analytics LLP",
  receivingEntity: "a limited liability partnership",
  receivingAddress: "9 Turner Street, Mumbai 400001",
  effectiveDate: "2026-08-01",
  purpose: "evaluating a potential supply agreement for warehouse automation hardware",
  termYears: "2",
  confidentialityYears: "5",
  jurisdictionKey: "india",
  city: "Bengaluru",
  tradeSecretsIndefinite: true,
  includeResiduals: false,
  includeNonSolicit: true,
  nonSolicitMonths: "12",
  includeDtsaNotice: false,
  returnNoticeDays: "30",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const doc = useMemo(
    () =>
      buildOneWayNda({
        ...form,
        termYears: Number(form.termYears),
        confidentialityYears: Number(form.confidentialityYears),
        nonSolicitMonths: Number(form.nonSolicitMonths),
        returnNoticeDays: Number(form.returnNoticeDays),
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
          <FileLock className="h-4 w-4" aria-hidden="true" />
          Contract template
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">One-Way NDA Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A unilateral NDA binds only the party receiving the information — the right structure when
          you are the one sharing a pitch deck, roadmap or source code. Fill in the parties, purpose
          and survival period and the full draft assembles below, clause numbering included.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Parties</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-disclosing">
              Disclosing party (shares the information)
            </label>
            <input id="nda-disclosing" className={`mt-2 ${INPUT_CLASS}`} value={form.disclosingName} onChange={set("disclosingName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-disclosing-entity">
              Disclosing party entity type
            </label>
            <select id="nda-disclosing-entity" className={`mt-2 ${INPUT_CLASS}`} value={form.disclosingEntity} onChange={set("disclosingEntity")}>
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nda-disclosing-address">
              Disclosing party address
            </label>
            <input id="nda-disclosing-address" className={`mt-2 ${INPUT_CLASS}`} value={form.disclosingAddress} onChange={set("disclosingAddress")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-receiving">
              Receiving party (receives the information)
            </label>
            <input id="nda-receiving" className={`mt-2 ${INPUT_CLASS}`} value={form.receivingName} onChange={set("receivingName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-receiving-entity">
              Receiving party entity type
            </label>
            <select id="nda-receiving-entity" className={`mt-2 ${INPUT_CLASS}`} value={form.receivingEntity} onChange={set("receivingEntity")}>
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nda-receiving-address">
              Receiving party address
            </label>
            <input id="nda-receiving-address" className={`mt-2 ${INPUT_CLASS}`} value={form.receivingAddress} onChange={set("receivingAddress")} />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Deal terms</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nda-purpose">
              Purpose the information may be used for
            </label>
            <textarea id="nda-purpose" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.purpose} onChange={set("purpose")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-effective">
              Effective date
            </label>
            <input id="nda-effective" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.effectiveDate} onChange={set("effectiveDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-term">
              Term of the agreement (years)
            </label>
            <input id="nda-term" type="number" inputMode="numeric" min={MIN_TERM_YEARS} max={MAX_TERM_YEARS} step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.termYears} onChange={set("termYears")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-confidentiality">
              Confidentiality survives for (years)
            </label>
            <input id="nda-confidentiality" type="number" inputMode="numeric" min={MIN_TERM_YEARS} max={MAX_TERM_YEARS} step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.confidentialityYears} onChange={set("confidentialityYears")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-return">
              Return or destroy materials within (days)
            </label>
            <input id="nda-return" type="number" inputMode="numeric" min="0" max="180" step="1" className={`mt-2 ${INPUT_CLASS}`} value={form.returnNoticeDays} onChange={set("returnNoticeDays")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-jurisdiction">
              Governing law
            </label>
            <select id="nda-jurisdiction" className={`mt-2 ${INPUT_CLASS}`} value={form.jurisdictionKey} onChange={set("jurisdictionKey")}>
              {JURISDICTIONS.map((j) => (
                <option key={j.key} value={j.key}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-city">
              Forum city
            </label>
            <input id="nda-city" className={`mt-2 ${INPUT_CLASS}`} value={form.city} onChange={set("city")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nda-solicit">
              Non-solicitation period (months)
            </label>
            <select id="nda-solicit" className={`mt-2 ${INPUT_CLASS}`} value={form.nonSolicitMonths} onChange={set("nonSolicitMonths")} disabled={!form.includeNonSolicit}>
              {NON_SOLICIT_MONTH_OPTIONS.map((months) => (
                <option key={months} value={String(months)}>
                  {months} months
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Optional clauses</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_ROW} htmlFor="nda-tradesecret">
              <input id="nda-tradesecret" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.tradeSecretsIndefinite} onChange={set("tradeSecretsIndefinite")} />
              Trade secrets protected indefinitely
            </label>
            <label className={CHECK_ROW} htmlFor="nda-residuals">
              <input id="nda-residuals" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.includeResiduals} onChange={set("includeResiduals")} />
              Residual knowledge clause
            </label>
            <label className={CHECK_ROW} htmlFor="nda-nonsolicit">
              <input id="nda-nonsolicit" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.includeNonSolicit} onChange={set("includeNonSolicit")} />
              Non-solicitation of employees
            </label>
            <label className={CHECK_ROW} htmlFor="nda-dtsa">
              <input id="nda-dtsa" type="checkbox" className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]" checked={form.includeDtsaNotice} onChange={set("includeDtsaNotice")} />
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
              Draft agreement
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${doc.clauseCount} clauses`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Complete the required fields to generate the draft."
                : `${int(doc.wordCount)} words, effective ${doc.effectiveDateLong}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the full NDA text" disabled={failed} className={`${GHOST_BTN} disabled:opacity-40`}>
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
            ["Agreement expires", failed ? DASH : doc.termEndDateLong],
            ["Confidentiality runs until", failed ? DASH : doc.confidentialityEndDateLong],
            ["Governing law", failed ? DASH : doc.jurisdiction.law],
            ["Exclusive jurisdiction", failed ? DASH : doc.jurisdiction.courts],
            ["Word count", failed ? DASH : int(doc.wordCount)],
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
          <h2 className="text-base font-semibold">Check before you send this</h2>
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
        This is a template, not legal advice, and no lawyer-client relationship is created by using
        it. Confidentiality law, enforceability of restrictive covenants and stamping or
        registration requirements differ by jurisdiction. Have a qualified lawyer review the draft
        before you rely on it.
      </p>
    </main>
  );
}
