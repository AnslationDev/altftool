"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TriangleAlert, Wind } from "lucide-react";

import {
  BREATH_HOLD_SECONDS,
  INHALER_DEVICES,
  TIDAL_BREATHS_PER_PUFF,
  WAIT_BETWEEN_PUFFS_SECONDS,
  allStepIds,
  scoreTechnique,
} from "../lib";

const DASH = "—";

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULT_DEVICE = "pmdi";

const toneClass = (tone) => {
  if (tone === "good") return "text-[var(--success)]";
  if (tone === "bad") return "text-[var(--danger)]";
  return "text-[var(--foreground)]";
};

export default function ToolHome() {
  const [deviceKey, setDeviceKey] = useState(DEFAULT_DEVICE);
  const [ticked, setTicked] = useState(() => allStepIds(DEFAULT_DEVICE));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreTechnique({ deviceKey, completedIds: ticked }),
    [deviceKey, ticked],
  );

  const hasError = Boolean(result.error);
  const device = INHALER_DEVICES[deviceKey];

  const chooseDevice = (key) => {
    setDeviceKey(key);
    setTicked(allStepIds(key));
    setCopied(false);
  };

  const toggleStep = (id) => {
    setTicked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Inhaler technique check — ${result.device.label}`,
      `Score: ${result.completedCount} of ${result.totalSteps} steps (${result.scorePct}%)`,
      `Critical steps: ${result.criticalTotal - result.criticalMissed} of ${result.criticalTotal}`,
      `Verdict: ${result.verdict.label}`,
      `Inhalation speed for this device: ${result.device.inhalationSpeed}`,
    ];
    if (result.missedSteps.length > 0) {
      lines.push("Steps to fix:");
      for (const step of result.missedSteps) {
        lines.push(`- ${step.critical ? "[critical] " : ""}${step.text}`);
      }
    }
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
    setDeviceKey(DEFAULT_DEVICE);
    setTicked(allStepIds(DEFAULT_DEVICE));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Inhaler Technique Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your device family and untick anything you do not actually do. Steps marked critical
          decide whether the dose reaches your lungs at all — the rest affect side effects, dose
          counting and device life.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className={LABEL}>Which inhaler do you use?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.values(INHALER_DEVICES).map((option) => {
              const active = option.key === deviceKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseDevice(option.key)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
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
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {device.aka} · Inhalation speed: {device.inhalationSpeed}
          </p>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => chooseDevice(deviceKey)} className={GHOST_BTN}>
            Tick everything
          </button>
          <button
            type="button"
            onClick={() => {
              setTicked([]);
              setCopied(false);
            }}
            className={GHOST_BTN}
          >
            Clear all
          </button>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">{device.label} — step by step</h2>
        <ul className="mt-3 space-y-2">
          {device.steps.map((step, index) => {
            const checked = ticked.includes(step.id);
            return (
              <li
                key={step.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    id={step.id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStep(step.id)}
                    className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
                  />
                  <label htmlFor={step.id} className="min-h-11 flex-1 cursor-pointer text-sm leading-6">
                    <span className="font-semibold text-[var(--muted-foreground)]">
                      Step {index + 1}.
                    </span>{" "}
                    {step.text}
                    {step.critical ? (
                      <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        critical
                      </span>
                    ) : null}
                    {step.why ? (
                      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                        {step.why}
                      </span>
                    ) : null}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
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
              Technique score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.scorePct}%`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : toneClass(result.verdict.tone)
              }`}
            >
              {hasError ? "Choose a device to score your technique." : result.verdict.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the inhaler technique result"
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
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Steps completed",
              hasError ? DASH : `${result.completedCount} of ${result.totalSteps}`,
            ],
            [
              "Critical steps completed",
              hasError
                ? DASH
                : `${result.criticalTotal - result.criticalMissed} of ${result.criticalTotal} (${result.criticalPct}%)`,
            ],
            ["Inhalation speed for this device", hasError ? DASH : result.device.inhalationSpeed],
            ["Breath-hold after inhaling", `${BREATH_HOLD_SECONDS} seconds`],
            ["Gap between two puffs", `${WAIT_BETWEEN_PUFFS_SECONDS} seconds`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.verdict.tone === "bad"
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {result.verdict.advice}
          </p>
        ) : null}
      </section>

      {!hasError && result.missedSteps.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Steps to fix</h2>
          <ul className="mt-3 space-y-2">
            {result.missedSteps.map((step) => (
              <li
                key={step.id}
                className={`flex gap-2 rounded-md px-3 py-2 text-sm leading-6 ${
                  step.critical
                    ? "bg-[var(--danger-soft)] font-medium text-[var(--danger)]"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {step.text}
                  {step.why ? <span className="block text-xs opacity-90">{step.why}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Technique varies slightly between brands, so read the
        leaflet supplied with your own inhaler, and ask a pharmacist, GP or asthma nurse to watch you
        use it at least once a year. A young child using a spacer and mask can take{" "}
        {TIDAL_BREATHS_PER_PUFF} normal breaths per puff instead of a single deep breath. If you are
        needing a reliever inhaler more often than usual, seek review rather than adjusting doses
        yourself.
      </p>
    </main>
  );
}
