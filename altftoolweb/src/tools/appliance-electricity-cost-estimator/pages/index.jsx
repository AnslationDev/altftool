"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Zap } from "lucide-react";

import {
  APPLIANCE_PRESETS,
  GRID_EMISSION_KG_PER_KWH,
  MAX_DAYS_PER_MONTH,
  MAX_HOURS_PER_DAY,
  estimateBill,
  presetById,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_APPLIANCES = [
  { id: 1, presetId: "ac-3star", name: "Split AC 1.5 ton, 3 star", watts: "1500", hoursPerDay: "6", quantity: "1", daysPerMonth: "30" },
  { id: 2, presetId: "fan", name: "Ceiling fan", watts: "70", hoursPerDay: "10", quantity: "4", daysPerMonth: "30" },
  { id: 3, presetId: "fridge", name: "Refrigerator, 250 L", watts: "150", hoursPerDay: "8", quantity: "1", daysPerMonth: "30" },
  { id: 4, presetId: "led-bulb", name: "LED bulb", watts: "9", hoursPerDay: "6", quantity: "8", daysPerMonth: "30" },
];

const DEFAULTS = { tariff: "8", fixedCharge: "150", duty: "5" };

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [appliances, setAppliances] = useState(DEFAULT_APPLIANCES);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [fixedCharge, setFixedCharge] = useState(DEFAULTS.fixedCharge);
  const [duty, setDuty] = useState(DEFAULTS.duty);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateBill({
        appliances: appliances.map((item) => ({
          id: item.id,
          name: item.name,
          watts: toNumber(item.watts),
          hoursPerDay: toNumber(item.hoursPerDay),
          quantity: toNumber(item.quantity),
          daysPerMonth: toNumber(item.daysPerMonth),
        })),
        tariff: toNumber(tariff),
        fixedCharge: toNumber(fixedCharge),
        dutyPercent: toNumber(duty),
      }),
    [appliances, tariff, fixedCharge, duty],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Appliance-wise electricity cost",
      `Units a month: ${num(result.totalKwh)} kWh`,
      `Energy charge: ${money2(result.energyCharge)}`,
      `Electricity duty: ${money2(result.duty)}`,
      `Fixed charges: ${money2(result.fixedCharge)}`,
      `Estimated bill: ${money2(result.totalBill)}`,
      "",
      ...result.ranked.map(
        (row) => `${row.name}: ${num(row.kwhPerMonth)} kWh, ${money(row.monthlyCost)} (${num(row.sharePercent)}%)`,
      ),
    ].join("\n");
  }, [ok, result]);

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
    setAppliances(DEFAULT_APPLIANCES);
    setTariff(DEFAULTS.tariff);
    setFixedCharge(DEFAULTS.fixedCharge);
    setDuty(DEFAULTS.duty);
    setCopied(false);
  };

  const updateItem = (id, field, value) =>
    setAppliances((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const applyPreset = (id, presetId) =>
    setAppliances((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const preset = presetById(presetId);
        if (!preset) return { ...item, presetId: "custom" };
        return {
          ...item,
          presetId,
          name: preset.label,
          watts: String(preset.watts),
          hoursPerDay: String(preset.hours),
        };
      }),
    );

  const addItem = () =>
    setAppliances((prev) => {
      const nextId = prev.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          presetId: "led-tube",
          name: "LED tube light",
          watts: "20",
          hoursPerDay: "6",
          quantity: "1",
          daysPerMonth: "30",
        },
      ];
    });

  const removeItem = (id) =>
    setAppliances((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Electricity bill
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Appliance Wise Electricity Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One kilowatt-hour is one unit on your bill. Enter what you run and for how long to see
          which appliance is actually driving the bill, and what each one costs a month.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your tariff</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="el-tariff">
              Energy charge per unit (INR/kWh)
            </label>
            <input
              id="el-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Take the slab rate from your latest bill — domestic tariffs are usually telescopic
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-fixed">
              Fixed / demand charges for the month (INR)
            </label>
            <input
              id="el-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={fixedCharge}
              onChange={(event) => setFixedCharge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="el-duty">
              Electricity duty (%)
            </label>
            <input
              id="el-duty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="0.5"
              value={duty}
              onChange={(event) => setDuty(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Levied by your state on the energy charge; the rate is printed on the bill
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Appliances</h2>
          <button type="button" onClick={addItem} className={GHOST_BTN} aria-label="Add an appliance">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add appliance
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {appliances.map((item) => (
            <div key={item.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`el-preset-${item.id}`}>
                    Appliance
                  </label>
                  <select
                    id={`el-preset-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={item.presetId}
                    onChange={(event) => applyPreset(item.id, event.target.value)}
                  >
                    {APPLIANCE_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} — {preset.watts} W
                      </option>
                    ))}
                    <option value="custom">Something else (set the wattage yourself)</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`el-name-${item.id}`}>
                    Label
                  </label>
                  <input
                    id={`el-name-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.name}
                    onChange={(event) => updateItem(item.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`el-watts-${item.id}`}>
                    Power rating (watts)
                  </label>
                  <input
                    id={`el-watts-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="5"
                    value={item.watts}
                    onChange={(event) => updateItem(item.id, "watts", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`el-hours-${item.id}`}>
                    Hours run a day
                  </label>
                  <input
                    id={`el-hours-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max={MAX_HOURS_PER_DAY}
                    step="0.5"
                    value={item.hoursPerDay}
                    onChange={(event) => updateItem(item.id, "hoursPerDay", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`el-qty-${item.id}`}>
                    How many
                  </label>
                  <input
                    id={`el-qty-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`el-days-${item.id}`}>
                    Days used in the month
                  </label>
                  <input
                    id={`el-days-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={MAX_DAYS_PER_MONTH}
                    step="1"
                    value={item.daysPerMonth}
                    onChange={(event) => updateItem(item.id, "daysPerMonth", event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                    aria-label={`Remove ${item.name}`}
                    disabled={appliances.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
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
              Estimated monthly bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.totalBill) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${num(result.totalKwh)} units${result.biggest ? ` · ${result.biggest.name} is the biggest draw at ${num(result.biggest.sharePercent)}%` : ""}`
                : "Fix the highlighted input to estimate the bill."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy appliance electricity cost breakdown"
              className={GHOST_BTN}
              disabled={!ok}
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
          {[
            ["Units consumed a month", ok ? `${num(result.totalKwh)} kWh` : DASH],
            ["Energy charge", ok ? money2(result.energyCharge) : DASH],
            ["Electricity duty", ok ? money2(result.duty) : DASH],
            ["Fixed / demand charges", ok ? money2(result.fixedCharge) : DASH],
            ["Effective cost per unit", ok ? money2(result.effectiveRatePerUnit) : DASH],
            ["Connected load", ok ? `${num(result.connectedLoadKw)} kW` : DASH],
            ["Units a year", ok ? `${num(result.totalKwhPerYear)} kWh` : DASH],
            ["Cost a year", ok ? money(result.annualBill) : DASH],
            ["Carbon output a month", ok ? `${num(result.co2KgPerMonth)} kg CO2` : DASH],
            ["Carbon output a year", ok ? `${num(result.co2KgPerYear)} kg CO2` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Biggest consumers first</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Appliance</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Watts x qty</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Units/month</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cost/month</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.watts} W x {row.quantity}
                    </td>
                    <td className="py-2 pr-3 text-right">{num(row.kwhPerMonth)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(row.monthlyCost)}</td>
                    <td className="py-2 text-right">{num(row.sharePercent)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-2">
            {result.ranked.map((row) => (
              <div key={row.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-[var(--muted-foreground)]">
                  {row.name}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                  <span
                    className="block h-full bg-[var(--primary)]"
                    style={{ width: `${Math.max(0, Math.min(100, row.sharePercent))}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-xs font-semibold">
                  {num(row.sharePercent)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate for planning. Domestic tariffs in most states are telescopic, so the rate rises
        with consumption and a single average rate will not match the bill exactly. Compressor-driven
        appliances such as fridges and inverter air conditioners cycle on and off, so enter the hours
        the compressor actually runs rather than the hours the plug is on. Carbon uses about{" "}
        {GRID_EMISSION_KG_PER_KWH} kg CO2 per unit for the Indian grid.
      </p>
    </main>
  );
}
