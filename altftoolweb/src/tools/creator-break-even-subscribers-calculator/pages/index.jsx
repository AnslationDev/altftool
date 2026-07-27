"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { MAX_TIERS, computeBreakEven, incomeAtMembers } from "../lib";

const DEFAULT_TIERS = [
  { id: 1, name: "Supporter", price: "199", share: "60" },
  { id: 2, name: "Insider", price: "499", share: "30" },
  { id: 3, name: "Producer", price: "999", share: "10" },
];

const DEFAULTS = {
  monthlyCosts: "40000",
  platformFee: "8",
  processingFee: "2.9",
  processingFixed: "3",
  churn: "5",
  netNew: "20",
  targetMembers: "500",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const moneyFine = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const count = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  return text === "" ? 0 : Number(text);
};

export default function ToolHome() {
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const patchTier = (id, changes) =>
    setTiers((prev) => prev.map((tier) => (tier.id === id ? { ...tier, ...changes } : tier)));

  const addTier = () =>
    setTiers((prev) => {
      if (prev.length >= MAX_TIERS) return prev;
      const nextId = prev.reduce((max, tier) => Math.max(max, tier.id), 0) + 1;
      return [...prev, { id: nextId, name: `Tier ${prev.length + 1}`, price: "299", share: "0" }];
    });

  const removeTier = (id) =>
    setTiers((prev) => (prev.length <= 1 ? prev : prev.filter((tier) => tier.id !== id)));

  const result = useMemo(
    () =>
      computeBreakEven({
        monthlyCosts: toNumber(values.monthlyCosts),
        tiers: tiers.map((tier) => ({
          name: tier.name || "Tier",
          price: toNumber(tier.price),
          sharePercent: toNumber(tier.share),
        })),
        platformFeePercent: toNumber(values.platformFee),
        processingFeePercent: toNumber(values.processingFee),
        processingFixed: toNumber(values.processingFixed),
        monthlyChurnPercent: toNumber(values.churn),
        netNewPerMonth: toNumber(values.netNew),
      }),
    [tiers, values],
  );

  const ok = !result.error;

  const target = useMemo(
    () =>
      ok
        ? incomeAtMembers({
            members: toNumber(values.targetMembers),
            blendedNet: result.blendedNet,
            monthlyCosts: result.monthlyCosts,
          })
        : { error: result.error },
    [ok, result, values.targetMembers],
  );

  const shareTotal = tiers.reduce((sum, tier) => sum + toNumber(tier.share), 0);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Break-even members",
      `Monthly production costs: ${money(result.monthlyCosts)}`,
      `Average member is worth ${moneyFine(result.blendedNet)} net (${pct(result.blendedTakeHomePercent)} of ${moneyFine(result.blendedGross)})`,
      `Members needed to break even: ${count(result.breakEvenMembers)}`,
      `Fees lost at that size: ${money(result.feesAtBreakEven)} a month`,
      `Replacements needed each month for churn: ${count(result.replacementsPerMonth)}`,
      result.monthsToBreakEven === null
        ? ""
        : `Months to get there at your current growth: ${result.monthsToBreakEven}`,
    ]
      .filter(Boolean)
      .join("\n");
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
    setTiers(DEFAULT_TIERS);
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Membership maths
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Break Even Subscribers Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A pledge is not what you keep. Take off the platform's cut and the payment processor's
          percentage plus flat charge, then see how many members it takes to cover a month of work.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="be-costs">
              Monthly production costs (INR)
            </label>
            <input
              id="be-costs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={values.monthlyCosts}
              onChange={setField("monthlyCosts")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-platform">
              Platform fee (% of pledge)
            </label>
            <input
              id="be-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="0.5"
              value={values.platformFee}
              onChange={setField("platformFee")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-processing">
              Payment processing (%)
            </label>
            <input
              id="be-processing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="0.1"
              value={values.processingFee}
              onChange={setField("processingFee")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-fixed">
              Flat processing charge per payment (INR)
            </label>
            <input
              id="be-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={values.processingFixed}
              onChange={setField("processingFixed")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-churn">
              Monthly churn (%)
            </label>
            <input
              id="be-churn"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="0.5"
              value={values.churn}
              onChange={setField("churn")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="be-netnew">
              Net new members a month
            </label>
            <input
              id="be-netnew"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.netNew}
              onChange={setField("netNew")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Tiers and the mix of members</h2>
          <span
            className={
              Math.abs(shareTotal - 100) < 0.01
                ? "text-sm font-semibold text-[var(--success)]"
                : "text-sm font-semibold text-[var(--danger)]"
            }
          >
            Shares total {NUM2.format(shareTotal)}%
          </span>
        </div>

        <ul className="mt-4 space-y-4">
          {tiers.map((tier) => (
            <li
              key={tier.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`be-name-${tier.id}`}>
                    Tier name
                  </label>
                  <input
                    id={`be-name-${tier.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={tier.name}
                    onChange={(event) => patchTier(tier.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`be-price-${tier.id}`}>
                    Price a month (INR)
                  </label>
                  <input
                    id={`be-price-${tier.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="10"
                    value={tier.price}
                    onChange={(event) => patchTier(tier.id, { price: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`be-share-${tier.id}`}>
                    Share of members (%)
                  </label>
                  <input
                    id={`be-share-${tier.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="1"
                    value={tier.share}
                    onChange={(event) => patchTier(tier.id, { share: event.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeTier(tier.id)}
                    disabled={tiers.length <= 1}
                    aria-label={`Remove tier ${tier.name}`}
                    className={`${GHOST_BTN} w-full disabled:opacity-50`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addTier}
          disabled={tiers.length >= MAX_TIERS}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-50`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a tier
        </button>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Paying members needed to break even
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? count(result.breakEvenMembers) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Each member is worth ${moneyFine(result.blendedNet)} net of fees`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy break-even result"
              className={GHOST_BTN}
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
            ["Average pledge before fees", ok ? moneyFine(result.blendedGross) : DASH],
            ["Share of a pledge you keep", ok ? pct(result.blendedTakeHomePercent) : DASH],
            ["Gross pledges at break-even", ok ? money(result.grossAtBreakEven) : DASH],
            ["Fees lost each month at that size", ok ? money(result.feesAtBreakEven) : DASH],
            ["Replacements needed each month for churn", ok ? count(result.replacementsPerMonth) : DASH],
            ["Total sign-ups needed a month to also grow", ok ? count(result.grossSignupsNeeded) : DASH],
            [
              "Months to reach break-even at current growth",
              ok && result.monthsToBreakEven !== null ? count(result.monthsToBreakEven) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Members needed on each tier</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tier
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Net per member
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Members
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Net a month
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{moneyFine(row.net)}</td>
                    <td className="py-2 pr-3 text-right">{count(row.membersAtBreakEven)}</td>
                    <td className="py-2 text-right">{money(row.netAtBreakEven)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check a target</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="be-target">
              If you had this many members
            </label>
            <input
              id="be-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={values.targetMembers}
              onChange={setField("targetMembers")}
            />
          </div>
          <div className="flex items-end">
            {target.error ? (
              <p
                role="alert"
                className="w-full rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {target.error}
              </p>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                Net income{" "}
                <span className="font-semibold text-[var(--foreground)]">{money(target.net)}</span> a
                month, leaving{" "}
                <span className="font-semibold text-[var(--foreground)]">{money(target.profit)}</span>{" "}
                after production costs.
              </p>
            )}
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fee percentages differ by platform, plan and country, and taxes may apply on top. Check your
        own payout statement for the exact rates before you rely on these numbers.
      </p>
    </main>
  );
}
