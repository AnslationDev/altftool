"use client";

import { useMemo, useState } from "react";
import { BatteryCharging, Check, Copy, RotateCcw } from "lucide-react";

import {
  BATTERY_TYPES,
  USAGE_FACTORS,
  WARNING_SIGNS,
  planBatteryReplacement,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  batteryType: "mf",
  ageMonths: "30",
  factors: ["hotClimate", "shortTrips"],
  signs: [],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_BASE =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [batteryType, setBatteryType] = useState(DEFAULTS.batteryType);
  const [ageMonths, setAgeMonths] = useState(DEFAULTS.ageMonths);
  const [factors, setFactors] = useState(DEFAULTS.factors);
  const [signs, setSigns] = useState(DEFAULTS.signs);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planBatteryReplacement({
        batteryType,
        ageMonths: toNumber(ageMonths),
        factors,
        signs,
      }),
    [batteryType, ageMonths, factors, signs],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Car Battery Replacement Planner",
      `Battery: ${plan.batteryLabel}`,
      `Age: ${NUM.format(plan.ageMonths)} months`,
      `Typical life: ${plan.baseMonths} months, adjusted to ${plan.expectedMonths} months`,
      `Estimated remaining life: ${plan.healthPercent}%`,
      `Months left on the estimate: ${NUM.format(Math.max(0, plan.monthsRemaining))}`,
      `Symptom score: ${plan.riskScore}`,
      `Verdict: ${plan.verdictLabel}`,
    ].join("\n");
  }, [plan]);

  const toggle = (setter) => (id) => {
    setter((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const toggleFactor = toggle(setFactors);
  const toggleSign = toggle(setSigns);

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
    setBatteryType(DEFAULTS.batteryType);
    setAgeMonths(DEFAULTS.ageMonths);
    setFactors(DEFAULTS.factors);
    setSigns(DEFAULTS.signs);
    setCopied(false);
  };

  const ok = !plan.error;
  const urgent = ok && plan.verdict === "replace-now";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BatteryCharging className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Car Battery Replacement Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Starter batteries rarely die of old age alone — heat and chronic undercharging get them
          first. Combine the age of yours with how the car is actually used and what it is already
          doing, and see how much life is realistically left.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bat-type">
              Battery type fitted
            </label>
            <select
              id="bat-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={batteryType}
              onChange={(event) => {
                setBatteryType(event.target.value);
                setCopied(false);
              }}
            >
              {BATTERY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} — typically {type.months} months
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bat-age">
              Battery age (months)
            </label>
            <input
              id="bat-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="360"
              step="1"
              value={ageMonths}
              onChange={(event) => {
                setAgeMonths(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The manufacturing or fitment date is stamped on the case or the warranty card.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">How the car is used</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {USAGE_FACTORS.map((factor) => {
              const active = factors.includes(factor.id);
              return (
                <label
                  key={factor.id}
                  htmlFor={`fac-${factor.id}`}
                  className={`${CHECK_BASE} ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`fac-${factor.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleFactor(factor.id)}
                  />
                  <span>
                    <span className="block font-medium">{factor.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      &times;{factor.factor} expected life
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Warning signs you have noticed</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {WARNING_SIGNS.map((sign) => {
              const active = signs.includes(sign.id);
              return (
                <label
                  key={sign.id}
                  htmlFor={`sign-${sign.id}`}
                  className={`${CHECK_BASE} ${
                    active
                      ? "border-[var(--danger)] bg-[var(--danger-soft)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`sign-${sign.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleSign(sign.id)}
                  />
                  <span>
                    <span className="block font-medium">{sign.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {sign.points} point{sign.points === 1 ? "" : "s"}
                      {sign.critical ? " · replace immediately" : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated remaining life
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                urgent ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {ok ? `${plan.healthPercent}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? plan.verdictLabel : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy battery replacement plan"
              className={GHOST_BTN}
              disabled={!ok}
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

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={ok ? `${plan.healthPercent} percent of life remaining` : "No result"}
          >
            <span
              className={`block h-full ${urgent ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
              style={{ width: `${ok ? plan.healthPercent : 0}%` }}
            />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Typical life for this type", ok ? `${plan.baseMonths} months` : DASH],
            [
              "Usage factor applied",
              ok ? `${NUM.format(plan.factor)}${plan.factorClamped ? " (clamped)" : ""}` : DASH,
            ],
            ["Adjusted expected life", ok ? `${plan.expectedMonths} months` : DASH],
            ["Current age", ok ? `${NUM.format(plan.ageMonths)} months` : DASH],
            [
              "Months left on the estimate",
              ok ? NUM.format(Math.max(0, plan.monthsRemaining)) : DASH,
            ],
            ["Calendar life used", ok ? `${NUM.format(plan.percentLifeUsed)}%` : DASH],
            ["Symptom score", ok ? String(plan.riskScore) : DASH],
            ["Verdict", ok ? plan.verdictLabel : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What to do next</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {plan.advice.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. A conductance or load test at a battery dealer measures the
        actual state of health; this planner cannot see inside your battery.
      </p>
    </main>
  );
}
