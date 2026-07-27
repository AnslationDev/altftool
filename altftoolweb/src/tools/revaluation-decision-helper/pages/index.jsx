"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { REVALUATION_STAGES, weighRevaluation } from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const isoToday = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const isoPlusDays = (iso, days) => {
  const stamp = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(stamp)) return iso;
  const next = new Date(stamp + days * 86400000);
  const pad = (value) => String(value).padStart(2, "0");
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
};

const BASE_DEFAULTS = {
  currentMarks: "62",
  maxMarks: "100",
  targetMarks: "70",
  feePerSubject: "500",
  subjects: "2",
  chanceOfIncrease: "35",
  gainIfIncreased: "6",
  chanceOfDecrease: "8",
  lossIfDecreased: "3",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [today] = useState(isoToday);
  const [values, setValues] = useState(BASE_DEFAULTS);
  const [deadline, setDeadline] = useState(() => isoPlusDays(isoToday(), 9));
  const [copied, setCopied] = useState(false);

  const setField = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const result = useMemo(
    () =>
      weighRevaluation({
        currentMarks: toNumber(values.currentMarks),
        maxMarks: toNumber(values.maxMarks),
        targetMarks: toNumber(values.targetMarks),
        feePerSubject: toNumber(values.feePerSubject),
        subjects: toNumber(values.subjects),
        chanceOfIncrease: toNumber(values.chanceOfIncrease),
        gainIfIncreased: toNumber(values.gainIfIncreased),
        chanceOfDecrease: toNumber(values.chanceOfDecrease),
        lossIfDecreased: toNumber(values.lossIfDecreased),
        todayIso: today,
        deadlineIso: deadline,
      }),
    [values, today, deadline],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Revaluation Decision Helper",
      `Current: ${result.currentMarks} of ${result.maxMarks} (${pct(result.currentPercent)}); target ${result.targetMarks}`,
      `Fee: ${money(result.feePerSubject)} × ${result.subjects} subject(s) = ${money(result.totalFee)}`,
      `Chance of a rise ${result.chanceOfIncrease}% (+${result.gainIfIncreased}), of a fall ${result.chanceOfDecrease}% (-${result.lossIfDecreased}), no change ${result.chanceUnchanged}%`,
      `Expected change: ${result.expectedChange} marks → ${result.expectedMarks}`,
      `Break-even chance of a rise: ${result.breakEvenChance === null ? "n/a" : `${result.breakEvenChance}%`}`,
      `Cost per expected mark: ${result.costPerExpectedMark === null ? "no expected gain" : money(result.costPerExpectedMark)}`,
      `Range: ${result.worstCaseMarks} to ${result.bestCaseMarks}`,
      `Days left to apply: ${result.daysLeft === null ? "unknown" : result.daysLeft}`,
      `Verdict: ${result.recommendation}`,
      "",
      result.verdict,
    ].join("\n");
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
    setValues(BASE_DEFAULTS);
    setDeadline(isoPlusDays(today, 9));
    setCopied(false);
  };

  const field = (id, label, key, extra = {}, hint = null) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min="0"
        step="1"
        value={values[key]}
        onChange={setField(key)}
        {...extra}
      />
      {hint ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Post-result decisions
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Revaluation Decision Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Revaluation is a bet with a known fee and an uncertain payoff, and boards make the revised
          marks final whether they go up or down. Price both sides before you pay, and check the
          window has not already closed.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where you stand</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("rv-current", "Marks awarded", "currentMarks")}
          {field("rv-max", "Maximum marks for the subject", "maxMarks")}
          {field("rv-target", "Marks you actually need", "targetMarks", {}, "The cutoff, pass mark or aggregate you are chasing.")}
          {field("rv-subjects", "Subjects you would apply for", "subjects", { min: "1", max: "20" })}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The bet</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("rv-fee", "Fee per subject (INR)", "feePerSubject", { step: "50" }, "Take it from your board's current post-result circular.")}
          {field("rv-pup", "Chance the marks are raised (%)", "chanceOfIncrease", { max: "100" })}
          {field("rv-gain", "Marks gained if they are raised", "gainIfIncreased")}
          {field("rv-pdown", "Chance the marks are reduced (%)", "chanceOfDecrease", { max: "100" }, "Revised marks are final, so this side has to be priced.")}
          {field("rv-loss", "Marks lost if they are reduced", "lossIfDecreased")}
          <div>
            <label className={LABEL_CLASS} htmlFor="rv-deadline">
              Last date to apply
            </label>
            <input
              id="rv-deadline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">Counted from {today}.</p>
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
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Expected marks after revaluation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : num(result.expectedMarks)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the result."
                : `${result.expectedChange >= 0 ? "+" : ""}${num(result.expectedChange)} marks on your own estimates, from ${num(result.currentMarks)}`}
            </p>
            {!hasError && (
              <span
                className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${TONE_CLASS[result.recommendationTone]}`}
              >
                {result.recommendation}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy revaluation decision summary"
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
            ["Total fee", hasError ? DASH : money(result.totalFee)],
            [
              "Cost per expected mark",
              hasError
                ? DASH
                : result.costPerExpectedMark === null
                  ? "no expected gain"
                  : money(result.costPerExpectedMark),
            ],
            [
              "Break-even chance of a rise",
              hasError || result.breakEvenChance === null ? DASH : pct(result.breakEvenChance),
            ],
            ["Chance nothing changes", hasError ? DASH : pct(result.chanceUnchanged)],
            [
              "Best case",
              hasError ? DASH : `${num(result.bestCaseMarks)} (${pct(result.bestCasePercent)})`,
            ],
            [
              "Worst case",
              hasError ? DASH : `${num(result.worstCaseMarks)} (${pct(result.worstCasePercent)})`,
            ],
            [
              "Gap to the mark you need",
              hasError ? DASH : result.gapToTarget === 0 ? "already there" : `${num(result.gapToTarget)} marks`,
            ],
            [
              "Days left to apply",
              hasError || result.daysLeft === null
                ? DASH
                : result.daysLeft < 0
                  ? `closed ${num(Math.abs(result.daysLeft))} days ago`
                  : num(result.daysLeft),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.verdict}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The three stages, in order</h2>
        <ol className="mt-4 grid gap-4">
          {REVALUATION_STAGES.map((stage, index) => (
            <li key={stage.id} className="rounded-md bg-[var(--muted)] p-4">
              <p className="text-sm font-semibold">
                {index + 1}. {stage.label}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{stage.what}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{stage.typicalOutcome}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The chances of a rise or a fall are your own estimates, not a
        prediction — this tool only does the arithmetic on them. Fees, windows and the order of the
        stages differ by board and change every year, so take them from the current post-result
        circular and, where a career decision turns on it, speak to your school or department.
      </p>
    </main>
  );
}
