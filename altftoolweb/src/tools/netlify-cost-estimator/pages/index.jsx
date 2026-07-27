"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Rocket, RotateCcw } from "lucide-react";

import {
  BANDWIDTH_BLOCK_GB,
  BANDWIDTH_BLOCK_PRICE,
  BUILD_BLOCK_MINUTES,
  BUILD_BLOCK_PRICE,
  FUNCTION_PACK_INVOCATIONS,
  FUNCTION_PACK_PRICE,
  INCLUDED_FUNCTION_INVOCATIONS,
  PLANS,
  computeNetlifyCost,
} from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US");

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
  members: "3",
  bandwidthGb: "1200",
  buildMinutes: "26000",
  functionInvocations: "500000",
};

const DASH = "—";

export default function ToolHome() {
  const [planId, setPlanId] = useState(DEFAULTS.planId);
  const [members, setMembers] = useState(DEFAULTS.members);
  const [bandwidthGb, setBandwidthGb] = useState(DEFAULTS.bandwidthGb);
  const [buildMinutes, setBuildMinutes] = useState(DEFAULTS.buildMinutes);
  const [functionInvocations, setFunctionInvocations] = useState(DEFAULTS.functionInvocations);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeNetlifyCost({
        planId,
        members: members.trim() === "" ? Number.NaN : Number(members),
        bandwidthGb: bandwidthGb.trim() === "" ? 0 : Number(bandwidthGb),
        buildMinutes: buildMinutes.trim() === "" ? 0 : Number(buildMinutes),
        functionInvocations:
          functionInvocations.trim() === "" ? 0 : Number(functionInvocations),
      }),
    [planId, members, bandwidthGb, buildMinutes, functionInvocations],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Netlify ${result.planLabel} monthly cost estimate (list prices)`,
      `Members: ${money(result.memberCost)}`,
      `Bandwidth overage (${result.bandwidthBlocks} × ${BANDWIDTH_BLOCK_GB} GB blocks): ${money(result.bandwidthCost)}`,
      `Build minutes overage (${result.buildBlocks} × ${BUILD_BLOCK_MINUTES} min blocks): ${money(result.buildCost)}`,
      `Function packs: ${money(result.functionCost)}`,
      `Total per month: ${money(result.total)}`,
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
    setMembers(DEFAULTS.members);
    setBandwidthGb(DEFAULTS.bandwidthGb);
    setBuildMinutes(DEFAULTS.buildMinutes);
    setFunctionInvocations(DEFAULTS.functionInvocations);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Members", DASH],
        ["Bandwidth overage", DASH],
        ["Build minutes overage", DASH],
        ["Function invocation packs", DASH],
      ]
    : [
        ["Members", money(result.memberCost)],
        [
          `Bandwidth over ${NUM.format(result.includedBandwidthGb)} GB (${NUM.format(result.bandwidthOverGb)} GB → ${result.bandwidthBlocks} block${result.bandwidthBlocks === 1 ? "" : "s"} @ $${BANDWIDTH_BLOCK_PRICE})`,
          money(result.bandwidthCost),
        ],
        [
          `Build minutes over ${NUM.format(result.includedBuildMinutes)} (${NUM.format(result.buildOverMinutes)} min → ${result.buildBlocks} block${result.buildBlocks === 1 ? "" : "s"} @ $${BUILD_BLOCK_PRICE})`,
          money(result.buildCost),
        ],
        [
          `Function packs over ${NUM.format(INCLUDED_FUNCTION_INVOCATIONS)} invocations (${result.functionPacks} pack${result.functionPacks === 1 ? "" : "s"} @ $${FUNCTION_PACK_PRICE})`,
          money(result.functionCost),
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
          Netlify Pro is $19 per member with 1 TB bandwidth and 25,000 build minutes included; the
          Free plan gives 100 GB and 300 minutes. Overages bill in blocks — ${BANDWIDTH_BLOCK_PRICE}{" "}
          per {BANDWIDTH_BLOCK_GB} GB of bandwidth and ${BUILD_BLOCK_PRICE} per{" "}
          {BUILD_BLOCK_MINUTES} build minutes — and partial blocks round up.
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
              {PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.label} — ${plan.memberPrice}/member
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-members">
              Team members
            </label>
            <input
              id="nl-members"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={members}
              onChange={(event) => setMembers(event.target.value)}
            />
          </div>
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
            <label className={LABEL_CLASS} htmlFor="nl-builds">
              Build minutes per month
            </label>
            <input
              id="nl-builds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={buildMinutes}
              onChange={(event) => setBuildMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nl-functions">
              Serverless function invocations per month
            </label>
            <input
              id="nl-functions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="25000"
              value={functionInvocations}
              onChange={(event) => setFunctionInvocations(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              First {NUM.format(INCLUDED_FUNCTION_INVOCATIONS)} invocations are included; beyond
              that each ${FUNCTION_PACK_PRICE} pack covers up to{" "}
              {NUM.format(FUNCTION_PACK_INVOCATIONS)}.
            </p>
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
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.planLabel} plan, published list prices with block-rounded overages.`}
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
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate based on Netlify's published pricing. Background functions, edge
        functions, Identity, forms, large media and Enterprise agreements are not modelled, and
        Netlify revises plans periodically — confirm on netlify.com/pricing and your usage
        dashboard.
      </p>
    </main>
  );
}
