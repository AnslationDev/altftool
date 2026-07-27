"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Radar, RotateCcw } from "lucide-react";

import {
  AGENT_TRAITS,
  AVG_TRACE_KB,
  DATA_CLASSES,
  TIER_LABEL,
  buildChecklist,
  buildRedactionPlan,
  buildSummary,
  computeSamplingPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULT_TRAITS = ["tools", "pii"];
const DEFAULT_DONE = ["root-span", "llm-span", "structured-logs", "latency"];
const DEFAULT_CLASSES = ["email", "freetext", "secret"];
const DEFAULT_TRAFFIC = { runs: "25000", budget: "5000", retention: "30", traceKb: String(AVG_TRACE_KB) };

const TIER_STYLE = {
  required: "text-[var(--danger)]",
  recommended: "text-[var(--warning)]",
  optional: "text-[var(--muted-foreground)]",
};

const TONE_STYLE = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

function toggle(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function ToolHome() {
  const [traits, setTraits] = useState(DEFAULT_TRAITS);
  const [done, setDone] = useState(DEFAULT_DONE);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [runs, setRuns] = useState(DEFAULT_TRAFFIC.runs);
  const [budget, setBudget] = useState(DEFAULT_TRAFFIC.budget);
  const [retention, setRetention] = useState(DEFAULT_TRAFFIC.retention);
  const [traceKb, setTraceKb] = useState(DEFAULT_TRAFFIC.traceKb);
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(() => buildChecklist({ traits, done }), [traits, done]);
  const sampling = useMemo(
    () =>
      computeSamplingPlan({
        requestsPerDay: runs,
        targetTracesPerDay: budget,
        retentionDays: retention,
        avgTraceKb: traceKb,
      }),
    [runs, budget, retention, traceKb]
  );
  const redaction = useMemo(() => buildRedactionPlan(classes), [classes]);

  const summary = useMemo(
    () => buildSummary({ traits, checklist, sampling, redaction }),
    [traits, checklist, sampling, redaction]
  );

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
    setTraits(DEFAULT_TRAITS);
    setDone(DEFAULT_DONE);
    setClasses(DEFAULT_CLASSES);
    setRuns(DEFAULT_TRAFFIC.runs);
    setBudget(DEFAULT_TRAFFIC.budget);
    setRetention(DEFAULT_TRAFFIC.retention);
    setTraceKb(DEFAULT_TRAFFIC.traceKb);
    setCopied(false);
  };

  const failed = Boolean(checklist.error);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Radar className="h-4 w-4" aria-hidden="true" />
          Agent telemetry
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Agent Observability Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick what your agent does, tick what you already emit, and get a weighted readiness score,
          a sampling plan and a redaction table — built on the OpenTelemetry gen_ai.* conventions.
        </p>
      </header>

      <section className={CARD} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="text-base font-semibold">
          1. What does this agent do?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each trait escalates the signals it makes risky to skip.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {AGENT_TRAITS.map((trait) => (
            <label
              key={trait.id}
              htmlFor={`trait-${trait.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
            >
              <input
                id={`trait-${trait.id}`}
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={traits.includes(trait.id)}
                onChange={() => setTraits((prev) => toggle(prev, trait.id))}
              />
              <span>
                <span className="block text-sm font-semibold">{trait.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">{trait.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {checklist.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-labelledby="score-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Observability readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? dash : `${checklist.score}%`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${failed ? "text-[var(--muted-foreground)]" : TONE_STYLE[checklist.band.tone]}`}
            >
              {failed ? dash : checklist.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the observability plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Signals in place", failed ? dash : `${checklist.doneTotal} of ${checklist.total}`],
            ["Required signals missing", failed ? dash : String(checklist.requiredGaps.length)],
            [
              "Required / recommended / optional",
              failed
                ? dash
                : `${checklist.counts.required} / ${checklist.counts.recommended} / ${checklist.counts.optional}`,
            ],
            [
              "Weakest pillar",
              failed
                ? dash
                : [...checklist.byPillar].sort((a, b) => a.score - b.score)[0].label,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Readiness ${checklist.score} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, checklist.score))}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {!failed && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="signals-heading">
          <h2 id="signals-heading" className="text-base font-semibold">
            2. Tick what you already emit
          </h2>
          <div className="mt-4 space-y-6">
            {checklist.byPillar.map((pillar) => (
              <div key={pillar.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{pillar.label}</h3>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {pillar.score}% covered
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{pillar.blurb}</p>
                <ul className="mt-3 space-y-2">
                  {pillar.items.map((item) => (
                    <li key={item.id}>
                      <label
                        htmlFor={`sig-${item.id}`}
                        className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                      >
                        <input
                          id={`sig-${item.id}`}
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                          checked={item.done}
                          onChange={() => setDone((prev) => toggle(prev, item.id))}
                        />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">{item.label}</span>
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wide ${TIER_STYLE[item.tier]}`}
                            >
                              {TIER_LABEL[item.tier]}
                              {item.escalated ? " (escalated)" : ""}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {item.detail}
                          </span>
                          {item.attribute ? (
                            <code className="mt-1 block break-words text-[11px] text-[var(--primary)]">
                              {item.attribute}
                            </code>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="sampling-heading">
        <h2 id="sampling-heading" className="text-base font-semibold">
          3. Sampling and storage budget
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-runs">
              Agent runs per day
            </label>
            <input
              id="obs-runs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={runs}
              onChange={(event) => setRuns(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-budget">
              Traces you want to keep per day
            </label>
            <input
              id="obs-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-retention">
              Retention (days)
            </label>
            <input
              id="obs-retention"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={retention}
              onChange={(event) => setRetention(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-kb">
              Average trace size (KB)
            </label>
            <input
              id="obs-kb"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={traceKb}
              onChange={(event) => setTraceKb(event.target.value)}
            />
          </div>
        </div>

        {sampling.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {sampling.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Head sampling rate", sampling.error ? dash : `${sampling.headRatePct}%`],
            [
              "Traces captured per day",
              sampling.error ? dash : NUM.format(sampling.sampledPerDay),
            ],
            ["Traces held at any time", sampling.error ? dash : NUM.format(sampling.storedTraces)],
            ["Estimated trace storage", sampling.error ? dash : `${sampling.storageGb} GB`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!sampling.error && (sampling.capped || sampling.floored) ? (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            {sampling.capped
              ? "Your traffic is below the budget, so keep 100% of runs — head sampling buys you nothing yet."
              : "That budget forces a very low head rate. Lean on tail sampling rules instead, or raise the budget."}
          </p>
        ) : null}

        {!sampling.error && (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {sampling.tailRules.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  +
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="redaction-heading">
        <h2 id="redaction-heading" className="text-base font-semibold">
          4. What flows through this agent?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Select the data classes your prompts, tool arguments or documents can contain.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {DATA_CLASSES.map((cls) => (
            <label
              key={cls.id}
              htmlFor={`cls-${cls.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm transition hover:border-[var(--primary)]"
            >
              <input
                id={`cls-${cls.id}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={classes.includes(cls.id)}
                onChange={() => setClasses((prev) => toggle(prev, cls.id))}
              />
              <span className="font-medium">{cls.label}</span>
            </label>
          ))}
        </div>

        {redaction.empty ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Nothing selected — no redaction plan to show.
          </p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Data class
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Handling
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Retention
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {redaction.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3">
                        <span className={row.never ? "font-semibold text-[var(--danger)]" : ""}>
                          {row.strategy}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {row.note}
                        </span>
                      </td>
                      <td className="py-2 text-right whitespace-nowrap">
                        {row.never ? "Never stored" : `${row.retentionDays} days`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Strictest retention window across the selected classes:{" "}
              <strong className="text-[var(--foreground)]">
                {redaction.strictestRetentionDays} days
              </strong>
              {redaction.neverLog.length
                ? ` · ${redaction.neverLog.length} class${redaction.neverLog.length === 1 ? "" : "es"} must never reach telemetry.`
                : ""}
            </p>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Retention defaults and redaction strategies here are engineering conventions, not legal
        advice. Confirm what your jurisdiction and contracts require with a privacy professional
        before shipping.
      </p>
    </main>
  );
}
