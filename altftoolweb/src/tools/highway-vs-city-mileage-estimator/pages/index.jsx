"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { blendMileage, epaStyleCombined } from "../lib";

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
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num1 = (value) => (Number.isFinite(value) ? NUM1.format(value) : "—");
const num2 = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const DEFAULTS = {
  cityKmpl: "11",
  highwayKmpl: "18",
  citySharePct: "60",
  monthlyKm: "1000",
  fuelPrice: "105",
};

const SHARE_PRESETS = [
  { label: "City only", value: "100" },
  { label: "Mostly city", value: "75" },
  { label: "EPA 55/45", value: "55" },
  { label: "Even mix", value: "50" },
  { label: "Mostly highway", value: "25" },
];

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [cityKmpl, setCityKmpl] = useState(DEFAULTS.cityKmpl);
  const [highwayKmpl, setHighwayKmpl] = useState(DEFAULTS.highwayKmpl);
  const [citySharePct, setCitySharePct] = useState(DEFAULTS.citySharePct);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      blendMileage({
        cityKmpl: toNumber(cityKmpl),
        highwayKmpl: toNumber(highwayKmpl),
        citySharePct: toNumber(citySharePct),
        monthlyKm: toNumber(monthlyKm),
        fuelPrice: toNumber(fuelPrice),
      }),
    [cityKmpl, highwayKmpl, citySharePct, monthlyKm, fuelPrice],
  );

  const epa = useMemo(() => {
    const outcome = epaStyleCombined({
      cityKmpl: toNumber(cityKmpl),
      highwayKmpl: toNumber(highwayKmpl),
    });
    return outcome.error ? null : outcome;
  }, [cityKmpl, highwayKmpl]);

  const error = result.error ?? null;
  const view = error ? null : result;

  const summary = useMemo(() => {
    if (!view) return "";
    return [
      "Highway vs City Mileage",
      `Mix: ${num1(view.cityShare * 100)}% city / ${num1(view.highwayShare * 100)}% highway`,
      `Combined mileage: ${num2(view.blendedKmpl)} km/l`,
      `Consumption: ${num2(view.litresPer100Km)} l/100 km`,
      `Simple average would wrongly say: ${num2(view.arithmeticMean)} km/l`,
      `Fuel per month: ${num1(view.monthlyLitres)} litres`,
      `Fuel cost per month: ${money(view.monthlyCost)}`,
      `Fuel cost per year: ${money(view.yearlyCost)}`,
    ].join("\n");
  }, [view]);

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
    setCityKmpl(DEFAULTS.cityKmpl);
    setHighwayKmpl(DEFAULTS.highwayKmpl);
    setCitySharePct(DEFAULTS.citySharePct);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setFuelPrice(DEFAULTS.fuelPrice);
    setCopied(false);
  };

  const cityBar = view ? Math.max(0, Math.min(100, view.cityFuelShare * 100)) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Combined mileage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Highway vs City Mileage Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two mileage figures and your driving mix give one honest combined number. The blend is
          fuel-weighted, so thirsty city kilometres pull the average down as much as they should.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mix-city">
              City mileage (km per litre)
            </label>
            <input
              id="mix-city"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={cityKmpl}
              onChange={(event) => setCityKmpl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mix-highway">
              Highway mileage (km per litre)
            </label>
            <input
              id="mix-highway"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={highwayKmpl}
              onChange={(event) => setHighwayKmpl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mix-share">
              Share of distance driven in the city (%)
            </label>
            <input
              id="mix-share"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={citySharePct}
              onChange={(event) => setCitySharePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mix-monthly">
              Distance per month (km)
            </label>
            <input
              id="mix-monthly"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={monthlyKm}
              onChange={(event) => setMonthlyKm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mix-price">
              Fuel price (per litre)
            </label>
            <input
              id="mix-price"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SHARE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => setCitySharePct(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Combined mileage
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {view ? `${num2(view.blendedKmpl)} km/l` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {view
                ? `${num1(view.cityShare * 100)}% city · ${num1(view.highwayShare * 100)}% highway`
                : "Fix the highlighted input to see your combined figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy combined mileage result"
              className={GHOST_BTN}
              disabled={!view}
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
              aria-label="Reset the mileage mix"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Consumption", view ? `${num2(view.litresPer100Km)} litres / 100 km` : "—"],
            ["Simple average (wrong method)", view ? `${num2(view.arithmeticMean)} km/l` : "—"],
            [
              "How much that overstates economy",
              view ? `${num2(view.naiveError)} km/l (${num1(view.naiveErrorPct)}%)` : "—",
            ],
            ["EPA-style 55/45 combined", epa ? `${num2(epa.blendedKmpl)} km/l` : "—"],
            ["City kilometres per month", view ? `${num1(view.cityKm)} km` : "—"],
            ["Highway kilometres per month", view ? `${num1(view.highwayKm)} km` : "—"],
            ["Fuel used per month", view ? `${num1(view.monthlyLitres)} litres` : "—"],
            ["Fuel cost per km", view ? money2(view.costPerKm) : "—"],
            ["Fuel cost per month", view ? money(view.monthlyCost) : "—"],
            ["Fuel cost per year", view ? money(view.yearlyCost) : "—"],
            ["If it were all city driving", view ? `${money(view.allCityCost)} a month` : "—"],
            ["If it were all highway driving", view ? `${money(view.allHighwayCost)} a month` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`City driving burns ${num1(cityBar)} percent of your fuel`}
          >
            <span className="block h-full bg-[var(--danger)]" style={{ width: `${cityBar}%` }} />
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${100 - cityBar}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Share of fuel burnt: city {num1(cityBar)}% · highway {num1(100 - cityBar)}%
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        City and highway figures are yours to supply — measure them tank to tank on the two kinds of
        road rather than using brochure numbers, which come from a controlled test cycle.
      </p>
    </main>
  );
}
