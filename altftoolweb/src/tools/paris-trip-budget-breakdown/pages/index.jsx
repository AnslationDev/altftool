"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  DEFAULT_CONTINGENCY_PCT,
  DEPARTMENTAL_SURTAX,
  REGIONAL_SURTAX,
  SEASON_MULTIPLIERS,
  TIERS,
  TOURIST_TAX_EXEMPT_UNDER_AGE,
  buildParisBudget,
  categoryByValue,
  seasonByValue,
  tierByValue,
} from "../lib";

const EUR = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const EUR2 = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
const PCT = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 1 });

const money = (value) => EUR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => EUR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULT_TIER = "comfort";
const DEFAULT_SEASON = "shoulder";

const defaultsForTier = (tierValue) => {
  const tier = tierByValue(tierValue);
  return {
    stay: String(tier.stayPerRoomPerNight),
    food: String(tier.foodPerPersonPerDay),
    transport: String(tier.transportPerPersonPerDay),
    activities: String(tier.activitiesPerPersonPerDay),
    fare: String(tier.returnFarePerPerson),
    attractions: String(tier.attractionsPerPerson),
    peoplePerRoom: String(tier.peoplePerRoom),
    category: tier.category,
    municipalRate: String(categoryByValue(tier.category).municipalRateEur),
  };
};

