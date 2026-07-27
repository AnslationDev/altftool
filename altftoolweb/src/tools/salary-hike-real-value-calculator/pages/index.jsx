"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import { CESS_PCT, SLAB_RATES, SURCHARGE_OPTIONS, computeRealHike } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${num(value)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  gross: "1500000",
  takeHome: "1100000",
  hike: "10",
  inflation: "6",
  slab: "30",
  surcharge: "0",
  cess: String(CESS_PCT),
};

export default function ToolHome() {
  const [gross, setGross] = useState(DEFAULTS.gross);
  const [takeHome, setTakeHome] = useState(DEFAULTS.takeHome);
  const [hike, setHike] = useState(DEFAULTS.hike);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [surcharge, setSurcharge] = useState(DEFAULTS.surcharge);
  const [cess, setCess] = useState(DEFAULTS.cess);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRealHike({
        currentGross: gross,
        currentTakeHome: takeHome,
        hikePct: hike,
        inflationPct: inflation,
        marginalRatePct: slab,
        surchargePct: surcharge,
        cessPct: cess,
      }),
    [gross, takeHome, hike, inflation, slab, surcharge, cess],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Salary Hike Real Value Calculator",
      `Current gross: ${money(result.currentGross)} · take-home: ${money(result.currentTakeHome)}`,
      `Hike offered: ${pct(result.hikePct)} = ${money(result.increment)} on gross`,
      `Effective marginal tax on the raise: ${pct(result.effectiveMarginalPct)}`,
      `Tax on the increment: ${money(result.taxOnIncrement)}`,
      `Extra in hand: ${money(result.netIncrement)} a year (${money(result.netIncrementMonthly)} a month)`,
      `Cost of inflation: ${money(result.inflationCost)}`,
      `Real gain in purchasing power: ${money(result.realGain)} a year (${pct(result.realGainPct)})`,
      result.breakEvenHikePct === null
        ? null
        : `Hike needed just to stay level: ${pct(result.breakEvenHikePct)}`,
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
    setGross(DEFAULTS.gross);
    setTakeHome(DEFAULTS.takeHome);
    setHike(DEFAULTS.hike);
    setInflation(DEFAULTS.inflation);
    setSlab(DEFAULTS.slab);
    setSurcharge(DEFAULTS.surcharge);
    setCess(DEFAULTS.cess);
    setCopied(false);
  };

  const numberFields = [
    { id: "hike-gross", label: "Current annual gross / CTC (₹)", value: gross, set: setGross, step: "10000" },
    { id: "hike-take", label: "Current annual take-home (₹)", value: takeHome, set: setTakeHome, step: "10000" },
    { id: "hike-pct", label: "Hike offered (% of gross)", value: hike, set: setHike, step: "0.5" },
    { id: "hike-infl", label: "Inflation over the year (%)", value: inflation, set: setInflation, step: "0.25" },
    { id: "hike-cess", label: "Health and Education Cess (%)", value: cess, set: setCess, step: "0.5" },
  ];

  const rows = hasError
    ? [
        ["Raise on gross", DASH],
        ["Effective marginal tax rate", DASH],
        ["Tax on the increment", DASH],
        ["Extra in hand per year", DASH],
        ["Extra in hand per month", DASH],
        ["New take-home", DASH],
        ["What inflation takes back", DASH],
        ["Take-home in today's money", DASH],
        ["Real hike on gross, before tax", DASH],
        ["Hike needed just to stay level", DASH],
      ]
    : [
        ["Raise on gross", `${money(result.increment)} (${pct(result.hikePct)})`],
        ["Effective marginal tax rate", pct(result.effectiveMarginalPct)],
        ["Tax on the increment", money(result.taxOnIncrement)],
        ["Extra in hand per year", money(result.netIncrement)],
        ["Extra in hand per month", money(result.netIncrementMonthly)],
        [
          "New take-home",
          `${money(result.newTakeHome)} (${money(result.newTakeHomeMonthly)} a month)`,
        ],
        ["What inflation takes back", money(result.inflationCost)],
        ["Take-home in today's money", money(result.realNewTakeHome)],
        ["Real hike on gross, before tax", pct(result.realGrossHikePct)],
        [
          "Hike needed just to stay level",
          result.breakEvenHikePct === null ? DASH : pct(result.breakEvenHikePct),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Appraisal reality check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Salary Hike Real Value Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A raise sits on top of your existing income, so it is taxed at your marginal rate, and
          inflation then erodes the whole salary rather than just the increment. This works out what
          is genuinely left.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="hike-slab">
              Your top slab rate (%)
            </label>
            <select
              id="hike-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(event.target.value)}
            >
              {SLAB_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hike-surcharge">
              Surcharge on income tax
            </label>
            <select
              id="hike-surcharge"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surcharge}
              onChange={(event) => setSurcharge(event.target.value)}
            >
              {SURCHARGE_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[5, 8, 10, 12, 15, 20].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setHike(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset}% hike
            </button>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Real gain in purchasing power
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.realGain)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the real value."
                : `${money(result.realGainMonthly)} a month · ${pct(result.realGainPct)} of current take-home`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy real hike result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
            hasError
              ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
              : result.beatsInflation
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          {hasError ? DASH : result.verdict}
        </p>

        {!hasError && (
          <div className="mt-4">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`You keep ${pct(result.keptShareOfRaisePct)} of the raise after tax`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.keptShareOfRaisePct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              You keep {pct(result.keptShareOfRaisePct)} of every rupee of the raise after tax, before
              inflation is counted.
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Slab rates and surcharge thresholds are reset by the Finance Act each year — pick the rate
        that applies to you rather than assuming last year&rsquo;s. Take-home also depends on PF,
        professional tax and reimbursements. Informational only, not tax advice; check with a
        chartered accountant for your own return.
      </p>
    </main>
  );
}
