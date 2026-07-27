"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";
import {
  CABIN_ALLOWANCE_ECONOMY_KG,
  CABIN_ALLOWANCE_PREMIUM_KG,
  CURRENCIES,
  DEFAULT_AIRPORT_RATE_PER_KG,
  DEFAULT_ONLINE_RATE_PER_KG,
  FARE_BRANDS,
  MAX_SINGLE_PIECE_KG,
  PREPAID_BLOCKS_KG,
  TIER_BONUS_OPTIONS,
  buildBlockLadder,
  estimateExcessBaggage,
} from "../lib";

const NUM = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const kgs = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} kg`;
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  currency: "SGD",
  brand: "economy-lite",
  customAllowance: "25",
  tier: "none",
  passengers: "1",
  totalWeight: "33",
  heaviest: "24",
  airportRate: String(DEFAULT_AIRPORT_RATE_PER_KG),
  onlineRate: String(DEFAULT_ONLINE_RATE_PER_KG),
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
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [brand, setBrand] = useState(DEFAULTS.brand);
  const [customAllowance, setCustomAllowance] = useState(DEFAULTS.customAllowance);
  const [tier, setTier] = useState(DEFAULTS.tier);
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [totalWeight, setTotalWeight] = useState(DEFAULTS.totalWeight);
  const [heaviest, setHeaviest] = useState(DEFAULTS.heaviest);
  const [airportRate, setAirportRate] = useState(DEFAULTS.airportRate);
  const [onlineRate, setOnlineRate] = useState(DEFAULTS.onlineRate);
  const [copied, setCopied] = useState(false);

  const isCustom = brand === "custom";

  const fmt = useMemo(() => {
    const entry = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];
    return new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 0,
    });
  }, [currency]);

  const money = (value) => fmt.format(Number.isFinite(value) ? value : 0);

  const result = useMemo(() => {
    const fare = FARE_BRANDS.find((item) => item.value === brand);
    const tierEntry = TIER_BONUS_OPTIONS.find((item) => item.value === tier);
    return estimateExcessBaggage({
      totalCheckedKg: toNumber(totalWeight),
      fareBrandKg: isCustom ? toNumber(customAllowance) : fare?.kg ?? NaN,
      tierBonusKg: tierEntry ? tierEntry.kg : 0,
      passengers: toNumber(passengers),
      heaviestBagKg: toNumber(heaviest),
      airportRatePerKg: toNumber(airportRate),
      onlineRatePerKg: toNumber(onlineRate),
    });
  }, [brand, isCustom, customAllowance, tier, totalWeight, passengers, heaviest, airportRate, onlineRate]);

  const ladder = useMemo(
    () =>
      buildBlockLadder({
        airportRatePerKg: toNumber(airportRate),
        onlineRatePerKg: toNumber(onlineRate),
      }),
    [airportRate, onlineRate],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Singapore Airlines Excess Baggage Cost Estimator",
      `Fare brand allowance: ${result.fareBrandKg} kg + tier bonus ${result.tierBonusKg} kg = ${result.allowancePerPassengerKg} kg per passenger`,
      `Party allowance: ${result.totalAllowanceKg} kg for ${result.passengers} passenger(s)`,
      `Checked in: ${result.totalCheckedKg} kg`,
      `Chargeable excess: ${result.chargeableExcessKg} kg`,
      `At the airport: ${money(result.airportCost)}`,
      `Bought in advance: ${money(result.onlineTotalCost)} for ${result.onlineKgBought} kg`,
      result.cheapestOption === "none"
        ? "No excess baggage charge applies."
        : `Cheaper: ${result.cheapestOption === "online" ? "buy in advance" : "pay at the airport"} — ${money(result.cheapestCost)}`,
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
    setBrand(DEFAULTS.brand);
    setCustomAllowance(DEFAULTS.customAllowance);
    setTier(DEFAULTS.tier);
    setPassengers(DEFAULTS.passengers);
    setTotalWeight(DEFAULTS.totalWeight);
    setHeaviest(DEFAULTS.heaviest);
    setAirportRate(DEFAULTS.airportRate);
    setOnlineRate(DEFAULTS.onlineRate);
    setCopied(false);
  };

  const headline =
    ok && result.cheapestOption === "none"
      ? "Nothing to pay"
      : ok && result.cheapestOption === "online"
        ? "Cheapest: buy in advance"
        : "Cheapest: pay at the airport";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Singapore Airlines baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Singapore Airlines Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The allowance is a total weight, not a bag count, and any KrisFlyer tier bonus is added
          on top. This works out the excess kilos left over and prices them both ways — bought in
          advance, or weighed at the airport.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sq-brand">
              Fare brand / cabin
            </label>
            <select
              id="sq-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              {FARE_BRANDS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {isCustom && (
            <div>
              <label className={LABEL_CLASS} htmlFor="sq-custom-allowance">
                Allowance per passenger (kg)
              </label>
              <input
                id="sq-custom-allowance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="150"
                step="1"
                value={customAllowance}
                onChange={(event) => setCustomAllowance(event.target.value)}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sq-tier">
              KrisFlyer / PPS Club tier
            </label>
            <select
              id="sq-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tier}
              onChange={(event) => setTier(event.target.value)}
            >
              {TIER_BONUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sq-currency">
              Currency of the quoted rates
            </label>
            <select
              id="sq-currency"
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
            <label className={LABEL_CLASS} htmlFor="sq-passengers">
              Passengers on the booking
            </label>
            <input
              id="sq-passengers"
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
            <label className={LABEL_CLASS} htmlFor="sq-total">
              Total checked baggage weight (kg)
            </label>
            <input
              id="sq-total"
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
            <label className={LABEL_CLASS} htmlFor="sq-heaviest">
              Heaviest single bag (kg)
            </label>
            <input
              id="sq-heaviest"
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
            <label className={LABEL_CLASS} htmlFor="sq-airport-rate">
              Airport rate ({currency} per kg)
            </label>
            <input
              id="sq-airport-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={airportRate}
              onChange={(event) => setAirportRate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sq-online-rate">
              Advance purchase rate ({currency} per kg)
            </label>
            <input
              id="sq-online-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={onlineRate}
              onChange={(event) => setOnlineRate(event.target.value)}
            />
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Cabin baggage is counted separately: {CABIN_ALLOWANCE_ECONOMY_KG} kg in Economy and
          Premium Economy, up to {CABIN_ALLOWANCE_PREMIUM_KG} kg across two bags in Business and
          First.
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
              {ok ? headline : "Excess baggage cost"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.cheapestCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${kgs(result.chargeableExcessKg)} over a ${kgs(result.totalAllowanceKg)} allowance`
                : "Fix the inputs above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy Singapore Airlines excess baggage estimate"
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
            ["Fare brand allowance", ok ? kgs(result.fareBrandKg) : DASH],
            ["Tier bonus", ok ? kgs(result.tierBonusKg) : DASH],
            ["Allowance per passenger", ok ? kgs(result.allowancePerPassengerKg) : DASH],
            ["Allowance for the party", ok ? kgs(result.totalAllowanceKg) : DASH],
            ["Weight checked in", ok ? kgs(result.totalCheckedKg) : DASH],
            [
              "Chargeable excess (rounded up)",
              ok ? `${kgs(result.chargeableExcessKg)} (actual ${kgs(result.rawExcessKg)})` : DASH,
            ],
            ["Pay at the airport", ok ? money(result.airportCost) : DASH],
            [
              "Advance block bought",
              ok && result.onlineKgBought > 0
                ? `${kgs(result.blockPerPassengerKg)} x ${result.passengers} = ${kgs(result.onlineKgBought)}`
                : DASH,
            ],
            ["Advance cost", ok ? money(result.onlineBlockCost) : DASH],
            [
              "Balance settled at the airport",
              ok ? `${kgs(result.uncoveredKg)} = ${money(result.airportTopUpCost)}` : DASH,
            ],
            ["Advance purchase total", ok ? money(result.onlineTotalCost) : DASH],
            ["Saving by buying early", ok ? `${money(result.saving)} (${pct(result.savingPct)})` : DASH],
            ["Block weight left unused", ok ? kgs(result.unusedBlockKg) : DASH],
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
        <h2 className="text-base font-semibold">Advance block price ladder</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Advance weight is sold per passenger in {PREPAID_BLOCKS_KG.join(", ")} kg blocks.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Block
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  In advance
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Same kg at airport
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Saving
                </th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((row) => (
                <tr key={row.blockKg} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.blockKg} kg</td>
                  <td className="py-2 pr-3 text-right">{money(row.onlineCost)}</td>
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
        Informational estimate only. Excess rates are set by route band and currency, tier benefits
        depend on your membership status at the time of travel, and no single piece over{" "}
        {MAX_SINGLE_PIECE_KG} kg is accepted at check-in. Confirm on the airline&apos;s own
        manage-booking page.
      </p>
    </main>
  );
}
