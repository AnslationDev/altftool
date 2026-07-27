"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Microwave, RotateCcw } from "lucide-react";

import { MODES, buildTaskTable, computeMicrowaveCost } from "../lib";

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
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const num0 = (value) => (Number.isFinite(value) ? NUM0.format(value) : "—");
const num3 = (value) => (Number.isFinite(value) ? NUM3.format(value) : "—");

const DEFAULTS = {
  modeId: "solo",
  ratedPowerW: "800",
  grillPowerW: "1100",
  convectionPowerW: "1400",
  powerLevelPercent: "100",
  cookMinutes: "5",
  preheatMinutes: "8",
  usesPerDay: "3",
  standbyWatts: "3",
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
  const [modeId, setModeId] = useState(DEFAULTS.modeId);
  const [ratedPowerW, setRatedPowerW] = useState(DEFAULTS.ratedPowerW);
  const [grillPowerW, setGrillPowerW] = useState(DEFAULTS.grillPowerW);
  const [convectionPowerW, setConvectionPowerW] = useState(DEFAULTS.convectionPowerW);
  const [powerLevelPercent, setPowerLevelPercent] = useState(DEFAULTS.powerLevelPercent);
  const [cookMinutes, setCookMinutes] = useState(DEFAULTS.cookMinutes);
  const [preheatMinutes, setPreheatMinutes] = useState(DEFAULTS.preheatMinutes);
  const [usesPerDay, setUsesPerDay] = useState(DEFAULTS.usesPerDay);
  const [standbyWatts, setStandbyWatts] = useState(DEFAULTS.standbyWatts);
  const [daysPerMonth, setDaysPerMonth] = useState(DEFAULTS.daysPerMonth);
  const [tariffPerKwh, setTariffPerKwh] = useState(DEFAULTS.tariffPerKwh);
  const [copied, setCopied] = useState(false);

  const mode = MODES[modeId] ?? MODES.solo;

  const activePower =
    modeId === "grill" ? grillPowerW : modeId === "convection" ? convectionPowerW : ratedPowerW;
  const setActivePower =
    modeId === "grill" ? setGrillPowerW : modeId === "convection" ? setConvectionPowerW : setRatedPowerW;

  const input = useMemo(
    () => ({
      modeId,
      ratedPowerW: toNumber(activePower),
      powerLevelPercent: toNumber(powerLevelPercent),
      cookMinutes: toNumber(cookMinutes),
      preheatMinutes: mode.supportsPreheat ? toNumber(preheatMinutes) : 0,
      usesPerDay: toNumber(usesPerDay),
      standbyWatts: toNumber(standbyWatts),
      daysPerMonth: toNumber(daysPerMonth),
      tariffPerKwh: toNumber(tariffPerKwh),
    }),
    [
      modeId,
      activePower,
      powerLevelPercent,
      cookMinutes,
      preheatMinutes,
      mode.supportsPreheat,
      usesPerDay,
      standbyWatts,
      daysPerMonth,
      tariffPerKwh,
    ],
  );

  const result = useMemo(() => computeMicrowaveCost(input), [input]);
  const tasks = useMemo(
    () =>
      buildTaskTable({
        ratedPowerW: toNumber(ratedPowerW),
        grillPowerW: toNumber(grillPowerW),
        convectionPowerW: toNumber(convectionPowerW),
        tariffPerKwh: toNumber(tariffPerKwh),
      }),
    [ratedPowerW, grillPowerW, convectionPowerW, tariffPerKwh],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Microwave Running Cost",
      `Mode: ${result.modeLabel}`,
      `Draw from the socket: ${num0(result.drawWatts)} W`,
      `Energy per run: ${num3(result.runKwh)} kWh`,
      `Cost per run: ${money2(result.costPerRun)}`,
      `Cost per day: ${money2(result.costPerDay)}`,
      `Cost per month: ${money(result.monthlyCost)}`,
      `Cost per year: ${money(result.annualCost)}`,
      `Standby alone: ${num(result.standbyAnnualKwh)} kWh a year (${money(result.standbyAnnualCost)})`,
    ].join("\n");
  }, [hasError, result]);

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
    setModeId(DEFAULTS.modeId);
    setRatedPowerW(DEFAULTS.ratedPowerW);
    setGrillPowerW(DEFAULTS.grillPowerW);
    setConvectionPowerW(DEFAULTS.convectionPowerW);
    setPowerLevelPercent(DEFAULTS.powerLevelPercent);
    setCookMinutes(DEFAULTS.cookMinutes);
    setPreheatMinutes(DEFAULTS.preheatMinutes);
    setUsesPerDay(DEFAULTS.usesPerDay);
    setStandbyWatts(DEFAULTS.standbyWatts);
    setDaysPerMonth(DEFAULTS.daysPerMonth);
    setTariffPerKwh(DEFAULTS.tariffPerKwh);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Power drawn from the socket", `${num0(result.drawWatts)} W`],
        ["Energy per run", `${num3(result.runKwh)} kWh`],
        ["Cooking energy per day", `${num3(result.cookingKwhPerDay)} kWh`],
        ["Standby energy per day", `${num3(result.standbyKwhPerDay)} kWh (${num0(result.standbyShare)}% of the total)`],
        ["Total per day", `${num3(result.kwhPerDay)} kWh · ${money2(result.costPerDay)}`],
        ["Units per month", `${num(result.monthlyKwh)} kWh`],
        ["Cost per month", money(result.monthlyCost)],
        ["Units per year", `${num(result.annualKwh)} kWh`],
        ["Cost per year", money(result.annualCost)],
        ["Standby alone, per year", `${num(result.standbyAnnualKwh)} kWh · ${money(result.standbyAnnualCost)}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Microwave className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Microwave Running Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What one reheat, one bake and one month of microwave use actually cost — counting the
          socket draw rather than the number printed on the door.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mw-mode">
              Cooking mode
            </label>
            <select
              id="mw-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={modeId}
              onChange={(event) => setModeId(event.target.value)}
            >
              {Object.values(MODES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            id="mw-power"
            label={mode.powerLabel}
            value={activePower}
            onChange={setActivePower}
            min="1"
            max="5000"
            step="50"
          />
          <Field
            id="mw-level"
            label="Power level used (%)"
            value={powerLevelPercent}
            onChange={setPowerLevelPercent}
            min="1"
            max="100"
            step="5"
            hint="A lower level cycles the element on and off — it does not reduce the draw."
          />
          <Field
            id="mw-minutes"
            label="Minutes per run"
            value={cookMinutes}
            onChange={setCookMinutes}
            min="0"
            max="240"
            step="0.5"
          />
          {mode.supportsPreheat && (
            <Field
              id="mw-preheat"
              label="Preheat minutes"
              value={preheatMinutes}
              onChange={setPreheatMinutes}
              min="0"
              max="60"
              step="1"
              hint="Preheat runs the element at full power."
            />
          )}
          <Field
            id="mw-uses"
            label="Runs per day"
            value={usesPerDay}
            onChange={setUsesPerDay}
            min="0"
            max="100"
            step="1"
          />
          <Field
            id="mw-standby"
            label="Standby draw (W)"
            value={standbyWatts}
            onChange={setStandbyWatts}
            min="0"
            max="50"
            step="0.5"
            hint="The clock and display, running 24 hours a day. Typically 1-5 W."
          />
          <Field
            id="mw-days"
            label="Days used per month"
            value={daysPerMonth}
            onChange={setDaysPerMonth}
            min="1"
            max="31"
            step="1"
          />
          <Field
            id="mw-tariff"
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
              Cost per run
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : money2(result.costPerRun)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${num3(result.runKwh)} kWh a run · ${money(result.monthlyCost)} a month all in`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy microwave running cost result"
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
            {result.modeNote}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What common jobs cost</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Using your rated powers and tariff, excluding standby.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Job</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Minutes</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">kWh</th>
                <th scope="col" className="py-2 text-right font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.label}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {num(row.cookMinutes + row.preheatMinutes)}
                  </td>
                  <td className="py-2 pr-3 text-right">{num3(row.kwh)}</td>
                  <td className="py-2 text-right">{money2(row.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates based on a 65% magnetron efficiency and typical element duty cycles. A clamp meter
        or plug-in energy monitor on your own oven will give the exact draw.
      </p>
    </main>
  );
}
