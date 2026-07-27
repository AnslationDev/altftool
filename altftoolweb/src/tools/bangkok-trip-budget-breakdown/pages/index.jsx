"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw } from "lucide-react";
import {
  DEFAULT_CONTINGENCY_PCT,
  DEFAULT_INR_PER_THB,
  DEFAULT_INSURANCE_INR,
  DEFAULT_VISA_FEE_INR,
  PAYMENT_METHODS,
  SEASONS,
  TIERS,
  buildBangkokBudget,
  paymentByValue,
  seasonByValue,
  tierByValue,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const THB = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const baht = (value) => `฿${THB.format(Number.isFinite(value) ? value : 0)}`;
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULT_TIER = "comfort";
const DEFAULT_SEASON = "hot";
const DEFAULT_PAYMENT = "forexcard";

const ratesForTier = (tierValue) => {
  const tier = tierByValue(tierValue);
  return {
    stay: String(tier.stayPerRoomPerNightThb),
    food: String(tier.foodPerPersonPerDayThb),
    transport: String(tier.transportPerPersonPerDayThb),
    activities: String(tier.activitiesPerPersonPerDayThb),
    shopping: String(tier.shoppingPerPersonThb),
    fare: String(tier.returnFareInr),
    peoplePerRoom: String(tier.peoplePerRoom),
  };
};

const BASE_DEFAULTS = {
  travellers: "2",
  nights: "4",
  fx: String(DEFAULT_INR_PER_THB),
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
  const [visa, setVisa] = useState(BASE_DEFAULTS.visa);
  const [insurance, setInsurance] = useState(BASE_DEFAULTS.insurance);
  const [contingency, setContingency] = useState(BASE_DEFAULTS.contingency);
  const [cap, setCap] = useState(BASE_DEFAULTS.cap);
  const [claimVat, setClaimVat] = useState(true);
  const [copied, setCopied] = useState(false);

  const applyTier = (value) => {
    setTier(value);
    setRates(ratesForTier(value));
    setCopied(false);
  };

  const setRate = (key, value) => setRates((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      buildBangkokBudget({
        travellers: toNumber(travellers),
        nights: toNumber(nights),
        peoplePerRoom: toNumber(rates.peoplePerRoom),
        stayPerRoomPerNightThb: toNumber(rates.stay),
        foodPerPersonPerDayThb: toNumber(rates.food),
        transportPerPersonPerDayThb: toNumber(rates.transport),
        activitiesPerPersonPerDayThb: toNumber(rates.activities),
        shoppingPerPersonThb: toNumber(rates.shopping),
        returnFareInr: toNumber(rates.fare),
        visaFeeInr: toNumber(visa, 0),
        insuranceInr: toNumber(insurance, 0),
        inrPerThb: toNumber(fx),
        markupPercent: paymentByValue(payment).markupPercent,
        contingencyPct: toNumber(contingency, 0),
        seasonFactor: seasonByValue(season).factor,
        claimVatRefund: claimVat,
        budgetCapInr: toNumber(cap, 0),
      }),
    [travellers, nights, rates, fx, visa, insurance, contingency, season, payment, claimVat, cap],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Bangkok Trip Budget Breakdown",
      `${result.travellers} traveller(s), ${result.nights} night(s) / ${result.days} day(s), ${result.rooms} room(s)`,
      `Rate used: ${result.inrPerThb} INR per baht + ${result.markupPercent}% forex markup`,
      ...result.lines.map((line) => `${line.label}: ${money(line.inr)}`),
      `Total: ${money(result.totalInr)}`,
      `Per person: ${money(result.perPersonInr)}`,
      `Per person per day: ${money(result.perPersonPerDayInr)}`,
      `Baht to spend on the ground: ${baht(result.onGroundThb)}`,
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
    setVisa(BASE_DEFAULTS.visa);
    setInsurance(BASE_DEFAULTS.insurance);
    setContingency(BASE_DEFAULTS.contingency);
    setCap(BASE_DEFAULTS.cap);
    setClaimVat(true);
    setCopied(false);
  };

  const rateFields = [
    { id: "bkk-fare", key: "fare", label: "Return airfare per person (₹)", step: "1000" },
    { id: "bkk-stay", key: "stay", label: "Room rate per night (฿)", step: "100" },
    { id: "bkk-food", key: "food", label: "Food per person per day (฿)", step: "50" },
    { id: "bkk-transport", key: "transport", label: "Transport per person per day (฿)", step: "20" },
    { id: "bkk-activities", key: "activities", label: "Activities per person per day (฿)", step: "50" },
    { id: "bkk-shopping", key: "shopping", label: "Shopping per person (฿)", step: "500" },
    { id: "bkk-ppr", key: "peoplePerRoom", label: "People sharing each room", step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Bangkok trip planner
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bangkok Trip Budget Breakdown
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Keeps the rupee half of a Bangkok trip (flights, visa, insurance) separate from the baht
          half (room, food, BTS, temples, shopping), converts the baht at the rate you will really
          get, and reports cost per person per day.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bkk-tier">
              Travel style (sets the starting rates)
            </label>
            <select
              id="bkk-tier"
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
            <label className={LABEL_CLASS} htmlFor="bkk-season">
              Season (moves the room rate)
            </label>
            <select
              id="bkk-season"
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
            <label className={LABEL_CLASS} htmlFor="bkk-payment">
              How you pay in Thailand
            </label>
            <select
              id="bkk-payment"
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
            <label className={LABEL_CLASS} htmlFor="bkk-travellers">
              Travellers
            </label>
            <input
              id="bkk-travellers"
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
            <label className={LABEL_CLASS} htmlFor="bkk-nights">
              Nights in Bangkok
            </label>
            <input
              id="bkk-nights"
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
            <label className={LABEL_CLASS} htmlFor="bkk-fx">
              Rupees per 1 baht (today&apos;s rate)
            </label>
            <input
              id="bkk-fx"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={fx}
              onChange={(event) => setFx(event.target.value)}
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
            <label className={LABEL_CLASS} htmlFor="bkk-visa">
              Visa or e-visa fee per person (₹)
            </label>
            <input
              id="bkk-visa"
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
            <label className={LABEL_CLASS} htmlFor="bkk-insurance">
              Travel insurance per person (₹)
            </label>
            <input
              id="bkk-insurance"
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
            <label className={LABEL_CLASS} htmlFor="bkk-contingency">
              Contingency buffer (%)
            </label>
            <input
              id="bkk-contingency"
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
            <label className={LABEL_CLASS} htmlFor="bkk-cap">
              Budget cap for the group (₹, optional)
            </label>
            <input
              id="bkk-cap"
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

          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="bkk-vat"
            >
              <input
                id="bkk-vat"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={claimVat}
                onChange={(event) => setClaimVat(event.target.checked)}
              />
              Claim the tourist VAT refund on shopping at the airport
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
              aria-label="Copy the Bangkok trip budget breakdown"
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
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Line
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Baht
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
                    {line.thb > 0 ? baht(line.thb) : DASH}
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
            ["Baht to budget on the ground", ok ? baht(result.onGroundThb) : DASH],
            ["Baht per person", ok ? baht(result.onGroundThbPerPerson) : DASH],
            [
              "Effective rate after markup",
              ok ? `₹${result.effectiveRate.toFixed(3)} per baht` : DASH,
            ],
            ["Forex markup cost", ok ? money(result.forexMarkupInr) : DASH],
            ["Fixed rupee costs (flights, visa, insurance)", ok ? money(result.fixedInr) : DASH],
            ["Cost of one extra night", ok ? money(result.costOfOneMoreNightInr) : DASH],
            ["Subtotal before contingency", ok ? money(result.subtotalInr) : DASH],
            [
              "VAT refund reclaimable",
              ok && result.vatRefund.appliedThb > 0
                ? `${baht(result.vatRefund.appliedThb)} (${money(result.vatRefund.appliedInr)})`
                : DASH,
            ],
            [
              "Total after VAT refund",
              ok && result.vatRefund.appliedThb > 0 ? money(result.totalAfterRefundInr) : DASH,
            ],
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
        Planning estimate only. The starting baht rates are ordinary-week reference points and the
        exchange rate floats — replace both with your own quotes, and check current Thai visa and
        VAT refund rules before you travel.
      </p>
    </main>
  );
}
