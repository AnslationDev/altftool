"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UtensilsCrossed } from "lucide-react";

import { PROGRAMS, compareDishwashing } from "../lib";

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
  programId: "eco",
  cycleKwh: "",
  cycleLitres: "",
  detergentCost: "12",
  tapFlowLpm: "8",
  handMinutes: "15",
  hotSharePct: "60",
  coldInletC: "25",
  hotWaterC: "45",
  heaterEfficiency: "0.95",
  soapCost: "4",
  tariff: "8",
  waterPricePerKl: "30",
  hourlyValue: "0",
  cyclesPerWeek: "7",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      compareDishwashing({
        programId: form.programId,
        cycleKwh: form.cycleKwh.trim() === "" ? null : form.cycleKwh,
        cycleLitres: form.cycleLitres.trim() === "" ? null : form.cycleLitres,
        detergentCost: form.detergentCost,
        tapFlowLpm: form.tapFlowLpm,
        handMinutes: form.handMinutes,
        hotSharePct: form.hotSharePct,
        coldInletC: form.coldInletC,
        hotWaterC: form.hotWaterC,
        heaterEfficiency: form.heaterEfficiency,
        soapCost: form.soapCost,
        tariff: form.tariff,
        waterPricePerKl: form.waterPricePerKl,
        hourlyValue: form.hourlyValue,
        cyclesPerWeek: form.cyclesPerWeek,
      }),
    [form],
  );

  const error = result.error || "";
  const ok = !error;
  const winner = ok
    ? result.cheaperOption === "dishwasher"
      ? "The dishwasher is cheaper"
      : result.cheaperOption === "hand"
        ? "Hand washing is cheaper"
        : "Both cost the same"
    : "";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Dishwasher vs hand washing",
      `Programme: ${result.program.label} — ${NUM.format(result.kwhCycle)} kWh, ${NUM.format(result.litresCycle)} L per cycle`,
      `Dishwasher cost per load: ${INR2.format(result.dwTotal)}`,
      `Hand washing cost per load: ${INR2.format(result.handTotal)}`,
      `${winner} by ${INR2.format(Math.abs(result.savingPerCycle))} a load`,
      `Water difference: ${NUM.format(result.waterSavedPerCycle)} L saved per load by the machine`,
      `Yearly difference: ${INR.format(Math.abs(result.savingPerYear))}`,
    ].join("\n");
  }, [ok, result, winner]);

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
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dishwasher Running Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a dishwasher cycle against washing the same load by hand — electricity, water,
          detergent and, if you want to count it, your own time.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Dishwasher</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="dw-program">
              Programme
            </label>
            <select id="dw-program" className={INPUT} value={form.programId} onChange={set("programId")}>
              {PROGRAMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.kwh} kWh, {p.litres} L
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-detergent">
              Detergent per cycle (INR)
            </label>
            <input
              id="dw-detergent"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.detergentCost}
              onChange={set("detergentCost")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-kwh">
              Label energy per cycle (kWh, optional)
            </label>
            <input
              id="dw-kwh"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              placeholder="Leave blank to use the programme figure"
              value={form.cycleKwh}
              onChange={set("cycleKwh")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-litres">
              Label water per cycle (litres, optional)
            </label>
            <input
              id="dw-litres"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              placeholder="Leave blank to use the programme figure"
              value={form.cycleLitres}
              onChange={set("cycleLitres")}
            />
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Hand washing the same load</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="dw-flow">
              Tap flow rate (litres per minute)
            </label>
            <input
              id="dw-flow"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.tapFlowLpm}
              onChange={set("tapFlowLpm")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-minutes">
              Minutes at the running tap
            </label>
            <input
              id="dw-minutes"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.handMinutes}
              onChange={set("handMinutes")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-hotshare">
              Share of water drawn hot (%)
            </label>
            <input
              id="dw-hotshare"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={form.hotSharePct}
              onChange={set("hotSharePct")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-soap">
              Dish soap per wash (INR)
            </label>
            <input
              id="dw-soap"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.soapCost}
              onChange={set("soapCost")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-cold">
              Cold supply temperature (degC)
            </label>
            <input
              id="dw-cold"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.coldInletC}
              onChange={set("coldInletC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-hot">
              Washing-up water temperature (degC)
            </label>
            <input
              id="dw-hot"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.hotWaterC}
              onChange={set("hotWaterC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-eff">
              Water heater efficiency (0-1)
            </label>
            <input
              id="dw-eff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.05"
              value={form.heaterEfficiency}
              onChange={set("heaterEfficiency")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dw-hourly">
              Value of your time (INR per hour)
            </label>
            <input
              id="dw-hourly"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.hourlyValue}
              onChange={set("hourlyValue")}
            />
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Prices and frequency</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="dw-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="dw-tariff"
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
            <label className={LABEL} htmlFor="dw-water">
              Water price (INR per 1000 litres)
            </label>
            <input
              id="dw-water"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={form.waterPricePerKl}
              onChange={set("waterPricePerKl")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="dw-cycles">
              Loads washed per week
            </label>
            <input
              id="dw-cycles"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="70"
              step="1"
              value={form.cyclesPerWeek}
              onChange={set("cyclesPerWeek")}
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
              Difference per load
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(Math.abs(result.savingPerCycle)) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${winner} — ${money(Math.abs(result.savingPerYear))} a year` : "Fix the highlighted input to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy dishwasher cost comparison"
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
            ["Dishwasher electricity per load", ok ? money2(result.dwElectricity) : "—"],
            ["Dishwasher water per load", ok ? `${money2(result.dwWaterCost)} (${num(result.litresCycle)} L)` : "—"],
            ["Dishwasher detergent per load", ok ? money2(result.detergent) : "—"],
            ["Dishwasher total per load", ok ? money2(result.dwTotal) : "—"],
            ["Hand-wash water used", ok ? `${num(result.handLitres)} L (${num(result.hotLitres)} L hot)` : "—"],
            ["Hand-wash heating energy", ok ? `${num(result.handKwh)} kWh` : "—"],
            ["Hand-wash electricity per load", ok ? money2(result.handElectricity) : "—"],
            ["Hand-wash water + soap per load", ok ? money2(result.handWaterAndSoapCost) : "—"],
            ["Hand-wash time valued at", ok ? money2(result.handTimeCost) : "—"],
            ["Hand-wash total per load", ok ? money2(result.handTotal) : "—"],
            ["Water saved by the machine", ok ? `${num(result.waterSavedPerCycle)} L per load` : "—"],
            ["Water saved per year", ok ? `${num(result.waterSavedPerYear)} L` : "—"],
            ["Hours at the sink avoided per year", ok ? num(result.handHoursPerYear, " h") : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. The comparison is only fair when the dishwasher runs full and the hand-wash
        figures reflect how you actually wash — a filled basin uses far less water than a running tap.
      </p>
    </main>
  );
}
