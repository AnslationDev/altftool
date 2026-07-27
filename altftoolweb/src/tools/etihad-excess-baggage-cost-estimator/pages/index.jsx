"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, CircleCheck, Copy, Luggage, RotateCcw } from "lucide-react";

import {
  AIRLINE,
  ALLOWANCE_OPTIONS,
  CURRENCIES,
  DEFAULT_AIRPORT_RATE_PER_KG,
  DEFAULT_CURRENCY,
  DEFAULT_PREPAID_RATE_PER_KG,
  MAX_PASSENGERS,
  MAX_SINGLE_PIECE_KG,
  estimateExcessCost,
  getAllowanceOption,
  getCurrency,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const KG = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  allowanceKey: "eco-25",
  customAllowance: "25",
  passengers: "1",
  totalKg: "31",
  heaviestKg: "20",
  prepaidRate: String(DEFAULT_PREPAID_RATE_PER_KG),
  airportRate: String(DEFAULT_AIRPORT_RATE_PER_KG),
  currency: DEFAULT_CURRENCY,
};

export default function ToolHome() {
  const [allowanceKey, setAllowanceKey] = useState(DEFAULTS.allowanceKey);
  const [customAllowance, setCustomAllowance] = useState(DEFAULTS.customAllowance);
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [totalKg, setTotalKg] = useState(DEFAULTS.totalKg);
  const [heaviestKg, setHeaviestKg] = useState(DEFAULTS.heaviestKg);
  const [prepaidRate, setPrepaidRate] = useState(DEFAULTS.prepaidRate);
  const [airportRate, setAirportRate] = useState(DEFAULTS.airportRate);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const entry = getCurrency(currency);
    const formatter = new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 0,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [currency]);

  const allowanceOption = getAllowanceOption(allowanceKey);
  const isCustom = !allowanceOption || allowanceOption.kg === null;
  const allowanceValue = isCustom ? customAllowance : String(allowanceOption.kg);

  const result = useMemo(
    () =>
      estimateExcessCost({
        totalCheckedKg: totalKg,
        passengers: Number(passengers),
        allowanceKgPerPassenger: allowanceValue,
        heaviestBagKg: heaviestKg,
        prepaidRatePerKg: prepaidRate,
        airportRatePerKg: airportRate,
      }),
    [totalKg, passengers, allowanceValue, heaviestKg, prepaidRate, airportRate],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `${AIRLINE.name} excess baggage estimate`,
      `${result.passengers} passenger(s), ${KG.format(result.totalCheckedKg)} kg checked against ${KG.format(result.totalAllowanceKg)} kg free`,
      `Chargeable excess: ${result.chargeableExcessKg} kg`,
      `Cheapest: ${result.cheapestLabel} at ${money(result.cheapestCost)}`,
      `Paying it all at the airport: ${money(result.airportOnlyCost)}`,
      `Saving by buying ahead: ${money(result.savingVsAirport)} (${result.savingPct}%)`,
      result.chargeableExcessKg > 0 ? `Effective cost per kilo: ${money(result.effectivePerKg)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result, money]);

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
    setTotalKg(DEFAULTS.totalKg);
    setHeaviestKg(DEFAULTS.heaviestKg);
    setPrepaidRate(DEFAULTS.prepaidRate);
    setAirportRate(DEFAULTS.airportRate);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  const breakdown = failed
    ? []
    : [
        ["Free allowance", `${KG.format(result.totalAllowanceKg)} kg for ${result.passengers} passenger(s)`],
        ["Checked weight", `${KG.format(result.totalCheckedKg)} kg`],
        ["Chargeable excess", `${result.chargeableExcessKg} kg`],
        ["Cheapest way to buy it", result.cheapestLabel],
        ["Paying at the airport instead", money(result.airportOnlyCost)],
        ["Saving by buying ahead", `${money(result.savingVsAirport)} (${result.savingPct}%)`],
        [
          "Effective cost per kilo",
          result.chargeableExcessKg > 0 ? money(result.effectivePerKg) : "Nothing to pay",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          {AIRLINE.name} ({AIRLINE.code}) excess baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Etihad Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Advance weight is sold in fixed blocks per passenger; the airport desk bills the actual kilos at a higher
          rate. This prices every block plus the pay-at-the-airport option and shows which really costs least.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Your booking</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="allowance">
              Free checked allowance per passenger
            </label>
            <select
              id="allowance"
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
              <label className={LABEL_CLASS} htmlFor="custom-allowance">
                Allowance from my ticket (kg)
              </label>
              <input
                id="custom-allowance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={customAllowance}
                onChange={(event) => setCustomAllowance(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="passengers">
              Passengers on the booking
            </label>
            <input
              id="passengers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_PASSENGERS}
              step="1"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="total-kg">
              Total checked weight (kg)
            </label>
            <input
              id="total-kg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={totalKg}
              onChange={(event) => setTotalKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="heaviest-kg">
              Heaviest single bag (kg)
            </label>
            <input
              id="heaviest-kg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={heaviestKg}
              onChange={(event) => setHeaviestKg(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={`mt-4 ${CARD}`}>
        <h2 className="text-base font-semibold">Rates on your route</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Etihad sets excess rates by route and revises them, so the figures below are round placeholders. Replace
          both with what your own booking shows.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="currency">
              Currency
            </label>
            <select
              id="currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="prepaid-rate">
              Advance rate per kg
            </label>
            <input
              id="prepaid-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={prepaidRate}
              onChange={(event) => setPrepaidRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="airport-rate">
              Airport rate per kg
            </label>
            <input
              id="airport-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={airportRate}
              onChange={(event) => setAirportRate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed ? (
        <section className={`mt-6 ${CARD}`}>
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Cheapest total
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {["Free allowance", "Checked weight", "Chargeable excess", "Cheapest way to buy it", "Saving by buying ahead"].map(
              (label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ),
            )}
          </dl>
        </section>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Cheapest total
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${result.chargeableExcessKg > 0 ? "text-[var(--foreground)]" : "text-[var(--primary)]"}`}
                >
                  {money(result.cheapestCost)}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                  {result.chargeableExcessKg === 0 ? (
                    <>
                      <CircleCheck className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                      <span className="text-[var(--success)]">Inside the free allowance</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                      <span>
                        {result.chargeableExcessKg} kg chargeable · {result.cheapestLabel}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy Etihad excess baggage estimate"
                  className={GHOST_BTN}
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
              {breakdown.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {result.warnings.length > 0 && (
              <ul className="mt-5 space-y-2 text-sm">
                {result.warnings.map((note) => (
                  <li
                    key={note}
                    className={`rounded-md px-3 py-2 font-medium ${
                      note.includes(`${MAX_SINGLE_PIECE_KG} kg`)
                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`mt-4 ${CARD}`}>
            <h2 className="text-base font-semibold">Every option priced</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Anything a block does not cover is settled at the airport rate, which is why the smallest block that
              fits is not always the cheapest answer.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Option
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Bought
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Left for the desk
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Unused
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.options.map((option) => (
                    <tr key={option.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {option.blockKg > 0 ? `${option.blockKg} kg block` : "Pay at the airport"}
                        {option.id === result.cheapestId && result.chargeableExcessKg > 0 && (
                          <span className="ml-2 text-xs font-semibold text-[var(--success)]">cheapest</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-right">{option.kgBought} kg</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{option.uncoveredKg} kg</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{option.unusedKg} kg</td>
                      <td className="py-2 text-right font-semibold">{money(option.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Etihad sets excess baggage rates and advance block sizes by route and point of sale and
        revises them, and Etihad Guest tiers, codeshare sectors, infants, sports equipment and piece-concept routes to
        the Americas follow separate rules — check what your own booking quotes before you travel.
      </p>
    </main>
  );
}
