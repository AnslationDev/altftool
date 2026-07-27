"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import {
  CAR_CC_BANDS,
  CAR_KW_BANDS,
  CPA_PREMIUM_PER_YEAR,
  CPA_SUM_INSURED,
  EV_DISCOUNT_PERCENT,
  GST_RATE_PERCENT,
  LONG_TERM_YEARS,
  TP_RATES_EFFECTIVE_FROM,
  TW_CC_BANDS,
  TW_KW_BANDS,
  estimateTpPremium,
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

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  vehicleClass: "car",
  fuel: "ice",
  rating: "1200",
  term: "annual",
  includeCpa: true,
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [vehicleClass, setVehicleClass] = useState(DEFAULTS.vehicleClass);
  const [fuel, setFuel] = useState(DEFAULTS.fuel);
  const [rating, setRating] = useState(DEFAULTS.rating);
  const [term, setTerm] = useState(DEFAULTS.term);
  const [includeCpa, setIncludeCpa] = useState(DEFAULTS.includeCpa);
  const [copied, setCopied] = useState(false);

  const isElectric = fuel === "ev";

  const result = useMemo(
    () =>
      estimateTpPremium({
        vehicleClass,
        isElectric,
        rating: toNumber(rating),
        term,
        includeCpa,
      }),
    [vehicleClass, isElectric, rating, term, includeCpa],
  );

  const ok = !result.error;

  const bands = useMemo(() => {
    if (vehicleClass === "car") return isElectric ? CAR_KW_BANDS : CAR_CC_BANDS;
    return isElectric ? TW_KW_BANDS : TW_CC_BANDS;
  }, [vehicleClass, isElectric]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Third Party Motor Premium Estimate",
      `${vehicleClass === "car" ? "Private car" : "Two-wheeler"} · ${isElectric ? "Electric" : "Petrol / diesel / CNG"} · ${result.band}`,
      `Policy term: ${result.years} year${result.years > 1 ? "s" : ""}`,
      `Third party premium: ${money2(result.tpPremium)}`,
      `Owner-driver personal accident cover: ${money2(result.cpaPremium)}`,
      `GST at ${GST_RATE_PERCENT}%: ${money2(result.gst)}`,
      `Total payable: ${money2(result.total)}`,
      `Rates notified with effect from ${TP_RATES_EFFECTIVE_FROM}`,
    ].join("\n");
  }, [ok, result, vehicleClass, isElectric]);

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
    setVehicleClass(DEFAULTS.vehicleClass);
    setFuel(DEFAULTS.fuel);
    setRating(DEFAULTS.rating);
    setTerm(DEFAULTS.term);
    setIncludeCpa(DEFAULTS.includeCpa);
    setCopied(false);
  };

  const unitLabel = isElectric ? "Motor power (kW)" : "Engine capacity (cc)";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Motor insurance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Third Party Motor Premium Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Third party motor premium is fixed by notification, not by the insurer. Pick your vehicle
          class and engine size to see the statutory rate, the owner-driver cover and GST.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-class">
              Vehicle class
            </label>
            <select
              id="tp-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleClass}
              onChange={(event) => setVehicleClass(event.target.value)}
            >
              <option value="car">Private car</option>
              <option value="twoWheeler">Two-wheeler</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-fuel">
              Propulsion
            </label>
            <select
              id="tp-fuel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fuel}
              onChange={(event) => setFuel(event.target.value)}
            >
              <option value="ice">Petrol / diesel / CNG</option>
              <option value="ev">Battery electric</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-rating">
              {unitLabel}
            </label>
            <input
              id="tp-rating"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step={isElectric ? "1" : "10"}
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-term">
              Policy term
            </label>
            <select
              id="tp-term"
              className={`mt-2 ${INPUT_CLASS}`}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            >
              <option value="annual">Annual (renewal)</option>
              <option value="longTerm">
                Long term for a new vehicle ({LONG_TERM_YEARS[vehicleClass]} years)
              </option>
            </select>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"
          htmlFor="tp-cpa"
        >
          <input
            id="tp-cpa"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={includeCpa}
            onChange={(event) => setIncludeCpa(event.target.checked)}
          />
          Add owner-driver personal accident cover ({money(CPA_SUM_INSURED)} at{" "}
          {money(CPA_PREMIUM_PER_YEAR)} a year)
        </label>
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
              Total payable including GST
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(result.total) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.band} · ${result.years} year policy · ${money2(result.perYear)} a year`
                : "Correct the input above to see the notified rate."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy third party premium estimate"
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
            ["Notified third party premium", ok ? money2(result.tpPremium) : DASH],
            [
              "Owner-driver personal accident cover",
              ok ? (result.cpaPremium > 0 ? money2(result.cpaPremium) : "Not added") : DASH,
            ],
            ["Taxable premium", ok ? money2(result.taxable) : DASH],
            [`GST at ${GST_RATE_PERCENT}%`, ok ? money2(result.gst) : DASH],
            ["Total payable", ok ? money2(result.total) : DASH],
            ["Works out to per month", ok ? money2(result.monthlyEquivalent) : DASH],
            [
              `Electric vehicle concession (${EV_DISCOUNT_PERCENT}%)`,
              ok ? (result.isElectric ? `${money2(result.evSaving)} saved` : "Not applicable") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          Notified rate table for this vehicle class
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  1 year
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  {LONG_TERM_YEARS[vehicleClass]} years
                </th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band) => (
                <tr
                  key={band.label}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    ok && result.band === band.label ? "font-semibold text-[var(--primary)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 pr-3 text-right">{money(band.annual)}</td>
                  <td className="py-2 text-right">{money(band.longTerm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate using the third party rates notified with effect from{" "}
        {TP_RATES_EFFECTIVE_FROM}. Rates are revised from time to time and commercial, goods and
        passenger-carrying vehicles use separate tables. The own damage part of a comprehensive
        policy is priced by each insurer and is not included here.
      </p>
    </main>
  );
}
