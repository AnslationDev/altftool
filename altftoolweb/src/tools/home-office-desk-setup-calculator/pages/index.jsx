"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Monitor, RotateCcw } from "lucide-react";

import {
  MONITOR_GAZE_DOWN_DEG,
  MONITOR_GAZE_DOWN_MAX_DEG,
  planWorkstation,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const cm = (value) => (Number.isFinite(value) ? `${NUM.format(value)} cm` : DASH);

const DEFAULTS = {
  height: "175",
  shoe: "2.5",
  monitor: "24",
  useFixedDesk: false,
  fixedDesk: "75",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [height, setHeight] = useState(DEFAULTS.height);
  const [shoe, setShoe] = useState(DEFAULTS.shoe);
  const [monitor, setMonitor] = useState(DEFAULTS.monitor);
  const [useFixedDesk, setUseFixedDesk] = useState(DEFAULTS.useFixedDesk);
  const [fixedDesk, setFixedDesk] = useState(DEFAULTS.fixedDesk);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planWorkstation({
        heightCm: height.trim() === "" ? NaN : Number(height),
        shoeAllowanceCm: shoe.trim() === "" ? NaN : Number(shoe),
        monitorDiagonalIn: monitor.trim() === "" ? NaN : Number(monitor),
        fixedDeskHeightCm: useFixedDesk ? (fixedDesk.trim() === "" ? NaN : Number(fixedDesk)) : null,
      }),
    [height, shoe, monitor, useFixedDesk, fixedDesk],
  );

  const error = plan.error || null;

  const summary = useMemo(() => {
    if (error) return "";
    const lines = [
      "Home Office Desk Setup",
      `Standing height: ${NUM.format(plan.statureCm)} cm`,
      `Chair seat height: ${NUM.format(plan.seatHeightCm)} cm`,
      `Seated desk height: ${NUM.format(plan.deskHeightCm)} cm`,
      `Standing desk height: ${NUM.format(plan.standingDeskHeightCm)} cm`,
      `Seated eye height: ${NUM.format(plan.seatedEyeHeightCm)} cm`,
      `Monitor viewing distance: ${NUM.format(plan.viewingDistanceCm)} cm`,
      `Monitor centre: ${NUM.format(plan.monitorCentreCm)} cm from floor (top ${NUM.format(plan.monitorTopCm)} cm, bottom ${NUM.format(plan.monitorBottomCm)} cm)`,
      `Gap from desk top to bottom of screen: ${NUM.format(plan.riserAboveDeskCm)} cm`,
    ];
    if (plan.fixedDesk) {
      lines.push(
        `Fixed desk ${NUM.format(plan.fixedDesk.deskHeightCm)} cm: raise the chair to ${NUM.format(plan.fixedDesk.seatForDeskCm)} cm`,
        plan.fixedDesk.needsFootrest
          ? `Footrest needed: ${NUM.format(plan.fixedDesk.footrestHeightCm)} cm`
          : "No footrest needed",
      );
    }
    return lines.join("\n");
  }, [error, plan]);

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
    setHeight(DEFAULTS.height);
    setShoe(DEFAULTS.shoe);
    setMonitor(DEFAULTS.monitor);
    setUseFixedDesk(DEFAULTS.useFixedDesk);
    setFixedDesk(DEFAULTS.fixedDesk);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          Workstation setup
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Home Office Desk Setup Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turns your standing height into the seat, desk, standing-desk and monitor heights that keep
          your feet flat, forearms horizontal and gaze {MONITOR_GAZE_DOWN_DEG}–{MONITOR_GAZE_DOWN_MAX_DEG}°
          below the horizon.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-height">
              Your standing height (cm)
            </label>
            <input
              id="ds-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="220"
              step="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ds-shoe">
              Indoor heel height (cm)
            </label>
            <input
              id="ds-shoe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="8"
              step="0.5"
              value={shoe}
              onChange={(event) => setShoe(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ds-monitor">
              Monitor diagonal (inches, 16:9)
            </label>
            <input
              id="ds-monitor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="60"
              step="1"
              value={monitor}
              onChange={(event) => setMonitor(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
          htmlFor="ds-use-fixed"
        >
          <input
            id="ds-use-fixed"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={useFixedDesk}
            onChange={(event) => setUseFixedDesk(event.target.checked)}
          />
          My desk height cannot be adjusted
        </label>

        {useFixedDesk ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="ds-fixed">
              Actual desk height (cm)
            </label>
            <input
              id="ds-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="130"
              step="0.5"
              value={fixedDesk}
              onChange={(event) => setFixedDesk(event.target.value)}
            />
          </div>
        ) : null}
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Seated desk height
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : cm(plan.deskHeightCm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `with the chair seat at ${NUM.format(plan.seatHeightCm)} cm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy desk setup measurements"
              className={GHOST_BTN}
            >
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
            ["Chair seat height", error ? DASH : cm(plan.seatHeightCm)],
            ["Standing desk height", error ? DASH : cm(plan.standingDeskHeightCm)],
            ["Elbow height above the seat", error ? DASH : cm(plan.elbowAboveSeatCm)],
            ["Seated eye height from floor", error ? DASH : cm(plan.seatedEyeHeightCm)],
            ["Minimum knee depth under the desk", error ? DASH : cm(plan.minKneeDepthCm)],
            ["Minimum thigh clearance", error ? DASH : cm(plan.minThighClearanceCm)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Monitor position</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Panel width × height", error ? DASH : `${NUM.format(plan.monitorWidthCm)} × ${NUM.format(plan.monitorHeightCm)} cm`],
            ["Eye-to-screen distance", error ? DASH : cm(plan.viewingDistanceCm)],
            ["Screen centre above floor", error ? DASH : cm(plan.monitorCentreCm)],
            ["Top edge of screen", error ? DASH : cm(plan.monitorTopCm)],
            ["Bottom edge of screen", error ? DASH : cm(plan.monitorBottomCm)],
            ["Gap from desk top to bottom edge", error ? DASH : cm(plan.riserAboveDeskCm)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          The screen height is set by whichever rule is stricter: the top edge no higher than eye
          level, or the centre {MONITOR_GAZE_DOWN_DEG}° below the horizontal line of sight. If you
          wear varifocals, expect to sit the screen lower still.
        </p>
      </section>

      {!error && plan.fixedDesk ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Working with your fixed desk</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Desk height entered", cm(plan.fixedDesk.deskHeightCm)],
              ["Chair seat height for this desk", cm(plan.fixedDesk.seatForDeskCm)],
              [
                "Footrest height",
                plan.fixedDesk.needsFootrest ? cm(plan.fixedDesk.footrestHeightCm) : "Not needed",
              ],
              ["Thigh clearance you will have", cm(plan.fixedDesk.thighClearanceCm)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {plan.fixedDesk.thighClearanceCm < plan.minThighClearanceCm ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              Raising the chair this far leaves under {plan.minThighClearanceCm} cm of thigh
              clearance under the desk top. Lower the desk instead, or use a thinner desk apron.
            </p>
          ) : null}
        </section>
      ) : null}

      {!error && plan.notes.length > 0 ? (
        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          {plan.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are general ergonomic starting points derived from average body proportions — limb
        lengths vary, so adjust until your forearms are horizontal and your feet are flat. This is
        informational only; if you have persistent neck, back, wrist or eye pain, speak to a doctor
        or a qualified ergonomics assessor rather than relying on a calculator.
      </p>
    </main>
  );
}
