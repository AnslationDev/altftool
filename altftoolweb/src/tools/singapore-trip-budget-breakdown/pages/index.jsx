"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  DEFAULT_CONTINGENCY_PCT,
  GST_RATE,
  NETT_MULTIPLIER,
  SEASON_MULTIPLIERS,
  SERVICE_CHARGE_RATE,
  TIERS,
  TOURIST_REFUND_MIN_SGD,
  buildSingaporeBudget,
  seasonByValue,
  tierByValue,
} from "../lib";

const SGD = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-SG", { maximumFractionDigits: 1 });

const money = (value) => SGD.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULT_TIER = "comfort";
const DEFAULT_SEASON = "normal";

const defaultsForTier = (tierValue) => {
  const tier = tierByValue(tierValue);
  return {
    stay: String(tier.stayPerRoomPerNight),
    food: String(tier.foodPerPersonPerDay),
    transport: String(tier.transportPerPersonPerDay),
    activities: String(tier.activitiesPerPersonPerDay),
    fare: String(tier.returnFarePerPerson),
    attractions: String(tier.attractionsPerPerson),
    shopping: String(tier.shoppingPerPerson),
    peoplePerRoom: String(tier.peoplePerRoom),
  };
};

const BASE_DEFAULTS = {
  travellers: "2",
  nights: "4",
  contingency: String(DEFAULT_CONTINGENCY_PCT),
  cap: "",
  nett: false,
  foodMenu: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_WRAP =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm";
const CHECK_INPUT =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
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
  const [nett, setNett] = useState(BASE_DEFAULTS.nett);
  const [foodMenu, setFoodMenu] = useState(BASE_DEFAULTS.foodMenu);
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

  const result = useMemo(
    () =>
      buildSingaporeBudget({
        travellers: toNumber(travellers),
        nights: toNumber(nights),
        peoplePerRoom: toNumber(rates.peoplePerRoom),
        quotedRoomRate: toNumber(rates.stay),
        roomRateIsNett: nett,
        foodPerPersonPerDay: toNumber(rates.food),
        foodIsMenuPrice: foodMenu,
        transportPerPersonPerDay: toNumber(rates.transport),
        activitiesPerPersonPerDay: toNumber(rates.activities),
        returnFarePerPerson: toNumber(rates.fare),
        attractionsPerPerson: toNumber(rates.attractions, 0),
        shoppingPerPerson: toNumber(rates.shopping, 0),
        contingencyPct: toNumber(contingency, 0),
        seasonFactor: seasonByValue(season).factor,
        budgetCap: toNumber(cap, 0),
      }),
    [travellers, nights, rates, nett, foodMenu, contingency, season, cap],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Singapore Trip Budget Breakdown",
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
    setNett(BASE_DEFAULTS.nett);
    setFoodMenu(BASE_DEFAULTS.foodMenu);
    setContingency(BASE_DEFAULTS.contingency);
    setCap(BASE_DEFAULTS.cap);
    setCopied(false);
  };

  const rateFields = [
    { id: "sg-fare", key: "fare", label: "Return flight per person (S$)", step: "50" },
    { id: "sg-stay", key: "stay", label: "Quoted room rate per night (S$)", step: "25" },
    { id: "sg-food", key: "food", label: "Food per person per day (S$)", step: "10" },
    { id: "sg-transport", key: "transport", label: "MRT and taxis per person per day (S$)", step: "5" },
    { id: "sg-activities", key: "activities", label: "Activities per person per day (S$)", step: "10" },
    { id: "sg-attractions", key: "attractions", label: "Attraction tickets per person, one-off (S$)", step: "25" },
    { id: "sg-shopping", key: "shopping", label: "Shopping per person, one-off (S$)", step: "50" },
    { id: "sg-ppr", key: "peoplePerRoom", label: "People sharing each room", step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Singapore trip planner
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Singapore Trip Budget Breakdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits a Singapore trip into flights, room, the {Math.round(SERVICE_CHARGE_RATE * 100)}% service charge and{" "}
          {Math.round(GST_RATE * 100)}% GST that make up the &quot;++&quot;, food, transport, attractions and
          shopping. There is no per-night tourist tax here — the ++ is what moves the number.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-tier">
              Travel style (sets the starting rates)
            </label>
            <select
              id="sg-tier"
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
            <label className={LABEL_CLASS} htmlFor="sg-season">
              Season (moves the room rate)
            </label>
            <select
              id="sg-season"
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
            <label className={LABEL_CLASS} htmlFor="sg-travellers">
              Travellers
            </label>
            <input
              id="sg-travellers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="40"
              step="1"
              value={travellers}
              onChange={(event) => {
                setTravellers(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sg-nights">
              Nights in Singapore
            </label>
            <input
              id="sg-nights"
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
            <label className={LABEL_CLASS} htmlFor="sg-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="sg-contingency"
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
            <label className={LABEL_CLASS} htmlFor="sg-cap">
              Budget cap for the whole party (S$, optional)
            </label>
            <input
              id="sg-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="250"
              placeholder="e.g. 5000"
              value={cap}
              onChange={(event) => {
                setCap(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label htmlFor="sg-nett" className={CHECK_WRAP}>
              <input
                id="sg-nett"
                type="checkbox"
                className={CHECK_INPUT}
                checked={nett}
                onChange={(event) => {
                  setNett(event.target.checked);
                  setCopied(false);
                }}
              />
              <span className="min-w-0">
                <span className="block font-semibold leading-5">My room rate is a nett price</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  Tick if the quote already includes service charge and GST.
                </span>
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="sg-foodmenu" className={CHECK_WRAP}>
              <input
                id="sg-foodmenu"
                type="checkbox"
                className={CHECK_INPUT}
                checked={foodMenu}
                onChange={(event) => {
                  setFoodMenu(event.target.checked);
                  setCopied(false);
                }}
              />
              <span className="min-w-0">
                <span className="block font-semibold leading-5">My food figure is a ++ menu price</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  Restaurants quote ++; hawker centres quote nett.
                </span>
              </span>
            </label>
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
              aria-label="Copy the Singapore trip budget breakdown"
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
            ["Rooms booked", ok ? `${result.rooms} (${result.roomNights} room-nights)` : DASH],
            ["Base room rate after season factor", ok ? `${money(result.perRoomNight.base)} per night` : DASH],
            ["Nett cost of one room-night", ok ? money(result.perRoomNight.total) : DASH],
            ["Service charge and GST on the stay", ok ? money(result.stayExtras) : DASH],
            [
              "GST sitting inside the shopping figure",
              ok && result.shopping > 0 ? money(result.gstInsideShopping) : DASH,
            ],
            [
              `Qualifies for the tourist GST refund (min S$${TOURIST_REFUND_MIN_SGD})`,
              ok && result.shopping > 0 ? (result.refundEligible ? "Yes" : "No") : DASH,
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
        Planning estimate only. The ++ multiplier of {NETT_MULTIPLIER.toFixed(3)} is the {Math.round(SERVICE_CHARGE_RATE * 100)}%
        service charge followed by {Math.round(GST_RATE * 100)}% GST on the service-inclusive amount; tax rates and the
        refund scheme are revised from time to time, so check the current rules before relying on the refund figure.
        Replace the hotel, flight and food figures with your own quotes.
      </p>
    </main>
  );
}
