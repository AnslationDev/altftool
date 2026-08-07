"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailX, RotateCcw } from "lucide-react";

import {
  LOCKOUT_FACTORS,
  MAX_ACCESS_DAYS,
  PURPOSES,
  evaluateDisposableUse,
  formatDecision,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const EMPTY_FACTORS = {
  needsRecovery: false,
  needsOtp: false,
  hasPayment: false,
  needsReceipts: false,
  longTerm: false,
};

const DEFAULT_PURPOSE = "shopping";
const DEFAULT_DAYS = "180";

const factorsForPurpose = (purposeId) => {
  const purpose = PURPOSES.find((item) => item.id === purposeId);
  return { ...EMPTY_FACTORS, ...(purpose ? purpose.factors : {}) };
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [purpose, setPurpose] = useState(DEFAULT_PURPOSE);
  const [factors, setFactors] = useState(() => factorsForPurpose(DEFAULT_PURPOSE));
  const [accessDays, setAccessDays] = useState(DEFAULT_DAYS);
  const [formRejects, setFormRejects] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => evaluateDisposableUse({ purpose, factors, accessDays, formRejectsDisposable: formRejects }),
    [purpose, factors, accessDays, formRejects],
  );
  const summary = useMemo(() => formatDecision(result), [result]);
  const hasError = Boolean(result.error);

  const choosePurpose = (id) => {
    setPurpose(id);
    if (id !== "custom") setFactors(factorsForPurpose(id));
  };

  const toggleFactor = (id) => {
    setPurpose("custom");
    setFactors((current) => ({ ...current, [id]: !current[id] }));
  };

  const reset = () => {
    setPurpose(DEFAULT_PURPOSE);
    setFactors(factorsForPurpose(DEFAULT_PURPOSE));
    setAccessDays(DEFAULT_DAYS);
    setFormRejects(false);
    setCopied(false);
  };

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const purposeNote = PURPOSES.find((item) => item.id === purpose)?.note || "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailX className="h-4 w-4" aria-hidden="true" />
          Email security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Disposable Email Policy Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Throwaway addresses are excellent for a one-off download and terrible for anything with a
          password reset attached. Describe the signup and this scores the lockout risk, then shows
          which kind of address survives it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-purpose">
              What are you signing up for?
            </label>
            <select
              id="dep-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purpose}
              onChange={(event) => choosePurpose(event.target.value)}
            >
              {PURPOSES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-days">
              Days you must still receive mail there
            </label>
            <input
              id="dep-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_ACCESS_DAYS}
              step="1"
              value={accessDays}
              onChange={(event) => setAccessDays(event.target.value)}
            />
          </div>
        </div>

        {purposeNote && (
          <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {purposeNote}
          </p>
        )}

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What does this account actually need?</legend>
          <div className="mt-3 grid gap-2">
            {LOCKOUT_FACTORS.map((factor) => (
              <label
                key={factor.id}
                htmlFor={`dep-${factor.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`dep-${factor.id}`}
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(factors[factor.id])}
                  onChange={() => toggleFactor(factor.id)}
                />
                <span>
                  <span className="font-semibold">{factor.label}</span>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">+{factor.weight}</span>
                </span>
              </label>
            ))}
            <label
              htmlFor="dep-blocked"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
            >
              <input
                id="dep-blocked"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={formRejects}
                onChange={() => setFormRejects((value) => !value)}
              />
              <span className="font-semibold">The signup form rejects disposable domains</span>
            </label>
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Lockout risk
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.lockoutScore}/100`}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
              {hasError ? "—" : result.verdict.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              aria-label="Copy the disposable email decision"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy decision"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the explainer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{result.verdict.reason}</p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Recommended address type", hasError ? "—" : result.recommended.label],
            ["Address types that still work", hasError ? "—" : NUM.format(result.workableCount)],
            ["Mail must keep arriving for", hasError ? "—" : `${NUM.format(result.accessDays)} day${result.accessDays === 1 ? "" : "s"}`],
            ["Risk drivers ticked", hasError ? "—" : NUM.format(result.activeFactors.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Lockout risk ${result.lockoutScore} out of 100`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.lockoutScore}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How each address type holds up</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Address type</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Keeps mail</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Password-protected</th>
                    <th scope="col" className="py-2 font-semibold">Works here</th>
                  </tr>
                </thead>
                <tbody>
                  {result.types.map((type) => (
                    <tr key={type.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{type.label}</td>
                      <td className="py-2 pr-3">{type.retentionLabel}</td>
                      <td className="py-2 pr-3">{type.publiclyReadable ? "No" : "Yes"}</td>
                      <td
                        className={`py-2 font-semibold ${type.workable ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                      >
                        {type.workable ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-5 space-y-3">
              {result.types.map((type) => (
                <li key={type.id} className="rounded-lg border border-[var(--border)] p-3">
                  <p className="text-sm font-semibold">{type.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{type.summary}</p>
                  {type.blockers.map((blocker) => (
                    <p
                      key={blocker}
                      className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                    >
                      {blocker}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </section>

          {result.activeFactors.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">What happens if you lose the address</h2>
              <ul className="mt-4 space-y-3">
                {result.activeFactors.map((factor) => (
                  <li key={factor.id} className="text-sm leading-6">
                    <span className="font-semibold">{factor.label}</span>
                    <span className="block text-[var(--muted-foreground)]">{factor.consequence}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance, not legal advice. Retention windows for public inboxes are typical
        values and vary by provider — check the one you use. Using throwaway addresses to defeat
        one-per-customer limits or repeat free trials breaches most terms of service.
      </p>
    </main>
  );
}
