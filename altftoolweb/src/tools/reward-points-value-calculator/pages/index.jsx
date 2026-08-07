"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  GST_ON_FEE_PCT,
  SPEND_BLOCKS,
  compareRewardCards,
  pointValueFromRedemption,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const num4 = (value) => NUM4.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${num(value)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_CARDS = [
  {
    id: 1,
    name: "Everyday card",
    annualFee: "500",
    pointsPerBlock: "2",
    spendBlock: "150",
    pointValue: "0.25",
    monthlyCapPoints: "0",
    welcomeValue: "0",
    milestoneValue: "0",
  },
  {
    id: 2,
    name: "Premium card",
    annualFee: "2500",
    pointsPerBlock: "4",
    spendBlock: "100",
    pointValue: "0.30",
    monthlyCapPoints: "5000",
    welcomeValue: "2000",
    milestoneValue: "3000",
  },
];

const nextId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

const CARD_FIELDS = [
  { key: "annualFee", label: "Annual fee (₹)", step: "100" },
  { key: "pointsPerBlock", label: "Points per block", step: "0.5" },
  { key: "pointValue", label: "Value of 1 point (₹)", step: "0.05" },
  { key: "monthlyCapPoints", label: "Monthly points cap (0 = none)", step: "100" },
  { key: "welcomeValue", label: "Welcome benefit value (₹)", step: "500" },
  { key: "milestoneValue", label: "Milestone benefits a year (₹)", step: "500" },
];

export default function ToolHome() {
  const [monthlySpend, setMonthlySpend] = useState("50000");
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [redeemPoints, setRedeemPoints] = useState("10000");
  const [redeemRupees, setRedeemRupees] = useState("2500");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => compareRewardCards({ monthlySpend, cards }),
    [monthlySpend, cards],
  );

  const derivedPointValue = useMemo(
    () => pointValueFromRedemption({ points: redeemPoints, rupees: redeemRupees }),
    [redeemPoints, redeemRupees],
  );

  const hasError = Boolean(result.error);

  const updateCard = (id, patch) =>
    setCards((current) => current.map((card) => (card.id === id ? { ...card, ...patch } : card)));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Credit Card Reward Points Value",
      `Monthly spend: ${money(result.monthlySpend)} (${money(result.annualSpend)} a year)`,
      "",
      ...result.ranked.map(
        (card) =>
          `${card.name}: ${num(card.annualPoints)} points a year worth ${money(card.grossValue)}; fee with GST ${money(card.feeWithGst)}; net ${money(card.netValue)} (${pct(card.netRatePct)} of spend)`,
      ),
      "",
      `Best on net value: ${result.best.name}`,
    ].join("\n");
  }, [hasError, result]);

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
    setMonthlySpend("50000");
    setCards(DEFAULT_CARDS);
    setRedeemPoints("10000");
    setRedeemRupees("2500");
    setCopied(false);
  };

  const best = hasError ? null : result.best;

  const rows = hasError
    ? [
        ["Points earned a year", DASH],
        ["Reward value a year", DASH],
        ["Welcome and milestone value", DASH],
        ["Annual fee with GST", DASH],
        ["Effective reward rate", DASH],
        ["Net return after the fee", DASH],
        ["Spend needed to cover the fee", DASH],
      ]
    : [
        ["Points earned a year", num(best.annualPoints)],
        ["Reward value a year", money(best.grossValue)],
        ["Welcome and milestone value", money(best.extraBenefits)],
        ["Annual fee with GST", `${money(best.feeWithGst)} (fee ${money(best.annualFee)})`],
        ["Effective reward rate", pct(best.effectiveRatePct)],
        ["Net return after the fee", pct(best.netRatePct)],
        [
          "Spend needed to cover the fee",
          best.breakEvenReachable
            ? `${money(best.breakEvenMonthlySpend)} a month`
            : best.breakEvenUnreachableReason === "zero-value"
              ? "Not reachable — this card's points/value settings mean redemptions are worth nothing"
              : "Not reachable at this card's cap",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Rewards
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Credit Card Reward Points Value Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A point is worth whatever your redemption pays. Convert points to rupees, apply the spend
          block and monthly cap, subtract the fee with {GST_ON_FEE_PCT}% GST, and compare cards on
          what actually lands in your pocket.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rp-spend">
              Spend routed through the card each month (₹)
            </label>
            <input
              id="rp-spend"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={monthlySpend}
              onChange={(event) => setMonthlySpend(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-points">
              Points surrendered in a redemption
            </label>
            <input
              id="rp-points"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={redeemPoints}
              onChange={(event) => setRedeemPoints(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-rupees">
              Rupee value received for them
            </label>
            <input
              id="rp-rupees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={redeemRupees}
              onChange={(event) => setRedeemRupees(event.target.value)}
            />
          </div>
        </div>
        <p
          role={derivedPointValue.error ? "alert" : undefined}
          className="mt-3 text-sm text-[var(--muted-foreground)]"
        >
          {derivedPointValue.error
            ? derivedPointValue.error
            : `That redemption values one point at ₹${num4(derivedPointValue.valuePerPoint)} — copy it into the cards below if it matches how you redeem.`}
        </p>
      </section>

      <section className="mt-4 space-y-4">
        {cards.map((card) => (
          <div key={card.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-[180px] flex-1">
                <label className={LABEL_CLASS} htmlFor={`rp-name-${card.id}`}>
                  Card name
                </label>
                <input
                  id={`rp-name-${card.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={card.name}
                  onChange={(event) => updateCard(card.id, { name: event.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => setCards((current) => current.filter((item) => item.id !== card.id))}
                aria-label={`Remove ${card.name || "this card"}`}
                className={GHOST_BTN}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={SMALL_LABEL} htmlFor={`rp-block-${card.id}`}>
                  Spend block (₹)
                </label>
                <select
                  id={`rp-block-${card.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={card.spendBlock}
                  onChange={(event) => updateCard(card.id, { spendBlock: event.target.value })}
                >
                  {SPEND_BLOCKS.map((block) => (
                    <option key={block} value={String(block)}>
                      Per ₹{block} spent
                    </option>
                  ))}
                </select>
              </div>
              {CARD_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className={SMALL_LABEL} htmlFor={`rp-${field.key}-${card.id}`}>
                    {field.label}
                  </label>
                  <input
                    id={`rp-${field.key}-${card.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step={field.step}
                    value={card[field.key]}
                    onChange={(event) => updateCard(card.id, { [field.key]: event.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setCards((current) => [
              ...current,
              {
                id: nextId(current),
                name: `Card ${current.length + 1}`,
                annualFee: "0",
                pointsPerBlock: "1",
                spendBlock: "100",
                pointValue: "0.25",
                monthlyCapPoints: "0",
                welcomeValue: "0",
                milestoneValue: "0",
              },
            ])
          }
          className={GHOST_BTN}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another card
        </button>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Best card, net of fee" : `Best card: ${best.name}`}
            </p>
            <p aria-live="polite" className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(best.netValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to compare cards."
                : `Net value a year on ${money(result.annualSpend)} of spend${result.marginOverNext !== null ? ` · ${money(result.marginOverNext)} ahead of the next card` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy reward card comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Card by card</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Card</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Points / year</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Reward value</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Fee + GST</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Net</th>
                  <th scope="col" className="py-2 text-right font-semibold">Net rate</th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((card) => (
                  <tr key={card.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {card.name}
                      {card.capped && (
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          Cap costs you {num(card.cappedAway)} points a year
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{num(card.annualPoints)}</td>
                    <td className="py-2 pr-3 text-right">{money(card.grossValue)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(card.feeWithGst)}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(card.netValue)}</td>
                    <td className="py-2 text-right">{pct(card.netRatePct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!result.anyWorthKeeping && (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              At this spend, none of these cards earns back its fee. A no-fee card would leave you
              better off.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reward value assumes you actually redeem at the rate you entered — points that expire or are
        redeemed for catalogue merchandise are usually worth far less. Rent, fuel, wallet loads and
        government payments are often excluded from earning. Interest on a revolved balance dwarfs
        any reward. Informational only, not financial advice.
      </p>
    </main>
  );
}
