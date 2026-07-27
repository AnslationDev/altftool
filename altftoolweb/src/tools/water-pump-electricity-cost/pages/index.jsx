"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { buildHpComparison, computePumpCost } from "../lib";

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
  horsepower: "1",
  motorEfficiencyPercent: "72",
  flowLpm: "60",
  headMetres: "25",
  tankLitres: "1000",
  fillsPerDay: "2",
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
  const [horsepower, setHorsepower] = useState(DEFAULTS.horsepower);
  const [motorEfficiencyPercent, setMotorEfficiencyPercent] = useState(
    DEFAULTS.motorEfficiencyPercent,
  );
  const [flowLpm, setFlowLpm] = useState(DEFAULTS.flowLpm);
  const [headMetres, setHeadMetres] = useState(DEFAULTS.headMetres);
  const [tankLitres, setTankLitres] = useState(DEFAULTS.tankLitres);
  const [fillsPerDay, setFillsPerDay] = useState(DEFAULTS.fillsPerDay);
  const [daysPerMonth, setDaysPerMonth] = useState(DEFAULTS.daysPerMonth);
  const [tariffPerKwh, setTariffPerKwh] = useState(DEFAULTS.tariffPerKwh);
  const [copied, setCopied] = useState(false);

  const input = useMemo(
    () => ({
      horsepower: toNumber(horsepower),
      motorEfficiencyPercent: toNumber(motorEfficiencyPercent),
      flowLpm: toNumber(flowLpm),
      headMetres: toNumber(headMetres),
      tankLitres: toNumber(tankLitres),
      fillsPerDay: toNumber(fillsPerDay),
      daysPerMonth: toNumber(daysPerMonth),
      tariffPerKwh: toNumber(tariffPerKwh),
    }),
    [
      horsepower,
      motorEfficiencyPercent,
      flowLpm,
      headMetres,
      tankLitres,
      fillsPerDay,
      daysPerMonth,
      tariffPerKwh,
    ],
  );

  const result = useMemo(() => computePumpCost(input), [input]);
  const hpTable = useMemo(() => buildHpComparison(input), [input]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Water Pump Electricity Cost",
      `Pump: ${num(input.horsepower)} HP drawing about ${num0(result.drawWatts)} W`,
      `Runtime: ${num(result.minutesPerFill)} minutes a fill, ${num(result.minutesPerDay)} minutes a day`,
      `Water moved: ${num0(result.litresPerDay)} litres a day`,
      `Electricity: ${num(result.kwhPerDay)} units a day`,
      `Cost: ${money2(result.costPerDay)} a day, ${money(result.monthlyCost)} a month, ${money(result.annualCost)} a year`,
      `Cost per 1000 litres pumped: ${money2(result.costPer1000Litres)}`,
    ].join("\n");
  }, [hasError, result, input.horsepower]);

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
    setHorsepower(DEFAULTS.horsepower);
    setMotorEfficiencyPercent(DEFAULTS.motorEfficiencyPercent);
    setFlowLpm(DEFAULTS.flowLpm);
    setHeadMetres(DEFAULTS.headMetres);
    setTankLitres(DEFAULTS.tankLitres);
    setFillsPerDay(DEFAULTS.fillsPerDay);
    setDaysPerMonth(DEFAULTS.daysPerMonth);
    setTariffPerKwh(DEFAULTS.tariffPerKwh);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Power drawn from the meter", `${num0(result.drawWatts)} W · about ${num(result.currentAmps)} A at 230 V`],
        ["Time to fill the tank once", `${num(result.minutesPerFill)} minutes`],
        ["Pump running time per day", `${num(result.minutesPerDay)} minutes`],
        ["Water moved per day", `${num0(result.litresPerDay)} litres`],
        ["Energy per tank fill", `${num(result.kwhPerFill)} kWh · ${money2(result.costPerFill)}`],
        ["Electricity per day", `${num(result.kwhPerDay)} kWh · ${money2(result.costPerDay)}`],
        ["Units per month", `${num(result.monthlyKwh)} kWh`],
        ["Cost per month", money(result.monthlyCost)],
        ["Cost per year", money(result.annualCost)],
        ["Cost per 1000 litres pumped", money2(result.costPer1000Litres)],
        ["Useful hydraulic power", `${num(result.hydraulicKw)} kW at ${num(input.headMetres)} m head`],
        ["Wire-to-water efficiency", `${num(result.wireToWaterEfficiency)}%`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Water Pump Electricity Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Runtime comes from the real job — tank litres divided by flow — and the draw comes from the
          motor, not the horsepower on the nameplate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="wp-hp"
            label="Pump rating (HP)"
            value={horsepower}
            onChange={setHorsepower}
            min="0.1"
            max="25"
            step="0.25"
          />
          <Field
            id="wp-eff"
            label="Motor efficiency (%)"
            value={motorEfficiencyPercent}
            onChange={setMotorEfficiencyPercent}
            min="1"
            max="100"
            step="1"
            hint="Small single-phase motors run 70-78%; a rewound one can drop below 60%."
          />
          <Field
            id="wp-flow"
            label="Flow rate (litres per minute)"
            value={flowLpm}
            onChange={setFlowLpm}
            min="1"
            max="5000"
            step="5"
            hint="Time a bucket fill to measure it: 20 L in 20 s is 60 LPM."
          />
          <Field
            id="wp-head"
            label="Total head (metres)"
            value={headMetres}
            onChange={setHeadMetres}
            min="0"
            max="300"
            step="1"
            hint="Vertical lift plus pipe friction losses."
          />
          <Field
            id="wp-tank"
            label="Tank capacity (litres)"
            value={tankLitres}
            onChange={setTankLitres}
            min="1"
            step="50"
          />
          <Field
            id="wp-fills"
            label="Tank fills per day"
            value={fillsPerDay}
            onChange={setFillsPerDay}
            min="0"
            max="50"
            step="0.5"
          />
          <Field
            id="wp-days"
            label="Days used per month"
            value={daysPerMonth}
            onChange={setDaysPerMonth}
            min="1"
            max="31"
            step="1"
          />
          <Field
            id="wp-tariff"
            label="Electricity tariff (₹ per unit)"
            value={tariffPerKwh}
            onChange={setTariffPerKwh}
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
                : `${num(result.minutesPerDay)} minutes of pumping a day · ${money2(result.costPer1000Litres)} per 1000 litres`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy water pump electricity cost result"
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
            Wire-to-water efficiency is the useful hydraulic power divided by the electricity drawn.
            A low figure means the pump is delivering far less flow than it could at this head —
            usually an oversized pump, a choked foot valve, or an undersized delivery pipe.
          </p>
        )}
      </section>

      {!hasError && hpTable.rows.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Same job, different pump rating</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Assuming each pump still delivers your stated flow rate, so runtime stays the same.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Rating</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Draw</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kWh/day</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per month</th>
                </tr>
              </thead>
              <tbody>
                {hpTable.rows.map((row) => (
                  <tr key={row.hp} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{num(row.hp)} HP</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num0(row.drawWatts)} W
                    </td>
                    <td className="py-2 pr-3 text-right">{num(row.kwhPerDay)}</td>
                    <td className="py-2 text-right">{money(row.monthlyCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Actual draw varies with voltage, head and how worn the impeller is; a clamp
        meter on the supply cable gives the exact figure. Running a pump dry damages the seal and
        wastes the full draw for no water at all.
      </p>
    </main>
  );
}
