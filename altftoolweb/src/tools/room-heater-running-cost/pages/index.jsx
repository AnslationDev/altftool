"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heater, RotateCcw } from "lucide-react";

import { HEATER_TYPES, buildHeaterTypeComparison, computeHeaterCost } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const DEFAULTS = {
  heaterTypeId: "fan-blower",
  ratedWatts: "2000",
  hoursPerDay: "6",
  count: "1",
  daysPerMonth: "30",
  winterMonths: "3",
  tariffPerKwh: "8",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function Field({ id, label, value, onChange, min, max, step, hint }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [heaterTypeId, setHeaterTypeId] = useState(DEFAULTS.heaterTypeId);
  const [ratedWatts, setRatedWatts] = useState(DEFAULTS.ratedWatts);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [count, setCount] = useState(DEFAULTS.count);
  const [daysPerMonth, setDaysPerMonth] = useState(DEFAULTS.daysPerMonth);
  const [winterMonths, setWinterMonths] = useState(DEFAULTS.winterMonths);
  const [tariffPerKwh, setTariffPerKwh] = useState(DEFAULTS.tariffPerKwh);
  const [copied, setCopied] = useState(false);

  const input = useMemo(
    () => ({
      heaterTypeId,
      ratedWatts: toNumber(ratedWatts),
      hoursPerDay: toNumber(hoursPerDay),
      count: toNumber(count),
      daysPerMonth: toNumber(daysPerMonth),
      winterMonths: toNumber(winterMonths),
      tariffPerKwh: toNumber(tariffPerKwh),
    }),
    [heaterTypeId, ratedWatts, hoursPerDay, count, daysPerMonth, winterMonths, tariffPerKwh],
  );

  const result = useMemo(() => computeHeaterCost(input), [input]);
  const hasError = Boolean(result.error);

  const comparison = useMemo(
    () =>
      hasError
        ? { rows: [] }
        : buildHeaterTypeComparison({
            heatKwhPerDay: result.heatDeliveredKwhPerDay,
            daysPerMonth: input.daysPerMonth,
            winterMonths: input.winterMonths,
            tariffPerKwh: input.tariffPerKwh,
          }),
    [hasError, result.heatDeliveredKwhPerDay, input.daysPerMonth, input.winterMonths, input.tariffPerKwh],
  );

  const changeType = (id) => {
    setHeaterTypeId(id);
    const heater = HEATER_TYPES[id];
    if (heater) setRatedWatts(String(heater.defaultWatts));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Room Heater Running Cost",
      `Heater: ${result.heaterLabel}, ${num(input.ratedWatts)} W × ${num(input.count)}`,
      `Running: ${num(input.hoursPerDay)} hours a day`,
      `Electricity: ${num(result.kwhPerDay)} units a day`,
      `Cost per hour: ${money2(result.costPerHour)}`,
      `Cost per day: ${money(result.costPerDay)}`,
      `Cost per month: ${money(result.monthlyCost)}`,
      `Cost for the ${num(input.winterMonths)}-month season: ${money(result.seasonCost)}`,
    ].join("\n");
  }, [hasError, result, input.ratedWatts, input.count, input.hoursPerDay, input.winterMonths]);

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
    setHeaterTypeId(DEFAULTS.heaterTypeId);
    setRatedWatts(DEFAULTS.ratedWatts);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setCount(DEFAULTS.count);
    setDaysPerMonth(DEFAULTS.daysPerMonth);
    setWinterMonths(DEFAULTS.winterMonths);
    setTariffPerKwh(DEFAULTS.tariffPerKwh);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Connected load", `${num(result.connectedLoadKw)} kW · about ${num(result.currentAmps)} A at 230 V`],
        ["Element on-time", `${num(result.dutyCycle * 100)}% of the running hours`],
        ["Electricity per day", `${num(result.kwhPerDay)} kWh`],
        ["Heat delivered per day", `${num(result.heatDeliveredKwhPerDay)} kWh (COP ${num(result.cop)})`],
        ["Cost per hour of running", money2(result.costPerHour)],
        ["Cost per day", money(result.costPerDay)],
        ["Units per month", `${num(result.monthlyKwh)} kWh`],
        ["Cost per month", money(result.monthlyCost)],
        ["Units for the season", `${num(result.seasonKwh)} kWh`],
        ["Cost for the season", money(result.seasonCost)],
        ["Cost per kWh of heat delivered", money2(result.costPerKwhOfHeat)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Heater className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Room Heater Running Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What a winter of heating costs, and why every resistive heater costs exactly the same per
          unit of warmth while a reverse-cycle AC does not.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rh-type">
              Heater type
            </label>
            <select
              id="rh-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={heaterTypeId}
              onChange={(event) => changeType(event.target.value)}
            >
              {Object.values(HEATER_TYPES).map((heater) => (
                <option key={heater.id} value={heater.id}>
                  {heater.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            id="rh-watts"
            label="Rated wattage (W)"
            value={ratedWatts}
            onChange={setRatedWatts}
            min="1"
            max="5000"
            step="100"
            hint="For an AC in heat mode, use its rated power input."
          />
          <Field
            id="rh-hours"
            label="Hours switched on per day"
            value={hoursPerDay}
            onChange={setHoursPerDay}
            min="0"
            max="24"
            step="0.5"
          />
          <Field
            id="rh-count"
            label="How many heaters"
            value={count}
            onChange={setCount}
            min="1"
            max="20"
            step="1"
          />
          <Field
            id="rh-days"
            label="Days used per month"
            value={daysPerMonth}
            onChange={setDaysPerMonth}
            min="1"
            max="31"
            step="1"
          />
          <Field
            id="rh-months"
            label="Months of heating season"
            value={winterMonths}
            onChange={setWinterMonths}
            min="1"
            max="12"
            step="1"
          />
          <Field
            id="rh-tariff"
            label="Electricity tariff (₹ per unit)"
            value={tariffPerKwh}
            onChange={setTariffPerKwh}
            min="0"
            step="0.25"
            hint="Heating sits on top of your normal use, so pick your top slab rate."
          />
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
              Cost for the season
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : money(result.seasonCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${money(result.costPerDay)} a day · ${money(result.monthlyCost)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy room heater running cost result"
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
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">—</dd>
            </div>
          ) : (
            breakdown.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))
          )}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.heaterNote}
          </p>
        )}
      </section>

      {!hasError && comparison.rows.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Same warmth, different appliance</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Cost of delivering the {num(result.heatDeliveredKwhPerDay)} kWh of heat your current
            setting produces each day.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Appliance</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Units/day</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per day</th>
                  <th scope="col" className="py-2 text-right font-semibold">Season</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.label}
                      {row.id === comparison.cheapestId && (
                        <span className="ml-2 text-xs font-semibold text-[var(--success)]">cheapest</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num(row.electricityKwhPerDay)}
                    </td>
                    <td className="py-2 pr-3 text-right">{money2(row.costPerDay)}</td>
                    <td className="py-2 text-right">{money(row.seasonCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            The four resistive rows are identical because every one of them turns a unit of
            electricity into exactly one unit of heat. What changes between them is comfort, speed
            and how often the thermostat cuts in — not efficiency.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Duty cycles are typical values; a badly insulated or draughty room keeps the element on
        longer. Check that the socket and wiring are rated for the connected load before running two
        heaters on one circuit, and never leave a radiant heater unattended near fabric.
      </p>
    </main>
  );
}
