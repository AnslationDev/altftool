"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Router } from "lucide-react";

import {
  HOURS_PER_MONTH,
  NAT_DATA_PROCESSING_PER_GB,
  NAT_HOURLY_RATE,
  computeNatGatewayCost,
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
  gatewayCount: "3",
  dataProcessedGb: "1000",
  internetEgressGb: "500",
  hoursPerMonth: String(HOURS_PER_MONTH),
};

const DASH = "—";

export default function ToolHome() {
  const [gatewayCount, setGatewayCount] = useState(DEFAULTS.gatewayCount);
  const [dataProcessedGb, setDataProcessedGb] = useState(DEFAULTS.dataProcessedGb);
  const [internetEgressGb, setInternetEgressGb] = useState(DEFAULTS.internetEgressGb);
  const [hoursPerMonth, setHoursPerMonth] = useState(DEFAULTS.hoursPerMonth);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeNatGatewayCost({
        gatewayCount: gatewayCount.trim() === "" ? Number.NaN : Number(gatewayCount),
        dataProcessedGb: dataProcessedGb.trim() === "" ? 0 : Number(dataProcessedGb),
        internetEgressGb: internetEgressGb.trim() === "" ? 0 : Number(internetEgressGb),
        hoursPerMonth: hoursPerMonth.trim() === "" ? HOURS_PER_MONTH : Number(hoursPerMonth),
      }),
    [gatewayCount, dataProcessedGb, internetEgressGb, hoursPerMonth],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AWS NAT gateway monthly cost estimate (us-east-1 list prices)",
      `Gateways: ${NUM.format(result.gatewayCount)} × ${NUM.format(result.hours)} h`,
      `Hourly charges: ${money(result.hourlyCost)}`,
      `Data processing (${NUM.format(Number(dataProcessedGb) || 0)} GB @ $${NAT_DATA_PROCESSING_PER_GB}/GB): ${money(result.processingCost)}`,
      `Internet egress on top: ${money(result.egressCost)}`,
      `Total per month: ${money(result.total)}`,
    ].join("\n");
  }, [hasError, result, dataProcessedGb]);

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
    setGatewayCount(DEFAULTS.gatewayCount);
    setDataProcessedGb(DEFAULTS.dataProcessedGb);
    setInternetEgressGb(DEFAULTS.internetEgressGb);
    setHoursPerMonth(DEFAULTS.hoursPerMonth);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Hourly charges", DASH],
        ["Data processing", DASH],
        ["Internet egress on top", DASH],
        ["Effective cost per GB moved", DASH],
      ]
    : [
        [
          `Hourly charges (${NUM.format(result.gatewayCount)} × ${money(result.hourlyCostPerGateway)})`,
          money(result.hourlyCost),
        ],
        [
          `Data processing (total ${NUM.format(Number(dataProcessedGb) || 0)} GB × $${NAT_DATA_PROCESSING_PER_GB.toFixed(3)}/GB)`,
          money(result.processingCost),
        ],
        ["Internet egress on top (after 100 GB free)", money(result.egressCost)],
        ["Effective cost per GB moved", money(result.effectivePerGb)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Router className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AWS NAT Gateway Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A NAT gateway bills ${NAT_HOURLY_RATE}/hour just for existing plus $
          {NAT_DATA_PROCESSING_PER_GB}/GB on every byte it processes (us-east-1). Traffic that then
          exits to the internet pays standard data-transfer-out on top — this tool adds all three.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nat-count">
              NAT gateways (usually one per AZ)
            </label>
            <input
              id="nat-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={gatewayCount}
              onChange={(event) => setGatewayCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nat-hours">
              Hours running per month
            </label>
            <input
              id="nat-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="744"
              step="1"
              value={hoursPerMonth}
              onChange={(event) => setHoursPerMonth(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              730 is a full month by AWS convention.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nat-data">
              Total data processed per month, all gateways combined (GB)
            </label>
            <input
              id="nat-data"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={dataProcessedGb}
              onChange={(event) => setDataProcessedGb(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Sum across every NAT gateway — this is a total, not per-gateway like the hourly
              charge above.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nat-egress">
              Of which exits to the internet (GB)
            </label>
            <input
              id="nat-egress"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={internetEgressGb}
              onChange={(event) => setInternetEgressGb(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Set 0 if traffic stays inside AWS (e.g. to S3 via the gateway instead of an endpoint).
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              True monthly NAT cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Hourly + data processing + internet egress, us-east-1 list prices."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the NAT gateway cost estimate"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Ways teams cut this bill</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          <li>
            Add gateway VPC endpoints for S3 and DynamoDB — that traffic then bypasses the NAT
            gateway and its ${NAT_DATA_PROCESSING_PER_GB}/GB processing charge entirely, free of
            charge.
          </li>
          <li>
            Use interface endpoints (PrivateLink) for chatty AWS APIs; at $0.01/GB they beat the NAT
            path once volume is meaningful.
          </li>
          <li>
            In dev environments, one NAT gateway shared across AZs saves the extra hourly charges in
            exchange for cross-AZ transfer risk.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate using published us-east-1 on-demand rates. Cross-AZ data transfer to
        reach the gateway, other regions and price changes are not included — confirm with the AWS
        Pricing Calculator and your Cost Explorer data.
      </p>
    </main>
  );
}
