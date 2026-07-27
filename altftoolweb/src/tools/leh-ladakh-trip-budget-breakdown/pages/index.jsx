"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MountainSnow, RotateCcw } from "lucide-react";
import {
  DEFAULT_CONTINGENCY_PCT,
  ENVIRONMENT_FEE_PER_PERSON_INR,
  RED_CROSS_FEE_PER_PERSON_PER_DAY_INR,
  SEASONS,
  TIERS,
  TRANSPORT_MODES,
  buildLadakhBudget,
  seasonByValue,
  tierByValue,
  transportByValue,
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
const DEFAULT_SEASON = "peak";

const ratesForTier = (tierValue) => {
  const tier = tierByValue(tierValue);
  const mode = transportByValue(tier.transport);
  return {
    stay: String(tier.stayPerRoomPerNightInr),
    food: String(tier.foodPerPersonPerDayInr),
    activities: String(tier.activitiesPerPersonPerDayInr),
    gear: String(tier.gearPerPersonInr),
    shopping: String(tier.shoppingPerPersonInr),
    fare: String(tier.returnFareInr),
    peoplePerRoom: String(tier.peoplePerRoom),
    seats: String(mode.seatsPerVehicle),
    vehicle: String(mode.perVehiclePerDayInr),
  };
};

const BASE_DEFAULTS = {
  travellers: "2",
  nights: "6",
  acclimatisation: "2",
  environment: String(ENVIRONMENT_FEE_PER_PERSON_INR),
  redCross: String(RED_CROSS_FEE_PER_PERSON_PER_DAY_INR),
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
  const [transport, setTransport] = useState(tierByValue(DEFAULT_TIER).transport);
  const [travellers, setTravellers] = useState(BASE_DEFAULTS.travellers);
  const [nights, setNights] = useState(BASE_DEFAULTS.nights);
  const [acclimatisation, setAcclimatisation] = useState(BASE_DEFAULTS.acclimatisation);
  const [rates, setRates] = useState(ratesForTier(DEFAULT_TIER));
  const [environment, setEnvironment] = useState(BASE_DEFAULTS.environment);
  const [redCross, setRedCross] = useState(BASE_DEFAULTS.redCross);
  const [contingency, setContingency] = useState(BASE_DEFAULTS.contingency);
  const [cap, setCap] = useState(BASE_DEFAULTS.cap);
  const [copied, setCopied] = useState(false);

  const applyTier = (value) => {
    setTier(value);
    setRates(ratesForTier(value));
    setTransport(tierByValue(value).transport);
    setCopied(false);
  };

  const applyTransport = (value) => {
    const mode = transportByValue(value);
    setTransport(value);
    setRates((prev) => ({
      ...prev,
      seats: String(mode.seatsPerVehicle),
      vehicle: String(mode.perVehiclePerDayInr),
    }));
    setCopied(false);
  };

  const setRate = (key, value) => setRates((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      buildLadakhBudget({
        travellers: toNumber(travellers),
        nights: toNumber(nights),
        acclimatisationDays: toNumber(acclimatisation, 0),
        peoplePerRoom: toNumber(rates.peoplePerRoom),
        seatsPerVehicle: toNumber(rates.seats),
        stayPerRoomPerNightInr: toNumber(rates.stay),
        foodPerPersonPerDayInr: toNumber(rates.food),
        vehiclePerDayInr: toNumber(rates.vehicle),
        activitiesPerPersonPerDayInr: toNumber(rates.activities),
        gearPerPersonInr: toNumber(rates.gear),
        shoppingPerPersonInr: toNumber(rates.shopping),
        returnFareInr: toNumber(rates.fare),
        environmentFeeInr: toNumber(environment, 0),
        redCrossFeePerDayInr: toNumber(redCross, 0),
        contingencyPct: toNumber(contingency, 0),
        seasonFactor: seasonByValue(season).factor,
        budgetCapInr: toNumber(cap, 0),
      }),
    [travellers, nights, acclimatisation, rates, environment, redCross, contingency, season, cap],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Leh Ladakh Trip Budget Breakdown",
      `${result.travellers} traveller(s), ${result.nights} night(s) / ${result.days} day(s)`,
      `${result.acclimatisationDays} acclimatisation day(s), ${result.touringDays} touring day(s), ${result.rooms} room(s), ${result.vehicles} vehicle(s)`,
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
    setTransport(tierByValue(DEFAULT_TIER).transport);
    setTravellers(BASE_DEFAULTS.travellers);
    setNights(BASE_DEFAULTS.nights);
    setAcclimatisation(BASE_DEFAULTS.acclimatisation);
    setRates(ratesForTier(DEFAULT_TIER));
    setEnvironment(BASE_DEFAULTS.environment);
    setRedCross(BASE_DEFAULTS.redCross);
    setContingency(BASE_DEFAULTS.contingency);
    setCap(BASE_DEFAULTS.cap);
    setCopied(false);
  };

  const rateFields = [
    { id: "ldk-fare", key: "fare", label: "Return travel to Leh per person (₹)", step: "1000" },
    { id: "ldk-stay", key: "stay", label: "Room rate per night (₹)", step: "250" },
    { id: "ldk-food", key: "food", label: "Food per person per day (₹)", step: "100" },
    { id: "ldk-vehicle", key: "vehicle", label: "Vehicle per day (₹, whole vehicle)", step: "250" },
    { id: "ldk-seats", key: "seats", label: "Passengers per vehicle", step: "1" },
    { id: "ldk-activities", key: "activities", label: "Activities per person per touring day (₹)", step: "50" },
    { id: "ldk-gear", key: "gear", label: "Gear and medicines per person (₹)", step: "250" },
    { id: "ldk-shopping", key: "shopping", label: "Shopping per person (₹)", step: "500" },
    { id: "ldk-ppr", key: "peoplePerRoom", label: "People sharing each room", step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MountainSnow className="h-4 w-4" aria-hidden="true" />
          Leh Ladakh trip planner
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Leh Ladakh Trip Budget Breakdown
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Charges the taxi per vehicle rather than per head, keeps acclimatisation days out of the
          touring cost, and adds the permits and levies, so the per-person-per-day figure matches
          what a Ladakh trip actually bills.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ldk-tier">
              Travel style (sets the starting rates)
            </label>
            <select
              id="ldk-tier"
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
            <label className={LABEL_CLASS} htmlFor="ldk-transport">
              How you get around
            </label>
            <select
              id="ldk-transport"
              className={`mt-2 ${INPUT_CLASS}`}
              value={transport}
              onChange={(event) => applyTransport(event.target.value)}
            >
              {TRANSPORT_MODES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ldk-season">
              Season (moves the room rate)
            </label>
            <select
              id="ldk-season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {SEASONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ldk-travellers">
              Travellers
            </label>
            <input
              id="ldk-travellers"
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
            <label className={LABEL_CLASS} htmlFor="ldk-nights">
              Nights in Ladakh
            </label>
            <input
              id="ldk-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={nights}
              onChange={(event) => setNights(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ldk-acclim">
              Of those days, rest days in Leh
            </label>
            <input
              id="ldk-acclim"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={acclimatisation}
              onChange={(event) => setAcclimatisation(event.target.value)}
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
            <label className={LABEL_CLASS} htmlFor="ldk-environment">
              Environmental fee per person (₹, one-time)
            </label>
            <input
              id="ldk-environment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ldk-redcross">
              Per-day levy per person (₹)
            </label>
            <input
              id="ldk-redcross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={redCross}
              onChange={(event) => setRedCross(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ldk-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="ldk-contingency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={contingency}
              onChange={(event) => setContingency(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ldk-cap">
              Budget cap for the group (₹, optional)
            </label>
            <input
              id="ldk-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5000"
              placeholder="e.g. 150000"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
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
              aria-label="Copy the Leh Ladakh trip budget breakdown"
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
          <table className="w-full min-w-[360px] text-left text-sm">
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
            ["Days on the ground", ok ? `${result.days} days (${result.nights} nights)` : DASH],
            [
              "Rest days vs touring days",
              ok ? `${result.acclimatisationDays} resting, ${result.touringDays} touring` : DASH,
            ],
            ["Rooms booked", ok ? String(result.rooms) : DASH],
            ["Vehicles hired", ok ? String(result.vehicles) : DASH],
            [
              "Vehicle cost per head per touring day",
              ok ? money(result.vehicleCostPerHeadPerDay) : DASH,
            ],
            ["Cost of one more rest day", ok ? money(result.restDayCost) : DASH],
            ["Cost of one more touring day", ok ? money(result.touringDayCost) : DASH],
            ["Permits and levies", ok ? money(result.permits.totalInr) : DASH],
            ["Fixed costs (travel, gear, one-time fee)", ok ? money(result.fixed) : DASH],
            ["Subtotal before contingency", ok ? money(result.subtotal) : DASH],
            [
              "Against your budget cap",
              ok && result.budgetCapInr > 0
                ? `${result.budgetGap >= 0 ? "Under by" : "Over by"} ${money(Math.abs(result.budgetGap))}`
                : DASH,
            ],
            [
              "Nights the cap actually covers",
              ok && result.budgetCapInr > 0 && result.nightsAffordable !== null && result.capIsFeasible
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
        Planning estimate only, and not medical advice. Permit fees and taxi union rates are revised
        periodically and altitude illness is a real risk above 3,000 m — check the official Leh
        permit portal and speak to a doctor before you travel.
      </p>
    </main>
  );
}
