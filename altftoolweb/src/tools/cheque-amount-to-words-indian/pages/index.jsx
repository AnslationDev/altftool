"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SpellCheck } from "lucide-react";

import { amountToWords } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

const CASE_OPTIONS = [
  { value: "title", label: "Title Case" },
  { value: "upper", label: "UPPERCASE" },
  { value: "sentence", label: "Sentence case" },
];

const QUICK_AMOUNTS = [500, 25000, 123456.78, 1000000, 10000000];

const PLACE_VALUES = [
  ["Hundred", "100"],
  ["Thousand", "1,000"],
  ["Lakh", "1,00,000"],
  ["Crore", "1,00,00,000"],
  ["Hundred Crore", "1,00,00,00,000"],
];

const DEFAULTS = {
  amount: "123456.78",
  letterCase: "title",
  includeOnly: true,
  usePaiseFraction: false,
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
    if (Number.isNaN(amount)) return { error: "Enter a valid rupee amount." };
    return amountToWords({
      amount,
      letterCase: state.letterCase,
      includeOnly: state.includeOnly,
      usePaiseFraction: state.usePaiseFraction,
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

  const renderings = ok
    ? [
        ["cheque", "Cheque line", result.chequeWords],
        ["plain", "Plain wording", result.plainWords],
        ["international", "International (million / billion)", result.internationalWords],
        ["indian", "Indian digit grouping", result.formattedIndian],
        ["intlDigits", "International digit grouping", result.formattedInternational],
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SpellCheck className="h-4 w-4" aria-hidden="true" />
          Lakh · Crore
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cheque Amount to Words Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type a rupee amount and get the exact courtesy line a cheque needs — Indian lakh and crore
          place names, paise stated separately, and &ldquo;Only&rdquo; at the end so nothing can be
          added after it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cw-amount">
              Amount in rupees
            </label>
            <input
              id="cw-amount"
              className={`mt-2 ${INPUT_CLASS} text-lg font-semibold`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={state.amount}
              onChange={(event) => setField("amount", event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setField("amount", String(value))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {new Intl.NumberFormat("en-IN").format(value)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cw-case">
              Letter case
            </label>
            <select
              id="cw-case"
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
            <label className={TOGGLE_CLASS} htmlFor="cw-only">
              <input
                id="cw-only"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.includeOnly}
                onChange={(event) => setField("includeOnly", event.target.checked)}
              />
              End with &ldquo;Only&rdquo;
            </label>
            <label className={TOGGLE_CLASS} htmlFor="cw-fraction">
              <input
                id="cw-fraction"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={state.usePaiseFraction}
                onChange={(event) => setField("usePaiseFraction", event.target.checked)}
              />
              Write paise as 78/100
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
              Cheque courtesy line
            </p>
            <p className="mt-1 break-words text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {ok ? result.chequeWords : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.formattedIndian} · ${result.rupees.toLocaleString("en-IN")} rupees${result.hasPaise ? ` and ${result.paise} paise` : ""}`
                : "Fix the amount above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("main", result.chequeWords)}
              disabled={!ok}
              aria-label="Copy the cheque words"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copiedKey === "main" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedKey === "main" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the amount" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm">
          {renderings.map(([key, label, value]) => (
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
            <div className="rounded-md bg-[var(--muted)] px-3 py-3 text-sm text-[var(--muted-foreground)]">
              —
            </div>
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Indian place values</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 text-right font-semibold">Digits</th>
              </tr>
            </thead>
            <tbody>
              {PLACE_VALUES.map(([name, digits]) => (
                <tr key={name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{name}</td>
                  <td className="py-2 text-right tabular-nums">{digits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Write the words and the figures so they match exactly, strike through the space after
        &ldquo;Only&rdquo;, and keep the &ldquo;A/c Payee&rdquo; crossing if the cheque is not meant
        to be encashed over the counter. Banks return cheques where the words and figures differ.
      </p>
    </main>
  );
}
