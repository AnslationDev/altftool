"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fan, RotateCcw } from "lucide-react";

import {
  FAN_PRESETS,
  MAX_SPEED_STEP,
  affinityPowerFraction,
  computeFanCost,
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

const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : "—");
const num = (v, unit = "") => (Number.isFinite(v) ? `${NUM.format(v)}${unit}` : "—");

const DEFAULTS = {
  existingWatts: "75",
  newWatts: "30",
  loadFactor: "1",
  fanCount: "3",
  hoursPerDay: "12",
  monthsPerYear: "8",
  tariff: "8",
  newFanPrice: "3200",
  oldFanValue: "200",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SPEED_STEPS = Array.from({ length: MAX_SPEED_STEP }, (_, i) => i + 1);

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => computeFanCost(form), [form]);
  const error = result.error || "";
  const ok = !error;

  const applySpeed = (step) => {
    const fraction = affinityPowerFraction(step);
    if (fraction === null) return;
    setForm((prev) => ({ ...prev, loadFactor: fraction.toFixed(3) }));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Ceiling fan electricity cost",
      `Current fans: ${NUM.format(result.oldKwhPerYear)} kWh a year, ${INR.format(result.oldCostPerYear)}`,
      `After BLDC upgrade: ${NUM.format(result.newKwhPerYear)} kWh a year, ${INR.format(result.newCostPerYear)}`,
      `Saving: ${INR.format(result.savingPerYear)} a year (${NUM.format(result.savingSharePct)}%)`,
      `Upgrade cost: ${INR.format(result.netUpgradeCost)}`,
      result.paybackMonths === null
        ? "Payback: never at these wattages"
        : `Payback: ${NUM.format(result.paybackMonths)} months`,
      `Net saving after 5 years: ${INR.format(result.fiveYearNetSaving)}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fan className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ceiling Fan Electricity Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price the fans you already run, then see how long a BLDC replacement takes to pay for
          itself in saved units.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="fan-existing">
              Current fan power at full speed (watts)
            </label>
            <input
              id="fan-existing"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.existingWatts}
              onChange={set("existingWatts")}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {FAN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={CHIP}
                  onClick={() => setForm((prev) => ({ ...prev, existingWatts: String(preset.watts) }))}
                >
                  {preset.label} ({preset.watts} W)
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="fan-new">
              BLDC fan power at full speed (watts)
            </label>
            <input
              id="fan-new"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.newWatts}
              onChange={set("newWatts")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="fan-load">
              Load factor — share of full power at the speed you use (0-1)
            </label>
            <input
              id="fan-load"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.05"
              max="1"
              step="0.05"
              value={form.loadFactor}
              onChange={set("loadFactor")}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Electronically controlled fans follow the affinity law, where power falls with the cube
              of speed. Use these buttons only if your fan has electronic speed control — an old
              resistive regulator burns the difference as heat and saves almost nothing.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPEED_STEPS.map((step) => (
                <button key={step} type="button" className={CHIP} onClick={() => applySpeed(step)}>
                  Speed {step}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="fan-count">
              Number of fans
            </label>
            <input
              id="fan-count"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={form.fanCount}
              onChange={set("fanCount")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="fan-hours">
              Running hours per day
            </label>
            <input
              id="fan-hours"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={form.hoursPerDay}
              onChange={set("hoursPerDay")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="fan-months">
              Months of the year the fans run
            </label>
            <input
              id="fan-months"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="12"
              step="1"
              value={form.monthsPerYear}
              onChange={set("monthsPerYear")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="fan-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="fan-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.tariff}
              onChange={set("tariff")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="fan-price">
              Price of one BLDC fan (INR)
            </label>
            <input
              id="fan-price"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.newFanPrice}
              onChange={set("newFanPrice")}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="fan-salvage">
              Resale value of one old fan (INR)
            </label>
            <input
              id="fan-salvage"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.oldFanValue}
              onChange={set("oldFanValue")}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              BLDC upgrade payback
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (result.paybackMonths === null ? "No payback" : num(result.paybackMonths, " months")) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money(result.netUpgradeCost)} spent, ${money(result.savingPerYear)} saved every year`
                : "Fix the highlighted input to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy ceiling fan cost and payback result"
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
            ["Days of use per year", ok ? num(result.daysPerYear) : "—"],
            ["Current draw per fan at your speed", ok ? num(result.oldRunWatts, " W") : "—"],
            ["BLDC draw per fan at your speed", ok ? num(result.newRunWatts, " W") : "—"],
            ["Current fans — energy per year", ok ? `${num(result.oldKwhPerYear)} kWh` : "—"],
            ["Current fans — cost per month", ok ? money2(result.oldCostPerMonth) : "—"],
            ["Current fans — cost per year", ok ? money(result.oldCostPerYear) : "—"],
            ["After upgrade — energy per year", ok ? `${num(result.newKwhPerYear)} kWh` : "—"],
            ["After upgrade — cost per year", ok ? money(result.newCostPerYear) : "—"],
            ["Saving per month", ok ? money2(result.savingPerMonth) : "—"],
            ["Saving per year", ok ? `${money(result.savingPerYear)} (${num(result.savingSharePct, "%")})` : "—"],
            ["Net upgrade cost", ok ? money(result.netUpgradeCost) : "—"],
            ["Net position after 5 years", ok ? money(result.fiveYearNetSaving) : "—"],
            ["Net position after 10 years", ok ? money(result.tenYearNetSaving) : "—"],
            ["Estimated CO2 avoided per year", ok ? `${num(result.co2SavedKgPerYear)} kg` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only, using simple payback with no discounting or tariff escalation. Check the
        BEE label on any fan you buy — service value in cubic metres per minute per watt tells you
        how much air you get for those watts, which matters as much as the wattage itself.
      </p>
    </main>
  );
}
