"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MoonStar, RotateCcw } from "lucide-react";
import {
  DEFAULT_CARD_COST_TRY,
  DEFAULT_CONTINGENCY_PCT,
  DEFAULT_FARE_PER_RIDE_TRY,
  DEFAULT_INR_PER_TRY,
  DEFAULT_INSURANCE_INR,
  DEFAULT_MONTHLY_DEPRECIATION_PCT,
  DEFAULT_MONTHLY_INFLATION_PCT,
  DEFAULT_VISA_FEE_INR,
  PAYMENT_METHODS,
  SEASONS,
  TIERS,
  buildIstanbulBudget,
  paymentByValue,
  seasonByValue,
  tierByValue,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const TRY_FMT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const lira = (value) => `₺${TRY_FMT.format(Number.isFinite(value) ? value : 0)}`;
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULT_TIER = "comfort";
const DEFAULT_SEASON = "shoulder";
const DEFAULT_PAYMENT = "forexcard";

const ratesForTier = (tierValue) => {
  const tier = tierByValue(tierValue);
  return {
    stay: String(tier.stayPerRoomPerNightTry),
    food: String(tier.foodPerPersonPerDayTry),
    sights: String(tier.sightsPerPersonPerDayTry),
    shopping: String(tier.shoppingPerPersonTry),
    rides: String(tier.ridesPerPersonPerDay),
    taxi: String(tier.taxiPerPersonPerDayTry),
    fare: String(tier.returnFareInr),
    peoplePerRoom: String(tier.peoplePerRoom),
  };
};

const BASE_DEFAULTS = {
  travellers: "2",
  nights: "4",
  fx: String(DEFAULT_INR_PER_TRY),
  ridefare: String(DEFAULT_FARE_PER_RIDE_TRY),
  card: String(DEFAULT_CARD_COST_TRY),
  months: "3",
  inflation: String(DEFAULT_MONTHLY_INFLATION_PCT),
  depreciation: String(DEFAULT_MONTHLY_DEPRECIATION_PCT),
  visa: String(DEFAULT_VISA_FEE_INR),
  insurance: String(DEFAULT_INSURANCE_INR),
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
  const [payment, setPayment] = useState(DEFAULT_PAYMENT);
  const [travellers, setTravellers] = useState(BASE_DEFAULTS.travellers);
  const [nights, setNights] = useState(BASE_DEFAULTS.nights);
  const [rates, setRates] = useState(ratesForTier(DEFAULT_TIER));
  const [fx, setFx] = useState(BASE_DEFAULTS.fx);
  const [rideFare, setRideFare] = useState(BASE_DEFAULTS.ridefare);
  const [card, setCard] = useState(BASE_DEFAULTS.card);
  const [months, setMonths] = useState(BASE_DEFAULTS.months);
  const [inflation, setInflation] = useState(BASE_DEFAULTS.inflation);
  const [depreciation, setDepreciation] = useState(BASE_DEFAULTS.depreciation);
  const [visa, setVisa] = useState(BASE_DEFAULTS.visa);
  const [insurance, setInsurance] = useState(BASE_DEFAULTS.insurance);
  const [contingency, setContingency] = useState(BASE_DEFAULTS.contingency);
  const [cap, setCap] = useState(BASE_DEFAULTS.cap);
  const [copied, setCopied] = useState(false);

  const applyTier = (value) => {
    setTier(value);
    setRates(ratesForTier(value));
    setCopied(false);
  };

  const setRate = (key, value) => setRates((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      buildIstanbulBudget({
        travellers: toNumber(travellers),
        nights: toNumber(nights),
        peoplePerRoom: toNumber(rates.peoplePerRoom),
        stayPerRoomPerNightTry: toNumber(rates.stay),
        foodPerPersonPerDayTry: toNumber(rates.food),
        sightsPerPersonPerDayTry: toNumber(rates.sights),
        shoppingPerPersonTry: toNumber(rates.shopping),
        ridesPerPersonPerDay: toNumber(rates.rides, 0),
        farePerRideTry: toNumber(rideFare, 0),
        cardCostTry: toNumber(card, 0),
        taxiPerPersonPerDayTry: toNumber(rates.taxi, 0),
        returnFareInr: toNumber(rates.fare),
        visaFeeInr: toNumber(visa, 0),
        insuranceInr: toNumber(insurance, 0),
        inrPerTry: toNumber(fx),
        monthsUntilTravel: toNumber(months, 0),
        monthlyInflationPct: toNumber(inflation, 0),
        monthlyDepreciationPct: toNumber(depreciation, 0),
        markupPercent: paymentByValue(payment).markupPercent,
        contingencyPct: toNumber(contingency, 0),
        seasonFactor: seasonByValue(season).factor,
        budgetCapInr: toNumber(cap, 0),
      }),
    [
      travellers,
      nights,
      rates,
      rideFare,
      card,
      months,
      inflation,
      depreciation,
      visa,
      insurance,
      fx,
      payment,
      contingency,
      season,
      cap,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Istanbul Trip Budget Breakdown",
      `${result.travellers} traveller(s), ${result.nights} night(s) / ${result.days} day(s), ${result.rooms} room(s)`,
      `Rate used: ${result.inrPerTry} INR per lira + ${result.markupPercent}% markup, drift factor ${result.drift.factor.toFixed(3)}`,
      ...result.lines.map((line) => `${line.label}: ${money(line.inr)}`),
      `Total: ${money(result.totalInr)}`,
      `Per person: ${money(result.perPersonInr)}`,
      `Per person per day: ${money(result.perPersonPerDayInr)}`,
      `Lira to spend on the ground: ${lira(result.onGroundTry)}`,
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
    setPayment(DEFAULT_PAYMENT);
    setTravellers(BASE_DEFAULTS.travellers);
    setNights(BASE_DEFAULTS.nights);
    setRates(ratesForTier(DEFAULT_TIER));
    setFx(BASE_DEFAULTS.fx);
    setRideFare(BASE_DEFAULTS.ridefare);
    setCard(BASE_DEFAULTS.card);
    setMonths(BASE_DEFAULTS.months);
    setInflation(BASE_DEFAULTS.inflation);
    setDepreciation(BASE_DEFAULTS.depreciation);
    setVisa(BASE_DEFAULTS.visa);
    setInsurance(BASE_DEFAULTS.insurance);
    setContingency(BASE_DEFAULTS.contingency);
    setCap(BASE_DEFAULTS.cap);
    setCopied(false);
  };

  const rateFields = [
    { id: "ist-fare", key: "fare", label: "Return airfare per person (₹)", step: "1000" },
    { id: "ist-stay", key: "stay", label: "Room rate per night (₺)", step: "100" },
    { id: "ist-food", key: "food", label: "Food per person per day (₺)", step: "50" },
    { id: "ist-sights", key: "sights", label: "Sights per person per day (₺)", step: "50" },
    { id: "ist-shopping", key: "shopping", label: "Shopping per person (₺)", step: "500" },
    { id: "ist-rides", key: "rides", label: "Istanbulkart rides per person per day", step: "1" },
    { id: "ist-taxi", key: "taxi", label: "Taxi or transfer per person per day (₺)", step: "50" },
    { id: "ist-ppr", key: "peoplePerRoom", label: "People sharing each room", step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MoonStar className="h-4 w-4" aria-hidden="true" />
          Istanbul trip planner
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Istanbul Trip Budget Breakdown
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prices the room, food, Istanbulkart rides and sights in lira, keeps flights and the
          e-Visa in rupees, and adjusts for the two things that shift between booking and boarding:
          Turkish price inflation and the lira&apos;s slide against the rupee.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ist-tier">
              Travel style (sets the starting rates)
            </label>
            <select
              id="ist-tier"
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
            <label className={LABEL_CLASS} htmlFor="ist-season">
              Season (moves the room rate)
            </label>
            <select
              id="ist-season"
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
            <label className={LABEL_CLASS} htmlFor="ist-payment">
              How you pay in Türkiye
            </label>
            <select
              id="ist-payment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
            >
              {PAYMENT_METHODS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} (+{option.markupPercent}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-travellers">
              Travellers
            </label>
            <input
              id="ist-travellers"
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
            <label className={LABEL_CLASS} htmlFor="ist-nights">
              Nights in Istanbul
            </label>
            <input
              id="ist-nights"
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

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-fx">
              Rupees per 1 lira (today&apos;s rate)
            </label>
            <input
              id="ist-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={fx}
              onChange={(event) => setFx(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-months">
              Months until you travel
            </label>
            <input
              id="ist-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="36"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-inflation">
              Turkish price inflation (% a month)
            </label>
            <input
              id="ist-inflation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={inflation}
              onChange={(event) => setInflation(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-depreciation">
              Lira fall against the rupee (% a month)
            </label>
            <input
              id="ist-depreciation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={depreciation}
              onChange={(event) => setDepreciation(event.target.value)}
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
            <label className={LABEL_CLASS} htmlFor="ist-ridefare">
              Fare per Istanbulkart ride (₺)
            </label>
            <input
              id="ist-ridefare"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={rideFare}
              onChange={(event) => setRideFare(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-card">
              Istanbulkart purchase price (₺)
            </label>
            <input
              id="ist-card"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={card}
              onChange={(event) => setCard(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-visa">
              e-Visa fee per person (₹)
            </label>
            <input
              id="ist-visa"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={visa}
              onChange={(event) => setVisa(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-insurance">
              Travel insurance per person (₹)
            </label>
            <input
              id="ist-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="ist-contingency"
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

          <div>
            <label className={LABEL_CLASS} htmlFor="ist-cap">
              Budget cap for the group (₹, optional)
            </label>
            <input
              id="ist-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5000"
              placeholder="e.g. 180000"
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
              {ok ? money(result.totalInr) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money(result.perPersonInr)} per person · ${money(result.perPersonPerDayInr)} per person per day`
                : "Fix the inputs above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Istanbul trip budget breakdown"
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
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Line
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Lira
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rupees
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
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {line.lira > 0 ? lira(line.lira) : DASH}
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold">{money(line.inr)}</td>
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
            ["Lira to budget on the ground", ok ? lira(result.onGroundTry) : DASH],
            ["Lira per person", ok ? lira(result.onGroundTryPerPerson) : DASH],
            ["Istanbulkart rides and cards", ok ? lira(result.istanbulkartTry) : DASH],
            [
              "Drift factor to travel date",
              ok ? `${result.drift.factor.toFixed(3)}x (${pct(result.drift.percent)} in rupee terms)` : DASH,
            ],
            ["Cost of that drift", ok ? money(result.driftCostInr) : DASH],
            [
              "Effective rate after markup and drift",
              ok ? `₹${result.effectiveRate.toFixed(3)} per lira` : DASH,
            ],
            ["Forex markup cost", ok ? money(result.forexMarkupInr) : DASH],
            ["Fixed rupee costs (flights, visa, insurance)", ok ? money(result.fixedInr) : DASH],
            ["Cost of one extra night", ok ? money(result.costOfOneMoreNightInr) : DASH],
            ["Subtotal before contingency", ok ? money(result.subtotalInr) : DASH],
            [
              "Against your budget cap",
              ok && result.budgetCapInr > 0
                ? `${result.budgetGapInr >= 0 ? "Under by" : "Over by"} ${money(Math.abs(result.budgetGapInr))}`
                : DASH,
            ],
            [
              "Nights the cap actually covers",
              ok && result.budgetCapInr > 0 && result.nightsAffordable !== null
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
        Planning estimate only. The inflation and depreciation fields are your assumptions, not a
        forecast, and the rupee-lira rate moves daily — set all three from current data before you
        rely on the total.
      </p>
    </main>
  );
}
