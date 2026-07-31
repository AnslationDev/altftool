"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shirt } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { MONTHS, REGIONS, VENUES, planWardrobe } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const KG = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  regionId: "northeast",
  monthIndex: 9,
  tripDays: 9,
  laundryEveryDays: 5,
  venueIds: ["broadway","fine-dining","theme-park"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [regionId, setRegionId] = useState(DEFAULTS.regionId);
  const [monthIndex, setMonthIndex] = useState(String(DEFAULTS.monthIndex));
  const [tripDays, setTripDays] = useState(String(DEFAULTS.tripDays));
  const [laundry, setLaundry] = useState(String(DEFAULTS.laundryEveryDays));
  const [venueIds, setVenueIds] = useState(DEFAULTS.venueIds);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const plan = useMemo(
    () =>
      planWardrobe({
        regionId,
        monthIndex,
        tripDays,
        laundryEveryDays: laundry,
        venueIds,
      }),
    [regionId, monthIndex, tripDays, laundry, venueIds],
  );

  const hasError = Boolean(plan.error);

  const toggleVenue = (id) => {
    setVenueIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "USA Dress Code Planner",
      `Month: ${plan.climate.month} (${NUM.format(plan.climate.avgHighC)}°C high / ${NUM.format(plan.climate.avgLowC)}°C low, ${plan.climate.rainMm} mm rain)`,
      `Packing for a ${plan.cycleDays}-day wash cycle`,
      "",
      "Rules that apply:",
      ...plan.requirements.map((r) => `- ${r}`),
      "",
      "Pack:",
      ...plan.packing.map((row) => `- ${row.item} x${row.qty}`),
      "",
      `${plan.totalItems} items, about ${KG.format(plan.totalKg)} kg of clothing`,
    ].join("\n");
  }, [plan, hasError]);

  const copyResult = () => copy("summary", summary, { label: "USA dress code packing plan" });

  const reset = () => {
    setRegionId(DEFAULTS.regionId);
    setMonthIndex(String(DEFAULTS.monthIndex));
    setTripDays(String(DEFAULTS.tripDays));
    setLaundry(String(DEFAULTS.laundryEveryDays));
    setVenueIds(DEFAULTS.venueIds);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Shirt className="h-4 w-4" aria-hidden="true" />
          USA
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          USA Dress Code Planner for Travellers
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the region first &mdash; the US has six climates that behave nothing like each other
          &mdash; then the month and the places on your itinerary. The planner applies posted venue
          rules alongside NOAA climate normals and returns a counted packing list.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="us-region">
              Which part of the country?
            </label>
            <select
              id="us-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regionId}
              onChange={(event) => setRegionId(event.target.value)}
            >
              {REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-month">
              Month of travel
            </label>
            <select
              id="us-month"
              className={`mt-2 ${INPUT_CLASS}`}
              value={monthIndex}
              onChange={(event) => setMonthIndex(event.target.value)}
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-days">
              Trip length (days)
            </label>
            <input
              id="us-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={tripDays}
              onChange={(event) => setTripDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-laundry">
              Laundry every (days)
            </label>
            <input
              id="us-laundry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={laundry}
              onChange={(event) => setLaundry(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Laundromats are everywhere and most mid-range hotels have coin machines on site.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Where are you going?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {VENUES.map((venue) => {
              const active = venueIds.includes(venue.id);
              return (
                <label
                  key={venue.id}
                  htmlFor={`us-venue-${venue.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 font-semibold"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`us-venue-${venue.id}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleVenue(venue.id)}
                  />
                  <span>{venue.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Clothing to pack
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${plan.totalItems} items`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `About ${KG.format(plan.totalKg)} kg, sized for a ${plan.cycleDays}-day wash cycle`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={
                isCopied("summary")
                  ? "Copied the USA packing plan to clipboard"
                  : "Copy the USA packing plan"
              }
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("summary") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("summary") ? "Copied!" : "Copy plan"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Weather station used", hasError ? DASH : plan.region.station],
            [
              "Average daytime high",
              hasError ? DASH : `${NUM.format(plan.climate.avgHighC)}°C`,
            ],
            ["Average night low", hasError ? DASH : `${NUM.format(plan.climate.avgLowC)}°C`],
            [
              "Monthly rainfall",
              hasError ? DASH : `${plan.climate.rainMm} mm over ${plan.climate.rainyDays} wet days`,
            ],
            ["Tops packed per laundry-cycle day", hasError ? DASH : NUM.format(plan.topsPerDay)],
            ["Estimated clothing weight", hasError ? DASH : `${KG.format(plan.totalKg)} kg`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && plan.requirements.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Rules your itinerary triggers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {plan.requirements.map((item) => (
              <li key={item} className="flex gap-2">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Packing list</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.packing.map((row) => (
                  <tr key={row.item} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.item}</td>
                    <td className="py-2 pr-3 text-right">{row.qty}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasError && plan.venues.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What each place actually enforces</h2>
          <ul className="mt-3 space-y-4 text-sm">
            {plan.venues.map((venue) => (
              <li key={venue.id}>
                <p className="font-semibold">{venue.label}</p>
                <p className="mt-1 leading-6 text-[var(--muted-foreground)]">{venue.rule}</p>
                <p className="mt-1 leading-6 text-[var(--muted-foreground)]">{venue.fix}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError && plan.warnings.length > 0 ? (
        <section className="mt-6 space-y-2">
          {plan.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </p>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Climate figures are NOAA 1991&ndash;2020 normals for one representative station per region, so
        a mountain or inland city inside the same region can differ sharply. Venue rules are house
        policies and can change; check before you go.
      </p>
    </main>
  );
}
