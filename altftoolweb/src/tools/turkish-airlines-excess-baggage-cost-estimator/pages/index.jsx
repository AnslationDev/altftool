"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Luggage, RotateCcw } from "lucide-react";

import {
  CABIN_ALLOWANCE_BUSINESS_KG,
  CABIN_ALLOWANCE_BUSINESS_PIECES,
  CABIN_ALLOWANCE_ECONOMY_KG,
  CABIN_MAX_DIMENSIONS_CM,
  CURRENCIES,
  DEFAULT_AIRPORT_RATE_PER_KG,
  DEFAULT_EXTRA_PIECE_FEE,
  DEFAULT_ONLINE_DISCOUNT_PCT,
  DEFAULT_OVERWEIGHT_PIECE_FEE,
  MAX_SINGLE_PIECE_KG,
  PIECE_ALLOWANCES,
  REGIONS,
  WEIGHT_ALLOWANCES,
  estimatePieceConcept,
  estimateWeightConcept,
  routeBaggageSystem,
} from "../lib";

const NUM = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const DASH = "—";
const kgs = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} kg`;
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  currency: "TRY",
  originRegion: "turkey",
  destinationRegion: "europe",
  weightAllowance: "30",
  customAllowance: "30",
  bonusAllowance: "0",
  pieceAllowance: "eco-2",
  passengers: "2",
  totalWeight: "67",
  heaviest: "26",
  pieces: "5",
  overweightPieces: "0",
  airportRate: String(DEFAULT_AIRPORT_RATE_PER_KG),
  discount: String(DEFAULT_ONLINE_DISCOUNT_PCT),
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
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [originRegion, setOriginRegion] = useState(DEFAULTS.originRegion);
  const [destinationRegion, setDestinationRegion] = useState(DEFAULTS.destinationRegion);
  const [weightAllowance, setWeightAllowance] = useState(DEFAULTS.weightAllowance);
  const [customAllowance, setCustomAllowance] = useState(DEFAULTS.customAllowance);
  const [bonusAllowance, setBonusAllowance] = useState(DEFAULTS.bonusAllowance);
  const [pieceAllowance, setPieceAllowance] = useState(DEFAULTS.pieceAllowance);
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [totalWeight, setTotalWeight] = useState(DEFAULTS.totalWeight);
  const [heaviest, setHeaviest] = useState(DEFAULTS.heaviest);
  const [pieces, setPieces] = useState(DEFAULTS.pieces);
  const [overweightPieces, setOverweightPieces] = useState(DEFAULTS.overweightPieces);
  const [airportRate, setAirportRate] = useState(DEFAULTS.airportRate);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [extraPieceFee, setExtraPieceFee] = useState(DEFAULTS.extraPieceFee);
  const [overweightFee, setOverweightFee] = useState(DEFAULTS.overweightFee);
  const [copied, setCopied] = useState(false);

  const route = useMemo(
    () => routeBaggageSystem({ originRegion, destinationRegion }),
    [originRegion, destinationRegion],
  );
  const isWeight = route.system === "weight";
  const isCustomAllowance = weightAllowance === "custom";

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
      const preset = WEIGHT_ALLOWANCES.find((item) => item.value === weightAllowance);
      const allowanceKg = isCustomAllowance ? toNumber(customAllowance) : (preset?.kg ?? NaN);
      return estimateWeightConcept({
        totalCheckedKg: toNumber(totalWeight),
        allowanceKg,
        bonusAllowanceKg: toNumber(bonusAllowance),
        passengers: toNumber(passengers),
        heaviestBagKg: toNumber(heaviest),
        airportRatePerKg: toNumber(airportRate),
        onlineDiscountPct: toNumber(discount),
      });
    }
    const preset = PIECE_ALLOWANCES.find((item) => item.value === pieceAllowance) ?? PIECE_ALLOWANCES[1];
    return estimatePieceConcept({
      checkedPieces: toNumber(pieces),
      allowedPieces: preset.pieces,
      pieceLimitKg: preset.pieceKg,
      overweightPieces: toNumber(overweightPieces),
      heaviestBagKg: toNumber(heaviest),
      passengers: toNumber(passengers),
      extraPieceFee: toNumber(extraPieceFee),
      overweightPieceFee: toNumber(overweightFee),
    });
  }, [
    isWeight,
    weightAllowance,
    isCustomAllowance,
    customAllowance,
    bonusAllowance,
    totalWeight,
    passengers,
    heaviest,
    airportRate,
    discount,
    pieceAllowance,
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
        "Turkish Airlines Excess Baggage Cost Estimator — weight concept",
        `Allowance: ${result.perPassengerAllowanceKg} kg x ${result.passengers} passenger(s) = ${result.totalAllowanceKg} kg pooled`,
        `Checked in: ${result.totalCheckedKg} kg`,
        `Chargeable excess: ${result.chargeableExcessKg} kg`,
        `At the airport: ${money(result.airportCost)} (${money(result.airportRatePerKg)} per kg)`,
        `Bought before departure: ${money(result.onlineCost)} (${money(result.onlineRatePerKg)} per kg, ${result.onlineDiscountPct}% off)`,
        result.cheapestOption === "none"
          ? "No excess baggage charge applies."
          : `Cheaper: ${result.cheapestOption === "online" ? "buy before you fly" : "pay at the airport"} — ${money(result.cheapestCost)}`,
      ].join("\n");
    }
    return [
      "Turkish Airlines Excess Baggage Cost Estimator — piece concept",
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
    setCurrency(DEFAULTS.currency);
    setOriginRegion(DEFAULTS.originRegion);
    setDestinationRegion(DEFAULTS.destinationRegion);
    setWeightAllowance(DEFAULTS.weightAllowance);
    setCustomAllowance(DEFAULTS.customAllowance);
    setBonusAllowance(DEFAULTS.bonusAllowance);
    setPieceAllowance(DEFAULTS.pieceAllowance);
    setPassengers(DEFAULTS.passengers);
    setTotalWeight(DEFAULTS.totalWeight);
    setHeaviest(DEFAULTS.heaviest);
    setPieces(DEFAULTS.pieces);
    setOverweightPieces(DEFAULTS.overweightPieces);
    setAirportRate(DEFAULTS.airportRate);
    setDiscount(DEFAULTS.discount);
    setExtraPieceFee(DEFAULTS.extraPieceFee);
    setOverweightFee(DEFAULTS.overweightFee);
    setCopied(false);
  };

  const rows = !ok
    ? [
        ["Allowance for the party", DASH],
        ["Chargeable excess", DASH],
        ["Pay at the airport", DASH],
        ["Buy before you fly", DASH],
      ]
    : isWeight
      ? [
          [
            "Pooled allowance for the party",
            `${kgs(result.perPassengerAllowanceKg)} x ${result.passengers} = ${kgs(result.totalAllowanceKg)}`,
          ],
          ["Weight you are checking in", kgs(result.totalCheckedKg)],
          [
            "Chargeable excess (rounded up)",
            `${kgs(result.chargeableExcessKg)} (actual ${kgs(result.rawExcessKg)})`,
          ],
          ["Airport rate per kilo", money(result.airportRatePerKg)],
          [
            "Advance-purchase rate per kilo",
            `${money(result.onlineRatePerKg)} (${pct(result.onlineDiscountPct)} off)`,
          ],
          ["Pay at the airport desk", money(result.airportCost)],
          ["Buy before you fly", money(result.onlineCost)],
          ["Saving by buying early", `${money(result.saving)} (${pct(result.savingPct)})`],
        ]
      : [
          [
            "Piece allowance for the party",
            `${result.totalAllowedPieces} pieces, each up to ${result.pieceLimitKg} kg`,
          ],
          ["Pieces you are checking", String(result.checkedPieces)],
          ["Additional pieces", String(result.extraPieces)],
          ["Fee per additional piece", money(result.extraPieceFee)],
          ["Cost of additional pieces", money(result.extraPieceCost)],
          ["Overweight pieces", String(result.overweightPieces)],
          ["Fee per overweight piece", money(result.overweightPieceFee)],
          ["Cost of overweight pieces", money(result.overweightCost)],
        ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          Turkish Airlines baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Turkish Airlines Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          On Turkish Airlines the route decides the system, not the cabin. Pick both ends of your
          journey and the estimator switches between kilogram pricing and the Americas piece rules,
          pools the allowance across the booking and applies the advance-purchase discount.
        </p>
      </header>

      <section className={CARD} aria-labelledby="tk-route">
        <h2 id="tk-route" className="text-base font-semibold">
          Your journey
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tk-origin">
              Where the journey starts
            </label>
            <select
              id="tk-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={originRegion}
              onChange={(event) => setOriginRegion(event.target.value)}
            >
              {REGIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tk-destination">
              Where the journey ends
            </label>
            <select
              id="tk-destination"
              className={`mt-2 ${INPUT_CLASS}`}
              value={destinationRegion}
              onChange={(event) => setDestinationRegion(event.target.value)}
            >
              {REGIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tk-currency">
              Currency of the quoted rates
            </label>
            <select
              id="tk-currency"
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
            <label className={LABEL_CLASS} htmlFor="tk-passengers">
              Passengers on the booking
            </label>
            <input
              id="tk-passengers"
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
        </div>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-5 text-[var(--foreground)]">
          <span className="font-semibold">
            {isWeight ? "Weight concept applies." : "Piece concept applies."}
          </span>{" "}
          {route.reason}
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="tk-bags">
        <h2 id="tk-bags" className="text-base font-semibold">
          Your baggage and rates
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {isWeight ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="tk-allowance">
                  Allowance printed on the ticket
                </label>
                <select
                  id="tk-allowance"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={weightAllowance}
                  onChange={(event) => setWeightAllowance(event.target.value)}
                >
                  {WEIGHT_ALLOWANCES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {isCustomAllowance ? (
                <div>
                  <label className={LABEL_CLASS} htmlFor="tk-custom-allowance">
                    Allowance per passenger (kg)
                  </label>
                  <input
                    id="tk-custom-allowance"
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
              ) : null}

              <div>
                <label className={LABEL_CLASS} htmlFor="tk-bonus">
                  Extra allowance from frequent-flyer status (kg)
                </label>
                <input
                  id="tk-bonus"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="60"
                  step="5"
                  value={bonusAllowance}
                  onChange={(event) => setBonusAllowance(event.target.value)}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="tk-total">
                  Total checked baggage weight (kg)
                </label>
                <input
                  id="tk-total"
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
                <label className={LABEL_CLASS} htmlFor="tk-heaviest">
                  Heaviest single bag (kg)
                </label>
                <input
                  id="tk-heaviest"
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
                <label className={LABEL_CLASS} htmlFor="tk-airport-rate">
                  Airport rate ({currency} per kg)
                </label>
                <input
                  id="tk-airport-rate"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={airportRate}
                  onChange={(event) => setAirportRate(event.target.value)}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="tk-discount">
                  Advance-purchase discount (%)
                </label>
                <input
                  id="tk-discount"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="1"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="tk-piece-allowance">
                  Piece allowance on the ticket
                </label>
                <select
                  id="tk-piece-allowance"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={pieceAllowance}
                  onChange={(event) => setPieceAllowance(event.target.value)}
                >
                  {PIECE_ALLOWANCES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="tk-pieces">
                  Checked pieces in total
                </label>
                <input
                  id="tk-pieces"
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
                <label className={LABEL_CLASS} htmlFor="tk-ow-pieces">
                  Pieces over the per-bag weight limit
                </label>
                <input
                  id="tk-ow-pieces"
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
                <label className={LABEL_CLASS} htmlFor="tk-heaviest-piece">
                  Heaviest single bag (kg)
                </label>
                <input
                  id="tk-heaviest-piece"
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
                <label className={LABEL_CLASS} htmlFor="tk-extra-fee">
                  Fee per additional piece ({currency})
                </label>
                <input
                  id="tk-extra-fee"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="100"
                  value={extraPieceFee}
                  onChange={(event) => setExtraPieceFee(event.target.value)}
                />
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="tk-ow-fee">
                  Fee per overweight piece ({currency})
                </label>
                <input
                  id="tk-ow-fee"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="100"
                  value={overweightFee}
                  onChange={(event) => setOverweightFee(event.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Cabin baggage is separate: one piece up to {CABIN_ALLOWANCE_ECONOMY_KG} kg in Economy and{" "}
          {CABIN_ALLOWANCE_BUSINESS_PIECES} pieces of up to {CABIN_ALLOWANCE_BUSINESS_KG} kg each in
          Business, none larger than {CABIN_MAX_DIMENSIONS_CM} cm.
        </p>
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
              {ok && isWeight
                ? result.cheapestOption === "none"
                  ? "Nothing to pay"
                  : result.cheapestOption === "online"
                    ? "Cheapest: buy before you fly"
                    : "Cheapest: pay at the airport"
                : "Excess baggage cost"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(headlineCost) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {!ok
                ? "Fix the input above to see a figure."
                : isWeight
                  ? `${kgs(result.chargeableExcessKg)} over a ${kgs(result.totalAllowanceKg)} pooled allowance`
                  : `${result.extraPieces} extra piece(s) and ${result.overweightPieces} overweight piece(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Turkish Airlines excess baggage estimate"
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

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">How the two systems differ</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Question
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Weight concept
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Piece concept
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Where it applies", "All routes with no Americas endpoint", "Any journey touching the Americas"],
                ["What the ticket grants", "A total in kilograms", "A count of bags with a weight ceiling"],
                ["How excess is billed", "Per kilogram above the allowance", "Flat fee per extra or overweight bag"],
                ["Number of bags", "Unlimited within the weight", "Fixed — extra bags cost a flat fee"],
                ["Pooling on one booking", "Yes, allowances add together", "Yes, piece counts add together"],
                ["Per-piece ceiling", `${MAX_SINGLE_PIECE_KG} kg`, "23 kg or 32 kg by cabin"],
              ].map(([question, weight, piece]) => (
                <tr key={question} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-semibold">{question}</td>
                  <td className="py-2 pr-3">{weight}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{piece}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Excess rates are set by route band and currency of sale and
        change without notice, and no single piece over {MAX_SINGLE_PIECE_KG} kg is accepted at
        check-in whatever you pay. Confirm every figure on the airline&apos;s own manage-booking
        page before you travel.
      </p>
    </main>
  );
}
