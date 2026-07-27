"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  CITY_TIERS,
  DISINFECTION_PPM,
  LID_CONDITIONS,
  LPCD_NORM,
  MIN_RESIDUAL_CHLORINE_MGL,
  TANK_TYPES,
  WATER_SOURCES,
  planTankCleaning,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const todayIso = () => new Date().toISOString().slice(0, 10);

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const [year, month, day] = iso.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function ToolHome() {
  const [capacity, setCapacity] = useState("2000");
  const [tankType, setTankType] = useState("plastic");
  const [waterSource, setWaterSource] = useState("municipal");
  const [lidCondition, setLidCondition] = useState("sealed");
  const [cityTier, setCityTier] = useState("tier1");
  const [persons, setPersons] = useState("4");
  const [includeGst, setIncludeGst] = useState(true);
  const [lastCleaned, setLastCleaned] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const parse = (raw) => (String(raw).trim() === "" ? NaN : Number(raw));
    return planTankCleaning({
      capacityLitres: parse(capacity),
      tankType,
      waterSource,
      lidCondition,
      cityTier,
      persons: parse(persons),
      includeGst,
      lastCleanedIso: lastCleaned,
    });
  }, [capacity, tankType, waterSource, lidCondition, cityTier, persons, includeGst, lastCleaned]);

  const ok = !plan.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Water Tank Cleaning Plan",
      `${capacity} L ${plan.tankLabel} · ${plan.sourceLabel}`,
      `Clean every ${plan.intervalMonths} months (${plan.intervalDays} days), ${plan.cleansPerYear} times a year`,
      plan.nextDueIso ? `Next clean due: ${prettyDate(plan.nextDueIso)}` : null,
      `Cost per clean: ${money(plan.costPerClean)} · per year ${money(plan.annualCost)}`,
      `Disinfection: ${plan.powderGrams} g of bleaching powder to reach ${DISINFECTION_PPM} mg/L, ${plan.contactHours} hours contact`,
      `Storage lasts about ${plan.storageDays} days for ${persons} people at ${LPCD_NORM} litres per person per day`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, plan, capacity, persons]);

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
    setCapacity("2000");
    setTankType("plastic");
    setWaterSource("municipal");
    setLidCondition("sealed");
    setCityTier("tier1");
    setPersons("4");
    setIncludeGst(true);
    setLastCleaned(todayIso());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Water Tank Cleaning Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Starts from the twice-a-year baseline for treated municipal supply, then shortens the
          interval for borewell water, concrete tanks, sumps and lids that do not seal. You also get
          the cost, the rinse water used and the exact bleaching-powder dose for disinfection.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-capacity">
              Tank capacity (litres)
            </label>
            <input
              id="wt-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="200000"
              step="100"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-persons">
              People served
            </label>
            <input
              id="wt-persons"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              step="1"
              value={persons}
              onChange={(event) => setPersons(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-type">
              Tank type
            </label>
            <select
              id="wt-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tankType}
              onChange={(event) => setTankType(event.target.value)}
            >
              {TANK_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-source">
              Water source
            </label>
            <select
              id="wt-source"
              className={`mt-2 ${INPUT_CLASS}`}
              value={waterSource}
              onChange={(event) => setWaterSource(event.target.value)}
            >
              {WATER_SOURCES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-lid">
              Lid condition
            </label>
            <select
              id="wt-lid"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lidCondition}
              onChange={(event) => setLidCondition(event.target.value)}
            >
              {LID_CONDITIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-tier">
              City tier
            </label>
            <select
              id="wt-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cityTier}
              onChange={(event) => setCityTier(event.target.value)}
            >
              {CITY_TIERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-last">
              Last cleaned on
            </label>
            <input
              id="wt-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastCleaned}
              onChange={(event) => setLastCleaned(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="wt-gst"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id="wt-gst"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={includeGst}
                onChange={(event) => setIncludeGst(event.target.checked)}
              />
              <span>Add 18% GST (SAC 998533)</span>
            </label>
          </div>
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Clean the tank every
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${plan.intervalMonths} months` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Next due ${prettyDate(plan.nextDueIso)} · ${plan.cleansPerYear} cleans a year`
                : "Fix the inputs above to get a schedule"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy water tank cleaning plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cost per clean", ok ? money(plan.costPerClean) : DASH],
            ["GST included", ok ? (plan.gstRate > 0 ? money(plan.gstAmount) : "Not charged") : DASH],
            ["Cost per year", ok ? money(plan.annualCost) : DASH],
            ["Cost per 1,000 litres of capacity", ok ? money(plan.costPerThousandLitres) : DASH],
            ["Rinse water used per clean", ok ? `${NUM0.format(plan.rinseLitres)} litres` : DASH],
            ["Rinse water per year", ok ? `${NUM0.format(plan.rinseLitresPerYear)} litres` : DASH],
            [
              "Storage at CPHEEO norm",
              ok ? `${NUM1.format(plan.storageDays)} days for ${persons} people` : DASH,
            ],
            ["Daily demand at norm", ok ? `${NUM0.format(plan.dailyDemand)} litres` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && plan.intervalFloored ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Your combination of water source, tank type and lid condition points to an even shorter
            cycle. The interval is held at three months, the practical floor for domestic tanks —
            fixing the lid or filtering the inlet is a better answer than cleaning more often.
          </p>
        ) : null}
        {ok && !plan.storageAdequate ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            This tank holds less than one day of water for {persons} people at the CPHEEO norm of{" "}
            {LPCD_NORM} litres per person per day. Any interruption in supply will be felt the same day.
          </p>
        ) : null}
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Disinfection dose</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Bleaching powder per clean", `${NUM0.format(plan.powderGrams)} g`],
                ["Bleaching powder per year", `${NUM0.format(plan.powderGramsPerYear)} g`],
                ["Target free chlorine", `${DISINFECTION_PPM} mg/L`],
                ["Contact time before flushing", `${plan.contactHours} hours`],
                ["Residual at the tap after flushing", `at least ${MIN_RESIDUAL_CHLORINE_MGL} mg/L`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Dissolve the powder in a bucket of water, let the grit settle, pour the clear solution
              into the filled tank, hold for {plan.contactHours} hours, then drain and refill before
              anyone drinks from it. Doses assume bleaching powder with 33% available chlorine —
              check the label, because a weaker grade needs proportionally more.
            </p>
          </section>

          {plan.upcoming.length > 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Next four cleans</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {plan.upcoming.map((iso, index) => (
                  <li
                    key={iso}
                    className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <span className="text-[var(--muted-foreground)]">Clean {index + 1}</span>
                    <span className="font-semibold">{prettyDate(iso)}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Intervals follow the standard guidance that domestic storage tanks be cleaned at least twice
        a year, shortened for untreated sources and poor sealing. Underground sumps are confined
        spaces — never enter one without ventilation, a standby person and, where required, a
        breathing set. This is general information, not a substitute for a water quality test.
      </p>
    </main>
  );
}
