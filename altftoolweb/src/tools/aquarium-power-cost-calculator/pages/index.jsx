"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fish, RotateCcw } from "lucide-react";

import { COVER_FACTORS, computeAquariumCost } from "../lib";

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
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const num0 = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");

const DEFAULTS = {
  volumeLitres: "100",
  coverId: "covered",
  tankTempC: "26",
  roomTempC: "22",
  heaterWatts: "100",
  filterWatts: "12",
  filterHours: "24",
  airPumpWatts: "4",
  airPumpHours: "24",
  lightWatts: "18",
  lightHours: "8",
  otherWatts: "0",
  otherHours: "24",
  daysPerMonth: "30",
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
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (value) => setState((current) => ({ ...current, [key]: value }));

  const input = useMemo(
    () => ({
      volumeLitres: toNumber(state.volumeLitres),
      coverId: state.coverId,
      tankTempC: toNumber(state.tankTempC),
      roomTempC: toNumber(state.roomTempC),
      heaterWatts: toNumber(state.heaterWatts),
      filterWatts: toNumber(state.filterWatts),
      filterHours: toNumber(state.filterHours),
      airPumpWatts: toNumber(state.airPumpWatts),
      airPumpHours: toNumber(state.airPumpHours),
      lightWatts: toNumber(state.lightWatts),
      lightHours: toNumber(state.lightHours),
      otherWatts: toNumber(state.otherWatts),
      otherHours: toNumber(state.otherHours),
      daysPerMonth: toNumber(state.daysPerMonth),
      tariffPerKwh: toNumber(state.tariffPerKwh),
    }),
    [state],
  );

  const result = useMemo(() => computeAquariumCost(input), [input]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Aquarium Power Cost",
      `Tank: ${num0(input.volumeLitres)} L, held at ${num(input.tankTempC)} °C in a ${num(input.roomTempC)} °C room`,
      `Steady heat loss: ${num(result.steadyHeatLossW)} W (heater duty ${num0(result.heaterDuty * 100)}%)`,
      `Electricity: ${num(result.kwhPerDay)} units a day, ${num(result.monthlyKwh)} a month`,
      `Cost: ${money(result.monthlyCost)} a month, ${money(result.annualCost)} a year`,
      "",
      "By equipment:",
    ];
    for (const device of result.ranked) {
      lines.push(`  ${device.label} — ${num(device.monthlyKwh)} kWh, ${money(device.monthlyCost)} a month`);
    }
    return lines.join("\n");
  }, [hasError, result, input.volumeLitres, input.tankTempC, input.roomTempC]);

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
    setState(DEFAULTS);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Temperature to hold above the room", `${num(result.deltaT)} °C`],
        ["Heat loss coefficient", `${num(result.lossPerK)} W per °C`],
        ["Steady heat loss", `${num(result.steadyHeatLossW)} W`],
        ["Heater duty cycle", `${num0(result.heaterDuty * 100)}% of the time`],
        ["Average heater draw", `${num(result.heaterAverageW)} W`],
        [
          "Suggested heater size",
          result.recommendedHeaterW === null
            ? "Over 300 W — use two heaters"
            : result.recommendedHeaterW > 0
              ? `${num0(result.recommendedHeaterW)} W`
              : "No heating needed at these temperatures",
        ],
        ["Electricity per day", `${num(result.kwhPerDay)} kWh`],
        ["Units per month", `${num(result.monthlyKwh)} kWh`],
        ["Cost per month", money(result.monthlyCost)],
        ["Cost per year", money(result.annualCost)],
        ["Cost per litre of tank, per month", money2(result.costPerLitrePerMonth)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fish className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Aquarium Power Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Filter, air pump and light are simple watt-hours. The heater is worked out from how fast
          the tank loses heat to the room, which is what actually sets its bill.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The tank
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            id="aq-volume"
            label="Tank volume (litres)"
            value={state.volumeLitres}
            onChange={set("volumeLitres")}
            min="1"
            step="10"
          />
          <div>
            <label className={LABEL_CLASS} htmlFor="aq-cover">
              Top cover
            </label>
            <select
              id="aq-cover"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.coverId}
              onChange={(event) => set("coverId")(event.target.value)}
            >
              {Object.values(COVER_FACTORS).map((cover) => (
                <option key={cover.id} value={cover.id}>
                  {cover.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            id="aq-tank-temp"
            label="Water temperature to hold (°C)"
            value={state.tankTempC}
            onChange={set("tankTempC")}
            min="5"
            max="40"
            step="0.5"
          />
          <Field
            id="aq-room-temp"
            label="Average room temperature (°C)"
            value={state.roomTempC}
            onChange={set("roomTempC")}
            min="-10"
            max="50"
            step="0.5"
            hint="Use the night-time average, not the afternoon peak."
          />
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Equipment
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            id="aq-heater-w"
            label="Heater rating (W)"
            value={state.heaterWatts}
            onChange={set("heaterWatts")}
            min="0"
            max="2000"
            step="25"
            hint="A larger heater does not cost more to run — it just cycles less."
          />
          <Field
            id="aq-filter-w"
            label="Filter power (W)"
            value={state.filterWatts}
            onChange={set("filterWatts")}
            min="0"
            max="2000"
            step="1"
          />
          <Field
            id="aq-filter-h"
            label="Filter hours a day"
            value={state.filterHours}
            onChange={set("filterHours")}
            min="0"
            max="24"
            step="1"
          />
          <Field
            id="aq-air-w"
            label="Air pump power (W)"
            value={state.airPumpWatts}
            onChange={set("airPumpWatts")}
            min="0"
            max="2000"
            step="1"
          />
          <Field
            id="aq-air-h"
            label="Air pump hours a day"
            value={state.airPumpHours}
            onChange={set("airPumpHours")}
            min="0"
            max="24"
            step="1"
          />
          <Field
            id="aq-light-w"
            label="Light power (W)"
            value={state.lightWatts}
            onChange={set("lightWatts")}
            min="0"
            max="2000"
            step="1"
          />
          <Field
            id="aq-light-h"
            label="Light hours a day"
            value={state.lightHours}
            onChange={set("lightHours")}
            min="0"
            max="24"
            step="1"
            hint="Eight hours is plenty; longer mainly grows algae."
          />
          <Field
            id="aq-other-w"
            label="Other equipment (W)"
            value={state.otherWatts}
            onChange={set("otherWatts")}
            min="0"
            max="2000"
            step="1"
            hint="Wave maker, UV steriliser, CO₂ solenoid, chiller."
          />
          <Field
            id="aq-other-h"
            label="Other equipment hours a day"
            value={state.otherHours}
            onChange={set("otherHours")}
            min="0"
            max="24"
            step="1"
          />
          <Field
            id="aq-days"
            label="Days per month"
            value={state.daysPerMonth}
            onChange={set("daysPerMonth")}
            min="1"
            max="31"
            step="1"
          />
          <Field
            id="aq-tariff"
            label="Electricity tariff (₹ per unit)"
            value={state.tariffPerKwh}
            onChange={set("tariffPerKwh")}
            min="0"
            step="0.25"
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
              Cost per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : money(result.monthlyCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${num(result.monthlyKwh)} units a month · ${money(result.annualCost)} a year`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy aquarium power cost result"
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

        {!hasError && result.heaterUndersized && result.steadyHeatLossW > 0 && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            The heater is too small to hold this temperature: the tank loses{" "}
            {num(result.steadyHeatLossW)} W and the heater can only supply{" "}
            {num(input.heaterWatts)} W. It will run continuously and still fall short.
          </p>
        )}

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

        {!hasError && result.lidSavingMonthlyCost > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Fitting a glass lid would cut the heat loss by roughly{" "}
            <strong className="text-[var(--foreground)]">
              {money(result.lidSavingMonthlyCost)} a month
            </strong>{" "}
            because most of an open tank&apos;s heat leaves as evaporation.
          </p>
        )}
      </section>

      {!hasError && result.ranked.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the units go</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Equipment</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Avg W</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kWh/month</th>
                  <th scope="col" className="py-2 text-right font-semibold">₹/month</th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((device) => (
                  <tr key={device.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{device.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num(device.watts)}
                    </td>
                    <td className="py-2 pr-3 text-right">{num(device.monthlyKwh)}</td>
                    <td className="py-2 text-right font-semibold">{money(device.monthlyCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The heat-loss model uses a typical glass tank in still indoor air, scaled by surface area. A
        tank against an outside wall, under a fan, or in an air-conditioned room will lose more.
        Never run a heater without a thermostat, and always unplug before a water change.
      </p>
    </main>
  );
}
