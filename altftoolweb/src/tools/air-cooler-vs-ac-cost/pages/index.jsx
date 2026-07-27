"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wind } from "lucide-react";

import { compareCoolerAndAc, PAD_TYPES } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const degC = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} °C` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM0.format(v)}%` : DASH);
const kwh = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} kWh` : DASH);

const DEFAULTS = {
  temp: "40",
  rh: "25",
  pad: "honeycomb",
  airflow: "3000",
  fresh: "30",
  coolerPower: "180",
  tons: "1.5",
  iseer: "3.8",
  setpoint: "24",
  tariff: "8",
  water: "50",
  hours: "8",
  days: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const VERDICT_STYLE = {
  excellent: "bg-[var(--success-soft)] text-[var(--success)]",
  good: "bg-[var(--success-soft)] text-[var(--success)]",
  marginal: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  poor: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function ToolHome() {
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [rh, setRh] = useState(DEFAULTS.rh);
  const [pad, setPad] = useState(DEFAULTS.pad);
  const [airflow, setAirflow] = useState(DEFAULTS.airflow);
  const [fresh, setFresh] = useState(DEFAULTS.fresh);
  const [coolerPower, setCoolerPower] = useState(DEFAULTS.coolerPower);
  const [tons, setTons] = useState(DEFAULTS.tons);
  const [iseer, setIseer] = useState(DEFAULTS.iseer);
  const [setpoint, setSetpoint] = useState(DEFAULTS.setpoint);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [water, setWater] = useState(DEFAULTS.water);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareCoolerAndAc({
        outdoorTempC: toNum(temp),
        relativeHumidityPercent: toNum(rh),
        padType: pad,
        coolerAirflowCmh: toNum(airflow),
        freshAirPercent: toNum(fresh),
        coolerPowerW: toNum(coolerPower),
        acTons: toNum(tons),
        acIseer: toNum(iseer),
        acSetpointC: toNum(setpoint),
        tariffPerKwh: toNum(tariff),
        waterPricePerKilolitre: toNum(water),
        hoursPerDay: toNum(hours),
        daysPerMonth: toNum(days),
      }),
    [temp, rh, pad, airflow, fresh, coolerPower, tons, iseer, setpoint, tariff, water, hours, days],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Air Cooler vs AC Cost",
      `Outside: ${degC(toNum(temp))} at ${pct(toNum(rh))} RH`,
      `Wet bulb: ${degC(result.wetBulbC)} (depression ${degC(result.depressionC)})`,
      `Cooler can reach: ${degC(result.coolerOutletC)} at about ${pct(result.coolerOutletRhPercent)} RH`,
      `AC setpoint: ${degC(toNum(setpoint))}`,
      `Verdict: ${result.verdictText}`,
      `Cooler: ${kwh(result.coolerKwhPerHour)}/h, ${NUM2.format(result.waterLitresPerHour)} L water/h`,
      `AC: ${kwh(result.acKwhPerHour)}/h`,
      `Cooler monthly: ${money(result.coolerTotalMonth)} (power ${money(result.coolerElectricityMonth)} + water ${money(result.coolerWaterCostMonth)})`,
      `AC monthly: ${money(result.acTotalMonth)}`,
      `Monthly saving with the cooler: ${money(result.monthlySaving)} (${pct(result.savingPercent)})`,
    ].join("\n");
  }, [hasError, result, temp, rh, setpoint]);

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
    setTemp(DEFAULTS.temp);
    setRh(DEFAULTS.rh);
    setPad(DEFAULTS.pad);
    setAirflow(DEFAULTS.airflow);
    setFresh(DEFAULTS.fresh);
    setCoolerPower(DEFAULTS.coolerPower);
    setTons(DEFAULTS.tons);
    setIseer(DEFAULTS.iseer);
    setSetpoint(DEFAULTS.setpoint);
    setTariff(DEFAULTS.tariff);
    setWater(DEFAULTS.water);
    setHours(DEFAULTS.hours);
    setDays(DEFAULTS.days);
    setCopied(false);
  };

  const compareRows = [
    "Air temperature it can deliver",
    "Temperature drop achieved",
    "Humidity of the air it delivers",
    "Electricity per hour",
    "Water per hour",
    "Units per month",
    "Electricity cost per month",
    "Water cost per month",
    "Total cost per month",
  ];

  const coolerValues = hasError
    ? compareRows.map(() => DASH)
    : [
        degC(result.coolerOutletC),
        degC(result.coolerTempDropC),
        `about ${pct(result.coolerOutletRhPercent)} RH`,
        kwh(result.coolerKwhPerHour),
        `${NUM2.format(result.waterLitresPerHour)} L`,
        kwh(result.coolerKwhPerMonth),
        money(result.coolerElectricityMonth),
        money(result.coolerWaterCostMonth),
        money(result.coolerTotalMonth),
      ];

  const acValues = hasError
    ? compareRows.map(() => DASH)
    : [
        degC(toNum(setpoint)),
        degC(result.acTempDropC),
        "dehumidified",
        kwh(result.acKwhPerHour),
        "none",
        kwh(result.acKwhPerMonth),
        money(result.acTotalMonth),
        money(0),
        money(result.acTotalMonth),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Cooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Air Cooler vs AC Cost</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A cooler is cheap to run but cannot go below the wet-bulb temperature of your air. This
          computes the wet bulb for your conditions, the temperature each machine can actually
          deliver, and what both cost per month.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your climate right now</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-temp">
              Air temperature (°C)
            </label>
            <input
              id="cvc-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-20"
              max="50"
              step="0.5"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-rh">
              Relative humidity (%)
            </label>
            <input
              id="cvc-rh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="99"
              step="1"
              value={rh}
              onChange={(e) => setRh(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The two machines</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-pad">
              Cooler pad type
            </label>
            <select
              id="cvc-pad"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pad}
              onChange={(e) => setPad(e.target.value)}
            >
              {PAD_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({Math.round(option.effectiveness * 100)}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-power">
              Cooler power draw (W)
            </label>
            <input
              id="cvc-power"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={coolerPower}
              onChange={(e) => setCoolerPower(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-airflow">
              Cooler airflow (m³/h)
            </label>
            <input
              id="cvc-airflow"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="100"
              value={airflow}
              onChange={(e) => setAirflow(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-fresh">
              Share of air drawn fresh from outside (%)
            </label>
            <input
              id="cvc-fresh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={fresh}
              onChange={(e) => setFresh(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-tons">
              AC capacity (tons)
            </label>
            <input
              id="cvc-tons"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="10"
              step="0.1"
              value={tons}
              onChange={(e) => setTons(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-iseer">
              AC ISEER
            </label>
            <input
              id="cvc-iseer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="12"
              step="0.05"
              value={iseer}
              onChange={(e) => setIseer(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-setpoint">
              AC setpoint (°C)
            </label>
            <input
              id="cvc-setpoint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="16"
              max="30"
              step="1"
              value={setpoint}
              onChange={(e) => setSetpoint(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="cvc-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-water">
              Water price (₹ per 1,000 L)
            </label>
            <input
              id="cvc-water"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={water}
              onChange={(e) => setWater(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-hours">
              Hours run per day
            </label>
            <input
              id="cvc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="24"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cvc-days">
              Days per month
            </label>
            <input
              id="cvc-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Saved per month with the cooler
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.monthlySaving)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the comparison."
                : `${pct(result.savingPercent)} less than the AC, over ${NUM0.format(result.hoursPerMonth)} hours a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy cooler versus AC comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${VERDICT_STYLE[result.verdict]}`}
          >
            {result.verdictText} Wet bulb is {degC(result.wetBulbC)}, so the cooler bottoms out at{" "}
            {degC(result.coolerOutletC)} —{" "}
            {result.coolerCanReachSetpoint
              ? "cold enough to match your AC setpoint."
              : `still ${degC(result.coolerAboveSetpointC)} above your AC setpoint.`}
          </p>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Measure
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Desert cooler
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Air conditioner
                </th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((label, index) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{coolerValues[index]}</td>
                  <td className="py-2 text-right font-semibold">{acValues[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Water use is the amount evaporated into the fresh-air share at these conditions; in a sealed
        room the air recirculates already humid and consumption falls, but so does the cooling.
        Coolers need an open window to work and are not suitable for people with damp-triggered
        allergies or asthma — check with a doctor if that applies to your household.
      </p>
    </main>
  );
}
