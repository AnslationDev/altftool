"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  ADDONS,
  CITY_TIERS,
  FREQUENCIES,
  GST_RATE,
  SERVICE_TYPES,
  compareServiceTypes,
  estimateCleaningCost,
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
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ADDONS = {
  sofaSeat: "0",
  mattress: "0",
  carpet: "0",
  descale: "0",
  chimney: "0",
  fridge: "0",
  glass: "0",
  tank: "0",
};

export default function ToolHome() {
  const [area, setArea] = useState("1000");
  const [serviceType, setServiceType] = useState("deep-furnished");
  const [cityTier, setCityTier] = useState("tier1");
  const [frequency, setFrequency] = useState("oneoff");
  const [includeGst, setIncludeGst] = useState(true);
  const [addons, setAddons] = useState(DEFAULT_ADDONS);
  const [copied, setCopied] = useState(false);

  const inputs = useMemo(() => {
    const numericAddons = {};
    for (const addon of ADDONS) {
      const raw = String(addons[addon.id] ?? "").trim();
      numericAddons[addon.id] = raw === "" ? 0 : Number(raw);
    }
    return {
      areaSqft: String(area).trim() === "" ? NaN : Number(area),
      serviceType,
      cityTier,
      addons: numericAddons,
      frequency,
      includeGst,
    };
  }, [area, serviceType, cityTier, frequency, includeGst, addons]);

  const quote = useMemo(() => estimateCleaningCost(inputs), [inputs]);
  const comparison = useMemo(() => compareServiceTypes(inputs), [inputs]);

  const ok = !quote.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "House Cleaning Cost Estimate",
      `${quote.serviceLabel} · ${area} sq ft · ${quote.tierLabel}`,
      `Rate: ${money2(quote.perSqftRate)} per sq ft`,
      `Area charge: ${money(quote.areaCharge)}`,
      `Add-ons: ${money(quote.addonCharge)}`,
      quote.discountAmount > 0 ? `Contract discount: -${money(quote.discountAmount)}` : null,
      quote.gstAmount > 0 ? `GST at 18%: ${money(quote.gstAmount)}` : "GST: not charged",
      `Total per visit: ${money(quote.totalPerVisit)}`,
      `${quote.frequencyLabel}: ${money(quote.totalPerYear)} a year (${money(quote.monthlyEquivalent)} a month)`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, quote, area]);

  const setAddon = (id, value) => setAddons((previous) => ({ ...previous, [id]: value }));

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
    setArea("1000");
    setServiceType("deep-furnished");
    setCityTier("tier1");
    setFrequency("oneoff");
    setIncludeGst(true);
    setAddons(DEFAULT_ADDONS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">House Cleaning Cost Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prices a professional clean the way agencies do — a per-sq-ft rate for the service type,
          adjusted for your city tier, plus itemised add-ons, the contract discount and 18% GST.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-area">
              Carpet area (sq ft)
            </label>
            <input
              id="cc-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="20000"
              step="50"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-tier">
              City tier
            </label>
            <select
              id="cc-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cityTier}
              onChange={(event) => setCityTier(event.target.value)}
            >
              {CITY_TIERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-service">
              Type of clean
            </label>
            <select
              id="cc-service"
              className={`mt-2 ${INPUT_CLASS}`}
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
            >
              {SERVICE_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-freq">
              How often
            </label>
            <select
              id="cc-freq"
              className={`mt-2 ${INPUT_CLASS}`}
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
            >
              {FREQUENCIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                  {entry.discount > 0 ? ` — ${PCT.format(entry.discount)} contract discount` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          htmlFor="cc-gst"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        >
          <input
            id="cc-gst"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={includeGst}
            onChange={(event) => setIncludeGst(event.target.checked)}
          />
          <span>Provider is GST-registered (adds 18% under SAC 998533)</span>
        </label>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Add-on services</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {ADDONS.map((addon) => (
              <div key={addon.id}>
                <label className={LABEL_CLASS} htmlFor={`cc-a-${addon.id}`}>
                  {addon.label}
                </label>
                <input
                  id={`cc-a-${addon.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max={addon.max}
                  step="1"
                  value={addons[addon.id] ?? ""}
                  onChange={(event) => setAddon(addon.id, event.target.value)}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {money(addon.rate)} per {addon.unit}
                </p>
              </div>
            ))}
          </div>
        </fieldset>
      </section>

      {quote.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {quote.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated cost per visit
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(quote.totalPerVisit) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money2(quote.effectivePerSqft)} per sq ft all-in · ${quote.frequencyLabel.toLowerCase()}`
                : "Fix the inputs above to see a price"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cleaning cost estimate"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy quote"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rate applied", ok ? `${money2(quote.perSqftRate)} per sq ft` : DASH],
            ["Area charge", ok ? money(quote.areaCharge) : DASH],
            ["Add-ons", ok ? money(quote.addonCharge) : DASH],
            [
              "Minimum call-out floor",
              ok ? (quote.minimumApplied ? `${money(quote.minCharge)} applied` : `${money(quote.minCharge)} — not needed`) : DASH,
            ],
            ["Subtotal", ok ? money(quote.subtotal) : DASH],
            [
              "Contract discount",
              ok ? (quote.discountRate > 0 ? `-${money(quote.discountAmount)} (${PCT.format(quote.discountRate)})` : "None") : DASH,
            ],
            ["GST", ok ? (quote.gstRate > 0 ? `${money(quote.gstAmount)} at ${PCT.format(GST_RATE)}` : "Not charged") : DASH],
            ["Visits a year", ok ? String(quote.visitsPerYear) : DASH],
            ["Cost per year", ok ? money(quote.totalPerYear) : DASH],
            ["Spread per month", ok ? money(quote.monthlyEquivalent) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && quote.addonRows.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Add-on breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Service</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate</th>
                  <th scope="col" className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quote.addonRows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">
                      {row.qty} {row.unit}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money2(row.unitRate)}
                    </td>
                    <td className="py-2 text-right">{money(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What the other service levels would cost</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Service</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Rate / sq ft</th>
                  <th scope="col" className="py-2 text-right font-semibold">Per visit</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.id === serviceType ? "text-[var(--primary)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">
                      <span className="block font-semibold">{row.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{row.note}</span>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {row.perSqftRate === null ? DASH : money2(row.perSqftRate)}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {row.totalPerVisit === null ? DASH : money(row.totalPerVisit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates are market reference figures for Indian home-service providers and vary by locality,
        season and access. GST at 18% applies to general cleaning services under SAC 998533; a
        provider below the registration threshold may quote without it. Always confirm scope,
        materials and the minimum charge in writing before booking.
      </p>
    </main>
  );
}
