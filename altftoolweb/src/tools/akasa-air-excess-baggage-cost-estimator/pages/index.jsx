"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";
import {
  ALLOWANCE_OPTIONS,
  CABIN_BAG_LIMIT_KG,
  DEFAULT_BOOKING_RATE_PER_KG,
  DEFAULT_COUNTER_RATE_PER_KG,
  DEFAULT_WEB_CHECKIN_RATE_PER_KG,
  MAX_SINGLE_PIECE_KG,
  PERSONAL_ITEM_LIMIT_KG,
  PREPAID_SLABS_KG,
  estimateExcessBaggage,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const kgs = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} kg`;
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  allowanceKey: "domestic-15",
  customAllowance: "15",
  passengers: "1",
  totalWeight: "27",
  heaviest: "20",
  bookingRate: String(DEFAULT_BOOKING_RATE_PER_KG),
  webRate: String(DEFAULT_WEB_CHECKIN_RATE_PER_KG),
  counterRate: String(DEFAULT_COUNTER_RATE_PER_KG),
  pool: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [allowanceKey, setAllowanceKey] = useState(DEFAULTS.allowanceKey);
  const [customAllowance, setCustomAllowance] = useState(DEFAULTS.customAllowance);
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [totalWeight, setTotalWeight] = useState(DEFAULTS.totalWeight);
  const [heaviest, setHeaviest] = useState(DEFAULTS.heaviest);
  const [bookingRate, setBookingRate] = useState(DEFAULTS.bookingRate);
  const [webRate, setWebRate] = useState(DEFAULTS.webRate);
  const [counterRate, setCounterRate] = useState(DEFAULTS.counterRate);
  const [pool, setPool] = useState(DEFAULTS.pool);
  const [copied, setCopied] = useState(false);

  const isCustom = allowanceKey === "custom";

  const result = useMemo(() => {
    const option = ALLOWANCE_OPTIONS.find((item) => item.value === allowanceKey);
    const allowanceKgPerPassenger = isCustom ? toNumber(customAllowance) : option?.kg ?? NaN;
    return estimateExcessBaggage({
      totalCheckedKg: toNumber(totalWeight),
      passengers: toNumber(passengers),
      allowanceKgPerPassenger,
      poolAllowance: pool,
      heaviestBagKg: toNumber(heaviest),
      bookingRatePerKg: toNumber(bookingRate),
      webCheckinRatePerKg: toNumber(webRate),
      counterRatePerKg: toNumber(counterRate),
    });
  }, [
    allowanceKey,
    isCustom,
    customAllowance,
    totalWeight,
    passengers,
    heaviest,
    bookingRate,
    webRate,
    counterRate,
    pool,
  ]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Akasa Air Excess Baggage Cost Estimator",
      `Allowance: ${result.allowanceKgPerPassenger} kg x ${result.passengers} passenger(s) = ${result.totalAllowanceKg} kg`,
      `Checked in: ${result.totalCheckedKg} kg`,
      `Chargeable excess: ${result.chargeableExcessKg} kg`,
      ...result.channels.map((channel) => `${channel.label}: ${money(channel.total)}`),
      result.cheapestId === "none"
        ? "No excess baggage charge applies."
        : `Cheapest: ${result.cheapestLabel} — ${money(result.cheapestCost)}`,
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
    setAllowanceKey(DEFAULTS.allowanceKey);
    setCustomAllowance(DEFAULTS.customAllowance);
    setPassengers(DEFAULTS.passengers);
    setTotalWeight(DEFAULTS.totalWeight);
    setHeaviest(DEFAULTS.heaviest);
    setBookingRate(DEFAULTS.bookingRate);
    setWebRate(DEFAULTS.webRate);
    setCounterRate(DEFAULTS.counterRate);
    setPool(DEFAULTS.pool);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Akasa Air baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Akasa Air Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Extra baggage gets dearer the later you buy it. This prices the same overweight three
          ways — added at booking, added at web check-in, or weighed at the airport counter — and
          names the cheapest.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qp-allowance">
              Free checked allowance on your ticket
            </label>
            <select
              id="qp-allowance"
              className={`mt-2 ${INPUT_CLASS}`}
              value={allowanceKey}
              onChange={(event) => setAllowanceKey(event.target.value)}
            >
              {ALLOWANCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isCustom && (
            <div>
              <label className={LABEL_CLASS} htmlFor="qp-custom-allowance">
                Allowance per passenger (kg)
              </label>
              <input
                id="qp-custom-allowance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="1"
                value={customAllowance}
                onChange={(event) => setCustomAllowance(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="qp-passengers">
              Passengers on the booking
            </label>
            <input
              id="qp-passengers"
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
            <label className={LABEL_CLASS} htmlFor="qp-total">
              Total checked baggage weight (kg)
            </label>
            <input
              id="qp-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={totalWeight}
              onChange={(event) => setTotalWeight(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="qp-heaviest">
              Heaviest single bag (kg)
            </label>
            <input
              id="qp-heaviest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={heaviest}
              onChange={(event) => setHeaviest(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="qp-booking-rate">
              Rate at booking (INR per kg)
            </label>
            <input
              id="qp-booking-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={bookingRate}
              onChange={(event) => setBookingRate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="qp-web-rate">
              Rate at web check-in (INR per kg)
            </label>
            <input
              id="qp-web-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={webRate}
              onChange={(event) => setWebRate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="qp-counter-rate">
              Rate at the airport counter (INR per kg)
            </label>
            <input
              id="qp-counter-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={counterRate}
              onChange={(event) => setCounterRate(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="qp-pool"
            >
              <input
                id="qp-pool"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                checked={pool}
                onChange={(event) => setPool(event.target.checked)}
              />
              Pool the allowance across everyone on the booking
            </label>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Cabin baggage sits outside this calculation: {CABIN_BAG_LIMIT_KG} kg for one bag plus a{" "}
          {PERSONAL_ITEM_LIMIT_KG} kg personal item.
        </p>
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
              {ok ? (result.cheapestId === "none" ? "Nothing to pay" : result.cheapestLabel) : "Cheapest option"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.cheapestCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${kgs(result.chargeableExcessKg)} chargeable excess over ${kgs(result.totalAllowanceKg)}`
                : "Fix the inputs above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy Akasa Air excess baggage estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
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
            ["Free allowance for the party", ok ? kgs(result.totalAllowanceKg) : DASH],
            ["Weight checked in", ok ? kgs(result.totalCheckedKg) : DASH],
            [
              "Chargeable excess (rounded up)",
              ok ? `${kgs(result.chargeableExcessKg)} (actual ${kgs(result.rawExcessKg)})` : DASH,
            ],
            [
              "Advance block you must buy",
              ok && result.prepaidKgBought > 0
                ? `${kgs(result.slabPerPassengerKg)} x ${result.passengers} = ${kgs(result.prepaidKgBought)}`
                : DASH,
            ],
            ["Weight left for the counter", ok ? kgs(result.uncoveredKg) : DASH],
            ["Cost if you leave it to the counter", ok ? money(result.counterCost) : DASH],
            [
              "Saving versus the counter",
              ok ? `${money(result.savingVsCounter)} (${pct(result.savingPct)})` : DASH,
            ],
            ["Block weight you will not use", ok ? kgs(result.unusedBlockKg) : DASH],
            ["Effective cost per excess kilo", ok ? money(result.effectivePerKg) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.warnings.length > 0 && (
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
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The three buying channels</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Advance weight is sold per passenger in {PREPAID_SLABS_KG.join(", ")} kg blocks; the
          counter bills the exact kilos, rounded up.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Channel
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rate/kg
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Weight bought
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? result.channels : []).map((channel) => (
                <tr
                  key={channel.id}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    channel.id === result.cheapestId ? "text-[var(--success)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-semibold">{channel.label}</td>
                  <td className="py-2 pr-3 text-right">{money(channel.ratePerKg)}</td>
                  <td className="py-2 pr-3 text-right">
                    {kgs(channel.kgBought)}
                    {channel.topUpKg > 0 ? ` + ${kgs(channel.topUpKg)} counter` : ""}
                  </td>
                  <td className="py-2 text-right font-semibold">{money(channel.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Rates change with the fare sheet and differ by sector, and no
        single piece over {MAX_SINGLE_PIECE_KG} kg is accepted at check-in. Confirm the live figures
        on the airline&apos;s own booking or manage-booking page.
      </p>
    </main>
  );
}
