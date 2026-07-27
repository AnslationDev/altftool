"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";
import {
  DEFAULT_CONTINGENCY_PCT,
  DEFAULT_SHOPPING_PER_PERSON,
  MONUMENT_TICKETS,
  SEASON_MULTIPLIERS,
  TIERS,
  buildTripBudget,
  seasonByValue,
  sumMonumentTickets,
  tierByValue,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULT_TIER = "comfort";
const DEFAULT_SEASON = "winter";
const DEFAULT_SITES = ["composite", "amber", "hawa-mahal", "city-palace"];

const defaultsForTier = (tierValue) => {
  const tier = tierByValue(tierValue);
  return {
    stay: String(tier.stayPerRoomPerNight),
    food: String(tier.foodPerPersonPerDay),
    transport: String(tier.transportPerPersonPerDay),
    activities: String(tier.activitiesPerPersonPerDay),
    fare: String(tier.returnFarePerPerson),
    peoplePerRoom: String(tier.peoplePerRoom),
  };
};

const BASE_DEFAULTS = {
  travellers: "2",
  nights: "3",
  shopping: String(DEFAULT_SHOPPING_PER_PERSON),
  contingency: String(DEFAULT_CONTINGENCY_PCT),
  cap: "",
  nationality: "indian",
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
  const [travellers, setTravellers] = useState(BASE_DEFAULTS.travellers);
  const [nights, setNights] = useState(BASE_DEFAULTS.nights);
  const [rates, setRates] = useState(defaultsForTier(DEFAULT_TIER));
  const [sites, setSites] = useState(DEFAULT_SITES);
  const [nationality, setNationality] = useState(BASE_DEFAULTS.nationality);
  const [shopping, setShopping] = useState(BASE_DEFAULTS.shopping);
  const [contingency, setContingency] = useState(BASE_DEFAULTS.contingency);
  const [cap, setCap] = useState(BASE_DEFAULTS.cap);
  const [copied, setCopied] = useState(false);

  const applyTier = (value) => {
    setTier(value);
    setRates(defaultsForTier(value));
    setCopied(false);
  };

  const setRate = (key, value) => setRates((prev) => ({ ...prev, [key]: value }));

  const toggleSite = (value) =>
    setSites((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));

  const ticketSummary = useMemo(() => sumMonumentTickets(sites, nationality), [sites, nationality]);

  const result = useMemo(
    () =>
      buildTripBudget({
        travellers: toNumber(travellers),
        nights: toNumber(nights),
        peoplePerRoom: toNumber(rates.peoplePerRoom),
        stayPerRoomPerNight: toNumber(rates.stay),
        foodPerPersonPerDay: toNumber(rates.food),
        transportPerPersonPerDay: toNumber(rates.transport),
        activitiesPerPersonPerDay: toNumber(rates.activities),
        returnFarePerPerson: toNumber(rates.fare),
        ticketsPerPerson: ticketSummary.total,
        shoppingPerPerson: toNumber(shopping, 0),
        contingencyPct: toNumber(contingency, 0),
        seasonFactor: seasonByValue(season).factor,
        budgetCap: toNumber(cap, 0),
      }),
    [travellers, nights, rates, ticketSummary, shopping, contingency, season, cap],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Jaipur Trip Budget Breakdown",
      `${result.travellers} traveller(s), ${result.nights} night(s) / ${result.days} day(s), ${result.rooms} room(s)`,
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
    setTravellers(BASE_DEFAULTS.travellers);
    setNights(BASE_DEFAULTS.nights);
    setRates(defaultsForTier(DEFAULT_TIER));
    setSites(DEFAULT_SITES);
    setNationality(BASE_DEFAULTS.nationality);
    setShopping(BASE_DEFAULTS.shopping);
    setContingency(BASE_DEFAULTS.contingency);
    setCap(BASE_DEFAULTS.cap);
    setCopied(false);
  };

  const rateFields = [
    { id: "jai-fare", key: "fare", label: "Return travel per person (₹)", step: "500" },
    { id: "jai-stay", key: "stay", label: "Room rate per night (₹)", step: "250" },
    { id: "jai-food", key: "food", label: "Food per person per day (₹)", step: "100" },
    { id: "jai-transport", key: "transport", label: "Autos and cabs per person per day (₹)", step: "50" },
    { id: "jai-activities", key: "activities", label: "Guides and activities per day (₹)", step: "100" },
    { id: "jai-ppr", key: "peoplePerRoom", label: "People sharing each room", step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Jaipur trip planner
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Jaipur Trip Budget Breakdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits a Jaipur trip into travel, stay, food, autos, monument tickets and a contingency
          buffer. Entry fees use the published Rajasthan rates, including the two-day composite
          ticket, so you are not charged twice for the forts it already covers.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jai-tier">
              Travel style (sets the starting rates)
            </label>
            <select
              id="jai-tier"
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
            <label className={LABEL_CLASS} htmlFor="jai-season">
              Season (moves the room rate)
            </label>
            <select
              id="jai-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {SEASON_MULTIPLIERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="jai-nationality">
              Ticket price band
            </label>
            <select
              id="jai-nationality"
              className={`mt-2 ${INPUT_CLASS}`}
              value={nationality}
              onChange={(event) => setNationality(event.target.value)}
            >
              <option value="indian">Indian national</option>
              <option value="foreign">Foreign national</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="jai-travellers">
              Travellers
            </label>
            <input
              id="jai-travellers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="40"
              step="1"
              value={travellers}
              onChange={(event) => setTravellers(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="jai-nights">
              Nights in Jaipur
            </label>
            <input
              id="jai-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={nights}
              onChange={(event) => setNights(event.target.value)}
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
            <label className={LABEL_CLASS} htmlFor="jai-shopping">
              Shopping and souvenirs per person (₹)
            </label>
            <input
              id="jai-shopping"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={shopping}
              onChange={(event) => setShopping(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="jai-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="jai-contingency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={contingency}
              onChange={(event) => setContingency(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jai-cap">
              Budget cap for the whole group (₹, optional)
            </label>
            <input
              id="jai-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              placeholder="e.g. 50000"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Monuments you plan to enter
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {MONUMENT_TICKETS.map((site) => {
              const id = `jai-site-${site.value}`;
              const price = nationality === "foreign" ? site.foreign : site.indian;
              const covered =
                sites.includes("composite") && site.inComposite && sites.includes(site.value);
              return (
                <label
                  key={site.value}
                  htmlFor={id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    checked={sites.includes(site.value)}
                    onChange={() => toggleSite(site.value)}
                  />
                  <span className="min-w-0">
                    <span className="block leading-5">{site.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {covered ? "covered by composite ticket" : money(price)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Entry tickets for this selection: {money(ticketSummary.total)} per person.
          </p>
        </fieldset>
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
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.total) : DASH}
            </p>
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
              aria-label="Copy the Jaipur trip budget breakdown"
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
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Line
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Group
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
            ["Monument entry per person", ok ? money(ticketSummary.total) : DASH],
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
        Planning estimate only. Monument fees are the published rates and are revised from time to
        time; confirm them at the ticket counter and replace the hotel and travel figures with your
        own quotes.
      </p>
    </main>
  );
}
