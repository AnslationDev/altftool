"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, CircleCheck, Copy, Luggage, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  AIRLINE,
  CABIN_BAG_KG,
  CABIN_DIMS_CM,
  CHECKED_DIM_RULE,
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_EXCESS_RATE_PER_KG,
  FARE_OPTIONS,
  MAX_CHECKED_BAGS,
  MAX_SINGLE_PIECE_KG,
  PERSONAL_BAG_KG,
  PERSONAL_DIMS_CM,
  checkBaggage,
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

const KG = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const CM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULT_STATE = {
  fareKey: FARE_OPTIONS[0].key,
  cabinKg: "7",
  cabinDims: ["55", "35", "25"],
  carryPersonal: true,
  personalKg: "2",
  personalDims: ["40", "30", "15"],
  rate: String(DEFAULT_EXCESS_RATE_PER_KG),
  pieceFee: "0",
  heavyFee: "0",
  currency: DEFAULT_CURRENCY,
};

const makeBag = (id, weightKg, dims) => ({ id, weightKg, dims });

const DEFAULT_BAGS = [makeBag(1, "15", ["70", "45", "25"])];

export default function ToolHome() {
  const [fareKey, setFareKey] = useState(DEFAULT_STATE.fareKey);
  const [cabinKg, setCabinKg] = useState(DEFAULT_STATE.cabinKg);
  const [cabinDims, setCabinDims] = useState(DEFAULT_STATE.cabinDims);
  const [carryPersonal, setCarryPersonal] = useState(DEFAULT_STATE.carryPersonal);
  const [personalKg, setPersonalKg] = useState(DEFAULT_STATE.personalKg);
  const [personalDims, setPersonalDims] = useState(DEFAULT_STATE.personalDims);
  const [bags, setBags] = useState(DEFAULT_BAGS);
  const [rate, setRate] = useState(DEFAULT_STATE.rate);
  const [pieceFee, setPieceFee] = useState(DEFAULT_STATE.pieceFee);
  const [heavyFee, setHeavyFee] = useState(DEFAULT_STATE.heavyFee);
  const [currency, setCurrency] = useState(DEFAULT_STATE.currency);
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
      checkBaggage({
        fareKey,
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
    [fareKey, cabinKg, cabinDims, carryPersonal, personalKg, personalDims, bags, rate, pieceFee, heavyFee],
  );

  const failed = Boolean(result.error);
  const isPieceFare = !failed && result.checked.type === "piece";

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      `${AIRLINE.name} baggage check — ${result.fare.label}`,
      `Cabin bag: ${KG.format(result.cabin.weightKg)} kg, ${result.cabin.dimsCm.map((d) => CM.format(d)).join(" × ")} cm — ${result.cabin.ok ? "within allowance" : "over allowance"}`,
    ];
    if (result.personal) {
      lines.push(
        `Personal item: ${KG.format(result.personal.weightKg)} kg — ${result.personal.ok ? "within allowance" : "over allowance"}`,
      );
    }
    lines.push(
      `Checked: ${result.checked.pieceCount} piece(s), ${KG.format(result.checked.totalKg)} kg against ${result.checked.allowanceText}`,
      `Excess: ${KG.format(result.checked.excessKg)} kg${result.checked.extraPieces > 0 ? ` + ${result.checked.extraPieces} extra piece(s)` : ""}`,
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
    setFareKey(DEFAULT_STATE.fareKey);
    setCabinKg(DEFAULT_STATE.cabinKg);
    setCabinDims(DEFAULT_STATE.cabinDims);
    setCarryPersonal(DEFAULT_STATE.carryPersonal);
    setPersonalKg(DEFAULT_STATE.personalKg);
    setPersonalDims(DEFAULT_STATE.personalDims);
    setBags(DEFAULT_BAGS);
    setRate(DEFAULT_STATE.rate);
    setPieceFee(DEFAULT_STATE.pieceFee);
    setHeavyFee(DEFAULT_STATE.heavyFee);
    setCurrency(DEFAULT_STATE.currency);
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
        : [...prev, makeBag(prev.reduce((max, bag) => Math.max(max, bag.id), 0) + 1, "15", ["70", "45", "25"])],
    );

  const removeBag = (id) => setBags((prev) => (prev.length <= 1 ? prev : prev.filter((bag) => bag.id !== id)));

  const updateBag = (id, patch) =>
    setBags((prev) => prev.map((bag) => (bag.id === id ? { ...bag, ...patch } : bag)));

  const updateBagDim = (id, position, value) =>
    setBags((prev) =>
      prev.map((bag) =>
        bag.id === id
          ? { ...bag, dims: bag.dims.map((entry, index) => (index === position ? value : entry)) }
          : bag,
      ),
    );

  const dimLabels = ["Length", "Width", "Height"];

  const breakdown = failed
    ? []
    : [
        ["Fare / route", result.fare.label],
        [
          "Cabin bag",
          `${KG.format(result.cabin.weightKg)} kg of ${result.cabin.limitKg} kg · ${result.cabin.dimsCm.map((d) => CM.format(d)).join(" × ")} cm`,
        ],
        ...(result.personal
          ? [["Personal item", `${KG.format(result.personal.weightKg)} kg of ${result.personal.limitKg} kg`]]
          : []),
        ["Free checked allowance", result.checked.allowanceText],
        ["Checked pieces", `${result.checked.pieceCount}`],
        ["Total checked weight", `${KG.format(result.checked.totalKg)} kg`],
        ...(isPieceFare && result.checked.extraPieces > 0
          ? [["Pieces beyond allowance", `${result.checked.extraPieces}`]]
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

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your fare</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="bag-fare">
            Fare / route
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

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cabin bag</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Limit: {CABIN_BAG_KG} kg and {CABIN_DIMS_CM.join(" × ")} cm.
        </p>
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
            {dimLabels.map((label, index) => (
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
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Personal item</h2>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="carry-personal">
            <input
              id="carry-personal"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={carryPersonal}
              onChange={(event) => setCarryPersonal(event.target.checked)}
            />
            I am carrying one
          </label>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Limit: {PERSONAL_BAG_KG} kg and {PERSONAL_DIMS_CM.join(" × ")} cm, carried in addition to the cabin bag.
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
              {dimLabels.map((label, index) => (
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

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
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
          Each piece must stay under {MAX_SINGLE_PIECE_KG} kg and{" "}
          {CHECKED_DIM_RULE.type === "linear"
            ? `${CHECKED_DIM_RULE.maxSumCm} cm of length + width + height`
            : `${CHECKED_DIM_RULE.maxEachCm.join(" × ")} cm`}
          .
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
                  {dimLabels.map((label, index) => (
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

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Excess baggage pricing</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Rates change by route and by how far ahead you buy. Put the figure quoted for your booking here.
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
          {isPieceFare ? (
            <>
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
            </>
          ) : (
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
        </div>
      </section>

      {failed ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Excess checked weight
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {["Fare / route", "Cabin bag", "Free checked allowance", "Total checked weight", "Estimated excess charge"].map(
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
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Excess checked weight
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${result.checked.excessKg > 0 ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}
                >
                  {KG.format(result.checked.excessKg)} kg
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                  {result.ok ? (
                    <>
                      <CircleCheck className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                      <span className="text-[var(--success)]">Everything is within the published allowance</span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
                      <span className="text-[var(--danger)]">
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

            {!result.ok && (
              <ul className="mt-5 space-y-2 text-sm">
                {result.issues.map((issue) => (
                  <li
                    key={issue}
                    className="rounded-md bg-[var(--danger-soft)] px-3 py-2 font-medium text-[var(--danger)]"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
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
                      L + W + H
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Size check
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3 font-semibold">Cabin bag</td>
                    <td className="py-2 pr-3 text-right">
                      {KG.format(result.cabin.weightKg)} kg
                      {!result.cabin.weightOk && <span className="text-[var(--danger)]"> ▲</span>}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {result.cabin.dimsCm.map((d) => CM.format(d)).join(" × ")} cm
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${result.cabin.dimsOk ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                    >
                      {result.cabin.dimsOk ? "Fits" : "Too big"}
                    </td>
                  </tr>
                  {result.personal && (
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3 font-semibold">Personal item</td>
                      <td className="py-2 pr-3 text-right">
                        {KG.format(result.personal.weightKg)} kg
                        {!result.personal.weightOk && <span className="text-[var(--danger)]"> ▲</span>}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {result.personal.dimsCm.map((d) => CM.format(d)).join(" × ")} cm
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${result.personal.dimsOk ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
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
                        {bag.overSinglePieceLimit && <span className="text-[var(--danger)]"> ▲</span>}
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {CM.format(bag.sumCm)} cm
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${bag.dimsOk ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
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
        Informational only. {AIRLINE.name} can revise allowances, and codeshare partners, promotional fares,
        infants, sports gear and musical instruments follow separate rules — check the allowance printed on your
        own booking before you travel.
      </p>
    </main>
  );
}
