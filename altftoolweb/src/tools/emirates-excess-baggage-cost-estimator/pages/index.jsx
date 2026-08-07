"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";
import {
  CABIN_ALLOWANCE_ECONOMY_KG,
  CABIN_ALLOWANCE_PREMIUM_KG,
  CURRENCIES,
  DEFAULT_AIRPORT_RATE_PER_KG,
  DEFAULT_EXTRA_PIECE_FEE,
  DEFAULT_ONLINE_RATE_PER_KG,
  DEFAULT_OVERWEIGHT_PIECE_FEE,
  MAX_SINGLE_PIECE_KG,
  PIECE_FARE_BRANDS,
  PREPAID_MAX_KG,
  PREPAID_STEP_KG,
  WEIGHT_FARE_BRANDS,
  estimatePieceConcept,
  estimateWeightConcept,
} from "../lib";

const NUM = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const kgs = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} kg`;
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  mode: "weight",
  currency: "AED",
  weightBrand: "economy-saver",
  customAllowance: "25",
  pieceBrand: "economy-piece",
  passengers: "1",
  totalWeight: "38",
  heaviest: "26",
  pieces: "3",
  overweightPieces: "0",
  airportRate: String(DEFAULT_AIRPORT_RATE_PER_KG),
  onlineRate: String(DEFAULT_ONLINE_RATE_PER_KG),
  extraPieceFee: String(DEFAULT_EXTRA_PIECE_FEE),
  overweightFee: String(DEFAULT_OVERWEIGHT_PIECE_FEE),
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
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [weightBrand, setWeightBrand] = useState(DEFAULTS.weightBrand);
  const [customAllowance, setCustomAllowance] = useState(DEFAULTS.customAllowance);
  const [pieceBrand, setPieceBrand] = useState(DEFAULTS.pieceBrand);
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [totalWeight, setTotalWeight] = useState(DEFAULTS.totalWeight);
  const [heaviest, setHeaviest] = useState(DEFAULTS.heaviest);
  const [pieces, setPieces] = useState(DEFAULTS.pieces);
  const [overweightPieces, setOverweightPieces] = useState(DEFAULTS.overweightPieces);
  const [airportRate, setAirportRate] = useState(DEFAULTS.airportRate);
  const [onlineRate, setOnlineRate] = useState(DEFAULTS.onlineRate);
  const [extraPieceFee, setExtraPieceFee] = useState(DEFAULTS.extraPieceFee);
  const [overweightFee, setOverweightFee] = useState(DEFAULTS.overweightFee);
  const [copied, setCopied] = useState(false);

  const isWeight = mode === "weight";
  const isCustomAllowance = weightBrand === "custom";

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
    if (isWeight) {
      const brand = WEIGHT_FARE_BRANDS.find((item) => item.value === weightBrand);
      const allowanceKg = isCustomAllowance ? toNumber(customAllowance) : brand?.kg ?? NaN;
      return estimateWeightConcept({
        totalCheckedKg: toNumber(totalWeight),
        allowanceKg,
        passengers: toNumber(passengers),
        heaviestBagKg: toNumber(heaviest),
        airportRatePerKg: toNumber(airportRate),
        onlineRatePerKg: toNumber(onlineRate),
      });
    }
    const brand = PIECE_FARE_BRANDS.find((item) => item.value === pieceBrand) ?? PIECE_FARE_BRANDS[0];
    return estimatePieceConcept({
      checkedPieces: toNumber(pieces),
      allowedPieces: brand.pieces,
      pieceLimitKg: brand.pieceKg,
      overweightPieces: toNumber(overweightPieces),
      heaviestBagKg: toNumber(heaviest),
      passengers: toNumber(passengers),
      extraPieceFee: toNumber(extraPieceFee),
      overweightPieceFee: toNumber(overweightFee),
    });
  }, [
    isWeight,
    weightBrand,
    isCustomAllowance,
    customAllowance,
    totalWeight,
    passengers,
    heaviest,
    airportRate,
    onlineRate,
    pieceBrand,
    pieces,
    overweightPieces,
    extraPieceFee,
    overweightFee,
  ]);

  const ok = !result.error;
  const headlineCost = ok ? (isWeight ? result.cheapestCost : result.totalCost) : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    if (isWeight) {
      return [
        "Emirates Excess Baggage Cost Estimator — weight concept",
        `Allowance: ${result.allowanceKg} kg x ${result.passengers} passenger(s) = ${result.totalAllowanceKg} kg`,
        `Checked in: ${result.totalCheckedKg} kg`,
        `Chargeable excess: ${result.chargeableExcessKg} kg`,
        `At the airport: ${money(result.airportCost)}`,
        `Prepaid online: ${money(result.prepaidTotalCost)} for ${result.prepaidKgBought} kg`,
        result.cheapestOption === "none"
          ? "No excess baggage charge applies."
          : `Cheaper: ${result.cheapestOption === "prepaid" ? "prepay online" : "pay at the airport"} — ${money(result.cheapestCost)}`,
      ].join("\n");
    }
    return [
      "Emirates Excess Baggage Cost Estimator — piece concept",
      `Allowance: ${result.allowedPieces} piece(s) x ${result.pieceLimitKg} kg x ${result.passengers} passenger(s)`,
      `Checked pieces: ${result.checkedPieces}`,
      `Additional pieces: ${result.extraPieces} = ${money(result.extraPieceCost)}`,
      `Overweight pieces: ${result.overweightPieces} = ${money(result.overweightCost)}`,
      `Total: ${money(result.totalCost)}`,
    ].join("\n");
  }, [ok, isWeight, result, fmt]);

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
    setMode(DEFAULTS.mode);
    setCurrency(DEFAULTS.currency);
    setWeightBrand(DEFAULTS.weightBrand);
    setCustomAllowance(DEFAULTS.customAllowance);
    setPieceBrand(DEFAULTS.pieceBrand);
    setPassengers(DEFAULTS.passengers);
    setTotalWeight(DEFAULTS.totalWeight);
    setHeaviest(DEFAULTS.heaviest);
    setPieces(DEFAULTS.pieces);
    setOverweightPieces(DEFAULTS.overweightPieces);
    setAirportRate(DEFAULTS.airportRate);
    setOnlineRate(DEFAULTS.onlineRate);
    setExtraPieceFee(DEFAULTS.extraPieceFee);
    setOverweightFee(DEFAULTS.overweightFee);
    setCopied(false);
  };

  const rows = ok
    ? isWeight
      ? [
          ["Allowance for the party", kgs(result.totalAllowanceKg)],
          ["Weight checked in", kgs(result.totalCheckedKg)],
          [
            "Chargeable excess (rounded up)",
            `${kgs(result.chargeableExcessKg)} (actual ${kgs(result.rawExcessKg)})`,
          ],
          ["Pay at the airport", money(result.airportCost)],
          [
            "Prepaid weight bought online",
            result.prepaidKgBought > 0
              ? `${kgs(result.prepaidPerPassengerKg)} x ${result.passengers} = ${kgs(result.prepaidKgBought)}`
              : DASH,
          ],
          ["Prepaid cost", money(result.prepaidCost)],
          [
            "Balance settled at the airport",
            `${kgs(result.uncoveredKg)} = ${money(result.airportTopUpCost)}`,
          ],
          ["Prepay total", money(result.prepaidTotalCost)],
          ["Saving by prepaying", `${money(result.saving)} (${pct(result.savingPct)})`],
          ["Prepaid weight left unused", kgs(result.unusedPrepaidKg)],
          ["Effective cost per excess kilo", money(result.effectivePerKg)],
        ]
      : [
          [
            "Piece allowance for the party",
            `${result.totalAllowedPieces} pieces, each up to ${result.pieceLimitKg} kg`,
          ],
          ["Pieces you are checking", String(result.checkedPieces)],
          ["Additional pieces", String(result.extraPieces)],
          ["Additional piece fee", money(result.extraPieceFee)],
          ["Cost of additional pieces", money(result.extraPieceCost)],
          ["Overweight pieces", String(result.overweightPieces)],
          ["Overweight fee per piece", money(result.overweightPieceFee)],
          ["Cost of overweight pieces", money(result.overweightCost)],
        ]
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Emirates baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Emirates Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Most of the Emirates network charges excess by the kilogram; routes to and from the
          Americas charge by the piece. Pick the system that matches your ticket and see what the
          extra bags actually cost.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which baggage system is on your ticket?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["weight", "Weight concept (kg allowance)"],
              ["piece", "Piece concept (Americas routes)"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`ek-mode-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm font-semibold ${
                  mode === value
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`ek-mode-${value}`}
                  type="radio"
                  name="ek-mode"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ek-currency">
              Currency of the quoted rates
            </label>
            <select
              id="ek-currency"
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
            <label className={LABEL_CLASS} htmlFor="ek-passengers">
              Passengers on the booking
            </label>
            <input
              id="ek-passengers"
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

          {isWeight ? (
            <>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="ek-brand">
                  Fare brand / cabin
                </label>
                <select
                  id="ek-brand"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={weightBrand}
                  onChange={(event) => setWeightBrand(event.target.value)}
                >
                  {WEIGHT_FARE_BRANDS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {isCustomAllowance && (
                <div>
                  <label className={LABEL_CLASS} htmlFor="ek-custom-allowance">
                    Allowance per passenger (kg)
                  </label>
                  <input
                    id="ek-custom-allowance"
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

              <div>
                <label className={LABEL_CLASS} htmlFor="ek-total">
                  Total checked baggage weight (kg)
                </label>
                <input
                  id="ek-total"
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
                <label className={LABEL_CLASS} htmlFor="ek-heaviest">
                  Heaviest single bag (kg)
                </label>
                <input
                  id="ek-heaviest"
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
                <label className={LABEL_CLASS} htmlFor="ek-airport-rate">
                  Airport rate ({currency} per kg)
                </label>
                <input
                  id="ek-airport-rate"
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
                <label className={LABEL_CLASS} htmlFor="ek-online-rate">
                  Prepaid online rate ({currency} per kg)
                </label>
                <input
                  id="ek-online-rate"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={onlineRate}
                  onChange={(event) => setOnlineRate(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="ek-piece-brand">
                  Cabin and piece allowance
                </label>
                <select
                  id="ek-piece-brand"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={pieceBrand}
                  onChange={(event) => setPieceBrand(event.target.value)}
                >
                  {PIECE_FARE_BRANDS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="ek-pieces">
                  Checked pieces in total
                </label>
                <input
                  id="ek-pieces"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="20"
                  step="1"
                  value={pieces}
                  onChange={(event) => setPieces(event.target.value)}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="ek-ow-pieces">
                  Pieces over the per-bag weight limit
                </label>
                <input
                  id="ek-ow-pieces"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="20"
                  step="1"
                  value={overweightPieces}
                  onChange={(event) => setOverweightPieces(event.target.value)}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="ek-heaviest-piece">
                  Heaviest single bag (kg)
                </label>
                <input
                  id="ek-heaviest-piece"
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
                <label className={LABEL_CLASS} htmlFor="ek-extra-fee">
                  Additional piece fee ({currency})
                </label>
                <input
                  id="ek-extra-fee"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={extraPieceFee}
                  onChange={(event) => setExtraPieceFee(event.target.value)}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="ek-ow-fee">
                  Overweight piece fee ({currency})
                </label>
                <input
                  id="ek-ow-fee"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={overweightFee}
                  onChange={(event) => setOverweightFee(event.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Cabin baggage is separate: {CABIN_ALLOWANCE_ECONOMY_KG} kg for one bag in Economy, up to{" "}
          {CABIN_ALLOWANCE_PREMIUM_KG} kg across two bags in the premium cabins.
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

      <section aria-live="polite" aria-atomic="true" className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok && isWeight
                ? result.cheapestOption === "none"
                  ? "Nothing to pay"
                  : result.cheapestOption === "prepaid"
                    ? "Cheapest: prepay online"
                    : "Cheapest: pay at the airport"
                : "Excess baggage cost"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(headlineCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {!ok
                ? "Fix the inputs above to see a figure."
                : isWeight
                  ? `${kgs(result.chargeableExcessKg)} over a ${kgs(result.totalAllowanceKg)} allowance`
                  : `${result.extraPieces} extra piece(s) and ${result.overweightPieces} overweight piece(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy Emirates excess baggage estimate"
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
          {(ok
            ? rows
            : [
                ["Allowance", DASH],
                ["Chargeable excess", DASH],
                ["Cost", DASH],
              ]
          ).map(([label, value]) => (
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
        <h2 className="text-base font-semibold">Checked allowance by fare brand</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Fare brand
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Weight-concept routes
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Americas routes
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Economy Special", "20 kg", "1 x 23 kg"],
                ["Economy Saver", "25 kg", "2 x 23 kg"],
                ["Economy Flex", "30 kg", "2 x 23 kg"],
                ["Economy Flex Plus", "35 kg", "2 x 23 kg"],
                ["Premium Economy", "40 kg", "2 x 23 kg"],
                ["Business", "40 kg", "2 x 32 kg"],
                ["First", "50 kg", "2 x 32 kg"],
              ].map(([brand, weight, piece]) => (
                <tr key={brand} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{brand}</td>
                  <td className="py-2 pr-3 text-right">{weight}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{piece}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Prepaid online weight is sold in {PREPAID_STEP_KG} kg steps up to {PREPAID_MAX_KG} kg per
          passenger; anything beyond that is settled at the airport.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Excess rates are set by route band and currency and change
        often, and no single piece over {MAX_SINGLE_PIECE_KG} kg is accepted at check-in whatever
        you pay. Confirm the figures on the airline&apos;s own manage-booking page.
      </p>
    </main>
  );
}
