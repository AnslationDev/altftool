"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Triangle } from "lucide-react";

import {
  BANDWIDTH_OVERAGE_PER_GB,
  EDGE_REQUEST_OVERAGE_PER_M,
  FUNCTION_DURATION_OVERAGE_PER_GB_HOUR,
  INCLUDED_BANDWIDTH_GB,
  INCLUDED_BUILD_MINUTES,
  INCLUDED_EDGE_REQUESTS_M,
  INCLUDED_FUNCTION_GB_HOURS,
  INCLUDED_INVOCATIONS_M,
  INVOCATION_OVERAGE_PER_M,
  SEAT_PRICE,
  computeVercelCost,
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
  seats: "2",
  bandwidthGb: "1500",
  edgeRequestsM: "15",
  invocationsM: "3",
  functionGbHours: "1200",
  buildMinutes: "8000",
};

const DASH = "—";

export default function ToolHome() {
  const [seats, setSeats] = useState(DEFAULTS.seats);
  const [bandwidthGb, setBandwidthGb] = useState(DEFAULTS.bandwidthGb);
  const [edgeRequestsM, setEdgeRequestsM] = useState(DEFAULTS.edgeRequestsM);
  const [invocationsM, setInvocationsM] = useState(DEFAULTS.invocationsM);
  const [functionGbHours, setFunctionGbHours] = useState(DEFAULTS.functionGbHours);
  const [buildMinutes, setBuildMinutes] = useState(DEFAULTS.buildMinutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeVercelCost({
        seats: seats.trim() === "" ? Number.NaN : Number(seats),
        bandwidthGb: bandwidthGb.trim() === "" ? 0 : Number(bandwidthGb),
        edgeRequestsM: edgeRequestsM.trim() === "" ? 0 : Number(edgeRequestsM),
        invocationsM: invocationsM.trim() === "" ? 0 : Number(invocationsM),
        functionGbHours: functionGbHours.trim() === "" ? 0 : Number(functionGbHours),
        buildMinutes: buildMinutes.trim() === "" ? 0 : Number(buildMinutes),
      }),
    [seats, bandwidthGb, edgeRequestsM, invocationsM, functionGbHours, buildMinutes],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Vercel Pro monthly cost estimate (list prices)",
      `Seats: ${money(result.seatCost)}`,
      `Fast data transfer overage: ${money(result.bandwidthCost)}`,
      `Edge request overage: ${money(result.edgeRequestCost)}`,
      `Function invocation overage: ${money(result.invocationCost)}`,
      `Function duration overage: ${money(result.durationCost)}`,
      `Total per month: ${money(result.total)}`,
      result.buildWithinPlan
        ? "Build minutes: within the included allowance"
        : `Build minutes: ${NUM.format(result.buildMinutesOver)} over the included allowance`,
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
    setSeats(DEFAULTS.seats);
    setBandwidthGb(DEFAULTS.bandwidthGb);
    setEdgeRequestsM(DEFAULTS.edgeRequestsM);
    setInvocationsM(DEFAULTS.invocationsM);
    setFunctionGbHours(DEFAULTS.functionGbHours);
    setBuildMinutes(DEFAULTS.buildMinutes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Seats", DASH],
        ["Fast data transfer overage", DASH],
        ["Edge request overage", DASH],
        ["Function invocation overage", DASH],
        ["Function duration overage", DASH],
      ]
    : [
        [`Seats (${NUM.format(Number(seats))} × $${SEAT_PRICE})`, money(result.seatCost)],
        [
          `Fast data transfer over ${NUM.format(INCLUDED_BANDWIDTH_GB)} GB @ $${BANDWIDTH_OVERAGE_PER_GB}/GB`,
          money(result.bandwidthCost),
        ],
        [
          `Edge requests over ${INCLUDED_EDGE_REQUESTS_M}M @ $${EDGE_REQUEST_OVERAGE_PER_M}/M`,
          money(result.edgeRequestCost),
        ],
        [
          `Invocations over ${INCLUDED_INVOCATIONS_M}M @ $${INVOCATION_OVERAGE_PER_M}/M`,
          money(result.invocationCost),
        ],
        [
          `Duration over ${NUM.format(INCLUDED_FUNCTION_GB_HOURS)} GB-hr @ $${FUNCTION_DURATION_OVERAGE_PER_GB_HOUR}/GB-hr`,
          money(result.durationCost),
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Triangle className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vercel Usage Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Vercel Pro charges ${SEAT_PRICE}/seat plus metered overages once you pass the included
          allowances — 1 TB fast data transfer, 10M edge requests, 1M function invocations and
          1,000 GB-hours of function duration per team per month.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-seats">
              Team seats
            </label>
            <input
              id="vc-seats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={seats}
              onChange={(event) => setSeats(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-bandwidth">
              Fast data transfer (GB/month)
            </label>
            <input
              id="vc-bandwidth"
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
            <label className={LABEL_CLASS} htmlFor="vc-edge">
              Edge requests (millions/month)
            </label>
            <input
              id="vc-edge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={edgeRequestsM}
              onChange={(event) => setEdgeRequestsM(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-invocations">
              Function invocations (millions/month)
            </label>
            <input
              id="vc-invocations"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={invocationsM}
              onChange={(event) => setInvocationsM(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-duration">
              Function duration (GB-hours/month)
            </label>
            <input
              id="vc-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={functionGbHours}
              onChange={(event) => setFunctionGbHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-builds">
              Build minutes per month
            </label>
            <input
              id="vc-builds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={buildMinutes}
              onChange={(event) => setBuildMinutes(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Pro includes {NUM.format(INCLUDED_BUILD_MINUTES)} standard build minutes per month.
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

      {!hasError && !result.buildWithinPlan ? (
        <p className="mt-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
          Build usage exceeds the included {NUM.format(INCLUDED_BUILD_MINUTES)} minutes by{" "}
          {NUM.format(result.buildMinutesOver)} minutes — that requires enhanced build machines or
          on-demand concurrency, billed separately by Vercel.
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly Vercel bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Pro plan list prices; usage-based add-ons not shown are extra."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Vercel cost estimate"
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
        Informational estimate based on Vercel's published Pro plan pricing. Other metered products
        (ISR reads/writes, image optimization, KV, Postgres, monitoring), spend caps and Enterprise
        pricing are not modelled — check your Vercel usage dashboard for the authoritative numbers.
      </p>
    </main>
  );
}
