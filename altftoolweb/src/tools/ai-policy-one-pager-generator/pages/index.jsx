"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import { CLAUSES, buildPolicyOnePager } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const OPTIONAL_CLAUSES = CLAUSES.filter((c) => !c.core);

const DEFAULTS = {
  companyName: "Acme Pvt Ltd",
  approvedTools: "ChatGPT Team, Claude, GitHub Copilot",
  contact: "it-security@company.com",
  effectiveDate: "",
  optionalIds: ["cite-check", "no-sole-decisions", "no-impersonation"],
};

const DASH = "—";

export default function ToolHome() {
  const [companyName, setCompanyName] = useState(DEFAULTS.companyName);
  const [approvedTools, setApprovedTools] = useState(DEFAULTS.approvedTools);
  const [contact, setContact] = useState(DEFAULTS.contact);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [optionalIds, setOptionalIds] = useState(DEFAULTS.optionalIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPolicyOnePager({
        companyName,
        approvedTools,
        contact,
        effectiveDate,
        clauseIds: optionalIds,
      }),
    [companyName, approvedTools, contact, effectiveDate, optionalIds],
  );

  const hasError = Boolean(result.error);

  const toggleClause = (id) => {
    setOptionalIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCompanyName(DEFAULTS.companyName);
    setApprovedTools(DEFAULTS.approvedTools);
    setContact(DEFAULTS.contact);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setOptionalIds(DEFAULTS.optionalIds);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["DO clauses", DASH],
        ["DON'T clauses", DASH],
        ["Approved tools", DASH],
        ["Length", DASH],
      ]
    : [
        ["DO clauses", String(result.doCount)],
        ["DON'T clauses", String(result.dontCount)],
        ["Approved tools", String(result.approvedToolsList.length)],
        ["Length", `${result.wordCount} words`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          AI Governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Policy One Pager Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produce a single-page do-and-don&apos;t guide for staff AI use. Five core clauses are
          always included; toggle the optional ones your organisation needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pop-name">
              Company or team name
            </label>
            <input
              id="pop-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pop-date">
              Effective date (optional)
            </label>
            <input
              id="pop-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pop-tools">
              Approved tools (comma separated)
            </label>
            <input
              id="pop-tools"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={approvedTools}
              onChange={(e) => setApprovedTools(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pop-contact">
              Questions / incident contact (optional)
            </label>
            <input
              id="pop-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Optional clauses</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {OPTIONAL_CLAUSES.map((c) => (
              <label
                key={c.id}
                htmlFor={`pop-clause-${c.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`pop-clause-${c.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={optionalIds.includes(c.id)}
                  onChange={() => toggleClause(c.id)}
                />
                {c.label}{" "}
                <span className="text-xs uppercase text-[var(--muted-foreground)]">{c.type}</span>
              </label>
            ))}
          </div>
        </fieldset>
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
              One-pager
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.doCount + result.dontCount} rules`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the AI policy one pager"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy one-pager"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
          {hasError ? DASH : result.text}
        </pre>

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
        A starting template, not legal advice. Have counsel review the final policy against the
        privacy and sector rules that apply to your organisation.
      </p>
    </main>
  );
}
