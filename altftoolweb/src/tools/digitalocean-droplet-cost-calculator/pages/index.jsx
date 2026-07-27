"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { BILLING_HOURS_CAP, DROPLET_PLANS, estimateDropletCost } from "../lib";

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
  planId: "s-2-4",
  dropletCount: "2",
  hours: String(BILLING_HOURS_CAP),
  volumeGb: "100",
  snapshotGb: "50",
  lbNodes: "1",
  outboundGb: "9000",
};

const DASH = "—";

export default function ToolHome() {
  const [planId, setPlanId] = useState(DEFAULTS.planId);
  const [dropletCount, setDropletCount] = useState(DEFAULTS.dropletCount);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [volumeGb, setVolumeGb] = useState(DEFAULTS.volumeGb);
  const [snapshotGb, setSnapshotGb] = useState(DEFAULTS.snapshotGb);
  const [lbNodes, setLbNodes] = useState(DEFAULTS.lbNodes);
  const [outboundGb, setOutboundGb] = useState(DEFAULTS.outboundGb);
  const [copied, setCopied] = useState(false);

  const asNumber = (value) => (value.trim() === "" ? Number.NaN : Number(value));

  const result = useMemo(
    () =>
      estimateDropletCost({
        planId,
        dropletCount: asNumber(dropletCount),
        hoursPerDroplet: asNumber(hours),
        volumeGb: asNumber(volumeGb),
        snapshotGb: asNumber(snapshotGb),
        lbNodes: asNumber(lbNodes),
        outboundGb: asNumber(outboundGb),
      }),
    [planId, dropletCount, hours, volumeGb, snapshotGb, lbNodes, outboundGb],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "DigitalOcean monthly cost estimate",
      `Droplets: ${result.dropletCount} × ${result.plan} = ${money(result.dropletCost)}`,
      `Volumes: ${volumeGb} GB = ${money(result.volumeCost)}`,
      `Snapshots: ${snapshotGb} GB = ${money(result.snapshotCost)}`,
      `Load balancer: ${money(result.lbCost)}`,
      `Bandwidth overage: ${NUM.format(result.overageGb)} GB over the ${NUM.format(result.pooledAllowanceGb)} GB pool = ${money(result.bandwidthOverage)}`,
      `Estimated monthly total: ${money(result.total)}`,
    ].join("\n");
  }, [hasError, result, volumeGb, snapshotGb]);

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
    setDropletCount(DEFAULTS.dropletCount);
    setHours(DEFAULTS.hours);
    setVolumeGb(DEFAULTS.volumeGb);
    setSnapshotGb(DEFAULTS.snapshotGb);
    setLbNodes(DEFAULTS.lbNodes);
    setOutboundGb(DEFAULTS.outboundGb);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Droplets", DASH],
        ["Volumes", DASH],
        ["Snapshots", DASH],
        ["Load balancer", DASH],
        ["Bandwidth overage", DASH],
        ["Estimated yearly cost", DASH],
      ]
    : [
        [
          `Droplets (${result.dropletCount} × ${money(result.planUsd)}, ${NUM.format(result.hoursBilled)} h)`,
          money(result.dropletCost),
        ],
        ["Volumes ($0.10/GB/mo)", money(result.volumeCost)],
        ["Snapshots ($0.06/GB/mo)", money(result.snapshotCost)],
        ["Load balancer ($12/node/mo)", money(result.lbCost)],
        [
          `Bandwidth overage (${NUM.format(result.overageGb)} GB over ${NUM.format(result.pooledAllowanceGb)} GB pool @ $0.01/GB)`,
          money(result.bandwidthOverage),
        ],
        ["Estimated yearly cost", money(result.yearlyTotal)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          DigitalOcean Droplet Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price your droplets, block storage volumes, snapshots and load balancer together, with
          the pooled bandwidth allowance and the $0.01/GB overage worked out for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="do-plan">
              Droplet plan (Basic, regular SSD)
            </label>
            <select
              id="do-plan"
              className={`mt-2 ${INPUT_CLASS}`}
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
            >
              {DROPLET_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.label} — {money(plan.usd)}/mo
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="do-count">
              Number of droplets
            </label>
            <input
              id="do-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={dropletCount}
              onChange={(event) => setDropletCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="do-hours">
              Hours each droplet runs (672 = full month)
            </label>
            <input
              id="do-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={BILLING_HOURS_CAP}
              step="24"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="do-volume">
              Block storage volumes (GB)
            </label>
            <input
              id="do-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={volumeGb}
              onChange={(event) => setVolumeGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="do-snapshot">
              Snapshot data (GB)
            </label>
            <input
              id="do-snapshot"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={snapshotGb}
              onChange={(event) => setSnapshotGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="do-lb">
              Load balancer nodes (small)
            </label>
            <input
              id="do-lb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={lbNodes}
              onChange={(event) => setLbNodes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="do-outbound">
              Outbound transfer used per month (GB)
            </label>
            <input
              id="do-outbound"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={outboundGb}
              onChange={(event) => setOutboundGb(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Each droplet adds its transfer allowance to one account-wide pool; only usage beyond
              the pool is billed at $0.01/GB. Inbound transfer is free.
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
              Estimated monthly bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Droplets bill hourly at 1/672 of the monthly price and cap at ${NUM.format(BILLING_HOURS_CAP)} hours.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the DigitalOcean cost estimate"
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
        Estimate based on DigitalOcean&apos;s published Basic droplet, volume, snapshot and load
        balancer prices. Premium CPU, dedicated-CPU droplets, backups and managed databases are
        priced separately — confirm against the live pricing page before budgeting.
      </p>
    </main>
  );
}
