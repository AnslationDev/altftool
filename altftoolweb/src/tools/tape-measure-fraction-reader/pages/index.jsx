"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ruler } from "lucide-react";

import { SIXTEENTHS_TABLE, TAPE_DENOMINATORS, convertReading } from "../lib";

const MODES = [
  { value: "tape", label: "Tape reading", hint: 'Type it as you read it: 5 3/8, 6\' 2 1/2", 3/16' },
  { value: "mm", label: "Millimetres", hint: "Any metric size from a drawing or a spec sheet" },
  { value: "cm", label: "Centimetres", hint: "Handy for furniture and fabric sizes" },
  { value: "in", label: "Decimal inches", hint: "From a caliper or a CAD dimension" },
];

const DEFAULT_VALUES = { tape: "5 3/8", mm: "100", cm: "10", in: "3.937" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = (digits) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits });
const MM_FMT = NUM(2);
const IN_FMT = NUM(4);
const CM_FMT = NUM(3);
const M_FMT = NUM(4);
const FT_FMT = NUM(4);
const DEV_FMT = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const DASH = "—";

export default function ToolHome() {
  const [mode, setMode] = useState("tape");
  const [value, setValue] = useState(DEFAULT_VALUES.tape);
  const [denominator, setDenominator] = useState(16);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertReading({ value, mode, denominator }),
    [value, mode, denominator],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Tape Measure Fraction Reader",
      `Tape reading: ${result.fraction.text} (to the nearest 1/${denominator})`,
      `Feet and inches: ${result.feetInches.text}`,
      `Decimal inches: ${IN_FMT.format(result.inches)} in`,
      `Millimetres: ${MM_FMT.format(result.mm)} mm`,
      `Centimetres: ${CM_FMT.format(result.cm)} cm`,
      `Metres: ${M_FMT.format(result.metres)} m`,
      `Decimal feet: ${FT_FMT.format(result.feet)} ft`,
    ].join("\n");
  }, [hasError, result, denominator]);

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
    setMode("tape");
    setValue(DEFAULT_VALUES.tape);
    setDenominator(16);
    setCopied(false);
  };

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setValue(DEFAULT_VALUES[next]);
    setCopied(false);
  };

  const activeMode = MODES.find((item) => item.value === mode) ?? MODES[0];
  const primary = hasError
    ? DASH
    : mode === "tape"
      ? `${MM_FMT.format(result.mm)} mm`
      : result.fraction.text;
  const primaryLabel = mode === "tape" ? "In millimetres" : `Nearest 1/${denominator} tape mark`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Tape measure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tape Measure Fraction Reader</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type a mark the way you read it off the tape — 5 3/8, 6&apos; 2 1/2&quot;, 3/16 — and get
          decimal inches, millimetres, centimetres and feet. Or go the other way and snap a metric
          size onto the nearest mark your tape actually has.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">What are you entering?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-4">
            {MODES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => switchMode(item.value)}
                aria-pressed={mode === item.value}
                className={mode === item.value ? PRIMARY_BTN : GHOST_BTN}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tape-value">
              {activeMode.label}
            </label>
            <input
              id="tape-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type={mode === "tape" ? "text" : "number"}
              inputMode={mode === "tape" ? "text" : "decimal"}
              min={mode === "tape" ? undefined : "0"}
              step={mode === "tape" ? undefined : "any"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{activeMode.hint}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tape-precision">
              Finest mark on your tape
            </label>
            <select
              id="tape-precision"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(denominator)}
              onChange={(event) => setDenominator(Number(event.target.value))}
            >
              {TAPE_DENOMINATORS.map((den) => (
                <option key={den} value={String(den)}>
                  1/{den} inch
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Most site tapes stop at 1/16 in; engineer&apos;s tapes go to 1/32 or 1/64.
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

      <section aria-live="polite" role="status" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {primaryLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{primary}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the reading above to see the conversion."
                : result.isExactAtPrecision
                  ? "This size lands exactly on a mark at that precision."
                  : `Nearest mark is ${DEV_FMT.format(result.fraction.deviationMm)} mm from the true size.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy tape measure conversion"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the reader" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tape reading", hasError ? DASH : result.fraction.text],
            ["Feet and inches", hasError ? DASH : result.feetInches.text],
            ["Decimal inches", hasError ? DASH : `${IN_FMT.format(result.inches)} in`],
            ["Millimetres", hasError ? DASH : `${MM_FMT.format(result.mm)} mm`],
            ["Centimetres", hasError ? DASH : `${CM_FMT.format(result.cm)} cm`],
            ["Metres", hasError ? DASH : `${M_FMT.format(result.metres)} m`],
            ["Decimal feet", hasError ? DASH : `${FT_FMT.format(result.feet)} ft`],
          ].map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Same size on a coarser tape</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            What you would mark if your tape only went that fine, and how far off that mark is.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Precision</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Mark</th>
                  <th scope="col" className="py-2 text-right font-semibold">Off by</th>
                </tr>
              </thead>
              <tbody>
                {result.ladder.map((row) => (
                  <tr key={row.denominator} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">1/{row.denominator}</td>
                    <td className="py-2 pr-3">{row.text}</td>
                    <td
                      className={`py-2 text-right ${row.exact ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                    >
                      {row.exact ? "exact" : `${DEV_FMT.format(row.deviationMm)} mm`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every sixteenth on the tape</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Mark</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Inches</th>
                <th scope="col" className="py-2 text-right font-semibold">Millimetres</th>
              </tr>
            </thead>
            <tbody>
              {SIXTEENTHS_TABLE.map((row) => (
                <tr key={row.fraction} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.fraction}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {IN_FMT.format(row.inches)}
                  </td>
                  <td className="py-2 text-right">{MM_FMT.format(row.mm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The inch is defined as exactly 25.4 mm, so these conversions are exact — only the snapping
        to a tape mark introduces any rounding, and that amount is shown.
      </p>
    </main>
  );
}
