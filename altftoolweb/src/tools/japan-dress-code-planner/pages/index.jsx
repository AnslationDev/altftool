"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shirt, Thermometer, TriangleAlert } from "lucide-react";

import {
  DESTINATION,
  MAX_LAUNDRY_DAYS,
  MAX_TRIP_DAYS,
  MIN_LAUNDRY_DAYS,
  MIN_TRIP_DAYS,
  MONTHS,
  REGIONS,
  VENUES,
  planDressCode,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const CHECK_ROW =
  "flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  monthIndex: "3",
  regionId: "kanto",
  tripDays: "10",
  laundryEveryDays: "5",
};
const DEFAULT_VENUES = ["temples", "walking", "tatami-restaurants"];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [venueIds, setVenueIds] = useState(DEFAULT_VENUES);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleVenue = (id) =>
    setVenueIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      planDressCode({
        monthIndex: form.monthIndex === "" ? Number.NaN : Number(form.monthIndex),
        regionId: form.regionId,
        tripDays: form.tripDays === "" ? Number.NaN : Number(form.tripDays),
        laundryEveryDays:
          form.laundryEveryDays === "" ? Number.NaN : Number(form.laundryEveryDays),
        venueIds,
      }),
    [form, venueIds],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${DESTINATION.name} packing and dress plan — ${result.month}, ${result.region.label}`,
      `Typical month: ${result.meanTempC} °C mean, about ${result.rainfallMm} mm of rain (${result.band.label})`,
      `Trip: ${result.tripDays} days, laundry every ${result.laundryEveryDays} days`,
      "",
      `PACK ${result.totalItems} ITEMS`,
      ...result.packingList.map((item) => `  ${item.quantity} x ${item.label}`),
      "",
      "Dress rules for where you are going:",
      ...result.requirements.map((entry) => `  ${entry.label}: ${entry.rule}`),
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
    setVenueIds(DEFAULT_VENUES);
    setCopied(false);
  };

  const selectedRegion = REGIONS.find((region) => region.id === form.regionId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Shirt className="h-4 w-4" aria-hidden="true" />
          {DESTINATION.name}
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Japan Dress Code Planner for Travellers
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {DESTINATION.headline}
        </p>
      </header>

      <section className={CARD_CLASS}>
        <h2 className="text-base font-semibold">When and where</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="in-month">
              Month of travel
            </label>
            <select
              id="in-month"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.monthIndex}
              onChange={(event) => setField("monthIndex", event.target.value)}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={String(index)}>
                  {month}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>Climate normals, not a forecast.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-region">
              Region
            </label>
            <select
              id="in-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.regionId}
              onChange={(event) => setField("regionId", event.target.value)}
            >
              {REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{selectedRegion?.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-days">
              Trip length (days)
            </label>
            <input
              id="in-days"
              type="number"
              inputMode="numeric"
              min={MIN_TRIP_DAYS}
              max={MAX_TRIP_DAYS}
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tripDays}
              onChange={(event) => setField("tripDays", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-laundry">
              Laundry every (days)
            </label>
            <input
              id="in-laundry"
              type="number"
              inputMode="numeric"
              min={MIN_LAUNDRY_DAYS}
              max={MAX_LAUNDRY_DAYS}
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.laundryEveryDays}
              onChange={(event) => setField("laundryEveryDays", event.target.value)}
            />
            <p className={HINT_CLASS}>
              Coin laundries are everywhere in Japan, so a short cycle cuts the bag in half.
            </p>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">Where you will actually go</h2>
        <p className={HINT_CLASS}>Each one adds its own rule and, where it matters, its own items.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {VENUES.map((venue) => (
            <label className={CHECK_ROW} key={venue.id} htmlFor={`venue-${venue.id}`}>
              <input
                id={`venue-${venue.id}`}
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={venueIds.includes(venue.id)}
                onChange={() => toggleVenue(venue.id)}
              />
              <span>
                <span className="block font-medium">{venue.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                  {venue.strictness}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD_CLASS}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Items to pack
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : result.totalItems}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the plan."
                : `${result.month} in ${result.region.station} — ${result.band.label.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Japan packing and dress plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Mean daily temperature", hasError ? DASH : `${result.meanTempC} °C`],
            ["Typical monthly rainfall", hasError ? DASH : `${result.rainfallMm} mm`],
            ["Layering band", hasError ? DASH : result.band.label],
            [
              "Clothing cycle",
              hasError
                ? DASH
                : `${result.cycleDays} days of clothes for a ${result.tripDays}-day trip`,
            ],
            ["Shoes come off", hasError ? DASH : result.anyShoesOff ? "Yes, daily" : "Not at the places you ticked"],
            [
              "Covered shoulders and knees needed",
              hasError ? DASH : result.needsShoulders || result.needsKnees ? "Yes, for at least one venue" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2">
            <Thermometer className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <p className="text-sm text-[var(--muted-foreground)]">{result.band.advice}</p>
          </div>
        )}
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">The packing list</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                  <th className="py-2 pr-3 font-semibold">Qty</th>
                  <th className="py-2 pr-3 font-semibold">Item</th>
                  <th className="py-2 font-semibold">Why that many</th>
                </tr>
              </thead>
              <tbody>
                {result.packingList.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3 font-semibold tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 pr-3 font-medium">{item.label}</td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">What each place expects</h2>
          <ul className="mt-3 grid gap-3 text-sm">
            {result.requirements.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{entry.label}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                    {entry.strictness}
                  </span>
                  {entry.shoesOff ? (
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
                      shoes off
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block text-[var(--muted-foreground)]">{entry.rule}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.warnings.length > 0 && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2">
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="text-[var(--muted-foreground)]">{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning aid only. The temperature and rainfall figures are rounded long-run monthly
        averages for one station in each region, not a forecast, and any given week can sit well
        outside them. Venue dress rules vary by establishment — check with your ryokan, restaurant
        or host if it matters.
      </p>
    </main>
  );
}
