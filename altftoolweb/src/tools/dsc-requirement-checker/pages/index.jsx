"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSignature, Minus, RotateCcw } from "lucide-react";

import { ENTITY_TYPES, FILINGS, checkDscRequirement } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULT_FILINGS = ["mcaEforms", "incomeTaxReturn", "gstReturns"];

const VERDICT_STYLE = {
  mandatory: {
    label: "DSC compulsory",
    className: "text-[var(--danger)]",
  },
  optional: {
    label: "DSC optional",
    className: "text-[var(--primary)]",
  },
  notApplicable: {
    label: "Does not apply",
    className: "text-[var(--muted-foreground)]",
  },
};

export default function ToolHome() {
  const [entityType, setEntityType] = useState("company");
  const [selectedFilings, setSelectedFilings] = useState(DEFAULT_FILINGS);
  const [taxAuditApplicable, setTaxAuditApplicable] = useState(false);
  const [hasEmployees, setHasEmployees] = useState(true);
  const [signatoryCount, setSignatoryCount] = useState("2");
  const [copied, setCopied] = useState(false);

  const toggleFiling = (id) => {
    setSelectedFilings((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const result = useMemo(() => {
    const count = Number(String(signatoryCount).trim());
    if (!Number.isFinite(count)) {
      return { error: "Enter how many people will need to sign." };
    }
    return checkDscRequirement({
      entityType,
      selectedFilings,
      taxAuditApplicable,
      hasEmployees,
      signatoryCount: Math.trunc(count),
    });
  }, [entityType, selectedFilings, taxAuditApplicable, hasEmployees, signatoryCount]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Digital signature requirement check",
      `Entity: ${result.entityLabel}`,
      `Verdict: ${result.headline}`,
      `Certificate: ${result.certificateType}`,
      `Certificates needed: ${result.certificatesNeeded} (one per signatory)`,
      "",
      result.mandatory.length ? "Compulsory for:" : "",
      ...result.mandatory.map((row) => `- ${row.label} — ${row.rule}`),
      result.optional.length ? "\nOptional (EVC allowed) for:" : "",
      ...result.optional.map((row) => `- ${row.label} — ${row.rule}`),
      "",
      ...result.notes.map((note) => `* ${note}`),
    ]
      .filter(Boolean)
      .join("\n");
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
    setEntityType("company");
    setSelectedFilings(DEFAULT_FILINGS);
    setTaxAuditApplicable(false);
    setHasEmployees(true);
    setSignatoryCount("2");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileSignature className="h-4 w-4" aria-hidden="true" />
          Class 3 is the only class still issued
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Digital Signature Requirement Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Some filings must be digitally signed; others accept an EVC or Aadhaar OTP. Pick what you
          file and this names the rule behind each answer, and tells you whether a signature-only
          token will do or you need encryption as well.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dsc-entity">
              Who is filing
            </label>
            <select
              id="dsc-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
            >
              {ENTITY_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dsc-signatories">
              How many people will sign
            </label>
            <input
              id="dsc-signatories"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              value={signatoryCount}
              onChange={(event) => setSignatoryCount(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5 border-t border-[var(--border)] pt-5">
          <legend className={LABEL_CLASS}>What do you file?</legend>
          <div className="mt-3 grid gap-2">
            {FILINGS.map((filing) => (
              <label
                key={filing.id}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25"
                htmlFor={`dsc-${filing.id}`}
              >
                <input
                  id={`dsc-${filing.id}`}
                  type="checkbox"
                  className={`mt-0.5 ${CHECKBOX_CLASS}`}
                  checked={selectedFilings.includes(filing.id)}
                  onChange={() => toggleFiling(filing.id)}
                />
                <span className="flex-1">
                  <span className="block font-medium">{filing.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {filing.authority}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-5">
          <label className="flex min-h-11 items-start gap-3 text-sm font-medium" htmlFor="dsc-audit">
            <input
              id="dsc-audit"
              type="checkbox"
              className={`mt-0.5 ${CHECKBOX_CLASS}`}
              checked={taxAuditApplicable}
              onChange={(event) => setTaxAuditApplicable(event.target.checked)}
            />
            My accounts are audited under section 44AB
          </label>
          <label className="flex min-h-11 items-start gap-3 text-sm font-medium" htmlFor="dsc-employees">
            <input
              id="dsc-employees"
              type="checkbox"
              className={`mt-0.5 ${CHECKBOX_CLASS}`}
              checked={hasEmployees}
              onChange={(event) => setHasEmployees(event.target.checked)}
            />
            I have employees on the rolls with EPFO or ESIC registration
          </label>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Do you need a digital signature
            </p>
            <p
              className={`mt-1 text-2xl font-semibold sm:text-3xl ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.required
                    ? "text-[var(--primary)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? "—" : result.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the digital signature requirement result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Certificate to buy", hasError ? "—" : result.certificateType],
            [
              "How many",
              hasError
                ? "—"
                : result.certificatesNeeded === 0
                  ? "None compulsory"
                  : `${result.certificatesNeeded} — a DSC is personal and cannot be shared`,
            ],
            [
              "Encryption certificate needed",
              hasError ? "—" : result.needsEncryption ? "Yes, for sealed bids" : "No",
            ],
            [
              "Organisational certificate needed",
              hasError ? "—" : result.needsOrganisational ? "Yes, issued in the entity name" : "No",
            ],
            [
              "Validity you can buy",
              hasError ? "—" : `${result.validityOptions.join(", ")} years`,
            ],
            ["Token standard", hasError ? "—" : `${result.tokenStandard} or higher`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Filing by filing</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {result.assessed.map((row) => {
              const style = VERDICT_STYLE[row.verdict];
              return (
                <li key={row.id} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold">{row.label}</p>
                    <span className={`shrink-0 text-xs font-semibold ${style.className}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-1 leading-6 text-[var(--muted-foreground)]">{row.reason}</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">{row.rule}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <Minus className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span className="text-[var(--muted-foreground)]">{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Portal requirements change and individual tenders can
        impose stricter conditions than the general rule, so read the tender document or portal
        help page before buying a token. Certificates are issued only by Certifying Authorities
        licensed by the Controller of Certifying Authorities.
      </p>
    </main>
  );
}
