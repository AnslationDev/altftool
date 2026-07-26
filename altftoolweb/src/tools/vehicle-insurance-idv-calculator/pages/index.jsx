"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

/** IRDAI depreciation grid used to fix IDV on own-damage cover. */
const AGE_BANDS = [
  { id: "0-6m", label: "Not exceeding 6 months", depreciation: 5 },
  { id: "6m-1y", label: "6 months to 1 year", depreciation: 15 },
  { id: "1-2y", label: "1 year to 2 years", depreciation: 20 },
  { id: "2-3y", label: "2 years to 3 years", depreciation: 30 },
  { id: "3-4y", label: "3 years to 4 years", depreciation: 40 },
  { id: "4-5y", label: "4 years to 5 years", depreciation: 50 },
  { id: "5y+", label: "Over 5 years (mutually agreed)", depreciation: null },
];

const DEFAULTS = {
  exShowroom: 900000,
  band: "2-3y",
  accessories: 25000,
  customDepreciation: 60,
  adjustment: 0,
  odRate: 3,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [exShowroom, setExShowroom] = useState(String(DEFAULTS.exShowroom));
  const [band, setBand] = useState(DEFAULTS.band);
  const [accessories, setAccessories] = useState(String(DEFAULTS.accessories));
  const [customDepreciation, setCustomDepreciation] = useState(String(DEFAULTS.customDepreciation));
  const [adjustment, setAdjustment] = useState(String(DEFAULTS.adjustment));
  const [odRate, setOdRate] = useState(String(DEFAULTS.odRate));
  const [copied, setCopied] = useState(false);

  const selectedBand = AGE_BANDS.find((entry) => entry.id === band) ?? AGE_BANDS[0];
  const isOldVehicle = selectedBand.depreciation === null;

  const calc = useMemo(() => {
    const price = toNumber(exShowroom);
    const extras = toNumber(accessories);
    const custom = toNumber(customDepreciation);
    const adjust = toNumber(adjustment);
    const rate = toNumber(odRate);

    if ([price, extras, custom, adjust, rate].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (price <= 0) return { error: "Ex-showroom price must be greater than zero." };
    if (extras < 0) return { error: "Accessory value cannot be negative." };
    if (rate < 0 || rate > 20) return { error: "Own-damage rate should be between 0% and 20%." };
    if (adjust < -15 || adjust > 15) {
      return { error: "Insurers normally allow the IDV to be varied by only ±15%." };
    }

    const depreciationRate = isOldVehicle ? custom : selectedBand.depreciation;
    if (depreciationRate < 0 || depreciationRate > 95) {
      return { error: "Depreciation for a vehicle over 5 years old should be between 0% and 95%." };
    }

    const base = price + extras;
    const factor = 1 - depreciationRate / 100;
    const vehicleIdv = price * factor;
    const accessoryIdv = extras * factor;
    const standardIdv = vehicleIdv + accessoryIdv;
    const finalIdv = standardIdv * (1 + adjust / 100);
    const depreciationAmount = base - standardIdv;
    const odPremium = (finalIdv * rate) / 100;

    return {
      price,
      extras,
      base,
      depreciationRate,
      vehicleIdv,
      accessoryIdv,
      standardIdv,
      finalIdv,
      depreciationAmount,
      odPremium,
      minIdv: standardIdv * 0.85,
      maxIdv: standardIdv * 1.15,
      adjust,
      rate,
    };
  }, [exShowroom, accessories, customDepreciation, adjustment, odRate, selectedBand, isOldVehicle]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Vehicle Insurance IDV Calculator",
      `Ex-showroom price: ${money(calc.price)}`,
      `Accessories not factory fitted: ${money(calc.extras)}`,
      `Vehicle age band: ${selectedBand.label}`,
      `Depreciation applied: ${pct(calc.depreciationRate)}`,
      `Depreciation amount: ${money(calc.depreciationAmount)}`,
      `Standard IDV: ${money(calc.standardIdv)}`,
      `Adjustment: ${pct(calc.adjust)}`,
      `Final IDV: ${money(calc.finalIdv)}`,
      `Indicative own-damage premium at ${pct(calc.rate)}: ${money(calc.odPremium)}`,
    ].join("\n");
  }, [calc, selectedBand]);

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
    setExShowroom(String(DEFAULTS.exShowroom));
    setBand(DEFAULTS.band);
    setAccessories(String(DEFAULTS.accessories));
    setCustomDepreciation(String(DEFAULTS.customDepreciation));
    setAdjustment(String(DEFAULTS.adjustment));
    setOdRate(String(DEFAULTS.odRate));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Motor insurance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vehicle Insurance IDV Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Insured Declared Value is the ex-showroom price of your car or bike less the depreciation
          fixed by the IRDAI age grid. It is the maximum a total-loss or theft claim can pay, so it
          is worth checking before you renew.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-price">
              Ex-showroom price (INR)
            </label>
            <input
              id="idv-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={exShowroom}
              onChange={(event) => setExShowroom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-band">
              Vehicle age
            </label>
            <select
              id="idv-band"
              className={`mt-2 ${INPUT_CLASS}`}
              value={band}
              onChange={(event) => setBand(event.target.value)}
            >
              {AGE_BANDS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                  {entry.depreciation === null ? "" : ` — ${entry.depreciation}%`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-accessories">
              Accessories not factory fitted (INR)
            </label>
            <input
              id="idv-accessories"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={accessories}
              onChange={(event) => setAccessories(event.target.value)}
            />
          </div>
          {isOldVehicle && (
            <div>
              <label className={LABEL_CLASS} htmlFor="idv-custom-dep">
                Agreed depreciation (% — over 5 years)
              </label>
              <input
                id="idv-custom-dep"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="95"
                step="1"
                value={customDepreciation}
                onChange={(event) => setCustomDepreciation(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-adjust">
              IDV adjustment (% — insurers allow ±15)
            </label>
            <input
              id="idv-adjust"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-15"
              max="15"
              step="1"
              value={adjustment}
              onChange={(event) => setAdjustment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-od-rate">
              Own-damage rate (% of IDV)
            </label>
            <input
              id="idv-od-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.1"
              value={odRate}
              onChange={(event) => setOdRate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Insured Declared Value
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.finalIdv)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  After {pct(calc.depreciationRate)} depreciation on {money(calc.base)} of insurable
                  value
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy IDV result"
                  className={GHOST_BTN}
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
                ["Ex-showroom price", money(calc.price)],
                ["Accessories added", money(calc.extras)],
                ["Depreciation rate", pct(calc.depreciationRate)],
                ["Depreciation deducted", `− ${money(calc.depreciationAmount)}`],
                ["IDV of the vehicle", money(calc.vehicleIdv)],
                ["IDV of accessories", money(calc.accessoryIdv)],
                ["Standard IDV before adjustment", money(calc.standardIdv)],
                ["Negotiable IDV range (±15%)", `${money(calc.minIdv)} – ${money(calc.maxIdv)}`],
                [`Indicative own-damage premium at ${pct(calc.rate)}`, money(calc.odPremium)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">IRDAI depreciation grid</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Age of vehicle
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Depreciation
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      IDV on this car
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {AGE_BANDS.map((entry) => {
                    const rate =
                      entry.depreciation === null ? calc.depreciationRate : entry.depreciation;
                    const rowIdv = calc.base * (1 - rate / 100);
                    return (
                      <tr
                        key={entry.id}
                        className={`border-b border-[var(--border)] last:border-0 ${
                          entry.id === band ? "text-[var(--primary)]" : ""
                        }`}
                      >
                        <td className="py-2 pr-3 font-semibold">{entry.label}</td>
                        <td className="py-2 pr-3 text-right">
                          {entry.depreciation === null ? `${pct(rate)} (agreed)` : pct(rate)}
                        </td>
                        <td className="py-2 text-right">{money(rowIdv)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. IDV excludes registration charges, road tax and the insurance cost
        itself. Own-damage rates are de-tariffed, so the premium shown is indicative only — your
        insurer&apos;s quote will reflect model, city, add-ons and no claim bonus.
      </p>
    </main>
  );
}
