"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingDown } from "lucide-react";

import { RECOVERY_PROTOCOLS, computeHeartRateRecovery } from "../lib";

const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DASH = "—";

const DEFAULTS = {
  peakHr: "180",
  hr1min: "150",
  hr2min: "132",
  restingHr: "60",
  protocol: "cooldown",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [peakHr, setPeakHr] = useState(DEFAULTS.peakHr);
  const [hr1min, setHr1min] = useState(DEFAULTS.hr1min);
  const [hr2min, setHr2min] = useState(DEFAULTS.hr2min);
  const [restingHr, setRestingHr] = useState(DEFAULTS.restingHr);
  const [protocol, setProtocol] = useState(DEFAULTS.protocol);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = [peakHr, hr1min, hr2min, restingHr].map(toNumber);
    if (values.some((v) => Number.isNaN(v))) {
      return { error: "Enter numbers only — check each heart rate field." };
    }
    const [peak, one, two, rest] = values;
    return computeHeartRateRecovery({
      peakHr: peak === null ? undefined : peak,
      hr1min: one === null ? undefined : one,
      hr2min: two,
      restingHr: rest,
      protocol,
    });
  }, [peakHr, hr1min, hr2min, restingHr, protocol]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Heart Rate Recovery",
      `Peak heart rate: ${result.peakHr} bpm`,
      `1 minute after: ${result.hr1min} bpm — HRR1 = ${result.hrr1} bpm`,
    ];
    if (result.hrr2 !== null) {
      lines.push(`2 minutes after: ${result.hr2min} bpm — HRR2 = ${result.hrr2} bpm`);
    }
    lines.push(
      `Recovery protocol: ${result.protocolLabel}`,
      `Fitness band (HRR1): ${result.fitnessBand}`,
      result.hrr1BelowThreshold
        ? `HRR1 is at or below the ${result.hrr1Threshold} bpm threshold used in the research for this protocol.`
        : `HRR1 is above the ${result.hrr1Threshold} bpm threshold used in the research for this protocol.`,
    );
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
    setPeakHr(DEFAULTS.peakHr);
    setHr1min(DEFAULTS.hr1min);
    setHr2min(DEFAULTS.hr2min);
    setRestingHr(DEFAULTS.restingHr);
    setProtocol(DEFAULTS.protocol);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
          Post-exercise recovery
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Heart Rate Recovery Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Heart rate recovery is how far your pulse falls in the first minute or two after you stop.
          A bigger, faster drop reflects stronger vagal reactivation and better aerobic conditioning.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hrr-peak">
              Peak heart rate (bpm)
            </label>
            <input
              id="hrr-peak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="60"
              max="230"
              step="1"
              value={peakHr}
              onChange={(event) => setPeakHr(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The highest value reached at the end of the effort.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hrr-one">
              Heart rate at 1 minute (bpm)
            </label>
            <input
              id="hrr-one"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="230"
              step="1"
              value={hr1min}
              onChange={(event) => setHr1min(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hrr-two">
              Heart rate at 2 minutes (optional)
            </label>
            <input
              id="hrr-two"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="230"
              step="1"
              placeholder="e.g. 132"
              value={hr2min}
              onChange={(event) => setHr2min(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hrr-resting">
              Resting heart rate (optional)
            </label>
            <input
              id="hrr-resting"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="130"
              step="1"
              placeholder="e.g. 60"
              value={restingHr}
              onChange={(event) => setRestingHr(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hrr-protocol">
              What did you do right after stopping?
            </label>
            <select
              id="hrr-protocol"
              className={`mt-2 ${INPUT_CLASS}`}
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
            >
              {RECOVERY_PROTOCOLS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The published cut-off differs between the two, so this changes the threshold applied.
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              One-minute recovery (HRR1)
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.hrr1)} bpm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your recovery."
                : `${result.fitnessBand} — ${result.fitnessNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy heart rate recovery result"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.hrr1BelowThreshold ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            HRR1 is at or below {result.hrr1Threshold} bpm, the cut-off used in {result.protocolSource}{" "}
            A single reading is not a diagnosis, but it is worth mentioning to your doctor.
          </p>
        ) : null}

        {!hasError && result.notes.length > 0
          ? result.notes.map((note) => (
              <p
                key={note}
                className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                {note}
              </p>
            ))
          : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Two-minute recovery (HRR2)",
              hasError || result.hrr2 === null ? DASH : `${NUM0.format(result.hrr2)} bpm`,
            ],
            [
              "Drop in the second minute alone",
              hasError || result.secondMinuteDrop === null
                ? DASH
                : `${NUM0.format(result.secondMinuteDrop)} bpm`,
            ],
            [
              "HRR1 as % of peak heart rate",
              hasError ? DASH : `${NUM1.format(result.percentDrop1)}%`,
            ],
            [
              "HRR1 as % of heart rate reserve",
              hasError || result.reserveRecovered1 === null
                ? DASH
                : `${NUM1.format(result.reserveRecovered1)}%`,
            ],
            [
              "Threshold for this protocol",
              hasError ? DASH : `HRR1 abnormal at ≤ ${result.hrr1Threshold} bpm`,
            ],
            [
              "Two-minute threshold",
              hasError || result.hrr2 === null
                ? DASH
                : `${result.hrr2BelowThreshold ? "At or below" : "Above"} ${result.hrr2Threshold} bpm`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How to take the measurement</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          <li>Finish a hard but safe effort — a graded treadmill test, a hill repeat or a 5-minute time trial.</li>
          <li>Note the highest heart rate shown as you stop.</li>
          <li>Start a timer immediately and stay in the same posture you selected above.</li>
          <li>Record the reading at exactly 60 seconds, then again at 120 seconds.</li>
          <li>Repeat with the identical protocol each time — posture and cool-down change the numbers substantially.</li>
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a medical assessment. The published thresholds come from supervised
        treadmill testing in clinical populations and do not transfer perfectly to a wrist monitor
        after a gym session. Beta-blockers and other medications blunt recovery. Discuss a slow
        recovery — or any chest pain, faintness or irregular pulse — with a doctor.
      </p>
    </main>
  );
}
