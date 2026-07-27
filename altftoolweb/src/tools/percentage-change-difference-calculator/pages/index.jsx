"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw } from "lucide-react";

import {
  MODES,
  applyPercent,
  percentOf,
  percentageChange,
  percentageDifference,
  percentagePoints,
  whatPercent,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const DASH = "—";

const n = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const p = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);
const signed = (value) =>
  Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}` : DASH;
const signedPct = (value) =>
  Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM.format(value)}%` : DASH;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULTS = {
  change: { first: "80", second: "100" },
  difference: { first: "80", second: "100" },
  of: { first: "15", second: "2000" },
  "what-percent": { first: "300", second: "2000" },
  apply: { first: "2000", second: "-20" },
  points: { first: "45", second: "60" },
};

const FIELDS = {
  change: ["Old value (baseline)", "New value"],
  difference: ["First value", "Second value"],
  of: ["Percentage (%)", "Of this number"],
  "what-percent": ["This number", "Is what percent of"],
  apply: ["Starting value", "Change (%), negative to decrease"],
  points: ["First percentage (%)", "Second percentage (%)"],
};

export default function ToolHome() {
  const [mode, setMode] = useState("change");
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const pair = values[mode];
  const first = toNumber(pair.first);
  const second = toNumber(pair.second);

  const result = useMemo(() => {
    switch (mode) {
      case "change":
        return percentageChange({ from: first, to: second });
      case "difference":
        return percentageDifference({ a: first, b: second });
      case "of":
        return percentOf({ percent: first, value: second });
      case "what-percent":
        return whatPercent({ part: first, whole: second });
      case "apply":
        return applyPercent({ value: first, percent: second });
      case "points":
        return percentagePoints({ fromPct: first, toPct: second });
      default:
        return { error: "Pick a calculation." };
    }
  }, [mode, first, second]);

  const hasError = Boolean(result.error);

  const headline = useMemo(() => {
    if (hasError) return DASH;
    switch (mode) {
      case "change":
        return signedPct(result.changePct);
      case "difference":
        return p(result.differencePct);
      case "of":
        return n(result.result);
      case "what-percent":
        return p(result.result);
      case "apply":
        return n(result.result);
      case "points":
        return `${signed(result.points)} pp`;
      default:
        return DASH;
    }
  }, [hasError, mode, result]);

  const caption = useMemo(() => {
    if (hasError) return "Fix the input to see a result.";
    switch (mode) {
      case "change":
        return `${n(result.from)} to ${n(result.to)} is a ${n(Math.abs(result.absoluteChange))} ${result.direction}`;
      case "difference":
        return `The gap of ${n(result.absoluteDifference)} measured against their average of ${n(result.mean)}`;
      case "of":
        return `${n(result.percent)}% of ${n(result.value)}`;
      case "what-percent":
        return `${n(result.part)} out of ${n(result.whole)}`;
      case "apply":
        return `${n(result.value)} ${result.direction === "decrease" ? "minus" : "plus"} ${n(Math.abs(result.change))}`;
      case "points":
        return `${n(result.fromPct)}% to ${n(result.toPct)}% — a change of ${result.points === 0 ? "no" : signed(result.points)} percentage points`;
      default:
        return "";
    }
  }, [hasError, mode, result]);

  const rows = useMemo(() => {
    if (hasError) {
      return [
        ["Result", DASH],
        ["Supporting figure", DASH],
      ];
    }
    switch (mode) {
      case "change":
        return [
          ["Absolute change", signed(result.absoluteChange)],
          ["Percentage change", signedPct(result.changePct)],
          ["New value as a share of the old", p(result.ofOriginal)],
          ["Multiplier", result.multiplier === null ? DASH : `${n(result.multiplier)}x`],
          [
            "Change needed to get back",
            result.reversePct === null ? DASH : signedPct(result.reversePct),
          ],
        ];
      case "difference":
        return [
          ["Absolute difference", n(result.absoluteDifference)],
          ["Average of the two", n(result.mean)],
          ["Percentage difference (symmetric)", p(result.differencePct)],
          [
            "First relative to second",
            result.aRelativeToB === null ? DASH : signedPct(result.aRelativeToB),
          ],
          [
            "Second relative to first",
            result.bRelativeToA === null ? DASH : signedPct(result.bRelativeToA),
          ],
        ];
      case "of":
        return [
          ["Result", n(result.result)],
          ["Remaining amount", n(result.remainder)],
          ["Formula", `${n(result.value)} x ${n(result.percent)} ÷ 100`],
        ];
      case "what-percent":
        return [
          ["Percentage", p(result.result)],
          ["Remaining percentage", p(result.remainderPct)],
          ["Remaining amount", n(result.rest)],
          ["Formula", `${n(result.part)} ÷ ${n(result.whole)} x 100`],
        ];
      case "apply":
        return [
          ["Amount of the change", signed(result.change)],
          ["Final value", n(result.result)],
          ["Formula", `${n(result.value)} x (1 ${result.percent < 0 ? "-" : "+"} ${n(Math.abs(result.percent))} ÷ 100)`],
        ];
      case "points":
        return [
          ["Percentage point change", `${signed(result.points)} pp`],
          [
            "Relative change",
            result.relativePct === null ? DASH : signedPct(result.relativePct),
          ],
          ["Direction", result.direction],
        ];
      default:
        return [];
    }
  }, [hasError, mode, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const label = MODES.find((m) => m.id === mode)?.label ?? mode;
    return [`${label}: ${headline}`, caption, ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  }, [hasError, mode, headline, caption, rows]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const setField = (key, value) =>
    setValues((current) => ({ ...current, [mode]: { ...current[mode], [key]: value } }));

  const [labelFirst, labelSecond] = FIELDS[mode];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Percentages
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Percentage Change and Difference Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six different questions hide behind the word &ldquo;percentage&rdquo;. Pick the one you
          actually mean and see the formula alongside the answer.
        </p>
      </header>

      <section className={CARD} aria-labelledby="pc-mode">
        <h2 id="pc-mode" className="text-base font-semibold">
          What do you want to work out?
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {MODES.map((option) => (
            <label
              key={option.id}
              htmlFor={`pc-mode-${option.id}`}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                mode === option.id
                  ? "border-[var(--primary)] bg-[var(--muted)]"
                  : "border-[var(--border)]"
              }`}
            >
              <input
                id={`pc-mode-${option.id}`}
                type="radio"
                name="pc-mode"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={mode === option.id}
                onChange={() => setMode(option.id)}
              />
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-first">
              {labelFirst}
            </label>
            <input
              id="pc-first"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="any"
              value={pair.first}
              onChange={(event) => setField("first", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-second">
              {labelSecond}
            </label>
            <input
              id="pc-second"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="any"
              value={pair.second}
              onChange={(event) => setField("second", event.target.value)}
            />
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="pc-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="pc-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              {MODES.find((m) => m.id === mode)?.label}
            </h2>
            <p className="mt-1 text-4xl font-semibold break-words text-[var(--primary)]">
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{caption}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the percentage result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Change or difference?</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Percentage change has a direction: it divides by the old value, so 80 to 100 is a 25%
          increase while 100 to 80 is a 20% decrease. Percentage difference has no baseline: it
          divides by the average of the two, so 80 and 100 differ by 22.22% whichever way round you
          write them. Use change for before-and-after, difference for two measurements of the same
          thing.
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Percentage points are different again. A rate moving from 45% to 60% has risen 15
          percentage points, which is a 33.33% relative increase — quoting the wrong one of those
          two is the most common percentage error in reporting.
        </p>
      </section>
    </main>
  );
}
