"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw } from "lucide-react";

import { compareEvPetrol } from "../lib";

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
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULTS = {
  batteryKwh: "30",
  evRangeKm: "250",
  homeTariff: "8",
  publicTariff: "20",
  homeSharePct: "80",
  chargingEfficiencyPct: "88",
  evMaintenancePerKm: "0.4",
  petrolMileage: "16",
  petrolPrice: "105",
  petrolMaintenancePerKm: "1.2",
  annualKm: "15000",
  evPricePremium: "500000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => compareEvPetrol(form), [form]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "EV vs Petrol Running Cost",
      `EV: ${NUM1.format(result.kwhPer100Km)} kWh/100 km, ${INR2.format(result.evTotalPerKm)} per km`,
      `Petrol: ${NUM1.format(result.petrolLitresPer100Km)} L/100 km, ${INR2.format(result.petrolTotalPerKm)} per km`,
      `Difference: ${INR2.format(Math.abs(result.savingPerKm))} per km in favour of ${result.cheaper === "ev" ? "the EV" : result.cheaper === "petrol" ? "petrol" : "neither"}`,
      `At ${INT.format(result.annualKm)} km a year: EV ${INR.format(result.evAnnual)}, petrol ${INR.format(result.petrolAnnual)}`,
      result.paybackNote,
      `CO2: ${NUM3.format(result.evCo2PerKm)} vs ${NUM3.format(result.petrolCo2PerKm)} kg per km`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const evRows = [
    ["Consumption at the wheels", hasError ? DASH : `${NUM1.format(result.kwhPer100Km)} kWh / 100 km`],
    ["Drawn from the socket", hasError ? DASH : `${NUM3.format(result.gridKwhPerKm)} kWh per km`],
    ["Blended tariff", hasError ? DASH : `${INR2.format(result.blendedTariff)} per kWh`],
    ["Energy cost", hasError ? DASH : `${INR2.format(result.evEnergyPerKm)} per km`],
    ["Maintenance", hasError ? DASH : `${INR2.format(result.evMaintenancePerKm)} per km`],
    ["Cost of one full charge", hasError ? DASH : INR.format(result.evFullChargeCost)],
    ["CO2 from the grid", hasError ? DASH : `${NUM3.format(result.evCo2PerKm)} kg per km`],
  ];

  const petrolRows = [
    ["Consumption", hasError ? DASH : `${NUM1.format(result.petrolLitresPer100Km)} L / 100 km`],
    ["Fuel cost", hasError ? DASH : `${INR2.format(result.petrolFuelPerKm)} per km`],
    ["Maintenance", hasError ? DASH : `${INR2.format(result.petrolMaintenancePerKm)} per km`],
    ["Total", hasError ? DASH : `${INR2.format(result.petrolTotalPerKm)} per km`],
    ["CO2 from the tailpipe", hasError ? DASH : `${NUM3.format(result.petrolCo2PerKm)} kg per km`],
  ];

  const yearRows = [
    ["EV per year", hasError ? DASH : INR.format(result.evAnnual)],
    ["Petrol per year", hasError ? DASH : INR.format(result.petrolAnnual)],
    ["Difference per year", hasError ? DASH : INR.format(Math.abs(result.annualSaving))],
    ["EV price premium", hasError ? DASH : INR.format(result.premium)],
    ["Break-even distance", hasError ? DASH : result.paybackKm === null ? "Never on these inputs" : `${INT.format(result.paybackKm)} km`],
    ["Break-even time", hasError ? DASH : result.paybackYears === null ? "Never on these inputs" : `${NUM1.format(result.paybackYears)} years`],
    ["CO2 avoided per year", hasError ? DASH : `${INT.format(result.co2SavedPerYearKg)} kg`],
  ];

  const field = (id, label, key, step, min, hint) => (
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
        step={step}
        value={form[key]}
        onChange={set(key)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          EV &amp; charging
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">EV vs Petrol Running Cost</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compares rupees per kilometre honestly — charging losses included, home and public
          charging blended, and the higher purchase price of the EV paid back over real distance.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The electric car</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("ev-battery", "Usable battery (kWh)", "batteryKwh", "0.5", "0")}
          {field("ev-range", "Real-world range (km)", "evRangeKm", "5", "0", "Use the range you actually see, not the claimed figure.")}
          {field("ev-home-tariff", "Home tariff (INR per kWh)", "homeTariff", "0.5", "0")}
          {field("ev-public-tariff", "Public charger tariff (INR per kWh)", "publicTariff", "0.5", "0")}
          {field("ev-home-share", "Charging done at home (%)", "homeSharePct", "5", "0")}
          {field("ev-eff", "Charging efficiency (%)", "chargingEfficiencyPct", "1", "1", "AC home charging is typically 85–90%.")}
          {field("ev-maint", "EV maintenance (INR per km)", "evMaintenancePerKm", "0.1", "0")}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The petrol car</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("petrol-mileage", "Mileage (km per litre)", "petrolMileage", "0.5", "0")}
          {field("petrol-price", "Petrol price (INR per litre)", "petrolPrice", "0.5", "0")}
          {field("petrol-maint", "Petrol maintenance (INR per km)", "petrolMaintenancePerKm", "0.1", "0")}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your usage</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("usage-km", "Kilometres per year", "annualKm", "500", "0")}
          {field("usage-premium", "How much more the EV costs to buy (INR)", "evPricePremium", "10000", "0")}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Running cost gap
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : result.cheaper === "ev" ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              {hasError ? DASH : `${INR2.format(Math.abs(result.savingPerKm))} / km`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a comparison."
                : result.cheaper === "ev"
                  ? `The EV runs ${NUM1.format(Math.abs(result.savingPct))}% cheaper per km — ${INR2.format(result.evTotalPerKm)} against ${INR2.format(result.petrolTotalPerKm)}.`
                  : result.cheaper === "petrol"
                    ? `Petrol runs cheaper here — ${INR2.format(result.petrolTotalPerKm)} against ${INR2.format(result.evTotalPerKm)} per km.`
                    : "The two cost exactly the same per kilometre."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy EV versus petrol comparison"
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

        <h3 className="mt-6 text-sm font-semibold">Electric</h3>
        <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
          {evRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-6 text-sm font-semibold">Petrol</h3>
        <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
          {petrolRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-6 text-sm font-semibold">Over a year, and payback</h3>
        <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
          {yearRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.paybackNote}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Running cost only. Insurance, road tax, depreciation, finance interest and any eventual
        battery replacement are excluded — add them before making a purchase decision. Grid CO2 uses
        an average Indian factor of 0.71 kg per kWh; rooftop solar charging is far lower.
      </p>
    </main>
  );
}
