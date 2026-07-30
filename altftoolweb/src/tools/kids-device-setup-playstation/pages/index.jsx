"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gamepad, RotateCcw } from "lucide-react";

import { CONSOLES, ONLINE_MODES, buildPlan } from "../lib";

const DEFAULTS = {
  childAge: "11",
  console: "ps5",
  onlineMode: "friends",
  weekdayMinutes: "60",
  weekendMinutes: "120",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TIER_LABEL = { essential: "Essential", recommended: "Recommended", optional: "Optional" };
const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};
const TONE_BAR = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};
const DASH = "—";

export default function ToolHome() {
  const [childAge, setChildAge] = useState(DEFAULTS.childAge);
  const [consoleId, setConsoleId] = useState(DEFAULTS.console);
  const [onlineMode, setOnlineMode] = useState(DEFAULTS.onlineMode);
  const [weekdayMinutes, setWeekdayMinutes] = useState(DEFAULTS.weekdayMinutes);
  const [weekendMinutes, setWeekendMinutes] = useState(DEFAULTS.weekendMinutes);
  const [completed, setCompleted] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildPlan({
        childAge,
        console: consoleId,
        onlineMode,
        weekdayMinutes,
        weekendMinutes,
        completed,
      }),
    [childAge, consoleId, onlineMode, weekdayMinutes, weekendMinutes, completed],
  );

  const grouped = useMemo(() => {
    if (plan.error) return [];
    return ["essential", "recommended", "optional"]
      .map((tier) => [tier, plan.steps.filter((step) => step.tier === tier)])
      .filter(([, list]) => list.length > 0);
  }, [plan]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    const consoleLabel = CONSOLES.find((item) => item.id === consoleId)?.label ?? consoleId;
    const modeLabel = ONLINE_MODES.find((item) => item.id === onlineMode)?.label ?? onlineMode;
    const lines = [
      "PlayStation family safety plan",
      `Child age ${childAge} · ${consoleLabel} · ${modeLabel}`,
      `Coverage: ${plan.score}% (${plan.band}) — ${plan.doneSteps} of ${plan.totalSteps} steps done`,
      `Age-rating ceiling: ${plan.rating.pegi} / ESRB ${plan.rating.esrb}`,
      `Play time: ${plan.playTime.weekdayMinutes} min school days, ${plan.playTime.weekendMinutes} min weekend days = ${plan.playTime.totalHours} hours a week`,
      "",
      "Still to do:",
    ];
    if (plan.remaining.length === 0) lines.push("- nothing, the checklist is complete");
    plan.remaining.forEach((step) => {
      lines.push(`- [${TIER_LABEL[step.tier]}] ${step.title}`);
      lines.push(`    ${step.where}`);
    });
    return lines.join("\n");
  }, [plan, childAge, consoleId, onlineMode]);

  const toggleStep = (id) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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
    setChildAge(DEFAULTS.childAge);
    setConsoleId(DEFAULTS.console);
    setOnlineMode(DEFAULTS.onlineMode);
    setWeekdayMinutes(DEFAULTS.weekdayMinutes);
    setWeekendMinutes(DEFAULTS.weekendMinutes);
    setCompleted([]);
    setCopied(false);
  };

  const toneText = plan.error ? TONE_TEXT.danger : TONE_TEXT[plan.tone] ?? TONE_TEXT.warning;
  const toneBar = plan.error ? TONE_BAR.danger : TONE_BAR[plan.tone] ?? TONE_BAR.warning;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gamepad className="h-4 w-4" aria-hidden="true" />
          Kids device safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          PlayStation Family Safety Setup
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the PSN child account, spending cap, communication limits and age-rating ceiling
          for your console, plus the weekly play-time budget the console will enforce.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-age">
              Child&apos;s age (years)
            </label>
            <input
              id="ps-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="17"
              step="1"
              value={childAge}
              onChange={(event) => setChildAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-console">
              Console
            </label>
            <select
              id="ps-console"
              className={`mt-2 ${INPUT_CLASS}`}
              value={consoleId}
              onChange={(event) => setConsoleId(event.target.value)}
            >
              {CONSOLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ps-mode">
              How do they play online?
            </label>
            <select
              id="ps-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={onlineMode}
              onChange={(event) => setOnlineMode(event.target.value)}
            >
              {ONLINE_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-weekday">
              School-day allowance (minutes)
            </label>
            <input
              id="ps-weekday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={weekdayMinutes}
              onChange={(event) => setWeekdayMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ps-weekend">
              Weekend-day allowance (minutes)
            </label>
            <input
              id="ps-weekend"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="15"
              value={weekendMinutes}
              onChange={(event) => setWeekendMinutes(event.target.value)}
            />
          </div>
        </div>
      </section>

      {plan.error ? (
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
              Family controls coverage
            </p>
            <p className={`mt-1 text-4xl font-semibold ${toneText}`}>
              {plan.error ? DASH : `${plan.score}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the inputs above to see the plan."
                : `${plan.band} · ${plan.doneSteps} of ${plan.totalSteps} steps done`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the PlayStation family safety plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className={`block h-full ${toneBar}`}
            style={{ width: plan.error ? "0%" : `${plan.score}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Essential steps still open",
              plan.error ? DASH : `${plan.essentialsMissing} of ${plan.essentialsTotal}`,
            ],
            ["Age-rating ceiling (PEGI)", plan.error ? DASH : plan.rating.pegi],
            ["Age-rating ceiling (ESRB)", plan.error ? DASH : plan.rating.esrb],
            [
              "Weekly play-time budget",
              plan.error
                ? DASH
                : `${plan.playTime.totalHours} hours (${plan.playTime.totalMinutes} minutes)`,
            ],
            [
              "Average across all 7 days",
              plan.error ? DASH : `${plan.playTime.averageDailyMinutes} minutes a day`,
            ],
            [
              "PS VR2 age restriction",
              plan.error ? DASH : plan.psvr2Allowed ? "Old enough (12+)" : "Keep blocked (under 12)",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error &&
        grouped.map(([tier, list]) => (
          <section key={tier} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              {TIER_LABEL[tier]}{" "}
              <span className="font-normal text-[var(--muted-foreground)]">({list.length})</span>
            </h2>
            <ul className="mt-3 space-y-3">
              {list.map((step) => (
                <li key={step.id} className="rounded-lg border border-[var(--border)] p-3">
                  <label
                    className="flex min-h-11 cursor-pointer items-start gap-3"
                    htmlFor={`ps-step-${step.id}`}
                  >
                    <input
                      id={`ps-step-${step.id}`}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={step.done}
                      onChange={() => toggleStep(step.id)}
                    />
                    <span>
                      <span className="block text-sm font-semibold leading-6">{step.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--primary)]">
                        {step.where}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {step.why}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance only. The console age level is chosen from a numbered list that maps to
        your region&apos;s rating system, so pick the entry beside the age shown above. Menu names
        change between system-software updates.
      </p>
    </main>
  );
}
