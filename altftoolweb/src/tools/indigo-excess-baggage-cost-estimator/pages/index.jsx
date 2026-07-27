"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";
import {
  ALLOWANCE_OPTIONS,
  DEFAULT_AIRPORT_RATE_PER_KG,
  DEFAULT_PREPAID_RATE_PER_KG,
  FREE_HAND_BAGGAGE_KG,
  FREE_PERSONAL_ITEM_KG,
  MAX_SINGLE_PIECE_KG,
  PREPAID_SLABS_KG,
  buildSlabLadder,
  estimateExcessBaggage,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const kg = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} kg`;
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  allowanceKey: "domestic-regular",
  customAllowance: "15",
  passengers: "1",
  totalWeight: "24",
  heaviestBag: "18",
  airportRate: String(DEFAULT_AIRPORT_RATE_PER_KG),
  prepaidRate: String(DEFAULT_PREPAID_RATE_PER_KG),
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
  const [heaviestBag, setHeaviestBag] = useState(DEFAULTS.heaviestBag);
  const [airportRate, setAirportRate] = useState(DEFAULTS.airportRate);
  const [prepaidRate, setPrepaidRate] = useState(DEFAULTS.prepaidRate);
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
      heaviestBagKg: toNumber(heaviestBag),
      airportRatePerKg: toNumber(airportRate),
      prepaidRatePerKg: toNumber(prepaidRate),
    });
  }, [
    allowanceKey,
    isCustom,
    customAllowance,
    totalWeight,
    passengers,
    heaviestBag,
    airportRate,
    prepaidRate,
    pool,
  ]);

  const ladder = useMemo(
    () =>
      buildSlabLadder({
        airportRatePerKg: toNumber(airportRate),
        prepaidRatePerKg: toNumber(prepaidRate),
      }),
    [airportRate, prepaidRate],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "IndiGo Excess Baggage Cost Estimator",
      `Free allowance: ${result.allowanceKgPerPassenger} kg x ${result.passengers} passenger(s) = ${result.totalAllowanceKg} kg`,
      `Checked in: ${result.totalCheckedKg} kg`,
      `Chargeable excess: ${result.chargeableExcessKg} kg`,
      `Pay at the airport: ${money(result.airportCost)} (${money(result.airportRatePerKg)}/kg)`,
      `Prepay online: ${money(result.prepaidTotalCost)} (${result.prepaidKgBought} kg bought at ${money(result.prepaidRatePerKg)}/kg)`,
      result.cheapestOption === "none"
        ? "No excess baggage charge applies."
        : `Cheaper option: ${result.cheapestOption === "prepaid" ? "prepay online" : "pay at the airport"} — ${money(result.cheapestCost)}`,
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
    setHeaviestBag(DEFAULTS.heaviestBag);
    setAirportRate(DEFAULTS.airportRate);
    setPrepaidRate(DEFAULTS.prepaidRate);
    setPool(DEFAULTS.pool);
    setCopied(false);
  };

  const headlineLabel =
    ok && result.cheapestOption === "none"
      ? "Nothing to pay"
      : ok && result.cheapestOption === "prepaid"
        ? "Cheapest: prepay online"
        : "Cheapest: pay at the airport";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          IndiGo baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          IndiGo Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weigh your bags before you leave home. This compares the per-kilogram counter charge
          against buying a prepaid excess baggage slab, rounding each the way the airline actually
          does, and tells you which one costs less.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ind-allowance">
              Free checked allowance on your ticket
            </label>
            <select
              id="ind-allowance"
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
              <label className={LABEL_CLASS} htmlFor="ind-custom-allowance">
                Allowance per passenger (kg)
              </label>
              <input
                id="ind-custom-allowance"
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
            <label className={LABEL_CLASS} htmlFor="ind-passengers">
              Passengers on the booking
            </label>
            <input
              id="ind-passengers"
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
            <label className={LABEL_CLASS} htmlFor="ind-total">
              Total checked baggage weight (kg)
            </label>
            <input
              id="ind-total"
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
            <label className={LABEL_CLASS} htmlFor="ind-heaviest">
              Heaviest single bag (kg)
            </label>
            <input
              id="ind-heaviest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={heaviestBag}
              onChange={(event) => setHeaviestBag(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ind-airport-rate">
              Counter rate (INR per kg)
            </label>
            <input
              id="ind-airport-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={airportRate}
              onChange={(event) => setAirportRate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ind-prepaid-rate">
              Prepaid rate (INR per kg)
            </label>
            <input
              id="ind-prepaid-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={prepaidRate}
              onChange={(event) => setPrepaidRate(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="ind-pool"
            >
              <input
                id="ind-pool"
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
          Cabin baggage is separate: {FREE_HAND_BAGGAGE_KG} kg carry-on plus a{" "}
          {FREE_PERSONAL_ITEM_KG} kg personal item. Rates are editable — put your own booking page
          figures in.
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
              {ok ? headlineLabel : "Excess baggage cost"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.cheapestCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${kg(result.chargeableExcessKg)} chargeable excess over a ${kg(result.totalAllowanceKg)} allowance`
                : "Fix the inputs above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy excess baggage estimate"
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
            ["Free allowance for the party", ok ? kg(result.totalAllowanceKg) : DASH],
            ["Weight checked in", ok ? kg(result.totalCheckedKg) : DASH],
            [
              "Chargeable excess (rounded up)",
              ok ? `${kg(result.chargeableExcessKg)} (actual ${kg(result.rawExcessKg)})` : DASH,
            ],
            ["Pay at the counter", ok ? money(result.airportCost) : DASH],
            [
              "Prepaid slab bought",
              ok && result.prepaidKgBought > 0
                ? `${kg(result.slabPerPassengerKg)} x ${result.passengers} = ${kg(result.prepaidKgBought)}`
                : DASH,
            ],
            ["Prepaid cost", ok ? money(result.prepaidSlabCost) : DASH],
            [
              "Left to pay at the counter after prepaying",
              ok ? `${kg(result.uncoveredKg)} = ${money(result.counterTopUpCost)}` : DASH,
            ],
            ["Prepay total", ok ? money(result.prepaidTotalCost) : DASH],
            [
              "Saving by prepaying",
              ok ? `${money(result.saving)} (${pct(result.savingPct)})` : DASH,
            ],
            ["Unused prepaid weight", ok ? kg(result.unusedPrepaidKg) : DASH],
            ["Effective cost per excess kilo", ok ? money(result.effectivePerKg) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
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
        <h2 className="text-base font-semibold">Prepaid slab price ladder</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Prepaid excess is sold per passenger in {PREPAID_SLABS_KG.join(", ")} kg blocks — you
          cannot buy 7 kg.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Slab
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Prepaid
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Same kg at counter
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Saving
                </th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((row) => (
                <tr key={row.slabKg} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.slabKg} kg</td>
                  <td className="py-2 pr-3 text-right">{money(row.prepaidCost)}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {money(row.airportCost)}
                  </td>
                  <td className="py-2 text-right text-[var(--success)]">{money(row.saving)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Excess baggage rates change with the fare sheet and differ by
        sector; no single piece over {MAX_SINGLE_PIECE_KG} kg is accepted. Confirm the current rate
        and your ticketed allowance on the airline&apos;s own booking or manage-booking page before
        travelling.
      </p>
    </main>
  );
}
