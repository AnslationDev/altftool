"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, CircleCheck, Copy, Luggage, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  AIRLINE,
  CURRENCIES,
  DEFAULTS,
  FARE_OPTIONS,
  MAX_CHECKED_BAGS,
  MAX_SINGLE_PIECE_KG,
  SECOND_CABIN_PIECE,
  checkBaggage,
  describeDimRule,
  getCurrency,
  getFare,
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

const KG = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const CM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";
const DIM_LABELS = ["Length", "Width", "Height"];

const makeBag = (id, bag) => ({ id, weightKg: bag.weightKg, dims: [...bag.dims] });
const startingBags = () => DEFAULTS.bags.map((bag, index) => makeBag(index + 1, bag));

export default function ToolHome() {
  const [fareKey, setFareKey] = useState(DEFAULTS.fareKey);
  const [carryCabinBag, setCarryCabinBag] = useState(DEFAULTS.carryCabinBag);
  const [cabinKg, setCabinKg] = useState(DEFAULTS.cabinKg);
  const [cabinDims, setCabinDims] = useState(DEFAULTS.cabinDims);
  const [carryPersonal, setCarryPersonal] = useState(DEFAULTS.carryPersonal);
  const [personalKg, setPersonalKg] = useState(DEFAULTS.personalKg);
  const [personalDims, setPersonalDims] = useState(DEFAULTS.personalDims);
  const [bags, setBags] = useState(startingBags);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [pieceFee, setPieceFee] = useState(DEFAULTS.pieceFee);
  const [heavyFee, setHeavyFee] = useState(DEFAULTS.heavyFee);
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

  const fare = getFare(fareKey) || FARE_OPTIONS[0];

  const result = useMemo(
    () =>
      checkBaggage({
        fareKey,
        carryCabinBag,
        cabinBagKg: cabinKg,
        cabinDimsCm: cabinDims,
        carryPersonalItem: carryPersonal,
        personalBagKg: personalKg,
        personalDimsCm: personalDims,
        checkedBags: bags.map((bag) => ({ weightKg: bag.weightKg, dimsCm: bag.dims })),
        excessRatePerKg: rate,
        extraPieceFee: pieceFee,
        overweightPieceFee: heavyFee,
      }),
    [
      fareKey,
      carryCabinBag,
      cabinKg,
      cabinDims,
      carryPersonal,
      personalKg,
      personalDims,
      bags,
      rate,
      pieceFee,
      heavyFee,
    ],
  );

  const failed = Boolean(result.error);
  const isPieceFare = !failed && result.checked.type === "piece";
  // A weight fare that also caps the number of bags needs the per-kilo rate AND an
  // extra-bag fee; a pure piece fare needs the two per-bag fees instead.
  const showRateInput = !failed && result.checked.type === "weight";
  const showExtraBagFee = !failed && (isPieceFare || result.checked.maxPieces != null);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [`${AIRLINE.name} baggage check — ${result.fare.label}`];
    if (result.cabin) {
      lines.push(
        `Cabin bag: ${KG.format(result.cabin.weightKg)} kg, ${result.cabin.dimsCm
          .map((d) => CM.format(d))
          .join(" × ")} cm — ${result.cabin.ok ? "within allowance" : "over allowance"}`,
      );
    }
    if (result.personal) {
      lines.push(
        `Personal item: ${KG.format(result.personal.weightKg)} kg — ${
          result.personal.ok ? "within allowance" : "over allowance"
        }`,
      );
    }
    lines.push(
      `Checked: ${result.checked.pieceCount} piece(s), ${KG.format(result.checked.totalKg)} kg against ${result.checked.allowanceText}`,
      `Excess: ${KG.format(result.checked.excessKg)} kg${
        result.checked.extraPieces > 0 ? ` + ${result.checked.extraPieces} extra piece(s)` : ""
      }`,
      `Estimated charge: ${result.checked.estimatedFee === null ? "rate not entered" : money(result.checked.estimatedFee)}`,
      `Verdict: ${result.ok ? "All bags within the published allowance" : result.issues.join(" ")}`,
    );
    return lines.join("\n");
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
    if (
      !window.confirm(
        "Reset the fare, cabin bag, personal item, all checked bags and pricing fields back to their defaults? This can't be undone.",
      )
    ) {
      return;
    }
    setFareKey(DEFAULTS.fareKey);
    setCarryCabinBag(DEFAULTS.carryCabinBag);
    setCabinKg(DEFAULTS.cabinKg);
    setCabinDims(DEFAULTS.cabinDims);
    setCarryPersonal(DEFAULTS.carryPersonal);
    setPersonalKg(DEFAULTS.personalKg);
    setPersonalDims(DEFAULTS.personalDims);
    setBags(startingBags());
    setRate(DEFAULTS.rate);
    setPieceFee(DEFAULTS.pieceFee);
    setHeavyFee(DEFAULTS.heavyFee);
    setCurrency(DEFAULTS.currency);
    setCopied(false);
  };

  const setDim = (setter) => (position, value) =>
    setter((prev) => prev.map((entry, index) => (index === position ? value : entry)));

  const setCabinDim = setDim(setCabinDims);
  const setPersonalDim = setDim(setPersonalDims);

  const addBag = () =>
    setBags((prev) =>
      prev.length >= MAX_CHECKED_BAGS
        ? prev
        : [
            ...prev,
            makeBag(prev.reduce((max, bag) => Math.max(max, bag.id), 0) + 1, DEFAULTS.bags[0]),
          ],
    );

  const removeBag = (id) => setBags((prev) => (prev.length <= 1 ? prev : prev.filter((bag) => bag.id !== id)));

  const updateBag = (id, patch) => setBags((prev) => prev.map((bag) => (bag.id === id ? { ...bag, ...patch } : bag)));

  const updateBagDim = (id, position, value) =>
    setBags((prev) =>
      prev.map((bag) =>
        bag.id === id
          ? { ...bag, dims: bag.dims.map((entry, index) => (index === position ? value : entry)) }
          : bag,
      ),
    );

  // Royal Silk Business and Royal First carry two full-size cabin bags rather than
  // a cabin bag plus a small under-seat item — the "personal item" section below
  // is actually tracking that second cabin bag for those fares.
  const isSecondCabinBag = fare.personal === SECOND_CABIN_PIECE;
  const personalSectionTitle = isSecondCabinBag ? "Second cabin bag" : "Personal item";
  const personalCheckboxLabel = isSecondCabinBag ? "I am carrying a second cabin bag" : "I am carrying one";

  const cabinLimitText = fare.cabin
    ? `${
        fare.cabin.combinedKg != null
          ? `${fare.cabin.pieces} pieces, ${fare.cabin.combinedKg} kg combined`
          : fare.cabin.pieces > 1
            ? `${fare.cabin.pieces} pieces of ${fare.cabin.kg} kg each`
            : `${fare.cabin.kg} kg`
      } and ${describeDimRule(fare.cabin.dimRule)}`
    : "Not included on this fare";
  const personalLimitText = fare.personal
    ? `${fare.personal.kg != null && fare.cabin && fare.cabin.combinedKg == null ? `${fare.personal.kg} kg and ` : ""}${describeDimRule(fare.personal.dimRule)}`
    : "Not included on this fare";
  const checkedRuleText = describeDimRule(fare.checkedDimRule || result.checked?.dimRule || null);

  const breakdown = failed
    ? []
    : [
        ["Fare / route", result.fare.label],
        ...(result.cabin
          ? [
              [
                "Cabin bag",
                `${KG.format(result.cabin.weightKg)} kg${result.cabin.limitKg != null ? ` of ${result.cabin.limitKg} kg` : ""} · ${result.cabin.dimsCm
                  .map((d) => CM.format(d))
                  .join(" × ")} cm`,
              ],
            ]
          : []),
        ...(result.personal
          ? [
              [
                personalSectionTitle,
                `${KG.format(result.personal.weightKg)} kg${result.personal.limitKg != null ? ` of ${result.personal.limitKg} kg` : ""}`,
              ],
            ]
          : []),
        ...(result.combinedCabin.limitKg != null
          ? [
              [
                "Cabin pieces combined",
                `${KG.format(result.combinedCabin.weightKg)} kg of ${result.combinedCabin.limitKg} kg`,
              ],
            ]
          : []),
        ["Free checked allowance", result.checked.allowanceText],
        ["Checked pieces", `${result.checked.pieceCount}`],
        ["Total checked weight", `${KG.format(result.checked.totalKg)} kg`],
        ...(result.checked.extraPieces > 0
          ? [["Bags beyond allowance", `${result.checked.extraPieces}`]]
          : []),
        [
          "Estimated excess charge",
          result.checked.estimatedFee === null ? "Enter a rate below" : money(result.checked.estimatedFee),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Luggage className="h-4 w-4" aria-hidden="true" />
          {AIRLINE.name} ({AIRLINE.code}) baggage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          {AIRLINE.name} Baggage Allowance Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weigh and measure your bags at home, enter the figures here, and see whether each one clears{" "}
          {AIRLINE.name}&apos;s published cabin and check-in limits — plus what the excess would cost.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Your fare</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="bag-fare">
            Cabin, fare or route
          </label>
          <select
            id="bag-fare"
            className={`mt-2 ${INPUT_CLASS}`}
            value={fareKey}
            onChange={(event) => setFareKey(event.target.value)}
          >
            {FARE_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={`mt-4 ${CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Cabin bag</h2>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="carry-cabin">
            <input
              id="carry-cabin"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={carryCabinBag}
              onChange={(event) => setCarryCabinBag(event.target.checked)}
            />
            I am carrying one
          </label>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Limit: {cabinLimitText}.</p>
        {carryCabinBag && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="cabin-kg">
                Weight (kg)
              </label>
              <input
                id="cabin-kg"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={cabinKg}
                onChange={(event) => setCabinKg(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DIM_LABELS.map((label, index) => (
                <div key={label}>
                  <label className={SMALL_LABEL_CLASS} htmlFor={`cabin-dim-${index}`}>
                    {label} (cm)
                  </label>
                  <input
                    id={`cabin-dim-${index}`}
                    className={`mt-2 ${INPUT_CLASS} px-2`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={cabinDims[index]}
                    onChange={(event) => setCabinDim(index, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={`mt-4 ${CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{personalSectionTitle}</h2>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="carry-personal">
            <input
              id="carry-personal"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={carryPersonal}
              onChange={(event) => setCarryPersonal(event.target.checked)}
            />
            {personalCheckboxLabel}
          </label>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {isSecondCabinBag
            ? `This fare includes 2 cabin bags — this is the second one, sized the same as your main cabin bag. Limit: ${personalLimitText}.`
            : `Limit: ${personalLimitText}.`}
        </p>
        {carryPersonal && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="personal-kg">
                Weight (kg)
              </label>
              <input
                id="personal-kg"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={personalKg}
                onChange={(event) => setPersonalKg(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DIM_LABELS.map((label, index) => (
                <div key={label}>
                  <label className={SMALL_LABEL_CLASS} htmlFor={`personal-dim-${index}`}>
                    {label} (cm)
                  </label>
                  <input
                    id={`personal-dim-${index}`}
                    className={`mt-2 ${INPUT_CLASS} px-2`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={personalDims[index]}
                    onChange={(event) => setPersonalDim(index, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={`mt-4 ${CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Checked bags</h2>
          <button
            type="button"
            onClick={addBag}
            disabled={bags.length >= MAX_CHECKED_BAGS}
            className={`${GHOST_BTN} disabled:opacity-50`}
            aria-label="Add another checked bag"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add bag
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Each piece must stay under {MAX_SINGLE_PIECE_KG} kg and {checkedRuleText}.
        </p>

        <div className="mt-4 space-y-4">
          {bags.map((bag, position) => (
            <div key={bag.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Bag {position + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeBag(bag.id)}
                  disabled={bags.length <= 1}
                  aria-label={`Remove checked bag ${position + 1}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL_CLASS} htmlFor={`bag-${bag.id}-kg`}>
                    Weight (kg)
                  </label>
                  <input
                    id={`bag-${bag.id}-kg`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={bag.weightKg}
                    onChange={(event) => updateBag(bag.id, { weightKg: event.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DIM_LABELS.map((label, index) => (
                    <div key={label}>
                      <label className={SMALL_LABEL_CLASS} htmlFor={`bag-${bag.id}-dim-${index}`}>
                        {label} (cm)
                      </label>
                      <input
                        id={`bag-${bag.id}-dim-${index}`}
                        className={`mt-2 ${INPUT_CLASS} px-2`}
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step="1"
                        value={bag.dims[index]}
                        onChange={(event) => updateBagDim(bag.id, index, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`mt-4 ${CARD}`}>
        <h2 className="text-base font-semibold">Excess baggage pricing</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Rates change by route, cabin and how far ahead you buy. Put the figure quoted for your booking here.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="excess-currency">
              Currency
            </label>
            <select
              id="excess-currency"
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
          {showRateInput && (
            <div>
              <label className={LABEL_CLASS} htmlFor="excess-rate">
                Excess rate per kg
              </label>
              <input
                id="excess-rate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </div>
          )}
          {showExtraBagFee && (
            <div>
              <label className={LABEL_CLASS} htmlFor="piece-fee">
                Fee per extra bag
              </label>
              <input
                id="piece-fee"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={pieceFee}
                onChange={(event) => setPieceFee(event.target.value)}
              />
            </div>
          )}
          {isPieceFare && (
            <div>
              <label className={LABEL_CLASS} htmlFor="heavy-fee">
                Fee per overweight bag
              </label>
              <input
                id="heavy-fee"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={heavyFee}
                onChange={(event) => setHeavyFee(event.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      {failed ? (
        <section className={`mt-6 ${CARD}`}>
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
          >
            {result.error}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Excess checked weight
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              "Fare / route",
              "Cabin bag",
              "Free checked allowance",
              "Total checked weight",
              "Estimated excess charge",
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
              <div aria-live="polite" role="status">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Excess checked weight
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${result.checked.excessKg > 0 ? "text-[var(--danger-text)]" : "text-[var(--primary)]"}`}
                >
                  {KG.format(result.checked.excessKg)} kg
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                  {result.ok ? (
                    <>
                      <CircleCheck className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                      <span className="text-[var(--success-text)]">Everything is within the published allowance</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
                      <span className="text-[var(--danger-text)]">
                        {result.issues.length} thing{result.issues.length === 1 ? "" : "s"} to fix before you fly
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label={`Copy ${AIRLINE.name} baggage check result`}
                  className={PRIMARY_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
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

            {!result.ok && (
              <ul className="mt-5 space-y-2 text-sm">
                {result.issues.map((issue) => (
                  <li
                    key={issue}
                    className="rounded-md bg-[var(--danger-soft)] px-3 py-2 font-medium text-[var(--danger-text)]"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`mt-4 ${CARD}`}>
            <h2 className="text-base font-semibold">Bag-by-bag</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Bag
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Weight
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Size
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Size check
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.cabin && (
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3 font-semibold">Cabin bag</td>
                      <td className="py-2 pr-3 text-right">
                        {KG.format(result.cabin.weightKg)} kg
                        {!result.cabin.weightOk && <span className="text-[var(--danger-text)]"> ▲</span>}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {result.cabin.dimsCm.map((d) => CM.format(d)).join(" × ")} cm
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${result.cabin.dimsOk ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}
                      >
                        {result.cabin.dimsOk ? "Fits" : "Too big"}
                      </td>
                    </tr>
                  )}
                  {result.personal && (
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3 font-semibold">{personalSectionTitle}</td>
                      <td className="py-2 pr-3 text-right">
                        {KG.format(result.personal.weightKg)} kg
                        {!result.personal.weightOk && <span className="text-[var(--danger-text)]"> ▲</span>}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {result.personal.dimsCm.map((d) => CM.format(d)).join(" × ")} cm
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${result.personal.dimsOk ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}
                      >
                        {result.personal.dimsOk ? "Fits" : "Too big"}
                      </td>
                    </tr>
                  )}
                  {result.checked.bags.map((bag) => (
                    <tr key={bag.index} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">Checked {bag.index}</td>
                      <td className="py-2 pr-3 text-right">
                        {KG.format(bag.weightKg)} kg
                        {bag.overSinglePieceLimit && <span className="text-[var(--danger-text)]"> ▲</span>}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {bag.dimsCm.map((d) => CM.format(d)).join(" × ")} cm ({CM.format(bag.sumCm)} cm)
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${bag.dimsOk ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}
                      >
                        {bag.dimsOk ? "Fits" : "Oversize"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. {AIRLINE.name} can revise allowances, and codeshare partners, promotional fares, loyalty
        tiers, infants, sports gear and musical instruments follow separate rules — check the allowance printed on
        your own booking before you travel.
      </p>
    </main>
  );
}
