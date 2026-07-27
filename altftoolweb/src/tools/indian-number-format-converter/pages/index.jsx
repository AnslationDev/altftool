"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, RotateCcw } from "lucide-react";

import { UNITS, convertNumber } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = { value: "15", unit: "million" };

const AMOUNT_FMT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertNumber({ value, unit }), [value, unit]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Indian number format conversion",
      `Input: ${value} ${UNITS.find((item) => item.id === unit)?.label ?? unit}`,
      `Indian notation: ${result.indianSpoken} (${result.indianGrouped})`,
      `International notation: ${result.internationalSpoken} (${result.internationalGrouped})`,
    ].join("\n");
  }, [hasError, result, value, unit]);

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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setCopied(false);
  };

  const formRows = hasError
    ? []
    : [
        ...result.indianForms.map((form) => [`In ${form.unit}`, AMOUNT_FMT.format(form.amount)]),
        ...result.internationalForms.map((form) => [
          `In ${form.unit}`,
          AMOUNT_FMT.format(form.amount),
        ]),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          Lakh · Crore · Million · Billion
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Indian Number Format Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          1 lakh is 100,000, 1 crore is 10 million, 1 billion is 100 crore, and 1 trillion is 1
          lakh crore. Type a number in either system and read it instantly in the other, with
          proper 2-2-3 and 3-3-3 digit grouping.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="inf-value">
              Number
            </label>
            <input
              id="inf-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Commas are fine — 1,50,00,000 and 15000000 both work.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inf-unit">
              Written in
            </label>
            <select
              id="inf-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Indian ⇄ International
            </p>
            <p className="mt-1 break-words text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.indianSpoken}
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              {hasError ? DASH : `= ${result.internationalSpoken}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the conversion result"
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
          {(hasError
            ? [
                ["Indian grouping (2-2-3)", DASH],
                ["International grouping (3-3-3)", DASH],
              ]
            : [
                ["Indian grouping (2-2-3)", result.indianGrouped],
                ["International grouping (3-3-3)", result.internationalGrouped],
                ...formRows,
              ]
          ).map(([label, val]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-semibold">{val}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Quick reference</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Indian</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Digits</th>
                <th scope="col" className="py-2 text-right font-semibold">International</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1 lakh", "1,00,000", "100 thousand"],
                ["10 lakh", "10,00,000", "1 million"],
                ["1 crore", "1,00,00,000", "10 million"],
                ["100 crore", "1,00,00,00,000", "1 billion"],
                ["1 lakh crore", "1,00,00,00,00,00,000", "1 trillion"],
              ].map(([indian, digits, international]) => (
                <tr key={indian} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{indian}</td>
                  <td className="py-2 pr-3">{digits}</td>
                  <td className="py-2 text-right">{international}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
