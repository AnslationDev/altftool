"use client";

import { useMemo, useState } from "react";
import { CarTaxiFront, Check, Copy, RotateCcw } from "lucide-react";
import {
  EXPORT_CATEGORIES,
  GDPR_RESPONSE_DAYS,
  GRIEVANCE_ACK_HOURS,
  GRIEVANCE_RESOLVE_DAYS,
  REQUEST_STEPS,
  estimateExport,
  formatSize,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SELECTED = ["trips", "routes", "profile", "payments", "safety"];
const DEFAULT_YEARS = "5";
const DEFAULT_TRIPS = "12";
const DEFAULT_MINUTES = "22";

const DASH = "—";

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [trips, setTrips] = useState(DEFAULT_TRIPS);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState([]);

  const result = useMemo(
    () =>
      estimateExport({
        selectedIds: selected,
        years: years.trim() === "" ? Number.NaN : Number(years),
        tripsPerMonth: trips.trim() === "" ? Number.NaN : Number(trips),
        avgTripMinutes: minutes.trim() === "" ? Number.NaN : Number(minutes),
      }),
    [selected, years, trips, minutes],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const toggleStep = (index) =>
    setDone((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Ride-app data request plan",
      `Categories selected: ${result.count}`,
      `Estimated archive: ${result.totalLabel}`,
      `Rides covered: ${result.totalTrips}`,
      `Location points in the export: ${result.locationPoints}`,
      `Home-inference index: ${result.homeInference}/99`,
      `Sensitivity: ${result.sensitivityScore}/100 (${result.band})`,
      `Grievance Officer: acknowledge in ${GRIEVANCE_ACK_HOURS} h, dispose in ${GRIEVANCE_RESOLVE_DAYS} days`,
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
    setSelected(DEFAULT_SELECTED);
    setYears(DEFAULT_YEARS);
    setTrips(DEFAULT_TRIPS);
    setMinutes(DEFAULT_MINUTES);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarTaxiFront className="h-4 w-4" aria-hidden="true" />
          Data access
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Uber and Ola Data Request Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plan a ride-app data request, estimate how many individual location points your history
          holds, and see how readily a home address falls out of repeated pickups — plus the exact
          rules to quote when an operator ignores you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Choose what to ask for</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {EXPORT_CATEGORIES.map((category) => {
            const checked = selected.includes(category.id);
            return (
              <label
                key={category.id}
                htmlFor={`ride-${category.id}`}
                className={`flex min-h-11 cursor-pointer gap-3 rounded-md border p-3 transition ${
                  checked
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`ride-${category.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(category.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{category.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {category.what}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelected(EXPORT_CATEGORIES.map((category) => category.id))}
            className={GHOST_BTN}
          >
            Select all
          </button>
          <button type="button" onClick={() => setSelected([])} className={GHOST_BTN}>
            Deselect all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Describe your riding</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ride-years">
              Years using the app
            </label>
            <input
              id="ride-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="17"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ride-trips">
              Rides per month
            </label>
            <input
              id="ride-trips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="1"
              value={trips}
              onChange={(event) => setTrips(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ride-minutes">
              Average ride length (minutes)
            </label>
            <input
              id="ride-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="180"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Location points in the export
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.locationPoints)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `Across about ${NUM.format(result.totalTrips)} rides`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the ride-app data request plan"
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
              aria-label="Reset the ride-app data request planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Estimated archive size", hasError ? DASH : result.totalLabel],
            [
              "Pickup and drop coordinates",
              hasError ? DASH : NUM.format(result.geoPoints),
            ],
            ["GPS breadcrumbs along routes", hasError ? DASH : NUM.format(result.routePings)],
            [
              "Home-inference index",
              hasError ? DASH : `${result.homeInference}/99`,
            ],
            [
              "Sensitivity of this selection",
              hasError ? DASH : `${result.sensitivityScore}/100 — ${result.band}`,
            ],
            [
              "Grievance Officer deadlines (India)",
              `${GRIEVANCE_ACK_HOURS} h to acknowledge, ${GRIEVANCE_RESOLVE_DAYS} days to dispose`,
            ],
            ["GDPR access deadline", `${GDPR_RESPONSE_DAYS} days`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          The home-inference index is a readability heuristic based on how quickly repeated origins
          cluster — it is not a claim about any operator&rsquo;s actual algorithm.
        </p>

        {!hasError && result.criticalCategories.length > 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Highest-risk items here: {result.criticalCategories.join(", ")}. Do not email this
            archive or upload it to a map viewer you do not control.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Size and risk by category</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Estimated size
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Sensitivity
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {row.note}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right align-top">{formatSize(row.sizeMb)}</td>
                    <td className="py-2 text-right align-top">{row.sensitivity}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">How to make the request</h2>
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {done.length}/{REQUEST_STEPS.length} done
          </span>
        </div>
        <ol className="mt-4 space-y-3">
          {REQUEST_STEPS.map(([title, detail], index) => {
            const checked = done.includes(index);
            return (
              <li key={title}>
                <label
                  htmlFor={`ride-step-${index}`}
                  className="flex min-h-11 cursor-pointer gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <input
                    id={`ride-step-${index}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStep(index)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${checked ? "text-[var(--success)]" : ""}`}
                    >
                      {index + 1}. {title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {detail}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes and point counts are planning estimates, not a measurement of your account. This page
        is informational and is not legal advice; consult a qualified professional about your
        data-protection rights.
      </p>
    </main>
  );
}
