"use client";

import { useMemo, useState } from "react";
import { Car, Check, Copy, RotateCcw } from "lucide-react";

import { IDV_DEPRECIATION_SLABS, computeIdv, depreciationForMonths, monthsBetween } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : DASH);

const DEFAULTS = {
  price: "1000000",
  accessories: "0",
  registration: "2023-04-01",
  valuation: "2026-04-01",
  odRate: "3",
  agreed: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [accessories, setAccessories] = useState(DEFAULTS.accessories);
  const [registration, setRegistration] = useState(DEFAULTS.registration);
  const [valuation, setValuation] = useState(DEFAULTS.valuation);
  const [odRate, setOdRate] = useState(DEFAULTS.odRate);
  const [agreed, setAgreed] = useState(DEFAULTS.agreed);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeIdv({
        exShowroomPrice: price.trim() === "" ? NaN : Number(price),
        accessoriesValue: accessories.trim() === "" ? 0 : Number(accessories),
        registrationDate: registration,
        valuationDate: valuation,
        odRatePct: odRate.trim() === "" ? 0 : Number(odRate),
        agreedDepreciationPct: agreed.trim() === "" ? null : agreed,
      }),
    [price, accessories, registration, valuation, odRate, agreed],
  );

  const error = result.error || null;

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Vehicle IDV Calculation",
      `Ex-showroom price: ${money(Number(price))}`,
      `Accessories declared separately: ${money(Number(accessories) || 0)}`,
      `Vehicle age at policy start: ${result.ageText} (${result.ageMonths} months)`,
      `Depreciation slab: ${result.slabLabel}`,
      `Depreciation applied: ${NUM.format(result.depreciationRate)}%`,
      `IDV of the vehicle: ${money(result.vehicleIdv)}`,
      `IDV of accessories: ${money(result.accessoriesIdv)}`,
      `Total Insured Declared Value: ${money(result.totalIdv)}`,
      `Own-damage premium at ${NUM.format(result.odRatePct)}%: ${money(result.odPremium)}`,
    ].join("\n");
  }, [error, result, price, accessories]);

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
    const isDefault =
      price === DEFAULTS.price &&
      accessories === DEFAULTS.accessories &&
      registration === DEFAULTS.registration &&
      valuation === DEFAULTS.valuation &&
      odRate === DEFAULTS.odRate &&
      agreed === DEFAULTS.agreed;
    if (!isDefault && !window.confirm("Reset all inputs to the default example? This cannot be undone.")) {
      return;
    }
    setPrice(DEFAULTS.price);
    setAccessories(DEFAULTS.accessories);
    setRegistration(DEFAULTS.registration);
    setValuation(DEFAULTS.valuation);
    setOdRate(DEFAULTS.odRate);
    setAgreed(DEFAULTS.agreed);
    setCopied(false);
  };

  // Whether the "Agreed depreciation" field should be shown depends only on the
  // vehicle's age (from the two dates), never on whether the agreed-depreciation
  // value the user typed into that same field is itself valid. Otherwise typing
  // an out-of-range value (which makes computeIdv() return an error) would
  // immediately unmount the very field the user needs to fix it in.
  const agreedFieldAgeMonths = monthsBetween(registration, valuation);
  const showAgreedField =
    agreedFieldAgeMonths !== null &&
    agreedFieldAgeMonths >= 0 &&
    depreciationForMonths(agreedFieldAgeMonths).mutuallyAgreed;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Car className="h-4 w-4" aria-hidden="true" />
          Motor insurance
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Vehicle IDV Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out the Insured Declared Value of a car or two-wheeler from the ex-showroom price and
          the GR.8 depreciation slabs of the India Motor Tariff — the figure your insurer pays on a
          total loss or theft claim.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
              step="1000"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-accessories">
              Extra fitted accessories (INR)
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
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-registration">
              First registration date
            </label>
            <input
              id="idv-registration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={registration}
              onChange={(event) => setRegistration(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-valuation">
              Policy start date
            </label>
            <input
              id="idv-valuation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={valuation}
              onChange={(event) => setValuation(event.target.value)}
            />
          </div>
          <div className={showAgreedField ? "" : "sm:col-span-2"}>
            <label className={LABEL_CLASS} htmlFor="idv-od-rate">
              Own-damage rate from your quote (%)
            </label>
            <input
              id="idv-od-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="25"
              step="0.1"
              value={odRate}
              onChange={(event) => setOdRate(event.target.value)}
            />
          </div>
          {showAgreedField ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="idv-agreed">
                Agreed depreciation (%, over 5 years)
              </label>
              <input
                id="idv-agreed"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="95"
                step="1"
                placeholder={String(result.depreciationRate)}
                value={agreed}
                onChange={(event) => setAgreed(event.target.value)}
              />
            </div>
          ) : null}
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Insured Declared Value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : money(result.totalIdv)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `${result.ageText} old · ${NUM.format(result.depreciationRate)}% depreciation`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy IDV calculation"
              className={GHOST_BTN}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Listed value before depreciation", error ? DASH : money(result.listedValue)],
            ["Depreciation slab applied", error ? DASH : result.slabLabel],
            ["Depreciation percentage", error ? DASH : pct(result.depreciationRate)],
            ["Depreciation in rupees", error ? DASH : money(result.depreciationAmount)],
            ["IDV of the vehicle", error ? DASH : money(result.vehicleIdv)],
            ["IDV of accessories", error ? DASH : money(result.accessoriesIdv)],
            [
              "Own-damage premium at your rate",
              error ? DASH : `${money(result.odPremium)} at ${pct(result.odRatePct)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && result.mutuallyAgreed ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            The tariff does not fix a depreciation percentage beyond five years — IDV is agreed
            between you and the insurer based on the vehicle's condition. The{" "}
            {NUM.format(result.depreciationRate)}% shown is an indicative market figure
            {result.overridden ? " you entered" : ""}, not a rule. Ask for the IDV in writing before
            you renew.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">GR.8 depreciation slabs</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Age of the vehicle</th>
                <th scope="col" className="py-2 text-right font-semibold">Depreciation</th>
              </tr>
            </thead>
            <tbody>
              {IDV_DEPRECIATION_SLABS.map((slab) => (
                <tr
                  key={slab.label}
                  className={`border-b border-[var(--border)] last:border-0 ${!error && result.slabLabel === slab.label ? "text-[var(--primary)]" : ""}`}
                >
                  <td className="py-2 pr-3">{slab.label}</td>
                  <td className="py-2 text-right font-semibold">{pct(slab.rate * 100)}</td>
                </tr>
              ))}
              <tr className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3">Exceeding 5 years, and obsolete models</td>
                <td className="py-2 text-right font-semibold">Mutually agreed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not insurance advice. IDV is based on the manufacturer's listed
        ex-showroom price for your exact variant and excludes registration charges, road tax and the
        premium itself. Insurers may offer an IDV band around the tariff figure — a lower IDV cuts
        your premium but also cuts the payout on a total-loss or theft claim. Confirm the figure on
        your policy schedule with your insurer.
      </p>
    </main>
  );
}
