"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";

import {
  LOADING_DAYS_MAX,
  LOADING_DAYS_MIN,
  MAX_DOSES_PER_DAY,
  NO_LOAD_SATURATION_DAYS,
  PROTOCOLS,
  buildCreatinePlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

/** Fixed so server and client render the same first paint; replaced on mount. */
const FALLBACK_START_DATE = "2026-01-01";

const DEFAULTS = {
  weight: "80",
  protocol: "loading",
  loadingDays: "5",
  doses: "4",
  tubGrams: "300",
  tubPrice: "",
  shownDays: "7",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [protocol, setProtocol] = useState(DEFAULTS.protocol);
  const [loadingDays, setLoadingDays] = useState(DEFAULTS.loadingDays);
  const [doses, setDoses] = useState(DEFAULTS.doses);
  const [startDate, setStartDate] = useState(FALLBACK_START_DATE);
  const [tubGrams, setTubGrams] = useState(DEFAULTS.tubGrams);
  const [tubPrice, setTubPrice] = useState(DEFAULTS.tubPrice);
  const [shownDays, setShownDays] = useState(DEFAULTS.shownDays);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStartDate(todayIso());
  }, []);

  const plan = useMemo(
    () =>
      buildCreatinePlan({
        bodyWeightKg: Number(weight),
        protocol,
        loadingDays: Number(loadingDays),
        dosesPerDay: Number(doses),
        startDate,
        tubGrams: tubGrams.trim() === "" ? 0 : Number(tubGrams),
        tubPrice: tubPrice.trim() === "" ? 0 : Number(tubPrice),
        maintenanceDaysShown: Number(shownDays),
      }),
    [weight, protocol, loadingDays, doses, startDate, tubGrams, tubPrice, shownDays],
  );

  const hasError = Boolean(plan.error);
  const show = (value) => (hasError ? DASH : value);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Creatine monohydrate plan",
      `Bodyweight: ${plan.weight} kg · ${plan.protocolLabel}`,
      plan.isLoading
        ? `Loading: ${plan.loadingDailyG} g/day for ${plan.loadingDays} days (${plan.perDoseG} g x ${plan.dosesPerDay} servings)`
        : "No loading phase",
      `Maintenance: ${plan.maintenanceDailyG} g/day (${plan.maintenanceScoops} level 5 g scoops)`,
      `Muscle stores saturated by: ${plan.saturationDate} (day ${plan.daysToSaturation})`,
      `Creatine used in the first 30 days: ${plan.first30DaysG} g`,
    ].join("\n");
  }, [hasError, plan]);

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
    setWeight(DEFAULTS.weight);
    setProtocol(DEFAULTS.protocol);
    setLoadingDays(DEFAULTS.loadingDays);
    setDoses(DEFAULTS.doses);
    setStartDate(todayIso());
    setTubGrams(DEFAULTS.tubGrams);
    setTubPrice(DEFAULTS.tubPrice);
    setShownDays(DEFAULTS.shownDays);
    setCopied(false);
  };

  const isLoadingProtocol = protocol === "loading";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Sports nutrition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Creatine Loading Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out your loading and maintenance doses of creatine monohydrate from bodyweight, split
          them across servings, and print a dated schedule you can follow day by day.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-weight">
              Bodyweight (kg)
            </label>
            <input
              id="cr-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="250"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-protocol">
              Protocol
            </label>
            <select
              id="cr-protocol"
              className={`mt-2 ${INPUT_CLASS}`}
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
            >
              {PROTOCOLS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-days">
              Loading days ({LOADING_DAYS_MIN}-{LOADING_DAYS_MAX})
            </label>
            <input
              id="cr-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LOADING_DAYS_MIN}
              max={LOADING_DAYS_MAX}
              step="1"
              value={loadingDays}
              disabled={!isLoadingProtocol}
              onChange={(event) => setLoadingDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-doses">
              Servings per day while loading
            </label>
            <input
              id="cr-doses"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_DOSES_PER_DAY}
              step="1"
              value={doses}
              disabled={!isLoadingProtocol}
              onChange={(event) => setDoses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-start">
              Start date
            </label>
            <input
              id="cr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-shown">
              Maintenance days to list
            </label>
            <input
              id="cr-shown"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={shownDays}
              onChange={(event) => setShownDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-tub">
              Tub size (g, optional)
            </label>
            <input
              id="cr-tub"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20000"
              step="50"
              value={tubGrams}
              onChange={(event) => setTubGrams(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-price">
              Tub price (optional)
            </label>
            <input
              id="cr-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="Any currency"
              value={tubPrice}
              onChange={(event) => setTubPrice(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError || plan.isLoading ? "Loading dose per day" : "Daily dose"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(`${plan.isLoading ? plan.loadingDailyG : plan.maintenanceDailyG} g`)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : plan.isLoading
                  ? `${plan.perDoseG} g x ${plan.dosesPerDay} servings, for ${plan.loadingDays} days`
                  : `${plan.maintenanceScoops} level 5 g scoops, every day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the creatine dosing plan"
              className={GHOST_BTN}
              disabled={hasError}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Loading phase",
              hasError ? DASH : plan.isLoading ? `${plan.loadingDays} days, ${plan.loadingTotalG} g total` : "Skipped",
            ],
            ["Maintenance dose", show(`${plan.maintenanceDailyG} g/day (${plan.maintenanceScoops} scoops)`)],
            ["Level 5 g scoops per loading day", show(plan.isLoading ? plan.loadingScoops : DASH)],
            ["Muscle stores saturated by", show(`${plan.saturationDate} (day ${plan.daysToSaturation})`)],
            ["Creatine used in the first 30 days", show(`${NUM.format(plan.first30DaysG)} g`)],
            [
              "Days one tub lasts",
              hasError ? DASH : plan.daysPerTub === null ? "Enter a tub size" : `${plan.daysPerTub} days`,
            ],
            [
              "Cost per maintenance day",
              hasError ? DASH : plan.costPerDay === null ? "Enter a tub price" : NUM.format(plan.costPerDay),
            ],
            [
              "Cost of the first 30 days",
              hasError ? DASH : plan.costFirst30Days === null ? "Enter a tub price" : NUM.format(plan.costFirst30Days),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.maintenanceRaised && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            The weight-based maintenance figure came out below 3 g, so it has been raised to the 3 g
            per day floor that most guidance uses.
          </p>
        )}
        {!hasError && !plan.isLoading && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            Skipping the loading phase reaches the same muscle saturation, it just takes about{" "}
            {NO_LOAD_SATURATION_DAYS} days instead of {LOADING_DAYS_MIN}-{LOADING_DAYS_MAX}.
          </p>
        )}
        {!hasError && plan.isLoading && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            Expect roughly {plan.waterGainKgMin}-{plan.waterGainKgMax} kg of scale weight during
            loading — this is intracellular water, not fat. Splitting the dose across{" "}
            {plan.dosesPerDay} servings with food reduces stomach upset.
          </p>
        )}
      </section>

      {!hasError && plan.schedule.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Dated schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Day</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Phase</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per serving</th>
                  <th scope="col" className="py-2 text-right font-semibold">Daily total</th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((row) => (
                  <tr key={row.date} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.day}</td>
                    <td className="py-2 pr-3">{row.date}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.phase}</td>
                    <td className="py-2 pr-3 text-right">
                      {row.perDoseG} g x {row.doses}
                    </td>
                    <td className="py-2 text-right font-semibold">{row.dailyG} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Creatine monohydrate is well studied in healthy adults, but check with a
        doctor before supplementing if you have kidney disease, are pregnant or breastfeeding, are
        under 18, or take prescription medication.
      </p>
    </main>
  );
}
