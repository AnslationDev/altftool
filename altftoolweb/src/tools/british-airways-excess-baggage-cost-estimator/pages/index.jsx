"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, CircleCheck, Copy, Luggage, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  AIRLINE,
  CABIN_OPTIONS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_FEES,
  MAX_BAGS,
  MAX_PASSENGERS,
  MAX_PIECE_DIMS_CM,
  MAX_SINGLE_PIECE_KG,
  estimateBaggageCost,
  getCurrency,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const KG = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  cabinKey: CABIN_OPTIONS[0].key,
  passengers: "1",
  bags: [{ weightKg: "23" }, { weightKg: "20" }],
  oversize: "0",
  currency: DEFAULT_CURRENCY,
  fees: { ...DEFAULT_FEES },
};

const FEE_FIELDS = [
  ["extraBagOnline", "Extra bag — prepaid"],
  ["extraBagAirport", "Extra bag — at the airport"],
  ["heavyBagOnline", "Heavy bag — prepaid"],
  ["heavyBagAirport", "Heavy bag — at the airport"],
  ["oversizeOnline", "Oversize bag — prepaid"],
  ["oversizeAirport", "Oversize bag — at the airport"],
];

const startingBags = () => DEFAULTS.bags.map((bag, index) => ({ id: index + 1, weightKg: bag.weightKg }));

