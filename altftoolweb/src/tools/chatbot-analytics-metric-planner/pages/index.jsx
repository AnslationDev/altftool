"use client";

import { useMemo, useState } from "react";
import { BarChart3, Check, Copy, RotateCcw } from "lucide-react";

import { METRIC_DEFINITIONS, computeMetricPlan } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const count = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const percent = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  conversations: "10000",
  containment: "65",
  cost: "120",
  tracked: ["containment", "escalation", "deflection", "csat"],
};

const DASH = "—";

export default function ToolHome() {
  const [conversations, setConversations] = useState(DEFAULTS.conversations);
  const [containment, setContainment] = useState(DEFAULTS.containment);
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [tracked, setTracked] = useState(DEFAULTS.tracked);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeMetricPlan({
        monthlyConversations:
          conversations.trim() === "" ? Number.NaN : Number(conversations),
        expectedContainmentPct:
          containment.trim() === "" ? Number.NaN : Number(containment),
        costPerHumanContact: cost.trim() === "" ? 0 : Number(cost),
      }),
    [conversations, containment, cost],
  );

  const hasError = Boolean(result.error);

  const trackedMetrics = METRIC_DEFINITIONS.filter((metric) =>
    tracked.includes(metric.id),
  );

  const toggleMetric = (id) => {
    setTracked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Chatbot analytics metric plan",
      `Expected bot conversations: ${count(result.monthlyConversations)} / month`,
      `Target containment rate: ${percent(result.containmentPct)}`,
      `Implied escalation rate: ${percent(result.escalationRatePct)}`,
      `Deflected contacts: ${count(result.deflectedPerMonth)} / month`,
      `Escalated to a human: ${count(result.escalatedPerMonth)} / month`,
      `Projected saving: ${money(result.monthlySavings)} / month, ${money(result.annualSavings)} / year`,
      "",
      "Metrics instrumented before launch:",
      ...trackedMetrics.map(
        (metric) => `- ${metric.label} = ${metric.formula}`,
      ),
    ];
    return lines.join("\n");
  }, [hasError, result, trackedMetrics]);

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
    setConversations(DEFAULTS.conversations);
    setContainment(DEFAULTS.containment);
    setCost(DEFAULTS.cost);
    setTracked(DEFAULTS.tracked);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Escalated to a human", DASH],
        ["Implied escalation rate", DASH],
        ["Cost per human contact", DASH],
        ["Projected saving per month", DASH],
        ["Projected saving per year", DASH],
      ]
    : [
        ["Escalated to a human", `${count(result.escalatedPerMonth)} / month`],
        ["Implied escalation rate", percent(result.escalationRatePct)],
        ["Cost per human contact", money(result.costPerHumanContact)],
        ["Projected saving per month", money(result.monthlySavings)],
        ["Projected saving per year", money(result.annualSavings)],
        ["Metrics instrumented", `${trackedMetrics.length} of ${METRIC_DEFINITIONS.length}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Pre-launch plan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Chatbot Analytics Metric Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose the containment, CSAT and deflection metrics you will instrument before the bot
          goes live, then project how many contacts it deflects and what that is worth.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cam-conversations">
              Expected bot conversations per month
            </label>
            <input
              id="cam-conversations"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={conversations}
              onChange={(event) => setConversations(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cam-containment">
              Target containment rate (%)
            </label>
            <input
              id="cam-containment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={containment}
              onChange={(event) => setContainment(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cam-cost">
              Fully loaded cost of one human-handled contact (INR)
            </label>
            <input
              id="cam-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Agent time, tooling and overhead divided by contacts handled. Enter 0 to skip the
              savings projection and plan metrics only.
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
              Contacts deflected each month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : count(result.deflectedPerMonth)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a projection."
                : `${percent(result.containmentPct)} of ${count(result.monthlyConversations)} conversations resolved without a human handoff.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the chatbot metric plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
        <h2 className="text-base font-semibold">Metrics to instrument before launch</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick the ones your analytics will capture from day one. Retrofitting a definition later
          breaks the trend line.
        </p>
        <ul className="mt-4 space-y-3">
          {METRIC_DEFINITIONS.map((metric) => {
            const inputId = `cam-metric-${metric.id}`;
            return (
              <li
                key={metric.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3"
                  htmlFor={inputId}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={tracked.includes(metric.id)}
                    onChange={() => toggleMetric(metric.id)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[var(--foreground)]">
                      {metric.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {metric.formula}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                      Watch out: {metric.pitfall}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The savings projection assumes every contained conversation replaces one human contact,
        which is an upper bound — validate it against your contact volume in the months before
        launch and discount accordingly.
      </p>
    </main>
  );
}
