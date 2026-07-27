"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  DEFAULT_PEAK_TO_AVERAGE_RATIO,
  DEFAULT_REDUNDANCY_INSTANCES,
  DEFAULT_TARGET_UTILIZATION_PERCENT,
  computeHeadroom,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  baseline: "200",
  ratio: String(DEFAULT_PEAK_TO_AVERAGE_RATIO),
  spike: "4",
  growth: "20",
  perInstance: "250",
  utilization: String(DEFAULT_TARGET_UTILIZATION_PERCENT),
  current: "8",
  redundancy: String(DEFAULT_REDUNDANCY_INSTANCES),
};

const DASH = "—";

const num = (value) => (value.trim() === "" ? Number.NaN : Number(value));

export default function ToolHome() {
  const [baseline, setBaseline] = useState(DEFAULTS.baseline);
  const [ratio, setRatio] = useState(DEFAULTS.ratio);
  const [spike, setSpike] = useState(DEFAULTS.spike);
  const [growth, setGrowth] = useState(DEFAULTS.growth);
  const [perInstance, setPerInstance] = useState(DEFAULTS.perInstance);
  const [utilization, setUtilization] = useState(DEFAULTS.utilization);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [redundancy, setRedundancy] = useState(DEFAULTS.redundancy);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeHeadroom({
        baselineRps: num(baseline),
        peakToAverageRatio: num(ratio),
        spikeMultiplier: num(spike),
        growthPercent: growth.trim() === "" ? 0 : Number(growth),
        perInstanceRps: num(perInstance),
        targetUtilizationPercent: num(utilization),
        currentInstances: current.trim() === "" ? 0 : Number(current),
        redundancyInstances: redundancy.trim() === "" ? 0 : Number(redundancy),
      }),
    [baseline, ratio, spike, growth, perInstance, utilization, current, redundancy],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Peak traffic headroom plan",
      `Projected peak: ${NUM.format(result.projectedPeakRps)} req/s`,
      `Required capacity at ${NUM.format(result.targetUtilizationPercent)}% peak utilization: ${NUM.format(result.requiredCapacityRps)} req/s`,
      `Instances for load: ${NUM.format(result.instancesForLoad)} (+${NUM.format(result.redundancyInstances)} redundancy = ${NUM.format(result.instancesRecommended)})`,
      `Current fleet: ${NUM.format(result.currentInstances)} instances = ${NUM.format(result.currentCapacityRps)} req/s`,
      result.currentHeadroomPercent === null
        ? "Current headroom: n/a (no instances entered)"
        : `Current headroom at projected peak: ${NUM1.format(result.currentHeadroomPercent)}%`,
      `Additional instances needed: ${NUM.format(result.additionalInstancesNeeded)}`,
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
    setBaseline(DEFAULTS.baseline);
    setRatio(DEFAULTS.ratio);
    setSpike(DEFAULTS.spike);
    setGrowth(DEFAULTS.growth);
    setPerInstance(DEFAULTS.perInstance);
    setUtilization(DEFAULTS.utilization);
    setCurrent(DEFAULTS.current);
    setRedundancy(DEFAULTS.redundancy);
    setCopied(false);
  };

  const fields = [
    {
      id: "pth-baseline",
      label: "Baseline average traffic (req/s)",
      value: baseline,
      set: setBaseline,
      step: "10",
      hint: "Normal-day average from your monitoring, not the peak.",
    },
    {
      id: "pth-ratio",
      label: "Daily peak-to-average ratio",
      value: ratio,
      set: setRatio,
      step: "0.1",
      hint: "Daily peak divided by daily average. Consumer traffic is often 2-3.",
    },
    {
      id: "pth-spike",
      label: "Event spike multiplier",
      value: spike,
      set: setSpike,
      step: "0.5",
      hint: "How much bigger the sale-day or viral peak is than a normal peak. 1 = no event.",
    },
    {
      id: "pth-growth",
      label: "Growth until the event (%)",
      value: growth,
      set: setGrowth,
      step: "5",
      hint: "Organic traffic growth expected between now and the event.",
    },
    {
      id: "pth-per-instance",
      label: "Capacity of one instance (req/s)",
      value: perInstance,
      set: setPerInstance,
      step: "10",
      hint: "Sustainable throughput at acceptable latency, measured with a load test.",
    },
    {
      id: "pth-utilization",
      label: "Target peak utilization (%)",
      value: utilization,
      set: setUtilization,
      step: "5",
      hint: "How hot you are willing to run at peak. 60% is a common latency-safe target.",
    },
    {
      id: "pth-current",
      label: "Instances running today",
      value: current,
      set: setCurrent,
      step: "1",
      hint: "Used for the gap analysis. Leave 0 to size from scratch.",
    },
    {
      id: "pth-redundancy",
      label: "Redundancy instances (N+R)",
      value: redundancy,
      set: setRedundancy,
      step: "1",
      hint: "Extra instances so losing one mid-spike does not eat the buffer. N+1 is typical.",
    },
  ];

  const rows = hasError
    ? [
        ["Projected peak load", DASH],
        ["Required capacity", DASH],
        ["Instances for load", DASH],
        ["Current headroom at peak", DASH],
        ["Additional instances needed", DASH],
      ]
    : [
        ["Projected peak load", `${NUM.format(result.projectedPeakRps)} req/s`],
        [
          `Required capacity at ${NUM.format(result.targetUtilizationPercent)}% utilization`,
          `${NUM.format(result.requiredCapacityRps)} req/s`,
        ],
        [
          "Instances for load + redundancy",
          `${NUM.format(result.instancesForLoad)} + ${NUM.format(result.redundancyInstances)}`,
        ],
        [
          "Current fleet capacity",
          result.currentCapacityRps > 0 ? `${NUM.format(result.currentCapacityRps)} req/s` : DASH,
        ],
        [
          "Current headroom at projected peak",
          result.currentHeadroomPercent === null
            ? DASH
            : `${NUM1.format(result.currentHeadroomPercent)}%`,
        ],
        [
          "Peak utilization of current fleet",
          result.currentPeakUtilizationPercent === null
            ? DASH
            : `${NUM1.format(result.currentPeakUtilizationPercent)}%`,
        ],
        [
          "Largest spike current fleet absorbs",
          result.maxSpikeAbsorbable === null ? DASH : `${NUM2.format(result.maxSpikeAbsorbable)}x`,
        ],
        ["Additional instances needed", NUM.format(result.additionalInstancesNeeded)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Capacity planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Peak Traffic Headroom Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Project the request rate a sale day or viral spike will produce, then size your fleet so
          that peak lands at a safe utilization — with N+1 redundancy on top.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{field.hint}</p>
            </div>
          ))}
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
              Instances to run for the event
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.instancesRecommended)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.meetsTarget
                  ? "Your current fleet already meets the target with redundancy."
                  : `Load needs ${NUM.format(result.instancesForLoad)} instances at ${NUM.format(result.targetUtilizationPercent)}% peak utilization, plus ${NUM.format(result.redundancyInstances)} for failure tolerance.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the capacity plan result"
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
        Planning estimate only. Per-instance capacity should come from a load test against
        production-like data, and autoscaling still needs pre-warming for step spikes — most
        autoscalers react in minutes while a flash sale arrives in seconds.
      </p>
    </main>
  );
}
