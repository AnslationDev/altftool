"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Home, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  FACING,
  FURNISHING,
  LISTING_TYPES,
  buildListingPrompt,
} from "../lib";

const INR0 = new Intl.NumberFormat("en-IN", {
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
const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  listingType: "sale",
  bedrooms: "2",
  bathrooms: "2",
  carpetSqft: "850",
  builtUpSqft: "1100",
  floor: "7",
  totalFloors: "14",
  price: "12000000",
  depositMonths: "3",
  ageYears: "3",
  locality: "Baner",
  city: "Pune",
  facing: "east",
  furnishing: "semi",
  highlights: "Covered parking, corner unit, society gym and a park across the lane",
  channel: "portal",
  reraRegistered: false,
  reraNumber: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildListingPrompt({
        listingType: form.listingType,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        carpetSqft: Number(form.carpetSqft),
        builtUpSqft: Number(form.builtUpSqft),
        floor: Number(form.floor),
        totalFloors: Number(form.totalFloors),
        price: Number(form.price),
        depositMonths: Number(form.depositMonths),
        ageYears: Number(form.ageYears),
        locality: form.locality,
        city: form.city,
        facing: form.facing,
        furnishing: form.furnishing,
        highlights: form.highlights,
        channel: form.channel,
        reraRegistered: form.reraRegistered,
        reraNumber: form.reraNumber,
      }),
    [form],
  );

  const hasError = Boolean(result.error);
  const isRent = form.listingType === "rent";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
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

  const rows = [
    [
      "Carpet area",
      hasError ? DASH : `${NUM.format(Number(form.carpetSqft))} sq ft (${NUM1.format(result.carpetSqm)} sq m)`,
    ],
    [
      "Loading factor over carpet",
      hasError || result.loadingPercent === null ? DASH : `${NUM1.format(result.loadingPercent)}%`,
    ],
    [
      isRent ? "Security deposit" : "Prompt length",
      hasError
        ? DASH
        : isRent
          ? INR0.format(result.depositAmount)
          : `${NUM.format(result.charCount)} characters`,
    ],
    [
      isRent ? "Rent for a year" : "Words in the prompt",
      hasError ? DASH : isRent ? INR0.format(result.annualRent) : NUM.format(result.wordCount),
    ],
    ["Listing channel", hasError ? DASH : result.channel.label],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Home className="h-4 w-4" aria-hidden="true" />
          Property listings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Real Estate Listing Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the property facts once. The prompt comes out with the carpet-area rate, the loading
          factor and the advertising rules already written in, so the copy you get back stays inside
          what you can actually claim.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-type">
              Listing type
            </label>
            <select
              id="listing-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.listingType}
              onChange={(event) => update("listingType", event.target.value)}
            >
              {LISTING_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-channel">
              Where will it be published?
            </label>
            <select
              id="listing-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.channel}
              onChange={(event) => update("channel", event.target.value)}
            >
              {CHANNELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-locality">
              Locality
            </label>
            <input
              id="listing-locality"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.locality}
              onChange={(event) => update("locality", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-city">
              City
            </label>
            <input
              id="listing-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-beds">
              Bedrooms (BHK)
            </label>
            <input
              id="listing-beds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={form.bedrooms}
              onChange={(event) => update("bedrooms", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-baths">
              Bathrooms
            </label>
            <input
              id="listing-baths"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={form.bathrooms}
              onChange={(event) => update("bathrooms", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-carpet">
              Carpet area (sq ft)
            </label>
            <input
              id="listing-carpet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.carpetSqft}
              onChange={(event) => update("carpetSqft", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-builtup">
              Built-up area (sq ft, 0 if unknown)
            </label>
            <input
              id="listing-builtup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={form.builtUpSqft}
              onChange={(event) => update("builtUpSqft", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-floor">
              Floor (0 for ground)
            </label>
            <input
              id="listing-floor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.floor}
              onChange={(event) => update("floor", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-total-floors">
              Total floors
            </label>
            <input
              id="listing-total-floors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="200"
              step="1"
              value={form.totalFloors}
              onChange={(event) => update("totalFloors", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-price">
              {isRent ? "Monthly rent (INR)" : "Asking price (INR)"}
            </label>
            <input
              id="listing-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
            />
          </div>
          {isRent ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="listing-deposit">
                Deposit (months of rent)
              </label>
              <input
                id="listing-deposit"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="36"
                step="1"
                value={form.depositMonths}
                onChange={(event) => update("depositMonths", event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="listing-age">
                Building age (years)
              </label>
              <input
                id="listing-age"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="200"
                step="1"
                value={form.ageYears}
                onChange={(event) => update("ageYears", event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-facing">
              Facing
            </label>
            <select
              id="listing-facing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.facing}
              onChange={(event) => update("facing", event.target.value)}
            >
              {FACING.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-furnishing">
              Furnishing
            </label>
            <select
              id="listing-furnishing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.furnishing}
              onChange={(event) => update("furnishing", event.target.value)}
            >
              {FURNISHING.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="listing-highlights">
            Owner notes and amenities (facts only)
          </label>
          <textarea
            id="listing-highlights"
            className={`mt-2 ${AREA_CLASS}`}
            rows={2}
            value={form.highlights}
            onChange={(event) => update("highlights", event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="listing-rera">
            <input
              id="listing-rera"
              type="checkbox"
              className={CHECK_CLASS}
              checked={form.reraRegistered}
              onChange={(event) => update("reraRegistered", event.target.checked)}
            />
            This is a RERA-registered project ad
          </label>
          <div>
            <label className={LABEL_CLASS} htmlFor="listing-rera-number">
              RERA registration number
            </label>
            <input
              id="listing-rera-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              disabled={!form.reraRegistered}
              value={form.reraNumber}
              onChange={(event) => update("reraNumber", event.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {isRent ? "Rent per sq ft of carpet" : "Carpet area rate"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : isRent
                  ? `${INR2.format(result.ratePerSqft)}`
                  : `${INR0.format(result.ratePerSqft)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the fields above to build the prompt."
                : isRent
                  ? "per sq ft of carpet area, per month"
                  : "per sq ft of carpet area"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated listing prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset every field"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="whitespace-pre-wrap break-words p-3 font-mono text-xs leading-6 text-[var(--foreground)] sm:text-sm">
            {hasError ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Advertising obligations differ by state RERA authority
        and by whether you are a promoter, an agent or an individual owner. Confirm your disclosure
        duties with a qualified professional before you publish.
      </p>
    </main>
  );
}
