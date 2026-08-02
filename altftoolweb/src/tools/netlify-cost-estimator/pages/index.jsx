"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Rocket, RotateCcw } from "lucide-react";

import {
  CREDIT_RATES,
  DEFAULT_PRO_CREDIT_TIER,
  PLANS,
  PRO_CREDIT_TIERS,
  computeNetlifyCost,
} from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US");
const CREDITS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  planId: "pro",
  proCreditTier: String(DEFAULT_PRO_CREDIT_TIER),
  bandwidthGb: "500",
  computeGbHours: "25",
  deploys: "40",
  webRequests: "1500000",
};

const DASH = "—";

export default function ToolHome() {
  const [planId, setPlanId] = useState(DEFAULTS.planId);
  const [proCreditTier, setProCreditTier] = useState(DEFAULTS.proCreditTier);
  const [bandwidthGb, setBandwidthGb] = useState(DEFAULTS.bandwidthGb);
  const [computeGbHours, setComputeGbHours] = useState(DEFAULTS.computeGbHours);
  const [deploys, setDeploys] = useState(DEFAULTS.deploys);
  const [webRequests, setWebRequests] = useState(DEFAULTS.webRequests);
  const [copied, setCopied] = useState(false);

  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];

  const result = useMemo(
    () =>
      computeNetlifyCost({
        planId,
        proCreditTier: planId === "pro" ? Number(proCreditTier) : undefined,
        bandwidthGb: bandwidthGb.trim() === "" ? 0 : Number(bandwidthGb),
        computeGbHours: computeGbHours.trim() === "" ? 0 : Number(computeGbHours),
        deploys: deploys.trim() === "" ? 0 : Number(deploys),
        webRequests: webRequests.trim() === "" ? 0 : Number(webRequests),
      }),
    [planId, proCreditTier, bandwidthGb, computeGbHours, deploys, webRequests],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Netlify ${result.planLabel} monthly cost estimate (credit-based pricing)`,
      `Base plan: ${money(result.basePrice)} for ${CREDITS.format(result.includedCredits)} credits`,
      `Bandwidth: ${CREDITS.format(result.bandwidthCredits)} credits`,
      `Function compute: ${CREDITS.format(result.computeCredits)} credits`,
      `Production deploys: ${CREDITS.format(result.deployCredits)} credits`,
      `Web requests: ${CREDITS.format(result.requestCredits)} credits`,
      `Credits used: ${CREDITS.format(result.creditsUsed)} of ${CREDITS.format(result.includedCredits)} included`,
      result.hardCapped
        ? "Over the Free plan's cap — no paid overage available, project pauses until upgrade or next cycle."
        : `Recharge packs: ${result.rechargePacks} (${money(result.rechargeCost)})`,
      `Total per month: ${result.hardCapped ? "N/A (hard cap reached)" : money(result.total)}`,
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
    setPlanId(DEFAULTS.planId);
    setProCreditTier(DEFAULTS.proCreditTier);
    setBandwidthGb(DEFAULTS.bandwidthGb);
    setComputeGbHours(DEFAULTS.computeGbHours);
    setDeploys(DEFAULTS.deploys);
    setWebRequests(DEFAULTS.webRequests);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Base plan", DASH],
        ["Bandwidth", DASH],
        ["Function compute", DASH],
        ["Production deploys", DASH],
        ["Web requests", DASH],
        ["Recharge packs", DASH],
      ]
    : [
        [
          `Base plan (${CREDITS.format(result.includedCredits)} credits included)`,
          money(result.basePrice),
        ],
        [
          `Bandwidth (${NUM.format(Number(bandwidthGb) || 0)} GB @ ${CREDIT_RATES.bandwidthPerGb} credits/GB)`,
          `${CREDITS.format(result.bandwidthCredits)} credits`,
        ],
        [
          `Function compute (${NUM.format(Number(computeGbHours) || 0)} GB-hr @ ${CREDIT_RATES.computePerGbHour} credits/GB-hr)`,
          `${CREDITS.format(result.computeCredits)} credits`,
        ],
        [
          `Production deploys (${NUM.format(Number(deploys) || 0)} @ ${CREDIT_RATES.deployEach} credits each)`,
          `${CREDITS.format(result.deployCredits)} credits`,
        ],
        [
          `Web requests (${NUM.format(Number(webRequests) || 0)} @ ${CREDIT_RATES.requestsPer10k} credits/10k)`,
          `${CREDITS.format(result.requestCredits)} credits`,
        ],
        [
          result.hardCapped
            ? "Over Free plan cap"
            : `Recharge packs (${result.rechargePacks} × ${planId === "personal" ? "$5/500 credits" : "$10/1,500 credits"})`,
          result.hardCapped ? "Project pauses" : money(result.rechargeCost),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Rocket className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Netlify Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Netlify bills on a shared monthly credit pool: Free gets 300 credits, Personal is
          $9 for 1,000, and Pro starts at $20 for 3,000 credits with unlimited team members
          included. Bandwidth, function compute, production deploys and web requests all draw
          from that pool — going over tops up in $5 (Personal) or $10 (Pro) recharge packs, or
          pauses the project on Free.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-plan">
              Plan
            </label>
            <select
              id="nl-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
            >
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.id === "pro" ? " — from $20/mo" : ` — $${p.basePrice}/mo`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{plan.seats}</p>
          </div>
          {planId === "pro" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="nl-tier">
                Pro credit tier
              </label>
              <select
                id="nl-tier"
                className={`mt-2 ${INPUT_CLASS}`}
                value={proCreditTier}
                onChange={(event) => setProCreditTier(event.target.value)}
              >
                {PRO_CREDIT_TIERS.map((tier) => (
                  <option key={tier.credits} value={tier.credits}>
                    {CREDITS.format(tier.credits)} credits — ${tier.price}/mo
                    {tier.rollover ? " (rollover eligible)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-bandwidth">
              Bandwidth (GB/month)
            </label>
            <input
              id="nl-bandwidth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={bandwidthGb}
              onChange={(event) => setBandwidthGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-compute">
              Function compute (GB-hours/month)
            </label>
            <input
              id="nl-compute"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={computeGbHours}
              onChange={(event) => setComputeGbHours(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Combined serverless, edge and background function execution time × memory — see
              your Netlify usage dashboard for this figure.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-deploys">
              Production deploys per month
            </label>
            <input
              id="nl-deploys"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={deploys}
              onChange={(event) => setDeploys(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Deploy previews, branch deploys and failed deploys are not metered.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-requests">
              Web requests per month
            </label>
            <input
              id="nl-requests"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50000"
              value={webRequests}
              onChange={(event) => setWebRequests(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Estimated monthly Netlify bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || result.hardCapped ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.hardCapped
                  ? `${result.planLabel} plan: usage exceeds the ${CREDITS.format(result.includedCredits)} credit cap — Netlify pauses the project until the next billing cycle or an upgrade.`
                  : `${result.planLabel} plan, credit-based pricing with recharge packs rounded up.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Netlify cost estimate"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
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
          {!hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Credits used</dt>
              <dd className="text-right font-semibold">
                {CREDITS.format(result.creditsUsed)} / {CREDITS.format(result.includedCredits)}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on Netlify's credit-based pricing. Rollover credits,
        Identity, forms (unmetered), large media and Enterprise agreements are not modelled, and
        Netlify revises plans periodically — confirm on netlify.com/pricing and your usage
        dashboard.
      </p>
    </main>
  );
}
