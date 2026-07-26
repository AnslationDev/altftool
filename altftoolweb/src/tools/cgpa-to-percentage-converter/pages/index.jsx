"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Copy, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/**
 * Each rule converts a grade point value on `scale` into a percentage,
 * and back again. Formulas are the widely published university rules.
 */
const RULES = [
  {
    id: "cbse",
    label: "CBSE (x 9.5)",
    scale: 10,
    note: "CBSE Class 10/12: Percentage = CGPA x 9.5",
    toPercent: (c) => c * 9.5,
    toCgpa: (p) => p / 9.5,
  },
  {
    id: "generic10",
    label: "Generic 10-point (x 10)",
    scale: 10,
    note: "Most common default: Percentage = CGPA x 10",
    toPercent: (c) => c * 10,
    toCgpa: (p) => p / 10,
  },
  {
    id: "vtu",
    label: "VTU (CGPA - 0.75) x 10",
    scale: 10,
    note: "VTU 2018 scheme: Percentage = (CGPA - 0.75) x 10",
    toPercent: (c) => (c - 0.75) * 10,
    toCgpa: (p) => p / 10 + 0.75,
  },
  {
    id: "gtu",
    label: "GTU (CGPA - 0.5) x 10",
    scale: 10,
    note: "GTU: Percentage = (CGPA - 0.5) x 10",
    toPercent: (c) => (c - 0.5) * 10,
    toCgpa: (p) => p / 10 + 0.5,
  },
  {
    id: "mu",
    label: "Mumbai University (piecewise)",
    scale: 10,
    note:
      "Mumbai University: 7.1 x CGPA + 11 for CGPA below 7.75, and 7.25 x CGPA + 9.95 from 7.75 upward.",
    toPercent: (c) => (c >= 7.75 ? 7.25 * c + 9.95 : 7.1 * c + 11),
    toCgpa: (p) => {
      const high = (p - 9.95) / 7.25;
      if (high >= 7.75) return high;
      return (p - 11) / 7.1;
    },
  },
  {
    id: "gpa4",
    label: "4.0 GPA scale (GPA / 4 x 100)",
    scale: 4,
    note: "US-style 4.0 scale: Percentage = GPA / 4 x 100",
    toPercent: (g) => (g / 4) * 100,
    toCgpa: (p) => (p / 100) * 4,
  },
  {
    id: "custom",
    label: "Custom multiplier",
    scale: 10,
    note: "Percentage = CGPA x your multiplier",
    custom: true,
  },
];

const num2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function classFor(percent) {
  if (percent >= 75) return "Distinction / First class with distinction";
  if (percent >= 60) return "First class";
  if (percent >= 50) return "Second class";
  if (percent >= 40) return "Pass class";
  return "Below pass class";
}

