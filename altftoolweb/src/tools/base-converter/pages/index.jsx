"use client";

import { useMemo, useState } from "react";
import { Binary, Check, Copy, RotateCcw } from "lucide-react";

import {
  COMMON_BASES,
  DEFAULT_FRACTION_DIGITS,
  MAX_BASE,
  MAX_FRACTION_DIGITS,
  MIN_BASE,
  convertAll,
  describeAlphabet,
} from "../lib";

const DEFAULTS = {
  value: "255",
  fromBase: "10",
  customBase: "5",
  fractionDigits: String(DEFAULT_FRACTION_DIGITS),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const ALL_BASES = Array.from({ length: MAX_BASE - MIN_BASE + 1 }, (_, index) => MIN_BASE + index);

const toInt = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isInteger(value) ? value : NaN;
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [fromBase, setFromBase] = useState(DEFAULTS.fromBase);
  const [customBase, setCustomBase] = useState(DEFAULTS.customBase);
  const [fractionDigits, setFractionDigits] = useState(DEFAULTS.fractionDigits);
  const [copied, setCopied] = useState(false);

  const sourceBase = toInt(fromBase);
  const extraBase = toInt(customBase);
  const digits = toInt(fractionDigits);

  const targetBases = useMemo(() => {
    const bases = COMMON_BASES.map((entry) => entry.base);
    if (Number.isInteger(extraBase) && !bases.includes(extraBase)) bases.push(extraBase);
    return bases.sort((a, b) => a - b);
  }, [extraBase]);

  const result = useMemo(
    () =>
      convertAll({
        text: value,
        fromBase: sourceBase,
        targetBases,
        fractionDigits: digits,
      }),
    [value, sourceBase, targetBases, digits],
  );

  const hasError = Boolean(result.error);
  const headline = hasError
    ? DASH
    : (result.results.find((row) => row.base === 10) || result.results[0]).text;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [`Input: ${value} (base ${sourceBase})`];
    for (const row of result.results) {
      const suffix = row.recurring ? " …(recurring)" : row.truncated ? " …(cut off, increase fraction digits)" : "";
      lines.push(`${row.label} (base ${row.base}): ${row.prefix}${row.text}${suffix}`);
    }
    lines.push(`Bit length: ${result.bitLength} bits (${result.byteLength} bytes)`);
    lines.push(
      `Fits in: ${result.fits
        .filter((item) => item.signed || item.unsigned)
        .map((item) => `${item.width}-bit${item.unsigned ? " unsigned" : ""}${item.signed ? " signed" : ""}`)
        .join(", ") || "no listed fixed-width type"}`,
    );
    return lines.join("\n");
  }, [hasError, result, sourceBase, value]);

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
    setFromBase(DEFAULTS.fromBase);
    setCustomBase(DEFAULTS.customBase);
    setFractionDigits(DEFAULTS.fractionDigits);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Binary className="h-4 w-4" aria-hidden="true" />
          Number bases
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Base Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert between binary, octal, decimal, hexadecimal, base 36 and anything else from base 2
          to base 36. Whole numbers are exact at any length, and fractions are converted as exact
          rationals rather than rounded floating point.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="value">
              Number
            </label>
            <input
              id="value"
              type="text"
              inputMode="text"
              spellCheck={false}
              autoComplete="off"
              className={`mt-2 font-mono ${INPUT_CLASS}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="255, DEAD.BEEF, -1010.11…"
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {Number.isInteger(sourceBase) && sourceBase >= MIN_BASE && sourceBase <= MAX_BASE
                ? `Base ${sourceBase} uses ${describeAlphabet(sourceBase)}. Spaces, underscores and commas are ignored.`
                : "Choose a base between 2 and 36."}
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="from-base">
              Input base
            </label>
            <select
              id="from-base"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fromBase}
              onChange={(event) => setFromBase(event.target.value)}
            >
              {ALL_BASES.map((base) => {
                const known = COMMON_BASES.find((entry) => entry.base === base);
                return (
                  <option key={base} value={String(base)}>
                    Base {base}
                    {known ? ` · ${known.label}` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="custom-base">
              Extra base to show
            </label>
            <select
              id="custom-base"
              className={`mt-2 ${INPUT_CLASS}`}
              value={customBase}
              onChange={(event) => setCustomBase(event.target.value)}
            >
              {ALL_BASES.map((base) => (
                <option key={base} value={String(base)}>
                  Base {base}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fraction-digits">
              Fraction digits ({digits})
            </label>
            <input
              id="fraction-digits"
              type="range"
              min="0"
              max={String(Math.min(60, MAX_FRACTION_DIGITS))}
              step="1"
              value={fractionDigits}
              onChange={(event) => setFractionDigits(event.target.value)}
              className="mt-4 h-2 w-full cursor-pointer accent-[var(--primary)]"
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              A fraction that ends in one base often recurs forever in another. This is where the
              expansion is cut off.
            </p>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <div role="status" aria-live="polite">
      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Decimal value
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold break-all text-[var(--primary)] sm:text-4xl">
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the number above to see a result."
                : `${result.bitLength} bits · ${result.byteLength} byte${result.byteLength === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Copied every base conversion to clipboard" : "Copy every base conversion to clipboard"}
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
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError ? COMMON_BASES.map((entry) => ({ ...entry, text: DASH })) : result.results).map(
            (row) => (
              <div key={row.base} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-[var(--muted-foreground)]">
                  {row.label || `Base ${row.base}`}
                  <span className="ml-1 text-xs">(base {row.base})</span>
                </dt>
                <dd className="min-w-0 text-right font-mono font-semibold break-all">
                  {row.prefix}
                  {row.text}
                  {row.recurring ? (
                    <span className="ml-1 font-sans text-xs font-normal text-[var(--muted-foreground)]">
                      …recurring
                    </span>
                  ) : row.truncated ? (
                    <span className="ml-1 font-sans text-xs font-normal text-[var(--muted-foreground)]">
                      …cut off
                    </span>
                  ) : null}
                </dd>
              </div>
            ),
          )}
        </dl>
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Grouped for reading</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Base
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Grouped
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((row) => (
                  <tr key={row.base} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {row.label || `Base ${row.base}`}
                    </td>
                    <td className="py-2 font-mono break-all text-[var(--muted-foreground)]">
                      {row.grouped}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Fixed-width types it fits in</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Width
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Unsigned
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Signed
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.fits.map((item) => (
                  <tr key={item.width} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.width}-bit</td>
                    <td className={`py-2 pr-3 ${item.unsigned ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                      {item.unsigned ? "Fits" : "Overflows"}
                    </td>
                    <td className={`py-2 ${item.signed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                      {item.signed ? "Fits" : "Overflows"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.hasFraction && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Fixed-width checks apply to the integer part only.
            </p>
          )}
        </section>
      )}
      </div>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything is computed with BigInt and exact rational fractions, so a 200-digit number and a
        recurring fraction are both handled without rounding. Base 36 is the ceiling because the
        digit alphabet runs 0-9 then A-Z.
      </p>
    </main>
  );
}
