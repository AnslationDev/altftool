"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SpellCheck } from "lucide-react";

import { CURRENCIES, amountToWords } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]";

const CASE_OPTIONS = [
  { value: "title", label: "Title Case" },
  { value: "upper", label: "UPPERCASE" },
  { value: "lower", label: "lowercase" },
  { value: "sentence", label: "Sentence case" },
];

const SYSTEM_OPTIONS = [
  { value: "indian", label: "Indian — lakh, crore" },
  { value: "international", label: "International — million, billion" },
];

const DEFAULTS = {
  amount: "125000.5",
  currency: "INR",
  system: "indian",
  letterCase: "title",
  includeOnly: true,
  minorAsFraction: false,
  hyphenate: false,
  useAnd: false,
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copiedKey, setCopiedKey] = useState("");

  const setField = (key, value) => setState((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => {
    const amount = toNumber(state.amount);
    if (Number.isNaN(amount)) return { error: "Enter a valid amount — digits only, with an optional decimal." };
    return amountToWords({
      amount,
      currency: state.currency,
      system: state.system,
      letterCase: state.letterCase,
      includeOnly: state.includeOnly,
      minorAsFraction: state.minorAsFraction,
      hyphenate: state.hyphenate,
      useAnd: state.useAnd,
    });
  }, [state]);

  const ok = !result.error;

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  };

  const reset = () => {
    setState(DEFAULTS);
    setCopiedKey("");
  };

  const rows = ok
    ? [
        ["cheque", "Cheque courtesy line", result.chequeLine],
        ["invoice", "Invoice / receipt wording", result.invoiceLine],
        ["legal", "Agreement style (figures + words)", result.legalLine],
        ["words", "Whole-number words only", result.wordsOnly],
        ["figures", "Figures", result.formattedCurrency],
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SpellCheck className="h-4 w-4" aria-hidden="true" />
          8 currencies
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Currency Amount to Words Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type an amount and get the wording a cheque, an invoice or a contract needs — in the Indian
          lakh-crore system or the international million-billion system, with the minor units spelled
          out separately.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="caw-amount">
              Amount
            </label>
            <input
              id="caw-amount"
              className={`mt-2 ${INPUT_CLASS} text-lg font-semibold`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={state.amount}
              onChange={(event) => setField("amount", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="caw-currency">
              Currency
            </label>
            <select
              id="caw-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.currency}
              onChange={(event) => {
                const code = event.target.value;
                setState((current) => ({
                  ...current,
                  currency: code,
                  system: CURRENCIES[code]?.defaultSystem ?? current.system,
                }));
              }}
            >
              {Object.values(CURRENCIES).map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="caw-system">
              Numbering system
            </label>
            <select
              id="caw-system"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.system}
              onChange={(event) => setField("system", event.target.value)}
            >
              {SYSTEM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="caw-case">
              Letter case
            </label>
            <select
              id="caw-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.letterCase}
              onChange={(event) => setField("letterCase", event.target.value)}
            >
              {CASE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid content-end gap-3">
            <label className={TOGGLE_CLASS} htmlFor="caw-only">
              <input
                id="caw-only"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.includeOnly}
                onChange={(event) => setField("includeOnly", event.target.checked)}
              />
              End with &ldquo;Only&rdquo;
            </label>
          </div>

          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
            <label className={TOGGLE_CLASS} htmlFor="caw-fraction">
              <input
                id="caw-fraction"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.minorAsFraction}
                onChange={(event) => setField("minorAsFraction", event.target.checked)}
              />
              Minor units as 50/100
            </label>
            <label className={TOGGLE_CLASS} htmlFor="caw-hyphen">
              <input
                id="caw-hyphen"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.hyphenate}
                onChange={(event) => setField("hyphenate", event.target.checked)}
              />
              Hyphenate (Twenty-One)
            </label>
            <label className={TOGGLE_CLASS} htmlFor="caw-and">
              <input
                id="caw-and"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.useAnd}
                onChange={(event) => setField("useAnd", event.target.checked)}
              />
              British &ldquo;and&rdquo;
            </label>
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Amount in words
            </p>
            <p className="mt-1 break-words text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {ok ? result.chequeLine : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.formattedCurrency} · ${result.numbering === "indian" ? "Indian" : "International"} numbering`
                : "Fix the amount above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("main", result.chequeLine)}
              disabled={!ok}
              aria-label="Copy the amount in words"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copiedKey === "main" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedKey === "main" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm">
          {rows.map(([key, label, value]) => (
            <div
              key={key}
              className="flex flex-col gap-2 rounded-md bg-[var(--muted)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {label}
                </dt>
                <dd className="mt-1 break-words font-semibold">{value}</dd>
              </div>
              <button
                type="button"
                onClick={() => copy(key, value)}
                aria-label={`Copy ${label}`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {copiedKey === key ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copiedKey === key ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
          {!ok && (
            <div className="rounded-md bg-[var(--muted)] px-3 py-3 text-sm text-[var(--muted-foreground)]">—</div>
          )}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Keep the words and the figures identical on any negotiable instrument, and strike through the
        blank space after the last word so nothing can be added. This page is informational; your bank
        or auditor decides the wording it will accept.
      </p>
    </main>
  );
}
