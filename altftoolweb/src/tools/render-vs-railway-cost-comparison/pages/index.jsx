"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCompareArrows, RotateCcw } from "lucide-react";

import { HOURS_PER_MONTH, RAILWAY_PLANS, compareRenderVsRailway } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  vcpu: "1",
  ramGb: "2",
  hours: String(HOURS_PER_MONTH),
  egressGb: "150",
  diskGb: "10",
  railwayPlanId: "hobby",
};

const DASH = "—";

export default function ToolHome() {
  const [vcpu, setVcpu] = useState(DEFAULTS.vcpu);
  const [ramGb, setRamGb] = useState(DEFAULTS.ramGb);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [egressGb, setEgressGb] = useState(DEFAULTS.egressGb);
  const [diskGb, setDiskGb] = useState(DEFAULTS.diskGb);
  const [railwayPlanId, setRailwayPlanId] = useState(DEFAULTS.railwayPlanId);
  const [copied, setCopied] = useState(false);

  const asNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      compareRenderVsRailway({
        vcpu: asNumber(vcpu),
        ramGb: asNumber(ramGb),
        hoursPerMonth: asNumber(hours),
        egressGb: asNumber(egressGb),
        diskGb: asNumber(diskGb),
        railwayPlanId,
      }),
    [vcpu, ramGb, hours, egressGb, diskGb, railwayPlanId],
  );

  const hasError = Boolean(result.error);

  const headline = useMemo(() => {
    if (hasError) return { amount: DASH, note: "Fix the input above to see a result." };
    if (!result.renderFits) {
      return {
        amount: money(result.railway.total),
        note: `Railway estimate — ${result.renderNote}`,
      };
    }
    if (result.cheaper === "tie") {
      return { amount: money(result.render.total), note: "Both providers land on the same price." };
    }
    const winner = result.cheaper === "render" ? "Render" : "Railway";
    const winnerTotal = result.cheaper === "render" ? result.render.total : result.railway.total;
    return {
      amount: money(winnerTotal),
      note: `${winner} is cheaper for this workload by ${money(result.savings)} per month.`,
    };
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Render vs Railway monthly cost comparison",
      `Workload: ${vcpu} vCPU, ${ramGb} GB RAM, ${result.hoursUsed} h/mo, ${egressGb} GB egress, ${diskGb} GB disk`,
      result.renderFits
        ? `Render (${result.render.instance}): ${money(result.render.total)}`
        : "Render: no single instance fits this workload",
      `Railway (${result.railway.plan}): ${money(result.railway.total)}`,
      result.renderFits && result.cheaper !== "tie"
        ? `Cheaper: ${result.cheaper === "render" ? "Render" : "Railway"} by ${money(result.savings)}/mo`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, vcpu, ramGb, egressGb, diskGb]);

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
    setVcpu(DEFAULTS.vcpu);
    setRamGb(DEFAULTS.ramGb);
    setHours(DEFAULTS.hours);
    setEgressGb(DEFAULTS.egressGb);
    setDiskGb(DEFAULTS.diskGb);
    setRailwayPlanId(DEFAULTS.railwayPlanId);
    setCopied(false);
  };

  const renderRows = hasError
    ? [["Render total", DASH]]
    : result.renderFits
      ? [
          ["Instance picked", result.render.instance],
          [
            `Compute (${money(result.render.instanceUsd)}/mo prorated)`,
            money(result.render.compute),
          ],
          ["Bandwidth overage (100 GB free, then $0.30/GB)", money(result.render.bandwidth)],
          ["Persistent disk ($0.25/GB/mo)", money(result.render.disk)],
          ["Render total", money(result.render.total)],
        ]
      : [["Render total", DASH]];

  const railwayRows = hasError
    ? [["Railway total", DASH]]
    : [
        ["Compute ($20/vCPU + $10/GB RAM, prorated)", money(result.railway.compute)],
        ["Egress ($0.05/GB)", money(result.railway.egress)],
        ["Volume storage ($0.15/GB/mo)", money(result.railway.disk)],
        ["Subscription", money(result.railway.base)],
        ["Included usage credit", `− ${money(result.railway.credit)}`],
        ["Railway total", money(result.railway.total)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
          PaaS pricing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Render vs Railway Cost Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe your app&apos;s resources once and see it priced both ways: Render&apos;s fixed
          instance tiers versus Railway&apos;s usage-based $20/vCPU + $10/GB-RAM metering, with
          egress and disk included.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-cpu">
              vCPUs needed
            </label>
            <input
              id="rr-cpu"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={vcpu}
              onChange={(event) => setVcpu(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-ram">
              RAM needed (GB)
            </label>
            <input
              id="rr-ram"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={ramGb}
              onChange={(event) => setRamGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-hours">
              Hours running per month (730 = always on)
            </label>
            <input
              id="rr-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={HOURS_PER_MONTH}
              step="10"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-egress">
              Egress / bandwidth per month (GB)
            </label>
            <input
              id="rr-egress"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={egressGb}
              onChange={(event) => setEgressGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-disk">
              Persistent disk / volume (GB)
            </label>
            <input
              id="rr-disk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={diskGb}
              onChange={(event) => setDiskGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-plan">
              Railway plan
            </label>
            <select
              id="rr-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              value={railwayPlanId}
              onChange={(event) => setRailwayPlanId(event.target.value)}
            >
              {RAILWAY_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.label}
                </option>
              ))}
            </select>
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
              Cheapest monthly cost for this workload
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline.amount}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{headline.note}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Render vs Railway comparison"
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

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Render
            </h2>
            {!hasError && !result.renderFits ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{result.renderNote}</p>
            ) : null}
            <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
              {renderRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Railway
            </h2>
            <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
              {railwayRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Based on each provider&apos;s published price list. Databases, extra services, replicas and
        team seats are billed separately on both platforms, and prices change — confirm against the
        live pricing pages before committing.
      </p>
    </main>
  );
}
