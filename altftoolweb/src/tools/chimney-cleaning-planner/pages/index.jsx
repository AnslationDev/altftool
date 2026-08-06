"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wind } from "lucide-react";

import {
  AUTO_CLEAN_CYCLE_DAYS,
  COOKING_STYLES,
  COSTS,
  FILTER_TYPES,
  planChimneyCare,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// Local calendar date, not UTC — toISOString() reads the UTC date, which is still
// "yesterday" in IST (UTC+5:30) for the first 5.5 hours of every local day. This
// tool's audience is Indian kitchens, so the "today" default must track local time.
const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  const [filterType, setFilterType] = useState("baffle");
  const [cookingStyle, setCookingStyle] = useState("mixed");
  const [hoursPerDay, setHoursPerDay] = useState("2");
  const [burners, setBurners] = useState("2");
  const [autoClean, setAutoClean] = useState(true);
  const [ductless, setDuctless] = useState(false);
  const [lengthFt, setLengthFt] = useState("10");
  const [widthFt, setWidthFt] = useState("8");
  const [heightFt, setHeightFt] = useState("10");
  const [ratedSuction, setRatedSuction] = useState("1200");
  const [lastCleaned, setLastCleaned] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const parse = (raw) => (String(raw).trim() === "" ? NaN : Number(raw));
    return planChimneyCare({
      filterType,
      hoursPerDay: parse(hoursPerDay),
      cookingStyle,
      burners: parse(burners),
      autoClean,
      ductless,
      kitchenLengthFt: parse(lengthFt),
      kitchenWidthFt: parse(widthFt),
      kitchenHeightFt: parse(heightFt),
      ratedSuction: parse(ratedSuction),
      lastCleanedIso: lastCleaned,
    });
  }, [
    filterType,
    hoursPerDay,
    cookingStyle,
    burners,
    autoClean,
    ductless,
    lengthFt,
    widthFt,
    heightFt,
    ratedSuction,
    lastCleaned,
  ]);

  const ok = !plan.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Kitchen Chimney Care Plan",
      `${plan.filterLabel} · ${plan.styleLabel}`,
      `Clean the filter every ${plan.filterIntervalDays} days (${plan.filterCleansPerYear} times a year)`,
      plan.nextFilterCleanIso ? `Next filter clean due: ${prettyDate(plan.nextFilterCleanIso)}` : null,
      plan.autoCleanCycleDays ? `Run the auto-clean heat cycle every ${plan.autoCleanCycleDays} days` : null,
      plan.charcoalIntervalDays ? `Replace charcoal filters every ${plan.charcoalIntervalDays} days` : null,
      `Professional deep service every ${plan.serviceIntervalDays} days`,
      plan.ductIntervalDays ? `Duct cleaning every ${plan.ductIntervalDays} days` : null,
      `Yearly cost: ${money(plan.annualCostDiy)} doing filters yourself, ${money(plan.annualCostPro)} paying for every clean`,
      `Suction needed for this kitchen: ${plan.requiredSuction} m³/hr`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, plan]);

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
    setFilterType("baffle");
    setCookingStyle("mixed");
    setHoursPerDay("2");
    setBurners("2");
    setAutoClean(true);
    setDuctless(false);
    setLengthFt("10");
    setWidthFt("8");
    setHeightFt("10");
    setRatedSuction("1200");
    setLastCleaned(todayIso());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Chimney Cleaning Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Filter cleaning intervals depend on how much you actually fry, not on the calendar. This
          planner works out your grease load, sets the interval, dates the next few cleans and checks
          whether the chimney is powerful enough for your kitchen.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ch-filter">
              Filter type
            </label>
            <select
              id="ch-filter"
              className={`mt-2 ${INPUT_CLASS}`}
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
            >
              {FILTER_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ch-style">
              Cooking style
            </label>
            <select
              id="ch-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cookingStyle}
              onChange={(event) => setCookingStyle(event.target.value)}
            >
              {COOKING_STYLES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-hours">
              Cooking hours a day under the hood
            </label>
            <input
              id="ch-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="16"
              step="0.25"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-burners">
              Burners usually running
            </label>
            <input
              id="ch-burners"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={burners}
              onChange={(event) => setBurners(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-last">
              Filters last cleaned on
            </label>
            <input
              id="ch-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastCleaned}
              onChange={(event) => setLastCleaned(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-suction">
              Rated suction (m³/hr, 0 if unknown)
            </label>
            <input
              id="ch-suction"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="5000"
              step="50"
              value={ratedSuction}
              onChange={(event) => setRatedSuction(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">Kitchen size</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-len">
              Length (ft)
            </label>
            <input
              id="ch-len"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="60"
              step="0.5"
              value={lengthFt}
              onChange={(event) => setLengthFt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-wid">
              Width (ft)
            </label>
            <input
              id="ch-wid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="60"
              step="0.5"
              value={widthFt}
              onChange={(event) => setWidthFt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ch-hei">
              Ceiling height (ft)
            </label>
            <input
              id="ch-hei"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="60"
              step="0.5"
              value={heightFt}
              onChange={(event) => setHeightFt(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            htmlFor="ch-auto"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="ch-auto"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={autoClean}
              onChange={(event) => setAutoClean(event.target.checked)}
            />
            <span>Has an auto-clean heat cycle</span>
          </label>
          <label
            htmlFor="ch-ductless"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="ch-ductless"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={ductless}
              onChange={(event) => setDuctless(event.target.checked)}
            />
            <span>Ductless / recirculating (uses charcoal filters)</span>
          </label>
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
          <div role="status" aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Clean the filters every
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${plan.filterIntervalDays} days` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Next due ${prettyDate(plan.nextFilterCleanIso)} · ${NUM1.format(plan.filterCleansPerYear)} cleans a year`
                : "Fix the inputs above to get a schedule"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={copied ? "Copied" : "Copy chimney care plan"}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" role="status" aria-live="polite" aria-atomic="true">
          {[
            ["Grease load", ok ? `${NUM1.format(plan.loadPerDay)} load units a day` : DASH],
            [
              "Auto-clean heat cycle",
              ok ? (plan.autoCleanCycleDays ? `Every ${AUTO_CLEAN_CYCLE_DAYS} days` : "Not fitted") : DASH,
            ],
            [
              "Charcoal filter replacement",
              ok ? (plan.charcoalIntervalDays ? `Every ${plan.charcoalIntervalDays} days` : "Not applicable — ducted") : DASH,
            ],
            ["Professional deep service", ok ? `Every ${plan.serviceIntervalDays} days` : DASH],
            [
              "Duct cleaning",
              ok ? (plan.ductIntervalDays ? `Every ${plan.ductIntervalDays} days` : "Not applicable — ductless") : DASH,
            ],
            ["Yearly cost, filters cleaned at home", ok ? money(plan.annualCostDiy) : DASH],
            ["Yearly cost, everything outsourced", ok ? money(plan.annualCostPro) : DASH],
            ["Saved by soaking filters yourself", ok ? money(plan.savingByDoingItYourself) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{plan.filterNote}</p>
        ) : null}
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Is the chimney powerful enough?</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm" role="status" aria-live="polite" aria-atomic="true">
              {[
                ["Kitchen volume", `${NUM0.format(plan.volumeCuFt)} cu ft (${NUM1.format(plan.volumeM3)} m³)`],
                ["Air changes assumed", `${plan.airChangesUsed} per hour`],
                ["Suction needed", `${NUM0.format(plan.requiredSuction)} m³/hr`],
                [
                  "Your chimney",
                  plan.suctionKnown ? `${NUM0.format(plan.ratedSuction)} m³/hr` : "Not entered",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {plan.suctionKnown ? (
              <p
                role="status"
                aria-live="polite"
                className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                  plan.suctionAdequate
                    ? "bg-[var(--muted)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                {plan.suctionAdequate
                  ? "Rated suction meets the requirement for this kitchen and cooking style."
                  : `Short by about ${NUM0.format(plan.suctionShortfall)} m³/hr. Expect smoke escaping the hood and faster grease build-up on walls.`}
              </p>
            ) : null}
          </section>

          {plan.upcomingFilterCleans.length > 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Next six filter cleans</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {plan.upcomingFilterCleans.map((iso, index) => (
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
        Intervals are derived from manufacturer guidance — roughly monthly baffle-filter cleaning at
        typical Indian cooking loads — scaled by your own cooking hours and frying intensity. Costs
        assume about {money(COSTS.proFilterClean)} for a paid filter clean and{" "}
        {money(COSTS.deepService)} for a deep service, and vary by city. Switch the chimney off at
        the wall before removing filters, and let hot filters cool before soaking them.
      </p>
    </main>
  );
}