const BASE_DEFAULTS = {
  adults: "2",
  children: "0",
  nights: "3",
  contingency: String(DEFAULT_CONTINGENCY_PCT),
  cap: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw, fallback = NaN) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return fallback;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [tier, setTier] = useState(DEFAULT_TIER);
  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [adults, setAdults] = useState(BASE_DEFAULTS.adults);
  const [children, setChildren] = useState(BASE_DEFAULTS.children);
  const [nights, setNights] = useState(BASE_DEFAULTS.nights);
  const [rates, setRates] = useState(defaultsForTier(DEFAULT_TIER));
  const [contingency, setContingency] = useState(BASE_DEFAULTS.contingency);
  const [cap, setCap] = useState(BASE_DEFAULTS.cap);
  const [copied, setCopied] = useState(false);

  const applyTier = (value) => {
    setTier(value);
    setRates(defaultsForTier(value));
    setCopied(false);
  };

  const setRate = (key, value) => {
    setRates((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const applyCategory = (value) => {
    setRates((prev) => ({
      ...prev,
      category: value,
      municipalRate: String(categoryByValue(value).municipalRateEur),
    }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildParisBudget({
        adults: toNumber(adults),
        children: toNumber(children, 0),
        nights: toNumber(nights),
        peoplePerRoom: toNumber(rates.peoplePerRoom),
        stayPerRoomPerNight: toNumber(rates.stay),
        municipalRateEur: toNumber(rates.municipalRate, 0),
        foodPerPersonPerDay: toNumber(rates.food),
        transportPerPersonPerDay: toNumber(rates.transport),
        activitiesPerPersonPerDay: toNumber(rates.activities),
        returnFarePerPerson: toNumber(rates.fare),
        attractionsPerPerson: toNumber(rates.attractions, 0),
        contingencyPct: toNumber(contingency, 0),
        seasonFactor: seasonByValue(season).factor,
        budgetCap: toNumber(cap, 0),
      }),
    [adults, children, nights, rates, contingency, season, cap],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Paris Trip Budget Breakdown",
      `${result.adults} adult(s) + ${result.children} under-${TOURIST_TAX_EXEMPT_UNDER_AGE}s, ${result.nights} night(s) / ${result.days} day(s), ${result.rooms} room(s)`,
      ...result.lines.map((line) => `${line.label}: ${money(line.amount)}`),
      `Total: ${money(result.total)}`,
      `Per person: ${money(result.perPerson)}`,
      `Per person per day: ${money(result.perPersonPerDay)}`,
    ].join("\n");
  }, [ok, result]);

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
    setTier(DEFAULT_TIER);
    setSeason(DEFAULT_SEASON);
    setAdults(BASE_DEFAULTS.adults);
    setChildren(BASE_DEFAULTS.children);
    setNights(BASE_DEFAULTS.nights);
    setRates(defaultsForTier(DEFAULT_TIER));
    setContingency(BASE_DEFAULTS.contingency);
    setCap(BASE_DEFAULTS.cap);
    setCopied(false);
  };

  const rateFields = [
    { id: "par-fare", key: "fare", label: "Return flight or rail per person (€)", step: "25" },
    { id: "par-stay", key: "stay", label: "Room rate per night (€)", step: "10" },
    { id: "par-food", key: "food", label: "Food per person per day (€)", step: "5" },
    { id: "par-transport", key: "transport", label: "Metro and taxis per person per day (€)", step: "1" },
    { id: "par-activities", key: "activities", label: "Activities per person per day (€)", step: "5" },
    { id: "par-attractions", key: "attractions", label: "Museum passes per person, one-off (€)", step: "10" },
    { id: "par-ppr", key: "peoplePerRoom", label: "People sharing each room", step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Paris trip planner
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Paris Trip Budget Breakdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits a Paris trip into travel, room, taxe de séjour, food, metro, activities and a contingency buffer. The
          tourist tax is charged per adult per night with the 10% departmental and 15% Île-de-France surtaxes on top,
          and guests under {TOURIST_TAX_EXEMPT_UNDER_AGE} are exempt.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="par-tier">
              Travel style (sets the starting rates)
            </label>
            <select
              id="par-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tier}
              onChange={(event) => applyTier(event.target.value)}
            >
              {TIERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="par-season">
              Season (moves the room rate)
            </label>
            <select
              id="par-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => {
                setSeason(event.target.value);
                setCopied(false);
              }}
            >
              {SEASON_MULTIPLIERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="par-category">
              Accommodation category (sets the tax rate)
            </label>
            <select
              id="par-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rates.category}
              onChange={(event) => applyCategory(event.target.value)}
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="par-adults">
              Adults (18 and over)
            </label>
            <input
              id="par-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="40"
              step="1"
              value={adults}
              onChange={(event) => {
                setAdults(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="par-children">
              Under-{TOURIST_TAX_EXEMPT_UNDER_AGE}s (tax exempt)
            </label>
            <input
              id="par-children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="40"
              step="1"
              value={children}
              onChange={(event) => {
                setChildren(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="par-nights">
              Nights in Paris
            </label>
            <input
              id="par-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={nights}
              onChange={(event) => {
                setNights(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="par-municipal">
              Municipal taxe de séjour per adult per night (€)
            </label>
            <input
              id="par-municipal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={rates.municipalRate}
              onChange={(event) => setRate("municipalRate", event.target.value)}
            />
          </div>

          {rateFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step={field.step}
                value={rates[field.key]}
                onChange={(event) => setRate(field.key, event.target.value)}
              />
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="par-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="par-contingency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={contingency}
              onChange={(event) => {
                setContingency(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="par-cap">
              Budget cap for the whole party (€, optional)
            </label>
            <input
              id="par-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              placeholder="e.g. 2500"
              value={cap}
              onChange={(event) => {
                setCap(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {!ok && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total trip cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{ok ? money(result.total) : DASH}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money(result.perPerson)} per person · ${money(result.perPersonPerDay)} per person per day`
                : "Fix the inputs above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Paris trip budget breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Line
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Party
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Per person
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.lines : []).map((line) => (
                <tr key={line.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <span className="font-semibold">{line.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{line.note}</span>
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold">{money(line.amount)}</td>
                  <td className="py-2 pr-3 text-right">{money(line.perPerson)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{pct(line.share)}</td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Nights / days on the ground", ok ? `${result.nights} nights, ${result.days} days` : DASH],
            ["Rooms booked", ok ? String(result.rooms) : DASH],
            ["Room rate after season factor", ok ? `${money(result.seasonalRoomRate)} per night` : DASH],
            [
              "Taxe de séjour per adult per night",
              ok ? money2(result.touristTaxPerAdultPerNight) : DASH,
            ],
            [
              `Of which the ${Math.round(DEPARTMENTAL_SURTAX * 100)}% + ${Math.round(REGIONAL_SURTAX * 100)}% surtaxes`,
              ok ? money2(result.touristTaxSurtaxPart) : DASH,
            ],
            ["Cost of one extra night", ok ? money(result.costOfOneMoreNight) : DASH],
            ["Subtotal before contingency", ok ? money(result.subtotal) : DASH],
            [
              "Against your budget cap",
              ok && result.budgetCap > 0
                ? `${result.budgetGap >= 0 ? "Under by" : "Over by"} ${money(Math.abs(result.budgetGap))}`
                : DASH,
            ],
            [
              "Nights the cap actually covers",
              ok && result.budgetCap > 0 && result.nightsAffordable !== null
                ? `${result.nightsAffordable} night(s)`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2 leading-5">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning estimate only. Paris republishes its taxe de séjour schedule, so copy the municipal rate from your
        booking confirmation — the 10% departmental and 15% regional additional taxes are then applied on top of
        whatever that rate is. Replace the hotel, travel and food figures with your own quotes before relying on the
        total.
      </p>
    </main>
  );
}
