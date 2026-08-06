"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { computeAiRoi } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Formats a fractional ROI as a whole-number percent, without ever printing "-0%". */
const pct = (value) => PCT.format(value).replace(/^-(0%?)$/, "$1");

/** Formats break-even hours, matching the on-screen table's "—" for the unreachable/undefined case. */
const breakEvenText = (value) => (value === null ? DASH : `${NUM1.format(value)} h`);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  seats: "10",
  costPerSeat: "30",
  otherCost: "0",
  hoursSaved: "2",
  hourlyRate: "50",
  adoption: "80",
};

const DASH = "—";

export default function ToolHome() {
  const [seats, setSeats] = useState(DEFAULTS.seats);
  const [costPerSeat, setCostPerSeat] = useState(DEFAULTS.costPerSeat);
  const [otherCost, setOtherCost] = useState(DEFAULTS.otherCost);
  const [hoursSaved, setHoursSaved] = useState(DEFAULTS.hoursSaved);
  const [hourlyRate, setHourlyRate] = useState(DEFAULTS.hourlyRate);
  const [adoption, setAdoption] = useState(DEFAULTS.adoption);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const num = (v) => (v.trim() === "" ? Number.NaN : Number(v));

  const result = useMemo(
    () =>
      computeAiRoi({
        seats: num(seats),
        costPerSeatMonthly: num(costPerSeat),
        otherMonthlyCost: otherCost.trim() === "" ? 0 : Number(otherCost),
        hoursSavedPerUserPerWeek: num(hoursSaved),
        hourlyRate: num(hourlyRate),
        adoptionPct: num(adoption),
      }),
    [seats, costPerSeat, otherCost, hoursSaved, hourlyRate, adoption],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AI tool ROI",
      `Monthly cost: ${USD.format(result.monthlyCost)}`,
      `Monthly hours saved: ${NUM1.format(result.monthlyHoursSaved)} h`,
      `Monthly value of time saved: ${USD.format(result.monthlyValue)}`,
      `Net monthly benefit: ${USD.format(result.netMonthly)}`,
      `ROI: ${pct(result.roiPct)}%`,
      `Annual net benefit: ${USD.format(result.annualNet)}`,
      `Break-even: ${breakEvenText(result.breakEvenHoursPerUserPerWeek)} saved per active user per week`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "AI ROI result" });
  };

  const reset = () => {
    setSeats(DEFAULTS.seats);
    setCostPerSeat(DEFAULTS.costPerSeat);
    setOtherCost(DEFAULTS.otherCost);
    setHoursSaved(DEFAULTS.hoursSaved);
    setHourlyRate(DEFAULTS.hourlyRate);
    setAdoption(DEFAULTS.adoption);
  };

  const rows = hasError
    ? [
        ["Total monthly cost", DASH],
        ["Active seats", DASH],
        ["Hours saved per month", DASH],
        ["Value of time saved / month", DASH],
        ["Net benefit / month", DASH],
        ["Annual net benefit", DASH],
        ["Break-even hours / user / week", DASH],
      ]
    : [
        ["Total monthly cost", USD.format(result.monthlyCost)],
        ["Active seats (after adoption)", NUM1.format(result.activeSeats)],
        ["Hours saved per month", `${NUM1.format(result.monthlyHoursSaved)} h`],
        ["Value of time saved / month", USD.format(result.monthlyValue)],
        ["Net benefit / month", USD.format(result.netMonthly)],
        ["Annual net benefit", USD.format(result.annualNet)],
        [
          "Break-even hours / user / week",
          result.breakEvenHoursPerUserPerWeek === null
            ? DASH
            : `${NUM1.format(result.breakEvenHoursPerUserPerWeek)} h`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          AI Business
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AI ROI Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price the time your team saves against what the tool costs: value = active seats × hours
          saved × hourly rate, ROI = (value − cost) ÷ cost.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="roi-seats">
              Licensed seats
            </label>
            <input
              id="roi-seats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roi-cps">
              Cost per seat per month ($)
            </label>
            <input
              id="roi-cps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={costPerSeat}
              onChange={(e) => setCostPerSeat(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roi-other">
              Other monthly cost ($ — API usage, training)
            </label>
            <input
              id="roi-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roi-hours">
              Hours saved per user per week
            </label>
            <input
              id="roi-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={hoursSaved}
              onChange={(e) => setHoursSaved(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roi-rate">
              Loaded hourly rate ($ / hour)
            </label>
            <input
              id="roi-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Salary plus benefits and overhead, divided by working hours — typically 1.25–1.4×
              base pay.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="roi-adoption">
              Adoption rate (% of seats actively using it)
            </label>
            <input
              id="roi-adoption"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={adoption}
              onChange={(e) => setAdoption(e.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monthly ROI
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--primary)]"
                  : result.roiPct >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {hasError ? DASH : `${pct(result.roiPct)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.paysForItself
                  ? "The reported time savings more than cover the subscription."
                  : "At these numbers the tool costs more than the time it saves."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label={isCopied("result") ? "Copied the AI ROI result to clipboard" : "Copy the AI ROI result"}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Time saved is self-reported and rarely converts 1:1 into extra
        output; treat the result as an upper bound and validate with measured before/after timings.
      </p>
    </main>
  );
}