export default function ToolHome() {
  const [direction, setDirection] = useState("toPercent");
  const [ruleId, setRuleId] = useState("cbse");
  const [cgpa, setCgpa] = useState("8.6");
  const [percent, setPercent] = useState("81.7");
  const [multiplier, setMultiplier] = useState("9.5");
  const [copied, setCopied] = useState(false);

  const rule = RULES.find((r) => r.id === ruleId) || RULES[0];

  const activeRule = useMemo(() => {
    if (!rule.custom) return rule;
    const m = Number(multiplier);
    const safe = Number.isFinite(m) && m > 0 ? m : 0;
    return {
      ...rule,
      note: `Percentage = CGPA x ${safe || "?"}`,
      toPercent: (c) => c * safe,
      toCgpa: (p) => (safe > 0 ? p / safe : 0),
    };
  }, [rule, multiplier]);

  const result = useMemo(() => {
    const maxScale = activeRule.scale;

    if (activeRule.custom !== undefined && activeRule.custom) {
      const m = Number(multiplier);
      if (!Number.isFinite(m) || m <= 0) {
        return { error: "Enter a custom multiplier greater than 0." };
      }
    }

    if (direction === "toPercent") {
      if (cgpa === "") return { error: "Enter a CGPA value to convert." };
      const c = Number(cgpa);
      if (!Number.isFinite(c)) return { error: "CGPA must be a number." };
      if (c < 0) return { error: "CGPA cannot be negative." };
      if (c > maxScale)
        return { error: `CGPA cannot be more than ${maxScale} on this scale.` };

      const raw = activeRule.toPercent(c);
      const value = Math.min(100, Math.max(0, raw));
      return {
        headline: `${num2.format(value)}%`,
        subline: `${num2.format(c)} CGPA on a ${maxScale}-point scale`,
        clamped: raw !== value,
        rawPercent: raw,
        percentValue: value,
        cgpaValue: c,
      };
    }

    if (percent === "") return { error: "Enter a percentage to convert." };
    const p = Number(percent);
    if (!Number.isFinite(p)) return { error: "Percentage must be a number." };
    if (p < 0 || p > 100) return { error: "Percentage must be between 0 and 100." };

    const raw = activeRule.toCgpa(p);
    const value = Math.min(maxScale, Math.max(0, raw));
    return {
      headline: `${num2.format(value)} CGPA`,
      subline: `${num2.format(p)}% on a ${maxScale}-point scale`,
      clamped: raw !== value,
      rawPercent: p,
      percentValue: p,
      cgpaValue: value,
    };
  }, [activeRule, cgpa, percent, direction, multiplier]);

  const reset = () => {
    setDirection("toPercent");
    setRuleId("cbse");
    setCgpa("8.6");
    setPercent("81.7");
    setMultiplier("9.5");
  };

  const copyResult = async () => {
    if (result.error) return;
    const text = [
      "CGPA to Percentage Converter",
      `Rule: ${activeRule.label}`,
      `Formula: ${activeRule.note}`,
      `CGPA: ${num2.format(result.cgpaValue)} / ${activeRule.scale}`,
      `Percentage: ${num2.format(result.percentValue)}%`,
      `Class: ${classFor(result.percentValue)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const comparisons = useMemo(() => {
    if (result.error) return [];
    const c = result.cgpaValue;
    return RULES.filter((r) => !r.custom && r.scale === activeRule.scale).map((r) => ({
      id: r.id,
      label: r.label,
      value: Math.min(100, Math.max(0, r.toPercent(c))),
    }));
  }, [result, activeRule]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Grade conversion
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">CGPA to Percentage Converter</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Convert CGPA to percentage (or back) using your board or university formula. Different
            institutions use different multipliers, so pick the rule printed on your marksheet.
          </p>
        </header>

        <section
          aria-label="Conversion inputs"
          className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { id: "toPercent", label: "CGPA to percentage" },
              { id: "toCgpa", label: "Percentage to CGPA" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setDirection(option.id)}
                aria-pressed={direction === option.id}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  direction === option.id
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="rule" className="mb-1 block text-sm font-medium">
                Conversion rule
              </label>
              <select
                id="rule"
                value={ruleId}
                onChange={(e) => setRuleId(e.target.value)}
                className={INPUT_CLASS}
              >
                {RULES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {rule.custom ? (
              <div>
                <label htmlFor="multiplier" className="mb-1 block text-sm font-medium">
                  Custom multiplier
                </label>
                <input
                  id="multiplier"
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="0.05"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            ) : (
              <div>
                <span className="mb-1 block text-sm font-medium">Grade scale</span>
                <p className="flex h-11 items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--muted-foreground)]">
                  {rule.scale}-point scale
                </p>
              </div>
            )}

            {direction === "toPercent" ? (
              <div className="sm:col-span-2">
                <label htmlFor="cgpa" className="mb-1 block text-sm font-medium">
                  CGPA (out of {activeRule.scale})
                </label>
                <input
                  id="cgpa"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={activeRule.scale}
                  step="0.01"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label htmlFor="percent" className="mb-1 block text-sm font-medium">
                  Percentage (0 - 100)
                </label>
                <input
                  id="percent"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.01"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>

          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{activeRule.note}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={reset} aria-label="Reset converter" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={() =>
                setDirection((d) => (d === "toPercent" ? "toCgpa" : "toPercent"))
              }
              className={PRIMARY_BTN}
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              Swap direction
            </button>
          </div>
        </section>

        {result.error && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {result.error}
          </div>
        )}

        <section
          aria-label="Conversion result"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {direction === "toPercent" ? "Equivalent percentage" : "Equivalent CGPA"}
              </p>
              <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
                {result.error ? "--" : result.headline}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.error ? "Fix the input above to see a result." : result.subline}
              </p>
            </div>
            <button
              type="button"
              onClick={copyResult}
              disabled={Boolean(result.error)}
              aria-label="Copy conversion result to clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          {!result.error && (
            <>
              <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)] text-sm">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">CGPA</dt>
                  <dd className="font-semibold">
                    {num2.format(result.cgpaValue)} / {activeRule.scale}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Percentage</dt>
                  <dd className="font-semibold">{num2.format(result.percentValue)}%</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Typical class</dt>
                  <dd className="font-semibold">{classFor(result.percentValue)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-[var(--muted-foreground)]">Formula used</dt>
                  <dd className="max-w-[60%] text-right font-semibold">{activeRule.label}</dd>
                </div>
              </dl>

              {result.clamped && (
                <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs text-[var(--danger)]">
                  The raw formula output fell outside the valid range and was capped. Double-check
                  that this rule matches your institution.
                </p>
              )}

              {comparisons.length > 1 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Same CGPA under other common rules
                  </p>
                  <ul className="space-y-2">
                    {comparisons.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                      >
                        <span className="text-[var(--muted-foreground)]">{row.label}</span>
                        <span className="font-semibold">{num2.format(row.value)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
            Informational only. Universities publish their own conversion certificate rules, and an
            official transcript always overrides a calculated figure.
          </p>
        </section>
      </div>
    </main>
  );
}
