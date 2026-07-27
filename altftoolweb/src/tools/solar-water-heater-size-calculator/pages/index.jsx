"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShowerHead } from "lucide-react";

import { BATHING_STYLES, COLLECTOR_TYPES, computeSolarWaterHeater } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : "—");
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : "—");

const DEFAULTS = {
  adults: "4",
  children: "0",
  bathingStyle: "shortShower",
  bathsPerDay: "1",
  kitchenLitres: "20",
  useTempC: "40",
  coldTempC: "25",
  storeTempC: "60",
  collectorType: "fpc",
  solarFractionPct: "70",
  tariff: "8",
  geyserEfficiency: "0.9",
  systemCost: "35000",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeSolarWaterHeater({
        adults: num(form.adults),
        children: num(form.children),
        bathingStyle: form.bathingStyle,
        bathsPerDay: num(form.bathsPerDay),
        kitchenLitres: num(form.kitchenLitres),
        useTempC: num(form.useTempC),
        coldTempC: num(form.coldTempC),
        storeTempC: num(form.storeTempC),
        collectorType: form.collectorType,
        solarFractionPct: num(form.solarFractionPct),
        tariff: num(form.tariff),
        geyserEfficiency: num(form.geyserEfficiency),
        systemCost: num(form.systemCost),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Solar Water Heater Size Calculator",
      `Hot water used: ${n0(result.demandLitres)} litres/day at ${form.useTempC} °C`,
      `Same as ${n1(result.storedLitresNeeded)} litres stored at ${form.storeTempC} °C`,
      `Recommended system: ${result.recommendedLpd} LPD`,
      `${result.collectorLabel}: ${n1(result.collectorAreaSqm)} m² collector, about ${n1(result.roofAreaSqm)} m² of roof`,
      `Heat delivered: ${n2(result.dailyKwhThermal)} kWh/day`,
      `Electricity saved: ${n2(result.dailyKwhSaved)} kWh/day · ${n0(result.annualKwhSaved)} kWh/year`,
      `Money saved: ${money(result.monthlySavings)}/month · ${money(result.annualSavings)}/year`,
      `Backup heating still needed: ${n0(result.annualKwhBackup)} kWh/year (${money(result.annualBackupCost)})`,
      result.paybackYears ? `Payback: ${n1(result.paybackYears)} years` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, form.useTempC, form.storeTempC]);

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
          <ShowerHead className="h-4 w-4" aria-hidden="true" />
          Solar thermal
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Solar Water Heater Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Systems are sold in litres per day at 60&nbsp;°C, but you bathe at about 40&nbsp;°C. This
          converts your real household usage through the mixing equation, so you buy the size you
          need instead of the size on the brochure.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Household</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="swh-adults">
              Adults
            </label>
            <input
              id="swh-adults"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.adults}
              onChange={set("adults")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-children">
              Children
            </label>
            <input
              id="swh-children"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.children}
              onChange={set("children")}
            />
            <p className={HINT}>Counted at 60% of an adult&apos;s water use.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="swh-style">
              How does the family bathe?
            </label>
            <select id="swh-style" className={INPUT} value={form.bathingStyle} onChange={set("bathingStyle")}>
              {Object.values(BATHING_STYLES).map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label} — {style.hint} ({style.litres} L)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-baths">
              Baths per person per day
            </label>
            <input
              id="swh-baths"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.bathsPerDay}
              onChange={set("bathsPerDay")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-kitchen">
              Kitchen &amp; laundry hot water (L/day)
            </label>
            <input
              id="swh-kitchen"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={form.kitchenLitres}
              onChange={set("kitchenLitres")}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Temperatures</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="swh-use">
              Bathing temperature (°C)
            </label>
            <input
              id="swh-use"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="26"
              max="60"
              step="1"
              value={form.useTempC}
              onChange={set("useTempC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-cold">
              Mains inlet temperature (°C)
            </label>
            <input
              id="swh-cold"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={form.coldTempC}
              onChange={set("coldTempC")}
            />
            <p className={HINT}>Roughly 15 °C in a north Indian winter, 28 °C in a coastal summer.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="swh-store">
              Tank storage temperature (°C)
            </label>
            <input
              id="swh-store"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="40"
              max="90"
              step="1"
              value={form.storeTempC}
              onChange={set("storeTempC")}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">System and running cost</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="swh-collector">
              Collector type
            </label>
            <select
              id="swh-collector"
              className={INPUT}
              value={form.collectorType}
              onChange={set("collectorType")}
            >
              {Object.values(COLLECTOR_TYPES).map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} — {type.hint}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-fraction">
              Solar fraction (%)
            </label>
            <input
              id="swh-fraction"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="5"
              value={form.solarFractionPct}
              onChange={set("solarFractionPct")}
            />
            <p className={HINT}>Share of the year the sun covers. 60–80% for most of India.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-tariff">
              Electricity tariff (₹ per kWh)
            </label>
            <input
              id="swh-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.tariff}
              onChange={set("tariff")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-eff">
              Electric geyser efficiency
            </label>
            <input
              id="swh-eff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.01"
              value={form.geyserEfficiency}
              onChange={set("geyserEfficiency")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="swh-cost">
              Installed cost after subsidy (₹, 0 to skip)
            </label>
            <input
              id="swh-cost"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.systemCost}
              onChange={set("systemCost")}
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
              Recommended system
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.recommendedLpd} LPD`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a recommendation"
                : `${n0(result.demandLitres)} L/day at ${form.useTempC} °C = ${n1(result.storedLitresNeeded)} L stored at ${form.storeTempC} °C`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy solar water heater sizing result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.oversizedBeyondCatalogue && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
            Your demand exceeds the largest domestic system. This is commercial territory — expect a
            bank of collectors and a custom tank.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bathing water", hasError ? "—" : `${n0(result.bathingLitres)} L/day (${result.styleLabel.toLowerCase()})`],
            ["Kitchen & laundry", hasError ? "—" : `${n0(result.kitchenLitres)} L/day`],
            ["Total at bathing temperature", hasError ? "—" : `${n0(result.demandLitres)} L/day`],
            ["Blend ratio applied", hasError ? "—" : `× ${n2(result.blendRatio)}`],
            ["Litres needed at storage temperature", hasError ? "—" : `${n1(result.storedLitresNeeded)} L/day`],
            ["Heat delivered", hasError ? "—" : `${n2(result.dailyKwhThermal)} kWh/day`],
            ["Collector area", hasError ? "—" : `${n1(result.collectorAreaSqm)} m² (${result.collectorLabel})`],
            ["Roof space to allow", hasError ? "—" : `${n1(result.roofAreaSqm)} m²`],
            ["Electricity saved", hasError ? "—" : `${n2(result.dailyKwhSaved)} kWh/day · ${n0(result.annualKwhSaved)} kWh/year`],
            ["Money saved", hasError ? "—" : `${money(result.monthlySavings)}/month · ${money(result.annualSavings)}/year`],
            ["Backup heating still needed", hasError ? "—" : `${n0(result.annualKwhBackup)} kWh/year · ${money(result.annualBackupCost)}`],
            [
              "Simple payback",
              hasError ? "—" : result.paybackYears ? `${n1(result.paybackYears)} years` : "enter a system cost",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate, not a quotation. Hard water shortens evacuated tube life sharply, a
        cloudy monsoon week will lean on the backup element, and the tank must sit above the outlets
        or be pumped. Confirm roof loading and plumbing runs with your installer.
      </p>
    </main>
  );
}
