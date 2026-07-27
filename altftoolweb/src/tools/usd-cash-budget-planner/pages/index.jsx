"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wallet } from "lucide-react";

import {
  CARD_TYPES,
  CURRENCY,
  DEFAULT_INR_PER_USD,
  LRS_TCS_THRESHOLD_INR,
  RBI_CASH_NOTES_LIMIT_USD,
  planCashBudget,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const FOREIGN = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
// Effective rates span 86 rupees per dollar to 0.0053 per rupiah, so format by
// significant digits rather than by a fixed number of decimal places.
const RATE = new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 4 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const local = (value) =>
  Number.isFinite(value) ? `${CURRENCY.symbol}${FOREIGN.format(value)}` : DASH;
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);

const DEFAULTS = {
  tripDays: "10",
  travellers: "2",
  styleId: CURRENCY.spendStyles[1].id,
  dailySpendPerPerson: String(CURRENCY.spendStyles[1].perDay),
  oneOffCash: String(CURRENCY.defaultOneOffCash),
  cashSharePct: String(CURRENCY.defaultCashSharePct),
  bufferPct: "15",
  inrPerUnit: String(CURRENCY.defaultInrPerUnit),
  inrPerUsd: String(DEFAULT_INR_PER_USD),
  cashRateMarkupPct: String(CURRENCY.defaultCashMarkupPct),
  cardMarkupPct: "3",
  cardTypeId: "credit",
  atmWithdrawalSize: String(CURRENCY.defaultAtmWithdrawal),
  atmFeeInr: "200",
  lrsAlreadyUsedInr: "0",
};

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TH_RIGHT = "py-2 pr-3 text-right text-xs font-semibold tracking-wide uppercase";
const TH_LEFT = "py-2 pr-3 text-left text-xs font-semibold tracking-wide uppercase";

const toNumber = (raw) => (String(raw).trim() === "" ? NaN : Number(raw));
const toInt = (raw) => (String(raw).trim() === "" ? NaN : Math.trunc(Number(raw)));

