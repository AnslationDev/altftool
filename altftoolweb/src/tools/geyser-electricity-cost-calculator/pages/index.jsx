"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShowerHead } from "lucide-react";

import {
  STANDING_LOSS_25L_KWH_PER_DAY,
  buildHoursOnComparison,
  computeGeyserCost,
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
  heaterType: "storage",
  tankLitres: "25",
  starRating: "5",
  hoursOnPerDay: "2",
  bucketsPerDay: "3",
  litresPerBucket: "20",
  showersPerDay: "0",
  showerMinutes: "8",
  showerFlowLpm: "9",
  otherLitresPerDay: "10",
  usageTempC: "42",
  inletTempC: "22",
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
  const [heaterType, setHeaterType] = useState(DEFAULTS.heaterType);
  const [tankLitres, setTankLitres] = useState(DEFAULTS.tankLitres);
  const [starRating, setStarRating] = useState(DEFAULTS.starRating);
  const [hoursOnPerDay, setHoursOnPerDay] = useState(DEFAULTS.hoursOnPerDay);
  const [bucketsPerDay, setBucketsPerDay] = useState(DEFAULTS.bucketsPerDay);
  const [litresPerBucket, setLitresPerBucket] = useState(DEFAULTS.litresPerBucket);
  const [showersPerDay, setShowersPerDay] = useState(DEFAULTS.showersPerDay);
  const [showerMinutes, setShowerMinutes] = useState(DEFAULTS.showerMinutes);
  const [showerFlowLpm, setShowerFlowLpm] = useState(DEFAULTS.showerFlowLpm);
  const [otherLitresPerDay, setOtherLitresPerDay] = useState(DEFAULTS.otherLitresPerDay);
  const [usageTempC, setUsageTempC] = useState(DEFAULTS.usageTempC);
  const [inletTempC, setInletTempC] = useState(DEFAULTS.inletTempC);
  const [daysPerMonth, setDaysPerMonth] = useState(DEFAULTS.daysPerMonth);
  const [tariffPerKwh, setTariffPerKwh] = useState(DEFAULTS.tariffPerKwh);
  const [copied, setCopied] = useState(false);

  const isStorage = heaterType === "storage";

  const input = useMemo(
    () => ({
      heaterType,
      tankLitres: toNumber(tankLitres),
      starRating: Number(starRating),
      hoursOnPerDay: toNumber(hoursOnPerDay),
      bucketsPerDay: toNumber(bucketsPerDay),
      litresPerBucket: toNumber(litresPerBucket),
      showersPerDay: toNumber(showersPerDay),
      showerMinutes: toNumber(showerMinutes),
      showerFlowLpm: toNumber(showerFlowLpm),
      otherLitresPerDay: toNumber(otherLitresPerDay),
      usageTempC: toNumber(usageTempC),
      inletTempC: toNumber(inletTempC),
      daysPerMonth: toNumber(daysPerMonth),
      tariffPerKwh: toNumber(tariffPerKwh),
    }),
    [
      heaterType,
      tankLitres,
      starRating,
      hoursOnPerDay,
      bucketsPerDay,
      litresPerBucket,
      showersPerDay,
      showerMinutes,
      showerFlowLpm,
      otherLitresPerDay,
      usageTempC,
      inletTempC,
      daysPerMonth,
      tariffPerKwh,
    ],
  );

  const result = useMemo(() => computeGeyserCost(input), [input]);
  const hoursComparison = useMemo(() => buildHoursOnComparison(input), [input]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Geyser Electricity Cost",
      `Hot water used: ${num0(result.litresPerDay)} litres a day at ${num0(input.usageTempC)} °C`,
      `Temperature rise: ${num0(result.deltaT)} °C above the mains`,
      `Electricity: ${num(result.kwhPerDay)} kWh a day`,
      `Standing loss: ${num(result.lossKwhPerDay)} kWh a day`,
      `Cost per day: ${money2(result.costPerDay)}`,
      `Cost per month: ${money(result.monthlyCost)}`,
      `Cost per year: ${money(result.annualCost)}`,
    ].join("\n");
  }, [hasError, result, input.usageTempC]);

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
    setHeaterType(DEFAULTS.heaterType);
    setTankLitres(DEFAULTS.tankLitres);
    setStarRating(DEFAULTS.starRating);
    setHoursOnPerDay(DEFAULTS.hoursOnPerDay);
    setBucketsPerDay(DEFAULTS.bucketsPerDay);
    setLitresPerBucket(DEFAULTS.litresPerBucket);
    setShowersPerDay(DEFAULTS.showersPerDay);
    setShowerMinutes(DEFAULTS.showerMinutes);
    setShowerFlowLpm(DEFAULTS.showerFlowLpm);
    setOtherLitresPerDay(DEFAULTS.otherLitresPerDay);
    setUsageTempC(DEFAULTS.usageTempC);
    setInletTempC(DEFAULTS.inletTempC);
    setDaysPerMonth(DEFAULTS.daysPerMonth);
    setTariffPerKwh(DEFAULTS.tariffPerKwh);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Hot water drawn per day", `${num0(result.litresPerDay)} L at ${num0(input.usageTempC)} °C`],
        ["Temperature rise needed", `${num0(result.deltaT)} °C`],
        ["Energy to heat that water", `${num(result.usefulKwhPerDay)} kWh/day`],
        ["Standing loss from the tank", `${num(result.lossKwhPerDay)} kWh/day (${num0(result.lossShare)}% of the total)`],
        ["Total electricity", `${num(result.kwhPerDay)} kWh/day`],
        ["Cost per day", money2(result.costPerDay)],
        ["Cost per bucket", money2(result.costPerBucket)],
        ["Cost per minute of shower", money2(result.costPerShowerMinute)],
        ["Units per month", `${num(result.monthlyKwh)} kWh`],
        ["Cost per month", money(result.monthlyCost)],
        ["Cost per year", money(result.annualCost)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShowerHead className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Geyser Electricity Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two things drive a water heater bill: the litres you actually use, and the heat the tank
          leaks while it sits switched on. This works out both.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The heater
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gy-type">
              Heater type
            </label>
            <select
              id="gy-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={heaterType}
              onChange={(event) => setHeaterType(event.target.value)}
            >
              <option value="storage">Storage tank geyser</option>
              <option value="instant">Instant / tankless heater</option>
            </select>
          </div>
          {isStorage && (
            <>
              <Field
                id="gy-tank"
                label="Tank capacity (litres)"
                value={tankLitres}
                onChange={setTankLitres}
                min="1"
                max="500"
                step="1"
              />
              <div>
                <label className={LABEL_CLASS} htmlFor="gy-star">
                  BEE star rating
                </label>
                <select
                  id="gy-star"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={starRating}
                  onChange={(event) => setStarRating(event.target.value)}
                >
                  {[5, 4, 3, 2, 1].map((star) => (
                    <option key={star} value={star}>
                      {star} star · {STANDING_LOSS_25L_KWH_PER_DAY[star]} kWh/24h at 25 L
                    </option>
                  ))}
                </select>
              </div>
              <Field
                id="gy-hours"
                label="Hours left switched on per day"
                value={hoursOnPerDay}
                onChange={setHoursOnPerDay}
                min="0"
                max="24"
                step="0.5"
                hint="This is the lever most people never touch."
              />
            </>
          )}
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Daily hot water use
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            id="gy-buckets"
            label="Bucket baths per day"
            value={bucketsPerDay}
            onChange={setBucketsPerDay}
            min="0"
            step="1"
          />
          <Field
            id="gy-bucket-litres"
            label="Litres per bucket"
            value={litresPerBucket}
            onChange={setLitresPerBucket}
            min="0"
            step="1"
          />
          <Field
            id="gy-showers"
            label="Showers per day"
            value={showersPerDay}
            onChange={setShowersPerDay}
            min="0"
            step="1"
          />
          <Field
            id="gy-shower-min"
            label="Minutes per shower"
            value={showerMinutes}
            onChange={setShowerMinutes}
            min="0"
            step="1"
          />
          <Field
            id="gy-flow"
            label="Shower flow (litres per minute)"
            value={showerFlowLpm}
            onChange={setShowerFlowLpm}
            min="0"
            step="0.5"
            hint="Plain head about 9, aerated low-flow about 6."
          />
          <Field
            id="gy-other"
            label="Other hot water per day (litres)"
            value={otherLitresPerDay}
            onChange={setOtherLitresPerDay}
            min="0"
            step="1"
            hint="Kitchen sink, wash basin, mopping."
          />
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Temperatures and tariff
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            id="gy-usage-temp"
            label="Bathing water temperature (°C)"
            value={usageTempC}
            onChange={setUsageTempC}
            min="0"
            max="80"
            step="1"
          />
          <Field
            id="gy-inlet"
            label="Mains water temperature (°C)"
            value={inletTempC}
            onChange={setInletTempC}
            min="0"
            max="60"
            step="1"
            hint="Around 25 °C in summer, 12-18 °C in a north Indian winter."
          />
          <Field
            id="gy-days"
            label="Days used per month"
            value={daysPerMonth}
            onChange={setDaysPerMonth}
            min="1"
            max="31"
            step="1"
          />
          <Field
            id="gy-tariff"
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
                : `${num(result.kwhPerDay)} units a day · ${money(result.annualCost)} a year`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy geyser electricity cost result"
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
      </section>

      {!hasError && isStorage && !hoursComparison.error && hoursComparison.rows.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What leaving it on costs</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Same hot water use, only the hours the geyser stays switched on change.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Switched on</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Standing loss</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per month</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per year</th>
                </tr>
              </thead>
              <tbody>
                {hoursComparison.rows.map((row) => (
                  <tr key={row.hours} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {row.hours === 24 ? "All day" : `${num(row.hours)} h/day`}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {num(row.lossKwhPerDay)} kWh
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.monthlyCost)}</td>
                    <td className="py-2 text-right">{money(row.annualCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Standing loss is scaled from the BEE label figure for a 25 litre tank using tank surface area
        and the real gap between stored water and room air, so it is an estimate rather than a
        measurement of your specific unit. Your own BEE label carries the tested number.
      </p>
    </main>
  );
}
