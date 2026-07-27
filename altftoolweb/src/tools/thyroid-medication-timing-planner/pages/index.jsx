"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import {
  BEDTIME_FASTING_GAP,
  BINDER_GAP,
  COFFEE_GAP,
  DOSE_MODES,
  FOOD_GAP_MIN,
  FOOD_GAP_PREFERRED,
  INTERACTIONS,
  formatClockTime,
  formatGap,
  parseClockTime,
  planThyroidTiming,
} from "../lib";

const DASH = "—";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULT_ITEMS = {
  breakfast: "07:15",
  coffee: "07:15",
  calcium: "",
  iron: "",
  acidDrug: "",
  soyFibre: "",
};

const DEFAULTS = {
  mode: "morning",
  doseTime: "06:00",
  lastMeal: "20:30",
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [doseTime, setDoseTime] = useState(DEFAULTS.doseTime);
  const [lastMeal, setLastMeal] = useState(DEFAULTS.lastMeal);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [copied, setCopied] = useState(false);

  const visibleItems = INTERACTIONS.filter((item) => item.modes.includes(mode));

  const result = useMemo(() => {
    const doseMinutes = parseClockTime(doseTime);
    if (doseMinutes === null) return { error: "Enter the tablet time as a valid time of day." };

    const itemMinutes = {};
    for (const item of INTERACTIONS) {
      const raw = items[item.key];
      if (!raw) continue;
      const parsed = parseClockTime(raw);
      if (parsed === null) {
        return { error: `The time entered for ${item.label.toLowerCase()} is not a valid time.` };
      }
      itemMinutes[item.key] = parsed;
    }

    return planThyroidTiming({
      mode,
      doseMinutes,
      lastMealMinutes: mode === "bedtime" ? parseClockTime(lastMeal) ?? undefined : undefined,
      itemMinutes,
    });
  }, [mode, doseTime, lastMeal, items]);

  const hasError = Boolean(result.error);

  const setItem = (key, value) => {
    setItems((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Levothyroxine timing check",
      `Routine: ${result.mode.label}`,
      `Tablet at ${result.doseLabel}`,
      `${result.clearCount} of ${result.checkedCount} gaps clear`,
    ];
    for (const check of result.checks) {
      lines.push(
        `${check.ok ? "OK" : "TOO CLOSE"} — ${check.label} at ${check.itemLabel}: ${formatGap(check.actualGap)} gap, needs ${formatGap(check.requiredGap)}`,
      );
    }
    if (result.recommendedDoseLabel) lines.push(`Suggested tablet time: ${result.recommendedDoseLabel}`);
    return lines.join("\n");
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
    setMode(DEFAULTS.mode);
    setDoseTime(DEFAULTS.doseTime);
    setLastMeal(DEFAULTS.lastMeal);
    setItems(DEFAULT_ITEMS);
    setCopied(false);
  };

  const headline = hasError
    ? DASH
    : result.allClear
      ? "All gaps clear"
      : `${result.failures.length} gap${result.failures.length === 1 ? "" : "s"} too short`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Thyroid Medication Timing Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Levothyroxine needs an empty stomach and real distance from coffee, calcium and iron. Enter
          your actual routine and see which gaps meet the labelled separations and which need
          shifting.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className={LABEL}>When do you take the tablet?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.values(DOSE_MODES).map((option) => {
              const active = option.key === mode;
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setMode(option.key);
                    setCopied(false);
                  }}
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{DOSE_MODES[mode].blurb}</p>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="thy-dose">
              Levothyroxine tablet at
            </label>
            <input
              id="thy-dose"
              className={INPUT}
              type="time"
              value={doseTime}
              onChange={(event) => {
                setDoseTime(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          {mode === "bedtime" ? (
            <div>
              <label className={LABEL} htmlFor="thy-lastmeal">
                Last meal or snack at
              </label>
              <input
                id="thy-lastmeal"
                className={INPUT}
                type="time"
                value={lastMeal}
                onChange={(event) => {
                  setLastMeal(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          ) : null}

          {visibleItems.map((item) => (
            <div key={item.key}>
              <label className={LABEL} htmlFor={`thy-${item.key}`}>
                {item.label}
              </label>
              <input
                id={`thy-${item.key}`}
                className={INPUT}
                type="time"
                value={items[item.key]}
                onChange={(event) => setItem(item.key, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Needs {formatGap(item.gap)}
                {item.preferredGap ? ` (${formatGap(item.preferredGap)} preferred)` : ""} · leave
                blank if it does not apply
              </p>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Routine check
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.allClear
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]"
              }`}
            >
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the check."
                : `Tablet at ${result.doseLabel} · ${result.clearCount} of ${result.checkedCount} gaps meet the labelled separation`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the levothyroxine timing check"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Tablet time", hasError ? DASH : result.doseLabel],
            [
              "Suggested tablet time",
              hasError || !result.recommendedDoseLabel ? DASH : result.recommendedDoseLabel,
            ],
            ["Gaps checked", hasError ? DASH : String(result.checkedCount)],
            ["Gaps too short", hasError ? DASH : String(result.failures.length)],
            [
              "Biggest shortfall",
              hasError || result.worstShortfall === 0 ? DASH : formatGap(result.worstShortfall),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.checks.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Gap by gap</h2>
          <ul className="mt-3 space-y-3">
            {result.checks.map((check) => (
              <li
                key={check.key}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {check.ok ? (
                      <Check className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                    ) : (
                      <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
                    )}
                    {check.label} at {check.itemLabel}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      check.ok ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {formatGap(check.actualGap)} gap · needs {formatGap(check.requiredGap)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{check.why}</p>
                {check.suggestion ? (
                  <p className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
                    {check.suggestion}
                  </p>
                ) : null}
                {check.ok && check.best === false ? (
                  <p className="mt-2 text-xs font-medium text-[var(--muted-foreground)]">
                    Meets the {formatGap(check.requiredGap)} minimum, but {formatGap(FOOD_GAP_PREFERRED)}{" "}
                    absorbs better.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError && result.timeline.length > 1 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Your day in order</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    What
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((row) => (
                  <tr
                    key={`${row.minutes}-${row.what}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">{formatClockTime(row.minutes)}</td>
                    <td className="py-2 pr-3">{row.what}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.isDose ? "Dose" : row.ok ? "Clear" : "Too close"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. The separations used are {FOOD_GAP_MIN} minutes
        before food ({FOOD_GAP_PREFERRED} preferred), {COFFEE_GAP} minutes from coffee,{" "}
        {BINDER_GAP / 60} hours from calcium, iron, antacids and fibre, and {BEDTIME_FASTING_GAP / 60}{" "}
        hours after the last meal for bedtime dosing. Consistency matters more than the exact hour —
        pick one routine, keep it, and let your doctor retest TSH about six weeks after any change.
      </p>
    </main>
  );
}
