"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Milk, RotateCcw } from "lucide-react";

import {
  MAINTENANCE_ML_PER_KG,
  MAX_DAILY_ML_UNDER_6M,
  MAX_FEEDS_PER_DAY,
  MAX_WEIGHT_KG,
  MIN_FEEDS_PER_DAY,
  MIN_WEIGHT_KG,
  RANGE_HIGH_ML_PER_KG,
  RANGE_LOW_ML_PER_KG,
  estimateFeedVolume,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const ml = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} mL` : "—");
const oz = (value) => (Number.isFinite(value) ? `${NUM1.format(value)} fl oz` : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  weight: "3.5",
  day: "10",
  feeds: "8",
  override: "",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [day, setDay] = useState(DEFAULTS.day);
  const [feeds, setFeeds] = useState(DEFAULTS.feeds);
  const [override, setOverride] = useState(DEFAULTS.override);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const overrideValue = String(override).trim() === "" ? null : toNumber(override);
    if (overrideValue !== null && Number.isNaN(overrideValue)) {
      return { error: "A prescribed intake must be a number in mL/kg/day." };
    }
    return estimateFeedVolume({
      weightKg: toNumber(weight),
      dayOfLife: toNumber(day),
      feedsPerDay: toNumber(feeds),
      mlPerKgOverride: overrideValue,
    });
  }, [weight, day, feeds, override]);

  const ok = !result.error;

  const summaryText = useMemo(() => {
    if (!ok) return "";
    return [
      "Newborn feeding volume estimate",
      `Weight: ${NUM1.format(result.weightKg)} kg · Day of life: ${result.dayOfLife} · Feeds per day: ${result.feedsPerDay}`,
      `Intake used: ${NUM0.format(result.mlPerKg)} mL/kg/day${result.usingOverride ? " (prescribed)" : ""}`,
      `Per feed: ${ml(result.perFeedMl)} (${oz(result.perFeedOz)})`,
      `Per 24 hours: ${ml(result.dailyMl)} (${oz(result.dailyOz)})`,
      `Typical daily range: ${ml(result.dailyLowMl)} to ${ml(result.dailyHighMl)}`,
      `Roughly one feed every ${NUM1.format(result.hoursBetweenFeeds)} hours`,
    ].join("\n");
  }, [ok, result]);

  const copyResult = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setWeight(DEFAULTS.weight);
    setDay(DEFAULTS.day);
    setFeeds(DEFAULTS.feeds);
    setOverride(DEFAULTS.override);
    setCopied(false);
  };

  const rows = ok
    ? [
        ["Total in 24 hours", `${ml(result.dailyMl)} · ${oz(result.dailyOz)}`],
        [
          "Intake rate used",
          `${NUM0.format(result.mlPerKg)} mL/kg/day${result.usingOverride ? " (prescribed)" : ""}`,
        ],
        [
          "Typical daily range",
          `${ml(result.dailyLowMl)} – ${ml(result.dailyHighMl)} (${NUM0.format(result.lowPerKg)}–${NUM0.format(result.highPerKg)} mL/kg/day)`,
        ],
        ["Typical per-feed range", `${ml(result.perFeedLowMl)} – ${ml(result.perFeedHighMl)}`],
        ["Feed interval at this count", `about every ${NUM1.format(result.hoursBetweenFeeds)} hours`],
        [
          "Stomach capacity around day " + result.dayOfLife,
          result.capacityLowMl === null
            ? DASH
            : `${ml(result.capacityLowMl)} – ${ml(result.capacityHighMl)}`,
        ],
      ]
    : [
        ["Total in 24 hours", DASH],
        ["Intake rate used", DASH],
        ["Typical daily range", DASH],
        ["Typical per-feed range", DASH],
        ["Feed interval at this count", DASH],
        ["Stomach capacity", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Milk className="h-4 w-4" aria-hidden="true" />
          Newborn feeding
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Newborn Feeding Volume Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimates how many millilitres a term newborn takes in 24 hours and per feed, using the
          standard mL/kg/day ramp for the first week and about {MAINTENANCE_ML_PER_KG} mL/kg/day
          afterwards. Informational only — follow the plan your paediatrician or neonatal team gives
          you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nfv-weight">
              Current weight (kg)
            </label>
            <input
              id="nfv-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_WEIGHT_KG}
              max={MAX_WEIGHT_KG}
              step="0.05"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nfv-day">
              Day of life (1 = day of birth)
            </label>
            <input
              id="nfv-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={day}
              onChange={(event) => setDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nfv-feeds">
              Feeds in 24 hours
            </label>
            <input
              id="nfv-feeds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_FEEDS_PER_DAY}
              max={MAX_FEEDS_PER_DAY}
              step="1"
              value={feeds}
              onChange={(event) => setFeeds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nfv-override">
              Prescribed intake (mL/kg/day, optional)
            </label>
            <input
              id="nfv-override"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="220"
              step="5"
              placeholder="Leave blank to use the standard ramp"
              value={override}
              onChange={(event) => setOverride(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[6, 7, 8, 10, 12].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setFeeds(String(count))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {count} feeds
            </button>
          ))}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated volume per feed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? ml(result.perFeedMl) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${oz(result.perFeedOz)} per feed across ${result.feedsPerDay} feeds a day`
                : "Fix the highlighted input to see an estimate."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the feeding volume estimate"
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <div className="mt-5 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.firstWeek && (
              <p>
                Day {result.dayOfLife} sits on the first-week ramp, so the target is lower than the
                steady {MAINTENANCE_ML_PER_KG} mL/kg/day used from about day 7 onwards.
              </p>
            )}
            {result.capApplies && (
              <p>
                Capped at {MAX_DAILY_ML_UNDER_6M} mL a day — the AAP notes formula-fed infants under
                six months rarely need more than that in 24 hours.
              </p>
            )}
            {result.aboveCapacity && (
              <p>
                This per-feed figure is above the typical stomach capacity for day{" "}
                {result.dayOfLife}. Smaller, more frequent feeds usually fit a newborn better.
              </p>
            )}
            {result.belowCapacity && (
              <p>
                This per-feed figure is below the typical stomach capacity for day{" "}
                {result.dayOfLife} — a normal pattern when feeds are very frequent.
              </p>
            )}
            {!result.usingOverride && !result.firstWeek && (
              <p>
                Past the first week the usual working range is {RANGE_LOW_ML_PER_KG}–
                {RANGE_HIGH_ML_PER_KG} mL/kg/day; babies vary within it day to day.
              </p>
            )}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for term babies only. Preterm infants and babies with reflux, cardiac,
        renal or growth concerns are fed to a prescribed plan. Breastfed babies feed to appetite and
        are not measured in millilitres. Weight gain, wet nappies and stool pattern are how intake is
        actually judged — speak to a paediatrician, midwife or health visitor with any concern.
      </p>
    </main>
  );
}
