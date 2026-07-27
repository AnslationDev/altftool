"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";

import {
  CURRENCIES,
  DEFAULT_AIRPORT_CHECKIN_FEE,
  DEFAULT_BAG_10KG_PRICE,
  DEFAULT_BAG_20KG_PRICE,
  DEFAULT_EXCESS_RATE_PER_KG,
  DEFAULT_GATE_BAG_FEE,
  DEFAULT_PRIORITY_PRICE,
  FREE_PERSONAL_BAG_CM,
  MAX_CHECKED_BAGS_PER_PASSENGER,
  MAX_SINGLE_PIECE_KG,
  PRIORITY_CABIN_BAG_CM,
  PRIORITY_CABIN_BAG_KG,
  cheapestBagPlan,
  estimateRyanairBaggage,
} from "../lib";

const NUM = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const DASH = "—";
const kgs = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} kg`;

const DEFAULTS = {
  currency: "EUR",
  passengers: "2",
  flights: "2",
  priority: true,
  bags10: "0",
  bags20: "1",
  checkedWeight: "23",
  heaviest: "23",
  cabinBag: "9",
  gateBags: "0",
  airportCheckIn: false,
  priorityPrice: String(DEFAULT_PRIORITY_PRICE),
  bag10Price: String(DEFAULT_BAG_10KG_PRICE),
  bag20Price: String(DEFAULT_BAG_20KG_PRICE),
  excessRate: String(DEFAULT_EXCESS_RATE_PER_KG),
  gateBagFee: String(DEFAULT_GATE_BAG_FEE),
  airportCheckInFee: String(DEFAULT_AIRPORT_CHECKIN_FEE),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const CHECKBOX_LABEL =
  "inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [flights, setFlights] = useState(DEFAULTS.flights);
  const [priority, setPriority] = useState(DEFAULTS.priority);
  const [bags10, setBags10] = useState(DEFAULTS.bags10);
  const [bags20, setBags20] = useState(DEFAULTS.bags20);
  const [checkedWeight, setCheckedWeight] = useState(DEFAULTS.checkedWeight);
  const [heaviest, setHeaviest] = useState(DEFAULTS.heaviest);
  const [cabinBag, setCabinBag] = useState(DEFAULTS.cabinBag);
  const [gateBags, setGateBags] = useState(DEFAULTS.gateBags);
  const [airportCheckIn, setAirportCheckIn] = useState(DEFAULTS.airportCheckIn);
  const [priorityPrice, setPriorityPrice] = useState(DEFAULTS.priorityPrice);
  const [bag10Price, setBag10Price] = useState(DEFAULTS.bag10Price);
  const [bag20Price, setBag20Price] = useState(DEFAULTS.bag20Price);
  const [excessRate, setExcessRate] = useState(DEFAULTS.excessRate);
  const [gateBagFee, setGateBagFee] = useState(DEFAULTS.gateBagFee);
  const [airportCheckInFee, setAirportCheckInFee] = useState(DEFAULTS.airportCheckInFee);
  const [copied, setCopied] = useState(false);

  const fmt = useMemo(() => {
    const entry = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];
    return new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 2,
    });
  }, [currency]);

  const money = (value) => fmt.format(Number.isFinite(value) ? value : 0);

  const result = useMemo(
    () =>
      estimateRyanairBaggage({
        passengers: toNumber(passengers),
        flights: toNumber(flights),
        priority,
        bags10: toNumber(bags10),
        bags20: toNumber(bags20),
        checkedWeightKg: toNumber(checkedWeight),
        heaviestBagKg: toNumber(heaviest),
        cabinBagKg: toNumber(cabinBag),
        gateBags: toNumber(gateBags),
        airportCheckIn,
        priorityPrice: toNumber(priorityPrice),
        bag10Price: toNumber(bag10Price),
        bag20Price: toNumber(bag20Price),
        excessRatePerKg: toNumber(excessRate),
        gateBagFee: toNumber(gateBagFee),
        airportCheckInFee: toNumber(airportCheckInFee),
      }),
    [
      passengers,
      flights,
      priority,
      bags10,
      bags20,
      checkedWeight,
      heaviest,
      cabinBag,
      gateBags,
      airportCheckIn,
      priorityPrice,
      bag10Price,
      bag20Price,
      excessRate,
      gateBagFee,
      airportCheckInFee,
    ],
  );

  const plan = useMemo(
    () =>
      cheapestBagPlan({
        checkedWeightKg: toNumber(checkedWeight),
        bag10Price: toNumber(bag10Price),
        bag20Price: toNumber(bag20Price),
        excessRatePerKg: toNumber(excessRate),
      }),
    [checkedWeight, bag10Price, bag20Price, excessRate],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Ryanair Excess Baggage Cost Estimator",
      `${result.passengers} passenger(s) x ${result.flights} one-way flight(s)`,
      `Hold allowance bought: ${result.holdAllowanceKg} kg per passenger (${result.bags10} x 10 kg, ${result.bags20} x 20 kg)`,
      `Hold weight packed: ${result.checkedWeightKg} kg — excess ${result.excessKg} kg`,
      `Per passenger, per flight: ${money(result.perPassengerPerFlight)}`,
      `Priority: ${money(result.priorityTotal)}`,
      `Hold bags: ${money(result.bagsTotal)}`,
      `Excess weight: ${money(result.excessTotal)}`,
      `Gate bag fees: ${money(result.gateTotal)}`,
      `Airport check-in: ${money(result.checkInTotal)}`,
      `Trip total: ${money(result.total)}`,
    ].join("\n");
  }, [ok, result, fmt]);

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
    setCurrency(DEFAULTS.currency);
    setPassengers(DEFAULTS.passengers);
    setFlights(DEFAULTS.flights);
    setPriority(DEFAULTS.priority);
    setBags10(DEFAULTS.bags10);
    setBags20(DEFAULTS.bags20);
    setCheckedWeight(DEFAULTS.checkedWeight);
    setHeaviest(DEFAULTS.heaviest);
    setCabinBag(DEFAULTS.cabinBag);
    setGateBags(DEFAULTS.gateBags);
    setAirportCheckIn(DEFAULTS.airportCheckIn);
    setPriorityPrice(DEFAULTS.priorityPrice);
    setBag10Price(DEFAULTS.bag10Price);
    setBag20Price(DEFAULTS.bag20Price);
    setExcessRate(DEFAULTS.excessRate);
    setGateBagFee(DEFAULTS.gateBagFee);
    setAirportCheckInFee(DEFAULTS.airportCheckInFee);
    setCopied(false);
  };

  const rows = ok
    ? [
        ["Hold allowance bought", `${kgs(result.holdAllowanceKg)} per passenger`],
        ["Hold weight packed", `${kgs(result.checkedWeightKg)} per passenger`],
        [
          "Excess weight (rounded up)",
          `${kgs(result.excessKg)} (actual ${kgs(result.rawExcessKg)})`,
        ],
        ["Cabin allowance in the locker", result.priority ? kgs(result.cabinAllowanceKg) : "Small under-seat bag only"],
        ["Per passenger, per one-way flight", money(result.perPassengerPerFlight)],
        ["Priority & 2 Cabin Bags — trip total", money(result.priorityTotal)],
        ["Hold bags — trip total", money(result.bagsTotal)],
        ["Excess weight — trip total", money(result.excessTotal)],
        ["Bags taken at the gate — trip total", money(result.gateTotal)],
        ["Airport check-in — trip total", money(result.checkInTotal)],
        ["Chargeable legs (passengers x flights)", String(result.legs)],
      ]
    : [
        ["Hold allowance bought", DASH],
        ["Excess weight", DASH],
        ["Per passenger, per one-way flight", DASH],
        ["Trip total", DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Ryanair baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ryanair Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every Ryanair bag fee is charged per passenger, per one-way flight, and nothing is pooled
          across the booking. Enter the prices your own booking quotes and see the real trip total —
          plus whether a second bag would be cheaper than the excess weight.
        </p>
      </header>

      <section className={CARD} aria-labelledby="ry-trip">
        <h2 id="ry-trip" className="text-base font-semibold">
          Your trip
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-currency">
              Currency
            </label>
            <select
              id="ry-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-passengers">
              Passengers
            </label>
            <input
              id="ry-passengers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="9"
              step="1"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-flights">
              One-way flights (a return is 2)
            </label>
            <input
              id="ry-flights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={flights}
              onChange={(event) => setFlights(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label className={CHECKBOX_LABEL} htmlFor="ry-priority">
              <input
                id="ry-priority"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={priority}
                onChange={(event) => setPriority(event.target.checked)}
              />
              Priority &amp; 2 Cabin Bags
            </label>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ry-bags">
        <h2 id="ry-bags" className="text-base font-semibold">
          What each passenger is carrying
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-bags10">
              10 kg check-in bags bought
            </label>
            <input
              id="ry-bags10"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={String(MAX_CHECKED_BAGS_PER_PASSENGER)}
              step="1"
              value={bags10}
              onChange={(event) => setBags10(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-bags20">
              20 kg check-in bags bought
            </label>
            <input
              id="ry-bags20"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={String(MAX_CHECKED_BAGS_PER_PASSENGER)}
              step="1"
              value={bags20}
              onChange={(event) => setBags20(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-weight">
              Hold weight actually packed (kg)
            </label>
            <input
              id="ry-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="0.5"
              value={checkedWeight}
              onChange={(event) => setCheckedWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-heaviest">
              Heaviest single hold bag (kg)
            </label>
            <input
              id="ry-heaviest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="0.5"
              value={heaviest}
              onChange={(event) => setHeaviest(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-cabin">
              Cabin bag weight (kg)
            </label>
            <input
              id="ry-cabin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={cabinBag}
              onChange={(event) => setCabinBag(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ry-gate">
              Bags you expect to be taken at the gate
            </label>
            <input
              id="ry-gate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="4"
              step="1"
              value={gateBags}
              onChange={(event) => setGateBags(event.target.value)}
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <label className={CHECKBOX_LABEL} htmlFor="ry-airport-checkin">
              <input
                id="ry-airport-checkin"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={airportCheckIn}
                onChange={(event) => setAirportCheckIn(event.target.checked)}
              />
              Checking in at the airport instead of online
            </label>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          The only free item is one small bag of {FREE_PERSONAL_BAG_CM} cm that fits under the seat
          in front. Priority adds an overhead-locker bag of {PRIORITY_CABIN_BAG_CM} cm up to{" "}
          {PRIORITY_CABIN_BAG_KG} kg.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ry-prices">
        <h2 id="ry-prices" className="text-base font-semibold">
          Prices from your booking ({currency}, per passenger per flight)
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["ry-priority-price", "Priority & 2 Cabin Bags", priorityPrice, setPriorityPrice, "1"],
            ["ry-bag10-price", "10 kg check-in bag", bag10Price, setBag10Price, "1"],
            ["ry-bag20-price", "20 kg check-in bag", bag20Price, setBag20Price, "1"],
            ["ry-excess-rate", "Excess weight, per kg at the airport", excessRate, setExcessRate, "0.5"],
            ["ry-gate-fee", "Bag taken at the gate", gateBagFee, setGateBagFee, "1"],
            ["ry-checkin-fee", "Airport check-in", airportCheckInFee, setAirportCheckInFee, "1"],
          ].map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {!ok ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Baggage cost for the whole trip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.total) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.passengers} passenger${result.passengers > 1 ? "s" : ""} across ${result.flights} one-way flight${result.flights > 1 ? "s" : ""}`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Ryanair baggage cost estimate"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--muted)] px-3 py-2 leading-5 text-[var(--foreground)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="ry-plan">
        <h2 id="ry-plan" className="text-base font-semibold">
          Cheapest way to carry that weight
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Every legal combination of up to {MAX_CHECKED_BAGS_PER_PASSENGER} hold bags, priced at
          your own rates, with per-kilogram excess added where the allowance falls short.
        </p>
        {plan.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Bags
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Allowance
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Excess
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cost per flight
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.plans.slice(0, 6).map((row) => (
                  <tr
                    key={`${row.bags10}-${row.bags20}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {row.bags === 0
                        ? "No hold bag"
                        : `${row.bags10} x 10 kg + ${row.bags20} x 20 kg`}
                    </td>
                    <td className="py-2 pr-3 text-right">{kgs(row.allowanceKg)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {kgs(row.excessKg)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Ryanair prices bags dynamically by route, season and how far
        ahead you book, and airport prices are higher than online prices, so the figures you enter
        must come from your own booking. No single piece over {MAX_SINGLE_PIECE_KG} kg is accepted
        at the bag drop whatever you pay.
      </p>
    </main>
  );
}
