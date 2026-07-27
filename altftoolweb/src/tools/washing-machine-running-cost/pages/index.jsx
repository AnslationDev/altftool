"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, WashingMachine } from "lucide-react";

import {
  MACHINE_TYPES,
  WASH_TEMPERATURES,
  buildTemperatureComparison,
  computeWashCost,
} from "../lib";

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
  machineType: "front-load",
  capacityKg: "7",
  washTemp: "40",
  inletTempC: "25",
  washesPerWeek: "5",
  tariffPerKwh: "8",
  waterCostPerKilolitre: "20",
  detergentCostPerWash: "6",
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

export default function ToolHome() {
  const [machineType, setMachineType] = useState(DEFAULTS.machineType);
  const [capacityKg, setCapacityKg] = useState(DEFAULTS.capacityKg);
  const [washTemp, setWashTemp] = useState(DEFAULTS.washTemp);
  const [inletTempC, setInletTempC] = useState(DEFAULTS.inletTempC);
  const [washesPerWeek, setWashesPerWeek] = useState(DEFAULTS.washesPerWeek);
  const [tariffPerKwh, setTariffPerKwh] = useState(DEFAULTS.tariffPerKwh);
  const [waterCostPerKilolitre, setWaterCostPerKilolitre] = useState(
    DEFAULTS.waterCostPerKilolitre,
  );
  const [detergentCostPerWash, setDetergentCostPerWash] = useState(
    DEFAULTS.detergentCostPerWash,
  );
  const [copied, setCopied] = useState(false);

  const input = useMemo(() => {
    const option = WASH_TEMPERATURES.find((item) => item.id === washTemp);
    return {
      machineType,
      capacityKg: toNumber(capacityKg),
      washTempC: option ? option.tempC : null,
      inletTempC: toNumber(inletTempC),
      washesPerWeek: toNumber(washesPerWeek),
      tariffPerKwh: toNumber(tariffPerKwh),
      waterCostPerKilolitre: toNumber(waterCostPerKilolitre),
      detergentCostPerWash: toNumber(detergentCostPerWash),
    };
  }, [
    machineType,
    capacityKg,
    washTemp,
    inletTempC,
    washesPerWeek,
    tariffPerKwh,
    waterCostPerKilolitre,
    detergentCostPerWash,
  ]);

  const result = useMemo(() => computeWashCost(input), [input]);
  const comparison = useMemo(() => buildTemperatureComparison(input), [input]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Washing Machine Running Cost",
      `Machine: ${result.machineLabel}, ${num(input.capacityKg)} kg`,
      `Programme: ${WASH_TEMPERATURES.find((item) => item.id === washTemp)?.label ?? ""}`,
      `Energy per wash: ${num(result.energyPerWashKwh)} kWh`,
      `Water per wash: ${num0(result.waterLitresPerWash)} litres`,
      `Cost per wash: ${money2(result.totalCostPerWash)}`,
      `Per month (${num(result.washesPerMonth)} washes): ${money(result.monthlyCost)}`,
      `Per year (${num0(result.washesPerYear)} washes): ${money(result.annualCost)}`,
      `Electricity used per year: ${num(result.annualKwh)} kWh`,
    ].join("\n");
  }, [hasError, result, input.capacityKg, washTemp]);

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
    setMachineType(DEFAULTS.machineType);
    setCapacityKg(DEFAULTS.capacityKg);
    setWashTemp(DEFAULTS.washTemp);
    setInletTempC(DEFAULTS.inletTempC);
    setWashesPerWeek(DEFAULTS.washesPerWeek);
    setTariffPerKwh(DEFAULTS.tariffPerKwh);
    setWaterCostPerKilolitre(DEFAULTS.waterCostPerKilolitre);
    setDetergentCostPerWash(DEFAULTS.detergentCostPerWash);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Electricity per wash", `${num(result.energyPerWashKwh)} kWh · ${money2(result.electricityCostPerWash)}`],
        ["— drum, pump and spin", `${num(result.baseEnergyKwh)} kWh`],
        ["— heating the wash water", `${num(result.heatEnergyKwh)} kWh (${num0(result.heatingShareOfEnergy)}% of the cycle)`],
        ["Water per wash", `${num0(result.waterLitresPerWash)} L · ${money2(result.waterCostPerWash)}`],
        ["Detergent and additives", money2(result.detergentCostPerWash)],
        ["Cost per month", `${money(result.monthlyCost)} (${num(result.washesPerMonth)} washes)`],
        ["Cost per year", money(result.annualCost)],
        ["Electricity per year", `${num(result.annualKwh)} kWh · ${money(result.annualElectricityCost)}`],
        ["Water per year", `${num(result.annualWaterKilolitres)} kL · ${money(result.annualWaterCost)}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <WashingMachine className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Washing Machine Running Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what one wash really costs in electricity, water and detergent — and how much of
          that bill is just heating the water.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-type">
              Machine type
            </label>
            <select
              id="wm-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={machineType}
              onChange={(event) => setMachineType(event.target.value)}
            >
              {Object.values(MACHINE_TYPES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-capacity">
              Rated capacity (kg)
            </label>
            <input
              id="wm-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="20"
              step="0.5"
              value={capacityKg}
              onChange={(event) => setCapacityKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-temp">
              Wash programme
            </label>
            <select
              id="wm-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              value={washTemp}
              onChange={(event) => setWashTemp(event.target.value)}
            >
              {WASH_TEMPERATURES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-inlet">
              Tap water temperature (°C)
            </label>
            <input
              id="wm-inlet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-5"
              max="60"
              step="1"
              value={inletTempC}
              onChange={(event) => setInletTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-washes">
              Washes per week
            </label>
            <input
              id="wm-washes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={washesPerWeek}
              onChange={(event) => setWashesPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="wm-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariffPerKwh}
              onChange={(event) => setTariffPerKwh(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-water">
              Water tariff (₹ per 1000 L)
            </label>
            <input
              id="wm-water"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={waterCostPerKilolitre}
              onChange={(event) => setWaterCostPerKilolitre(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wm-detergent">
              Detergent per wash (₹)
            </label>
            <input
              id="wm-detergent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={detergentCostPerWash}
              onChange={(event) => setDetergentCostPerWash(event.target.value)}
            />
          </div>
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
              Cost per wash
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : money2(result.totalCostPerWash)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${num(result.energyPerWashKwh)} kWh and ${num0(result.waterLitresPerWash)} litres per cycle`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy washing machine running cost result"
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
            {result.machineNote}
            {!result.hasBuiltInHeater && result.deltaT > 0
              ? " Most Indian top-load and semi-automatic machines have no built-in heater, so this heating energy is what your geyser or immersion rod spends filling the tub."
              : ""}
          </p>
        )}
      </section>

      {!hasError && !comparison.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What the temperature dial costs you</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Same machine, same load count, only the programme temperature changes.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Programme</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kWh</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per wash</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per year</th>
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
                    <td className="py-2 pr-3 text-right">{num(row.energyPerWashKwh)}</td>
                    <td className="py-2 pr-3 text-right">{money2(row.totalCostPerWash)}</td>
                    <td className="py-2 text-right">{money(row.annualCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates based on typical declared water and energy figures for each machine type. Your own
        machine&apos;s BEE label and programme settings are the authoritative numbers — a heavily
        soiled or extra-rinse cycle will use more than shown here.
      </p>
    </main>
  );
}
