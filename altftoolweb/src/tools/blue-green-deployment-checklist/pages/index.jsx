"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import {
  APP_TYPES,
  MIGRATION_STRATEGIES,
  SESSION_STORES,
  SWITCH_MECHANISMS,
  buildCutoverPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  mechanism: "load-balancer",
  appType: "web-sessions",
  migrationStrategy: "expand-contract",
  sessionStore: "shared",
  dnsTtlSeconds: "60",
  rampSteps: "4",
  perStepSoakMinutes: "10",
  soakMinutes: "60",
  connectionDrainSeconds: "30",
  baselineErrorRatePct: "0.4",
  errorBudgetMultiplier: "3",
  baselineP95Ms: "350",
  latencyTolerancePct: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const DASH = "—";

// The checklist item lists are conditionally assembled from the form inputs
// (see lib.js phaseItems), so the item at a given array index is not a stable
// identity — it can change text entirely when a dropdown changes. Derive the
// "done" key from the item's own text instead of its position so a checked
// box never silently reattaches to a different, unreviewed item.
const itemKey = (phaseId, item) => {
  let hash = 0;
  for (let i = 0; i < item.length; i += 1) {
    hash = (hash * 31 + item.charCodeAt(i)) | 0;
  }
  return `${phaseId}-${(hash >>> 0).toString(36)}`;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState({});

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const plan = useMemo(
    () =>
      buildCutoverPlan({
        mechanism: form.mechanism,
        appType: form.appType,
        migrationStrategy: form.migrationStrategy,
        sessionStore: form.sessionStore,
        dnsTtlSeconds: toNumber(form.dnsTtlSeconds),
        rampSteps: toNumber(form.rampSteps),
        perStepSoakMinutes: toNumber(form.perStepSoakMinutes),
        soakMinutes: toNumber(form.soakMinutes),
        connectionDrainSeconds: toNumber(form.connectionDrainSeconds),
        baselineErrorRatePct: toNumber(form.baselineErrorRatePct),
        errorBudgetMultiplier: toNumber(form.errorBudgetMultiplier),
        baselineP95Ms: toNumber(form.baselineP95Ms),
        latencyTolerancePct: toNumber(form.latencyTolerancePct),
      }),
    [form],
  );

  const hasError = Boolean(plan.error);
  const mechanismNote = SWITCH_MECHANISMS.find((m) => m.id === form.mechanism)?.note ?? "";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(plan.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setDone({});
    setCopied(false);
  };

  const toggleDone = (key) => {
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = hasError
    ? 0
    : plan.phases.reduce(
        (sum, phase) => sum + phase.items.filter((item) => done[itemKey(phase.id, item)]).length,
        0,
      );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Release management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Blue Green Deployment Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe how traffic moves from blue to green and get an ordered cutover checklist with the
          DNS wait, the canary ramp, session and migration steps, and numeric rollback triggers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-mechanism">
              Traffic switch mechanism
            </label>
            <select
              id="bg-mechanism"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.mechanism}
              onChange={setField("mechanism")}
            >
              {SWITCH_MECHANISMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{mechanismNote}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-apptype">
              Workload type
            </label>
            <select
              id="bg-apptype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.appType}
              onChange={setField("appType")}
            >
              {APP_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-migration">
              Database migration strategy
            </label>
            <select
              id="bg-migration"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.migrationStrategy}
              onChange={setField("migrationStrategy")}
            >
              {MIGRATION_STRATEGIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-session">
              Session storage
            </label>
            <select
              id="bg-session"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sessionStore}
              onChange={setField("sessionStore")}
            >
              {SESSION_STORES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-ttl">
              DNS record TTL (seconds)
            </label>
            <input
              id="bg-ttl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              step="30"
              value={form.dnsTtlSeconds}
              onChange={setField("dnsTtlSeconds")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-steps">
              Canary ramp steps (1–6)
            </label>
            <input
              id="bg-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={form.rampSteps}
              onChange={setField("rampSteps")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-step-soak">
              Hold per ramp step (minutes)
            </label>
            <input
              id="bg-step-soak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={form.perStepSoakMinutes}
              onChange={setField("perStepSoakMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-soak">
              Final soak at 100% (minutes)
            </label>
            <input
              id="bg-soak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="15"
              value={form.soakMinutes}
              onChange={setField("soakMinutes")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-drain">
              Connection drain (seconds)
            </label>
            <input
              id="bg-drain"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={form.connectionDrainSeconds}
              onChange={setField("connectionDrainSeconds")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-baseline-err">
              Baseline error rate (%)
            </label>
            <input
              id="bg-baseline-err"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.baselineErrorRatePct}
              onChange={setField("baselineErrorRatePct")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-multiplier">
              Abort at this multiple of baseline errors
            </label>
            <input
              id="bg-multiplier"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={form.errorBudgetMultiplier}
              onChange={setField("errorBudgetMultiplier")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-p95">
              Baseline p95 latency (ms)
            </label>
            <input
              id="bg-p95"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={form.baselineP95Ms}
              onChange={setField("baselineP95Ms")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bg-lat-tol">
              Latency tolerance (%)
            </label>
            <input
              id="bg-lat-tol"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={form.latencyTolerancePct}
              onChange={setField("latencyTolerancePct")}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Planned change window
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.windowMinutes)} min`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the plan."
                : `${plan.itemCount} checklist items · ${checkedCount} ticked`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the cutover checklist as markdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Traffic ramp", hasError ? DASH : plan.ramp.map((pct) => `${pct}%`).join(" → ")],
            [
              "Roll back if error rate exceeds",
              hasError ? DASH : `${NUM.format(plan.triggers.errorRatePct)}%`,
            ],
            [
              "Roll back if p95 latency exceeds",
              hasError ? DASH : `${NUM.format(plan.triggers.p95LatencyMs)} ms`,
            ],
            [
              "Keep blue alive after the swap",
              hasError
                ? DASH
                : plan.dnsWaitSeconds > 0
                  ? `${NUM.format(plan.dnsWaitSeconds)} s (2× TTL)`
                  : "No DNS wait — switch is instant",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError &&
        plan.phases.map((phase) => (
          <section
            key={phase.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{phase.title}</h2>
            <ul className="mt-3 space-y-1">
              {phase.items.map((item) => {
                const key = itemKey(phase.id, item);
                const checked = Boolean(done[key]);
                return (
                  <li key={key}>
                    <label
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm leading-6 hover:bg-[var(--muted)]"
                      htmlFor={key}
                    >
                      <input
                        id={key}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDone(key)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      />
                      <span className={checked ? "text-[var(--muted-foreground)] line-through" : ""}>
                        {item}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A generated starting point, not a substitute for your own runbook. Add the steps unique to your
        stack — CDN purges, cache warmers, third-party webhook endpoints and partner allowlists.
      </p>
    </main>
  );
}
