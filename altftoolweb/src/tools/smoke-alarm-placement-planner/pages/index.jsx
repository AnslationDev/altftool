"use client";

import { useMemo, useState } from "react";
import { AlarmSmoke, Check, Copy, RotateCcw } from "lucide-react";

import { ALARM_LIFE_YEARS, planAlarms } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const currentYearUtc = () => new Date().getUTCFullYear();

const DEFAULTS = {
  bedrooms: "3",
  sleepingAreas: "1",
  bedroomLevels: "1",
  levelsAboveGround: "2",
  hasBasement: false,
  hasFuelBurning: true,
  unitPrice: "1200",
  manufactureYear: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [year] = useState(currentYearUtc);
  const [bedrooms, setBedrooms] = useState(DEFAULTS.bedrooms);
  const [sleepingAreas, setSleepingAreas] = useState(DEFAULTS.sleepingAreas);
  const [bedroomLevels, setBedroomLevels] = useState(DEFAULTS.bedroomLevels);
  const [levelsAboveGround, setLevelsAboveGround] = useState(DEFAULTS.levelsAboveGround);
  const [hasBasement, setHasBasement] = useState(DEFAULTS.hasBasement);
  const [hasFuelBurning, setHasFuelBurning] = useState(DEFAULTS.hasFuelBurning);
  const [unitPrice, setUnitPrice] = useState(DEFAULTS.unitPrice);
  const [manufactureYear, setManufactureYear] = useState(DEFAULTS.manufactureYear);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planAlarms({
        bedrooms: bedrooms === "" ? 0 : Number(bedrooms),
        sleepingAreas: sleepingAreas === "" ? 0 : Number(sleepingAreas),
        bedroomLevels: bedroomLevels === "" ? 0 : Number(bedroomLevels),
        levelsAboveGround: levelsAboveGround === "" ? 0 : Number(levelsAboveGround),
        hasBasement,
        hasFuelBurning,
        unitPrice: unitPrice === "" ? 0 : Number(unitPrice),
        manufactureYear: manufactureYear === "" ? 0 : Number(manufactureYear),
        currentYear: year,
      }),
    [
      bedrooms,
      sleepingAreas,
      bedroomLevels,
      levelsAboveGround,
      hasBasement,
      hasFuelBurning,
      unitPrice,
      manufactureYear,
      year,
    ],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      "Smoke and CO alarm plan",
      `Smoke alarms: ${result.smokeAlarms}`,
      ...result.smokeByLocation.map((row) => `  ${row.count} — ${row.location}`),
      `CO alarms: ${result.coAlarms}`,
      ...result.coByLocation.map((row) => `  ${row.count} — ${row.location}`),
      result.totalCost === null ? "" : `Estimated cost: ${INR.format(result.totalCost)}`,
      result.replacement ? `Replacement: ${result.replacement.message}` : "",
      "",
      "Mounting rules:",
      ...result.placementRules.map((rule) => `- ${rule.title}: ${rule.rule}`),
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBedrooms(DEFAULTS.bedrooms);
    setSleepingAreas(DEFAULTS.sleepingAreas);
    setBedroomLevels(DEFAULTS.bedroomLevels);
    setLevelsAboveGround(DEFAULTS.levelsAboveGround);
    setHasBasement(DEFAULTS.hasBasement);
    setHasFuelBurning(DEFAULTS.hasFuelBurning);
    setUnitPrice(DEFAULTS.unitPrice);
    setManufactureYear(DEFAULTS.manufactureYear);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlarmSmoke className="h-4 w-4" aria-hidden="true" />
          Home safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Smoke Alarm Placement Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One alarm inside every bedroom, one outside each sleeping area, one on every level — the
          NFPA 72 coverage rule, counted for your layout, with the mounting distances for ceilings,
          walls, peaked ceilings and the areas to keep clear.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-bedrooms">
              Bedrooms
            </label>
            <input
              id="sa-bedrooms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-areas">
              Separate sleeping areas
            </label>
            <input
              id="sa-areas"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={sleepingAreas}
              onChange={(event) => setSleepingAreas(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Count the hallways or landings that serve bedrooms. Bedrooms off one corridor are a
              single sleeping area.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-levels">
              Levels at or above ground
            </label>
            <input
              id="sa-levels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={levelsAboveGround}
              onChange={(event) => setLevelsAboveGround(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-bedlevels">
              Levels that contain bedrooms
            </label>
            <input
              id="sa-bedlevels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              step="1"
              value={bedroomLevels}
              onChange={(event) => setBedroomLevels(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-price">
              Price per alarm (₹)
            </label>
            <input
              id="sa-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100000"
              step="100"
              value={unitPrice}
              onChange={(event) => setUnitPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sa-made">
              Manufacture year on existing alarms
            </label>
            <input
              id="sa-made"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1980"
              max={year + 1}
              step="1"
              placeholder="Leave blank if new"
              value={manufactureYear}
              onChange={(event) => setManufactureYear(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label
            htmlFor="sa-basement"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
          >
            <input
              id="sa-basement"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={hasBasement}
              onChange={(event) => setHasBasement(event.target.checked)}
            />
            <span>There is a basement or cellar</span>
          </label>
          <label
            htmlFor="sa-fuel"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
          >
            <input
              id="sa-fuel"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={hasFuelBurning}
              onChange={(event) => setHasFuelBurning(event.target.checked)}
            />
            <span>There is a fuel-burning appliance or an attached garage (needs CO alarms)</span>
          </label>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Smoke alarms needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.smokeAlarms)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to build the plan."
                : `Across ${NUM.format(result.totalLevels)} level(s), plus ${NUM.format(result.coAlarms)} CO alarm(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the alarm plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Smoke alarms", hasError ? DASH : NUM.format(result.smokeAlarms)],
            ["Carbon monoxide alarms", hasError ? DASH : NUM.format(result.coAlarms)],
            ["Total units to buy", hasError ? DASH : NUM.format(result.totalAlarms)],
            ["Levels in the home", hasError ? DASH : NUM.format(result.totalLevels)],
            ["Levels needing their own alarm", hasError ? DASH : NUM.format(result.levelsWithoutSleeping)],
            [
              "Estimated cost",
              hasError ? DASH : result.totalCost === null ? "Enter a price above" : INR.format(result.totalCost),
            ],
            [
              "Replacement due",
              hasError ? DASH : result.replacement ? String(result.replacement.dueYear) : "Enter a manufacture year",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.replacement ? (
          <p
            role={result.replacement.overdue ? "alert" : undefined}
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.replacement.overdue
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.replacement.message} Alarms are replaced {ALARM_LIFE_YEARS} years from the
            manufacture date printed on the back, not from the day they were fitted.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where they go</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Location
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...result.smokeByLocation.map((row) => ({ ...row, type: "Smoke" })),
                  ...result.coByLocation.map((row) => ({ ...row, type: "Carbon monoxide" })),
                ].map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.location}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{row.note}</span>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold text-[var(--primary)]">
                      {NUM.format(row.count)}
                    </td>
                    <td className="py-2 whitespace-nowrap text-[var(--muted-foreground)]">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Mounting rules</h2>
        <div className="mt-3 grid gap-3">
          {(hasError ? [] : result.placementRules).map((rule) => (
            <div key={rule.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="text-sm font-semibold">{rule.title}</p>
              <p className="mt-1 text-sm">{rule.rule}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{rule.why}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational information, not a code compliance check. Building regulations differ by country
        and state, and new or rewired homes usually require mains-powered, interconnected alarms with
        battery backup. Test every alarm monthly, and never remove one to stop nuisance alarms — move
        it or change the sensor type instead.
      </p>
    </main>
  );
}
