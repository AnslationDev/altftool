"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, MailOpen, RotateCcw } from "lucide-react";
import { RATE_BASIS, compareToBenchmark, computeCampaignMetrics, countNeededForRate } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const PCT3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

const DEFAULTS = {
  sent: "12000",
  bounces: "180",
  uniqueOpens: "4100",
  uniqueClicks: "640",
  unsubscribes: "38",
  complaints: "9",
  machineOpens: "1400",
  benchmark: "30",
  targetOpenRate: "40",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const pct = (value, formatter = PCT) => (value === null || value === undefined ? "—" : `${formatter.format(value)}%`);

export default function ToolHome() {
  const [sent, setSent] = useState(DEFAULTS.sent);
  const [bounces, setBounces] = useState(DEFAULTS.bounces);
  const [uniqueOpens, setUniqueOpens] = useState(DEFAULTS.uniqueOpens);
  const [uniqueClicks, setUniqueClicks] = useState(DEFAULTS.uniqueClicks);
  const [unsubscribes, setUnsubscribes] = useState(DEFAULTS.unsubscribes);
  const [complaints, setComplaints] = useState(DEFAULTS.complaints);
  const [machineOpens, setMachineOpens] = useState(DEFAULTS.machineOpens);
  const [benchmark, setBenchmark] = useState(DEFAULTS.benchmark);
  const [targetOpenRate, setTargetOpenRate] = useState(DEFAULTS.targetOpenRate);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  const metrics = useMemo(
    () =>
      computeCampaignMetrics({
        sent: toNumber(sent),
        bounces: toNumber(bounces),
        uniqueOpens: toNumber(uniqueOpens),
        uniqueClicks: toNumber(uniqueClicks),
        unsubscribes: toNumber(unsubscribes),
        complaints: toNumber(complaints),
        machineOpens: toNumber(machineOpens),
      }),
    [sent, bounces, uniqueOpens, uniqueClicks, unsubscribes, complaints, machineOpens],
  );

  const hasError = Boolean(metrics.error);
  const dash = "—";

  const comparison = useMemo(() => {
    if (hasError) return null;
    return compareToBenchmark({ value: metrics.openRate, benchmark: toNumber(benchmark) });
  }, [hasError, metrics, benchmark]);

  const target = useMemo(() => {
    if (hasError) return null;
    return countNeededForRate({
      targetRatePct: toNumber(targetOpenRate),
      delivered: metrics.delivered,
      currentCount: metrics.uniqueOpens,
    });
  }, [hasError, metrics, targetOpenRate]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Newsletter campaign metrics",
      `Sent ${NUM.format(metrics.sent)} · delivered ${NUM.format(metrics.delivered)} · bounced ${NUM.format(metrics.bounces)}`,
      `Open rate: ${pct(metrics.openRate)} of delivered`,
      `Adjusted open rate (machine opens removed): ${pct(metrics.adjustedOpenRate)}`,
      `Click rate: ${pct(metrics.clickRate)} · click-to-open: ${pct(metrics.clickToOpenRate)}`,
      `Bounce rate: ${pct(metrics.bounceRate)} of sent · delivery rate ${pct(metrics.deliveryRate)}`,
      `Unsubscribe rate: ${pct(metrics.unsubscribeRate, PCT3)} · complaint rate ${pct(metrics.complaintRate, PCT3)}`,
      comparison && !comparison.error
        ? `Versus benchmark: ${comparison.points >= 0 ? "+" : "−"}${PCT.format(Math.abs(comparison.points))} points (${comparison.direction})`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, metrics, comparison]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSent(DEFAULTS.sent);
    setBounces(DEFAULTS.bounces);
    setUniqueOpens(DEFAULTS.uniqueOpens);
    setUniqueClicks(DEFAULTS.uniqueClicks);
    setUnsubscribes(DEFAULTS.unsubscribes);
    setComplaints(DEFAULTS.complaints);
    setMachineOpens(DEFAULTS.machineOpens);
    setBenchmark(DEFAULTS.benchmark);
    setTargetOpenRate(DEFAULTS.targetOpenRate);
    setCopied(false);
  };

  const fields = [
    ["nl-sent", "Emails sent", sent, setSent, "1"],
    ["nl-bounces", "Bounces (hard + soft)", bounces, setBounces, "1"],
    ["nl-opens", "Unique opens", uniqueOpens, setUniqueOpens, "1"],
    ["nl-clicks", "Unique clicks", uniqueClicks, setUniqueClicks, "1"],
    ["nl-unsubs", "Unsubscribes", unsubscribes, setUnsubscribes, "1"],
    ["nl-complaints", "Spam complaints", complaints, setComplaints, "1"],
    ["nl-machine", "Machine / privacy-proxy opens", machineOpens, setMachineOpens, "1"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailOpen className="h-4 w-4" aria-hidden="true" />
          Email analytics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Newsletter Open Rate Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn campaign counts into open, click, click-to-open, bounce, unsubscribe and complaint rates —
          each on its correct denominator — plus an open rate adjusted for privacy-proxy opens.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="nl-benchmark">
              Your benchmark open rate (%)
            </label>
            <input
              id="nl-benchmark"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={benchmark}
              onChange={(event) => setBenchmark(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nl-target">
              Target open rate for the next send (%)
            </label>
            <input
              id="nl-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={targetOpenRate}
              onChange={(event) => setTargetOpenRate(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {metrics.error}
        </p>
      ) : null}

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Open rate (of {RATE_BASIS.open})
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : pct(metrics.openRate)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${NUM.format(metrics.uniqueOpens)} opens from ${NUM.format(metrics.delivered)} delivered`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the campaign metrics" className={GHOST_BTN}>
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
          {[
            ["Delivered", hasError ? dash : NUM.format(metrics.delivered)],
            [`Delivery rate (of ${RATE_BASIS.bounce})`, hasError ? dash : pct(metrics.deliveryRate)],
            [`Bounce rate (of ${RATE_BASIS.bounce})`, hasError ? dash : pct(metrics.bounceRate)],
            [
              "Adjusted open rate (machine opens removed)",
              hasError ? dash : pct(metrics.adjustedOpenRate),
            ],
            [`Click rate (of ${RATE_BASIS.click})`, hasError ? dash : pct(metrics.clickRate)],
            [`Click-to-open rate (of ${RATE_BASIS.clickToOpen})`, hasError ? dash : pct(metrics.clickToOpenRate)],
            [`Unsubscribe rate (of ${RATE_BASIS.unsubscribe})`, hasError ? dash : pct(metrics.unsubscribeRate, PCT3)],
            [`Complaint rate (of ${RATE_BASIS.complaint})`, hasError ? dash : pct(metrics.complaintRate, PCT3)],
            [
              "Versus your benchmark",
              hasError || !comparison || comparison.error
                ? dash
                : `${comparison.points >= 0 ? "+" : "−"}${PCT.format(Math.abs(comparison.points))} points ${comparison.direction}${
                    comparison.relativePct === null ? "" : ` (${PCT.format(Math.abs(comparison.relativePct))}% relative)`
                  }`,
            ],
            [
              "Opens needed for your target",
              hasError || !target || target.error
                ? dash
                : target.alreadyMet
                  ? "already met"
                  : `${NUM.format(Math.ceil(target.needed))} total · ${NUM.format(Math.ceil(target.extra))} more`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && metrics.flags.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {metrics.flags.map((flag) => (
              <li key={flag}>• {flag}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Open tracking relies on a pixel, so the raw figure counts privacy-proxy prefetches as opens and misses
        readers who block images. Treat clicks and click-to-open as the sturdier signals, and compare
        campaigns with each other rather than against a headline industry average.
      </p>
    </main>
  );
}
