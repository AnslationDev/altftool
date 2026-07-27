"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import {
  AGE_BANDS,
  HEALTH_EDUCATION_CESS,
  SHORT_TERM_HOLDING_MONTHS,
  STCG_RATE_CHANGE_DATE,
  STCG_RATE_CURRENT,
  STCG_RATE_LEGACY,
  STT_DELIVERY_RATE,
  SURCHARGE_CAP_111A,
  SURCHARGE_OPTIONS,
  computeStcgOnShares,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const DASH = "—";

const DEFAULTS = {
  buyPrice: "500",
  sellPrice: "700",
  quantity: "100",
  buyDate: "2025-01-10",
  sellDate: "2025-06-01",
  charges: "200",
  otherIncome: "1200000",
  regime: "new",
  ageBand: "general",
  surcharge: "0",
  resident: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [buyPrice, setBuyPrice] = useState(DEFAULTS.buyPrice);
  const [sellPrice, setSellPrice] = useState(DEFAULTS.sellPrice);
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [buyDate, setBuyDate] = useState(DEFAULTS.buyDate);
  const [sellDate, setSellDate] = useState(DEFAULTS.sellDate);
  const [charges, setCharges] = useState(DEFAULTS.charges);
  const [otherIncome, setOtherIncome] = useState(DEFAULTS.otherIncome);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [ageBand, setAgeBand] = useState(DEFAULTS.ageBand);
  const [surcharge, setSurcharge] = useState(DEFAULTS.surcharge);
  const [resident, setResident] = useState(DEFAULTS.resident);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeStcgOnShares({
        buyPrice: toNumber(buyPrice),
        sellPrice: toNumber(sellPrice),
        quantity: toNumber(quantity),
        buyDate,
        sellDate,
        transferCharges: toNumber(charges),
        otherIncome: toNumber(otherIncome),
        regime,
        ageBand,
        surchargeRatePct: toNumber(surcharge),
        isResidentIndividual: resident,
      }),
    [
      buyPrice,
      sellPrice,
      quantity,
      buyDate,
      sellDate,
      charges,
      otherIncome,
      regime,
      ageBand,
      surcharge,
      resident,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Short term capital gains on listed equity (Section 111A)",
      `Cost of acquisition: ${money2(result.costOfAcquisition)}`,
      `Sale consideration: ${money2(result.saleConsideration)}`,
      `Brokerage and transfer charges deducted: ${money2(result.transferCharges)}`,
      `${result.isLoss ? "Short-term capital loss" : "Short-term capital gain"}: ${money2(Math.abs(result.grossGain))}`,
      `Holding period: ${result.holdingDays} days — ${result.isShortTerm ? "short term" : "long term"}`,
      `Rate applied: ${result.rate}%`,
      `Basic exemption set against the gain: ${money2(result.exemptionUsed)}`,
      `Taxable gain: ${money2(result.taxableGain)}`,
      `Tax plus surcharge and cess: ${money2(result.totalTax)}`,
      `Securities transaction tax paid (not deductible): ${money2(result.sttTotal)}`,
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
    setBuyPrice(DEFAULTS.buyPrice);
    setSellPrice(DEFAULTS.sellPrice);
    setQuantity(DEFAULTS.quantity);
    setBuyDate(DEFAULTS.buyDate);
    setSellDate(DEFAULTS.sellDate);
    setCharges(DEFAULTS.charges);
    setOtherIncome(DEFAULTS.otherIncome);
    setRegime(DEFAULTS.regime);
    setAgeBand(DEFAULTS.ageBand);
    setSurcharge(DEFAULTS.surcharge);
    setResident(DEFAULTS.resident);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Capital gains
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Short Term Capital Gains Calculator on Shares
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Listed equity sold within {SHORT_TERM_HOLDING_MONTHS} months is taxed under Section 111A
          at {STCG_RATE_CURRENT}% for transfers from {STCG_RATE_CHANGE_DATE} and{" "}
          {STCG_RATE_LEGACY}% before that. Brokerage is deductible, securities transaction tax is
          not.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The trade</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-buy">
              Purchase price per share (INR)
            </label>
            <input
              id="stcg-buy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={buyPrice}
              onChange={(event) => setBuyPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-sell">
              Sale price per share (INR)
            </label>
            <input
              id="stcg-sell"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={sellPrice}
              onChange={(event) => setSellPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-qty">
              Number of shares
            </label>
            <input
              id="stcg-qty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-charges">
              Brokerage and transfer charges (INR)
            </label>
            <input
              id="stcg-charges"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={charges}
              onChange={(event) => setCharges(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-buydate">
              Purchase date
            </label>
            <input
              id="stcg-buydate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={buyDate}
              onChange={(event) => setBuyDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-selldate">
              Sale date
            </label>
            <input
              id="stcg-selldate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={sellDate}
              onChange={(event) => setSellDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your tax position</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-other">
              Total income other than these gains (INR)
            </label>
            <input
              id="stcg-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={otherIncome}
              onChange={(event) => setOtherIncome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-regime">
              Tax regime
            </label>
            <select
              id="stcg-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="new">New regime (Section 115BAC)</option>
              <option value="old">Old regime</option>
            </select>
          </div>
          {regime === "old" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="stcg-age">
                Age band
              </label>
              <select
                id="stcg-age"
                className={`mt-2 ${INPUT_CLASS}`}
                value={ageBand}
                onChange={(event) => setAgeBand(event.target.value)}
              >
                {AGE_BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="stcg-surcharge">
              Surcharge on your total income
            </label>
            <select
              id="stcg-surcharge"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surcharge}
              onChange={(event) => setSurcharge(event.target.value)}
            >
              {SURCHARGE_OPTIONS.map((option) => (
                <option key={option.rate} value={String(option.rate)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className={`mt-4 ${CHECKBOX_ROW}`} htmlFor="stcg-resident">
          <input
            id="stcg-resident"
            type="checkbox"
            className="h-5 w-5 accent-[var(--primary)]"
            checked={resident}
            onChange={(event) => setResident(event.target.checked)}
          />
          Resident individual or HUF (eligible for the basic exemption adjustment)
        </label>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Tax payable on this trade
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(result.totalTax) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {!ok
                ? "Fix the inputs above to see the tax"
                : !result.isShortTerm
                  ? `Held ${result.holdingDays} days, so this is a long-term gain and Section 111A does not apply`
                  : result.isLoss
                    ? "A short-term capital loss, so no tax arises on this trade"
                    : `${result.rate}% on ${money2(result.taxableGain)} plus ${HEALTH_EDUCATION_CESS}% cess`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the short term capital gains result"
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
          {[
            ["Cost of acquisition", ok ? money2(result.costOfAcquisition) : DASH],
            ["Sale consideration", ok ? money2(result.saleConsideration) : DASH],
            ["Brokerage and charges deducted", ok ? money2(result.transferCharges) : DASH],
            [
              ok && result.isLoss ? "Short-term capital loss" : "Capital gain",
              ok ? money2(Math.abs(result.grossGain)) : DASH,
            ],
            [
              "Holding period",
              ok
                ? `${result.holdingDays} days — ${result.isShortTerm ? "short term" : "long term"}`
                : DASH,
            ],
            [
              "Basic exemption available to set off",
              ok ? money2(result.unexhaustedExemption) : DASH,
            ],
            ["Basic exemption actually used", ok ? money2(result.exemptionUsed) : DASH],
            ["Taxable short-term gain", ok ? money2(result.taxableGain) : DASH],
            [`Tax at ${ok ? result.rate : STCG_RATE_CURRENT}%`, ok ? money2(result.baseTax) : DASH],
            [
              `Surcharge at ${ok ? NUM.format(result.surchargeRatePct) : "0"}%`,
              ok ? money2(result.surcharge) : DASH,
            ],
            [`Cess at ${HEALTH_EDUCATION_CESS}%`, ok ? money2(result.cess) : DASH],
            ["Gain left after tax", ok ? money2(result.netGainAfterTax) : DASH],
            ["Return on cost before tax", ok ? `${NUM.format(result.returnPct)}%` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.surchargeCapped ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Surcharge on Section 111A income is capped at {SURCHARGE_CAP_111A}%, so the higher rate
            you selected has been limited for this calculation.
          </p>
        ) : null}

        {ok && !result.isShortTerm ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The holding crossed {SHORT_TERM_HOLDING_MONTHS} months on {result.longTermFrom}, so the
            gain is long term and falls under Section 112A rather than Section 111A. Adjust the sale
            date to model a short-term exit.
          </p>
        ) : null}

        {ok && result.isLoss ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            A short-term capital loss can be set off against any capital gain, short term or long
            term, in the same year, and carried forward for eight assessment years if the return is
            filed on time.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Securities transaction tax</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          STT is charged at {STT_DELIVERY_RATE}% on both legs of a delivery-based equity trade. It
          is what makes the Section 111A concessional rate available, but Section 48 does not allow
          it as a deduction from the gain.
        </p>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["STT on the purchase", ok ? money2(result.sttOnBuy) : DASH],
            ["STT on the sale", ok ? money2(result.sttOnSell) : DASH],
            ["Total STT paid, not deductible", ok ? money2(result.sttTotal) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. This covers listed equity and equity-oriented fund units
        on which STT is paid. Unlisted shares, off-market transfers and intraday or derivative
        positions are taxed differently — intraday equity is speculative business income, not
        capital gains. The basic exemption of {ok ? money(result.basicExemption) : DASH} applied here
        reflects the regime and age band selected. Check your own position with a chartered
        accountant.
      </p>
    </main>
  );
}