export default function ToolHome() {
  const [tripDays, setTripDays] = useState(DEFAULTS.tripDays);
  const [travellers, setTravellers] = useState(DEFAULTS.travellers);
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [dailySpendPerPerson, setDailySpendPerPerson] = useState(DEFAULTS.dailySpendPerPerson);
  const [oneOffCash, setOneOffCash] = useState(DEFAULTS.oneOffCash);
  const [cashSharePct, setCashSharePct] = useState(DEFAULTS.cashSharePct);
  const [bufferPct, setBufferPct] = useState(DEFAULTS.bufferPct);
  const [inrPerUnit, setInrPerUnit] = useState(DEFAULTS.inrPerUnit);
  const [inrPerUsd, setInrPerUsd] = useState(DEFAULTS.inrPerUsd);
  const [cashRateMarkupPct, setCashRateMarkupPct] = useState(DEFAULTS.cashRateMarkupPct);
  const [cardMarkupPct, setCardMarkupPct] = useState(DEFAULTS.cardMarkupPct);
  const [cardTypeId, setCardTypeId] = useState(DEFAULTS.cardTypeId);
  const [atmWithdrawalSize, setAtmWithdrawalSize] = useState(DEFAULTS.atmWithdrawalSize);
  const [atmFeeInr, setAtmFeeInr] = useState(DEFAULTS.atmFeeInr);
  const [lrsAlreadyUsedInr, setLrsAlreadyUsedInr] = useState(DEFAULTS.lrsAlreadyUsedInr);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planCashBudget({
        tripDays: toInt(tripDays),
        travellers: toInt(travellers),
        dailySpendPerPerson: toNumber(dailySpendPerPerson),
        oneOffCash: String(oneOffCash).trim() === "" ? 0 : Number(oneOffCash),
        cashSharePct: toNumber(cashSharePct),
        bufferPct: toNumber(bufferPct),
        inrPerUnit: toNumber(inrPerUnit),
        inrPerUsd: toNumber(inrPerUsd),
        cashRateMarkupPct: toNumber(cashRateMarkupPct),
        cardMarkupPct: toNumber(cardMarkupPct),
        cardTypeId,
        atmWithdrawalSize: toNumber(atmWithdrawalSize),
        atmFeeInr: toNumber(atmFeeInr),
        lrsAlreadyUsedInr: String(lrsAlreadyUsedInr).trim() === "" ? 0 : Number(lrsAlreadyUsedInr),
      }),
    [
      tripDays,
      travellers,
      dailySpendPerPerson,
      oneOffCash,
      cashSharePct,
      bufferPct,
      inrPerUnit,
      inrPerUsd,
      cashRateMarkupPct,
      cardMarkupPct,
      cardTypeId,
      atmWithdrawalSize,
      atmFeeInr,
      lrsAlreadyUsedInr,
    ],
  );

  const hasError = Boolean(plan.error);
  const activeCard = CARD_TYPES.find((entry) => entry.id === cardTypeId);

  const applyStyle = (style) => {
    setStyleId(style.id);
    setDailySpendPerPerson(String(style.perDay));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${CURRENCY.code} cash budget for ${plan.tripDays} days, ${plan.travellers} traveller(s) in ${CURRENCY.country}`,
      `Carry in notes: ${CURRENCY.symbol}${FOREIGN.format(plan.cashToCarry)} (${INR.format(plan.cashAllInInr)} all-in)`,
      `Put on the card: ${CURRENCY.symbol}${FOREIGN.format(plan.cardSpend)} (${INR.format(plan.cardAllInInr)} all-in)`,
      `Cash per person per day: ${CURRENCY.symbol}${FOREIGN.format(plan.cashPerPersonPerDay)}`,
      `Total trip cost of the money itself: ${INR.format(plan.tripAllInInr)}`,
      `Paid above the mid-market rate: ${INR.format(plan.costOverMidMarketInr)}`,
      `Effective rate on cash: Rs ${RATE.format(plan.cashEffectiveRate)} per ${CURRENCY.code}`,
      `Effective rate on card: Rs ${RATE.format(plan.cardEffectiveRate)} per ${CURRENCY.code}`,
      `Notes: ${plan.notes.map((row) => `${row.count} x ${CURRENCY.symbol}${FOREIGN.format(row.note)}`).join(", ")}`,
      plan.tcs.tcsInr > 0 ? `TCS collected: ${INR.format(plan.tcs.tcsInr)} (creditable against income tax)` : null,
      ...plan.warnings.map((line) => `Note: ${line}`),
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, plan]);

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
    setTripDays(DEFAULTS.tripDays);
    setTravellers(DEFAULTS.travellers);
    setStyleId(DEFAULTS.styleId);
    setDailySpendPerPerson(DEFAULTS.dailySpendPerPerson);
    setOneOffCash(DEFAULTS.oneOffCash);
    setCashSharePct(DEFAULTS.cashSharePct);
    setBufferPct(DEFAULTS.bufferPct);
    setInrPerUnit(DEFAULTS.inrPerUnit);
    setInrPerUsd(DEFAULTS.inrPerUsd);
    setCashRateMarkupPct(DEFAULTS.cashRateMarkupPct);
    setCardMarkupPct(DEFAULTS.cardMarkupPct);
    setCardTypeId(DEFAULTS.cardTypeId);
    setAtmWithdrawalSize(DEFAULTS.atmWithdrawalSize);
    setAtmFeeInr(DEFAULTS.atmFeeInr);
    setLrsAlreadyUsedInr(DEFAULTS.lrsAlreadyUsedInr);
    setCopied(false);
  };

  const splitRows = [
    ["On-ground spend budgeted", hasError ? DASH : local(plan.groundSpend)],
    ["Of that, spent in cash", hasError ? DASH : local(plan.cashFromDaily)],
    ["One-off cash costs", hasError ? DASH : local(plan.oneOffCash)],
    ["Emergency buffer", hasError ? DASH : local(plan.bufferAmount)],
    ["Rounded up to carry", hasError ? DASH : local(plan.cashToCarry)],
    ["Left for the card", hasError ? DASH : local(plan.cardSpend)],
    ["Cash per person per day", hasError ? DASH : local(plan.cashPerPersonPerDay)],
    ["Share of the budget in notes", hasError ? DASH : pct(plan.actualCashSharePct)],
  ];

  const costRows = [
    ["Notes at the mid-market rate", hasError ? DASH : money(plan.cashMidInr)],
    ["Money changer's markup", hasError ? DASH : money(plan.cashMarkupInr)],
    ["GST on the currency purchase", hasError ? DASH : money(plan.cashGstInr)],
    ["Cash, all in", hasError ? DASH : money(plan.cashAllInInr)],
    ["Card spend at the mid-market rate", hasError ? DASH : money(plan.cardMidInr)],
    ["Card foreign-currency markup", hasError ? DASH : money(plan.cardMarkupInr)],
    ["GST on the card markup", hasError ? DASH : money(plan.cardMarkupGstInr)],
    ["Card, all in", hasError ? DASH : money(plan.cardAllInInr)],
    ["Paid above the mid-market rate", hasError ? DASH : money(plan.costOverMidMarketInr)],
    ["Same buffer, but every unit carried as notes", hasError ? DASH : money(plan.allCashInr)],
    ["Same buffer, but everything possible on the card", hasError ? DASH : money(plan.allCardInr)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wallet className="h-4 w-4" aria-hidden="true" />
          {CURRENCY.code} · {CURRENCY.country}
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">USD Cash Budget Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Works out how many dollars to actually carry in notes for a trip to the United States, what those notes cost once the changer&rsquo;s markup and GST are added, and what the same spend would cost on a card.</p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The trip</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cash-days">
              Trip length (days)
            </label>
            <input
              id="cash-days"
              className={INPUT_CLASS}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={tripDays}
              onChange={(event) => setTripDays(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-travellers">
              Travellers
            </label>
            <input
              id="cash-travellers"
              className={INPUT_CLASS}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={travellers}
              onChange={(event) => setTravellers(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cash-daily">
              On-ground spend per person per day ({CURRENCY.code})
            </label>
            <input
              id="cash-daily"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={dailySpendPerPerson}
              onChange={(event) => setDailySpendPerPerson(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Food, local transport, entry tickets and incidentals. Leave out flights and anything
              you have already paid for from India.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CURRENCY.spendStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={style.id === styleId ? CHIP_ON : CHIP_BTN}
                  aria-pressed={style.id === styleId}
                  onClick={() => applyStyle(style)}
                >
                  {style.label} · {CURRENCY.symbol}
                  {FOREIGN.format(style.perDay)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-oneoff">
              One-off costs that must be cash ({CURRENCY.code})
            </label>
            <input
              id="cash-oneoff"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={oneOffCash}
              onChange={(event) => setOneOffCash(event.target.value)}
            />
            <p className={HINT_CLASS}>Tips you will hand over in notes, a shuttle or diner that takes cash only, or a deposit easier settled in cash.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-share">
              Share of daily spend that will be cash (%)
            </label>
            <input
              id="cash-share"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={cashSharePct}
              onChange={(event) => setCashSharePct(event.target.value)}
            />
            <p className={HINT_CLASS}>The United States runs largely on cards. Around 15% covers tipping and the occasional cash-only counter.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-buffer">
              Emergency buffer on the cash (%)
            </label>
            <input
              id="cash-buffer"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={bufferPct}
              onChange={(event) => setBufferPct(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Covers a deposit, a taxi when a card is declined, or a day the ATMs are down.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-cardtype">
              Card you will use
            </label>
            <select
              id="cash-cardtype"
              className={INPUT_CLASS}
              value={cardTypeId}
              onChange={(event) => setCardTypeId(event.target.value)}
            >
              {CARD_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{activeCard?.note}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Rates and fees</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cash-rate">
              Mid-market rate (₹ per 1 {CURRENCY.code})
            </label>
            <input
              id="cash-rate"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={inrPerUnit}
              onChange={(event) => setInrPerUnit(event.target.value)}
            />
            <p className={HINT_CLASS}>The dollar floats against the rupee &mdash; use the day&rsquo;s mid-market rate, not the rate a counter quotes you.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-usd">
              Rupees per US dollar
            </label>
            <input
              id="cash-usd"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={inrPerUsd}
              onChange={(event) => setInrPerUsd(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Used only to test the RBI note limit and the customs thresholds, which are set in US
              dollars.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-changer">
              Money changer&rsquo;s markup on notes (%)
            </label>
            <input
              id="cash-changer"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.25"
              value={cashRateMarkupPct}
              onChange={(event) => setCashRateMarkupPct(event.target.value)}
            />
            <p className={HINT_CLASS}>
              How far above the mid-market rate the counter sells notes. Airport counters are the
              worst; a booked online rate is usually the best.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-cardmarkup">
              Card foreign-currency markup (%)
            </label>
            <input
              id="cash-cardmarkup"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.25"
              value={cardMarkupPct}
              onChange={(event) => setCardMarkupPct(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Most Indian cards charge 2% to 3.5% plus GST on the fee. Zero-markup travel cards
              charge 0%.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-atm-size">
              Typical ATM withdrawal ({CURRENCY.code})
            </label>
            <input
              id="cash-atm-size"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={atmWithdrawalSize}
              onChange={(event) => setAtmWithdrawalSize(event.target.value)}
            />
            <p className={HINT_CLASS}>US machines usually cap a single withdrawal near $300 to $500, and most add an operator surcharge of a few dollars on top of your own bank&rsquo;s fee.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cash-atm-fee">
              Fee per foreign ATM withdrawal (₹)
            </label>
            <input
              id="cash-atm-fee"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={atmFeeInr}
              onChange={(event) => setAtmFeeInr(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Your bank&rsquo;s charge, before the local operator&rsquo;s own fee. GST applies on top.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cash-lrs">
              LRS already used this financial year (₹)
            </label>
            <input
              id="cash-lrs"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={lrsAlreadyUsedInr}
              onChange={(event) => setLrsAlreadyUsedInr(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Earlier forex purchases, forex card loads, overseas fees or investments in the same
              year. TCS applies once the year&rsquo;s total passes {INR.format(LRS_TCS_THRESHOLD_INR)}.
            </p>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Carry in {CURRENCY.plural}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : local(plan.cashToCarry)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a cash figure."
                : `${money(plan.cashAllInInr)} all in, and ${local(plan.cardSpend)} left on the card.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the cash budget plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {splitRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && plan.warnings.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Worth knowing before you buy</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {plan.warnings.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What the money itself costs</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {costRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className={HINT_CLASS}>
          {hasError
            ? DASH
            : `Effective rate paid: ₹${RATE.format(plan.cashEffectiveRate)} per ${CURRENCY.code} on notes, ₹${RATE.format(plan.cardEffectiveRate)} on the card.`}
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where the notes should come from</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th scope="col" className={TH_LEFT}>
                  Route
                </th>
                <th scope="col" className={TH_RIGHT}>
                  Rupee cost
                </th>
                <th scope="col" className={TH_RIGHT}>
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3 font-semibold">Buy notes in India</td>
                <td className="py-2 pr-3 text-right">{hasError ? DASH : money(plan.cashAllInInr)}</td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">
                  {hasError ? DASH : `changer markup + GST`}
                </td>
              </tr>
              <tr className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3 font-semibold">Withdraw at destination ATMs</td>
                <td className="py-2 pr-3 text-right">{hasError ? DASH : money(plan.atmTotalInr)}</td>
                <td className="py-2 text-right text-[var(--muted-foreground)]">
                  {hasError
                    ? DASH
                    : `${plan.atmWithdrawals} withdrawal${plan.atmWithdrawals === 1 ? "" : "s"}, ${money(plan.atmFeesInr)} in fees`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={HINT_CLASS}>
          {hasError
            ? DASH
            : plan.cheaperCashRoute === "atm"
              ? `Withdrawing at the destination works out about ${money(plan.cashRouteSavingInr)} cheaper here, but it depends on ATMs being available and on declining the machine's offer to bill you in rupees.`
              : `Buying notes in India works out about ${money(plan.cashRouteSavingInr)} cheaper here, mostly because each foreign withdrawal carries a flat fee.`}
        </p>
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Ask for these notes</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {(hasError ? [] : plan.notes).map((row) => (
              <div key={row.note} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  {CURRENCY.symbol}
                  {FOREIGN.format(row.note)}
                </dt>
                <dd className="text-right font-semibold">
                  &times; {row.count} = {local(row.value)}
                </dd>
              </div>
            ))}
            {(hasError || plan.notes?.length === 0) && (
              <p className="py-2.5 text-[var(--muted-foreground)]">{DASH}</p>
            )}
          </dl>
          <p className={HINT_CLASS}>Weight the mix towards $20s and $1s. Ones are what tipping actually needs, and many vendors will not break a $100.</p>
        </section>

        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Limits this plan touches</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Notes in US dollar terms</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : `USD ${NUM2.format(plan.cashUsdEquivalent)}`}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">RBI cash limit per visit</dt>
              <dd className="text-right font-semibold">USD {RBI_CASH_NOTES_LIMIT_USD}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Counts towards LRS</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : money(plan.lrsAmountInr)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">TCS collected</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : money(plan.tcs.tcsInr)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Declare on return?</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : plan.mustDeclareOnReturn ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How cash works in {CURRENCY.country}</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {CURRENCY.cashFacts.map((fact) => (
            <li key={fact} className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or financial advice. Exchange rates, card markups, TCS rates and
        the LRS threshold change; confirm the current position with your bank or a chartered
        accountant before a large purchase of foreign exchange. Carrying more than USD 10,000 in aggregate also has to be reported to US customs on arrival, separately from the Indian declaration on the way home.
      </p>
    </main>
  );
}
