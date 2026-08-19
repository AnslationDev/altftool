"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, StarOff } from "lucide-react";
import { PLATFORMS, REGIONS, TARGETS, buildRemovalPlan } from "../lib";

const DASH = "—";

function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { target: "contact-details", platform: "maps", region: "gdpr" };

export default function ToolHome() {
  const [target, setTarget] = useState(DEFAULTS.target);
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [region, setRegion] = useState(DEFAULTS.region);
  const [startedOn, setStartedOn] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStartedOn(todayIso());
  }, []);

  const result = useMemo(
    () =>
      buildRemovalPlan({
        target,
        platform,
        region,
        startedOn,
      }),
    [target, platform, region, startedOn],
  );
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Review site personal data removal plan",
      `Removing: ${result.targetLabel}`,
      `Platform: ${result.platformLabel} · Region: ${result.regionLabel}`,
      `Route: ${result.routeLabel} — ${result.routeDetail}`,
      `Started ${result.startedOn}, all steps exhausted by ${result.completeBy} (${result.totalDays} days)`,
      "",
      ...result.steps.flatMap((step, index) => [
        `${index + 1}. ${step.title} [${step.owner}]`,
        `   ${step.detail}`,
        `   Chase or move on from ${step.dueOn} (${step.basis})`,
      ]),
      "",
      `Escalate to: ${result.escalateTo}`,
    ].join("\n");
  }, [ok, result]);

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
    setTarget(DEFAULTS.target);
    setPlatform(DEFAULTS.platform);
    setRegion(DEFAULTS.region);
    setStartedOn(todayIso());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <StarOff className="h-4 w-4" aria-hidden="true" />
          Review sites
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Review Site Personal Data Removal Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Say what you want off a review or rating platform and where you live, and this builds the
          ordered plan — which route actually applies, what to send at each stage, and the dated
          point at which you stop waiting and escalate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rem-target">
              What do you want removed
            </label>
            <select
              id="rem-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setCopied(false);
              }}
            >
              {TARGETS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rem-platform">
              Kind of platform
            </label>
            <select
              id="rem-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => {
                setPlatform(event.target.value);
                setCopied(false);
              }}
            >
              {PLATFORMS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rem-region">
              Where you live
            </label>
            <select
              id="rem-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                setCopied(false);
              }}
            >
              {REGIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rem-start">
              Starting on
            </label>
            <input
              id="rem-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startedOn}
              onChange={(event) => {
                setStartedOn(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {!ok && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Every route exhausted by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.completeBy : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.stepCount} steps over ${result.totalDays} days if nobody replies early`
                : "Fix the selections above to build the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the removal plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the selections" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Route that applies", ok ? result.routeLabel : DASH],
            ["Steps in the plan", ok ? result.stepCount : DASH],
            ["Steps only you can do", ok ? result.ownActions : DASH],
            ["Started on", ok ? result.startedOn : DASH],
            ["Escalate to", ok ? result.escalateTo : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.routeDetail}
          </p>
        )}
      </section>

      {ok && (
        <section
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 className="text-base font-semibold">Your plan</h2>
          <ol className="mt-3 space-y-3">
            {result.steps.map((step, index) => (
              <li key={step.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-bold text-[var(--primary-foreground)]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{step.title}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{step.detail}</p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {step.owner} · from {step.startsOn}
                  {step.days > 0 ? ` to ${step.dueOn}` : ""} · {step.basis}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance, not legal advice. A truthful review that identifies you is generally
        protected, and data protection law does not override freedom of expression; if you are
        weighing defamation or a court order, take advice from a qualified lawyer in your
        jurisdiction. Dates marked &quot;by convention&quot; are follow-up prompts, not legal deadlines.
      </p>
    </main>
  );
}