export default function ToolHome() {
  const [cabinKey, setCabinKey] = useState(DEFAULTS.cabinKey);
  const [passengers, setPassengers] = useState(DEFAULTS.passengers);
  const [bags, setBags] = useState(startingBags);
  const [oversize, setOversize] = useState(DEFAULTS.oversize);
  const [fees, setFees] = useState(DEFAULTS.fees);
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

  const result = useMemo(
    () =>
      estimateBaggageCost({
        cabinKey,
        passengers: Number(passengers),
        bagWeightsKg: bags.map((bag) => bag.weightKg),
        oversizeBags: Number(oversize),
        fees,
      }),
    [cabinKey, passengers, bags, oversize, fees],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `${AIRLINE.name} baggage cost — ${result.cabin.label}`,
      `${result.passengers} passenger(s), ${result.bagCount} checked bag(s), ${KG.format(result.totalKg)} kg total`,
      `Included: ${result.includedPieces} piece(s). Chargeable: ${result.extraBags} extra, ${result.heavyBags} heavy, ${result.oversizeBags} oversize`,
      `Prepaid in Manage My Booking: ${money(result.channels[0].total)}`,
      `Paid at the airport: ${money(result.airportCost)}`,
      `Cheapest: ${result.cheapestLabel} at ${money(result.cheapestCost)}, saving ${money(result.savingVsAirport)}`,
      result.canRepackAway
        ? `Evening out the weight across your bags would save a further ${money(result.repackSaving)}.`
        : "",
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
    setCabinKey(DEFAULTS.cabinKey);
    setPassengers(DEFAULTS.passengers);
    setBags(startingBags());
    setOversize(DEFAULTS.oversize);
    setFees({ ...DEFAULT_FEES });
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  const addBag = () =>
    setBags((prev) =>
      prev.length >= MAX_BAGS
        ? prev
        : [...prev, { id: prev.reduce((max, bag) => Math.max(max, bag.id), 0) + 1, weightKg: "23" }],
    );

  const removeBag = (id) => setBags((prev) => (prev.length <= 1 ? prev : prev.filter((bag) => bag.id !== id)));

  const updateBag = (id, value) =>
    setBags((prev) => prev.map((bag) => (bag.id === id ? { ...bag, weightKg: value } : bag)));

  const updateFee = (key, value) => setFees((prev) => ({ ...prev, [key]: value }));

  const breakdown = failed
    ? []
    : [
        ["Cabin / fare", result.cabin.label],
        ["Checked pieces included", `${result.includedPieces} for ${result.passengers} passenger(s)`],
        ["Bags you are checking", `${result.bagCount}, ${KG.format(result.totalKg)} kg in total`],
        ["Extra bags charged", `${result.extraBags}`],
        ["Heavy bags charged", `${result.heavyBags} over ${result.cabin.perPieceKg} kg`],
        ["Oversize bags charged", `${result.oversizeBags}`],
        ["Prepaid in Manage My Booking", money(result.channels[0].total)],
        ["Paid at the airport", money(result.airportCost)],
        ["Saving by prepaying", `${money(result.savingVsAirport)} (${result.savingPct}%)`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          {AIRLINE.name} ({AIRLINE.code}) baggage charges
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          British Airways Excess Baggage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          British Airways charges per bag, not per kilo. Enter what you are checking and see the extra-bag, heavy-bag
          and oversize charges priced both ways — prepaid before you travel and paid at the airport desk.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Your booking</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cabin">
              Cabin or fare
            </label>
            <select
              id="cabin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cabinKey}
              onChange={(event) => setCabinKey(event.target.value)}
            >
              {CABIN_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
            <label className={LABEL_CLASS} htmlFor="oversize">
              Bags outside {MAX_PIECE_DIMS_CM.join(" × ")} cm
            </label>
            <input
              id="oversize"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={oversize}
              onChange={(event) => setOversize(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={`mt-4 ${CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Checked bags</h2>
          <button
            type="button"
            onClick={addBag}
            disabled={bags.length >= MAX_BAGS}
            className={`${GHOST_BTN} disabled:opacity-50`}
            aria-label="Add another checked bag"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add bag
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Weigh each bag separately — the charge is per bag, and nothing over {MAX_SINGLE_PIECE_KG} kg is accepted.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {bags.map((bag, position) => (
            <div key={bag.id} className="flex items-end gap-2">
              <div className="flex-1">
                <label className={SMALL_LABEL_CLASS} htmlFor={`bag-${bag.id}`}>
                  Bag {position + 1} weight (kg)
                </label>
                <input
                  id={`bag-${bag.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={bag.weightKg}
                  onChange={(event) => updateBag(bag.id, event.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeBag(bag.id)}
                disabled={bags.length <= 1}
                aria-label={`Remove bag ${position + 1}`}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`mt-4 ${CARD}`}>
        <h2 className="text-base font-semibold">Charges on your route</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          British Airways sets these by route band and revises them, so the figures below are round placeholders.
          Replace them with the amounts your own booking quotes.
        </p>
        <div className="mt-3">
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FEE_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className={SMALL_LABEL_CLASS} htmlFor={`fee-${key}`}>
                {label}
              </label>
              <input
                id={`fee-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={fees[key]}
                onChange={(event) => updateFee(key, event.target.value)}
              />
            </div>
          ))}
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
            {[
              "Cabin / fare",
              "Checked pieces included",
              "Extra bags charged",
              "Heavy bags charged",
              "Paid at the airport",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{DASH}</dd>
              </div>
            ))}
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
                  className={`mt-1 text-4xl font-semibold ${result.cheapestCost > 0 ? "text-[var(--foreground)]" : "text-[var(--primary)]"}`}
                >
                  {money(result.cheapestCost)}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                  {result.chargeableItems === 0 ? (
                    <>
                      <CircleCheck className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                      <span className="text-[var(--success)]">Everything is inside the free piece allowance</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                      <span>
                        {result.cheapestLabel} · {result.chargeableItems} chargeable item
                        {result.chargeableItems === 1 ? "" : "s"}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy British Airways baggage cost estimate"
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
                      result.refusedBags > 0 && note.includes(`${MAX_SINGLE_PIECE_KG} kg`)
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
            <h2 className="text-base font-semibold">Prepaid against airport</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      When you pay
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Extra bags
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Heavy bags
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Oversize
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.channels.map((channel) => (
                    <tr key={channel.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">
                        {channel.label}
                        {channel.id === result.cheapestId && result.chargeableItems > 0 && (
                          <span className="ml-2 text-xs font-semibold text-[var(--success)]">cheapest</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-right">{money(channel.extraBagCost)}</td>
                      <td className="py-2 pr-3 text-right">{money(channel.heavyBagCost)}</td>
                      <td className="py-2 pr-3 text-right">{money(channel.oversizeCost)}</td>
                      <td className="py-2 text-right font-semibold">{money(channel.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. British Airways sets baggage charges by route band and revises them, and Executive Club
        tiers, oneworld status, codeshare sectors, sports equipment and outsize items follow separate rules — check
        the amounts quoted on your own booking before you travel.
      </p>
    </main>
  );
}
