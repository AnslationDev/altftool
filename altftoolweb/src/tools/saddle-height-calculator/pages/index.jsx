"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";
import {
  ADJUSTMENT_STEP_MM,
  CRANK_INSEAM_RANGE,
  HAMLEY_FACTOR,
  LEMOND_FACTOR,
  SETBACK_RANGES_CM,
  STANDARD_CRANKS_MM,
  computeSaddleHeight,
} from "../lib";

const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const mm = (value) => (Number.isFinite(value) ? `${N1.format(value)} mm` : "—");
const cm = (value) => (Number.isFinite(value) ? `${N1.format(value / 10)} cm` : "—");

const DEFAULTS = {
  inseamCm: "83",
  crankLengthMm: "172.5",
  style: "roadEndurance",
  currentSaddleHeightMm: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [inseamCm, setInseamCm] = useState(DEFAULTS.inseamCm);
  const [crankLengthMm, setCrankLengthMm] = useState(DEFAULTS.crankLengthMm);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [currentHeight, setCurrentHeight] = useState(DEFAULTS.currentSaddleHeightMm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSaddleHeight({
        inseamCm: toNumber(inseamCm),
        crankLengthMm: toNumber(crankLengthMm),
        style,
        currentSaddleHeightMm:
          currentHeight.trim() === "" ? undefined : toNumber(currentHeight),
      }),
    [inseamCm, crankLengthMm, style, currentHeight],
  );

  const ok = !result.error;
  const check = ok ? result.currentCheck : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Saddle Height Setup",
      `Inseam ${inseamCm} cm · ${crankLengthMm} mm cranks · ${result.styleLabel}`,
      `Recommended saddle height (BB centre to saddle top): ${mm(result.recommendedMm)}`,
      `LeMond method (x${LEMOND_FACTOR}): ${mm(result.lemondMm)}`,
      `Hamley method (${Math.round(HAMLEY_FACTOR * 100)}% of inseam): ${mm(result.hamleyMm)}`,
      `Working range: ${mm(result.rangeMm[0])} to ${mm(result.rangeMm[1])}`,
      `Saddle top to pedal at bottom dead centre: ${mm(result.toPedalAtBdcMm)}`,
      `Saddle nose behind BB: ${result.setbackRangeCm[0]} to ${result.setbackRangeCm[1]} cm`,
      `Knee flexion target at BDC: ${result.kneeFlexionRangeDeg[0]}-${result.kneeFlexionRangeDeg[1]} degrees`,
      `Crank length guide: ${mm(result.crankTargetMm[0])} to ${mm(result.crankTargetMm[1])} (nearest stock size ${result.crankSuggestionMm} mm)`,
    ];
    if (check) {
      lines.push(
        check.direction === "keep"
          ? "Current saddle height is already at the recommended figure."
          : `${check.direction === "raise" ? "Raise" : "Lower"} the saddle by ${mm(Math.abs(check.deltaMm))} — about ${check.steps} adjustment${check.steps === 1 ? "" : "s"} of ${ADJUSTMENT_STEP_MM} mm.`,
      );
    }
    return lines.join("\n");
  }, [ok, result, check, inseamCm, crankLengthMm]);

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
    setInseamCm(DEFAULTS.inseamCm);
    setCrankLengthMm(DEFAULTS.crankLengthMm);
    setStyle(DEFAULTS.style);
    setCurrentHeight(DEFAULTS.currentSaddleHeightMm);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Bike fit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Saddle Height Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two published fit methods, computed side by side. LeMond puts the saddle top at{" "}
          {LEMOND_FACTOR} times your inseam above the bottom bracket; Hamley and Thomas put it at{" "}
          {Math.round(HAMLEY_FACTOR * 100)}% of inseam measured from the pedal spindle. They should
          agree within a few millimetres.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-inseam">
              Cycling inseam (cm)
            </label>
            <input
              id="sh-inseam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="110"
              step="0.5"
              value={inseamCm}
              onChange={(event) => setInseamCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-crank">
              Crank length (mm)
            </label>
            <select
              id="sh-crank"
              className={`mt-2 ${INPUT_CLASS}`}
              value={crankLengthMm}
              onChange={(event) => setCrankLengthMm(event.target.value)}
            >
              {STANDARD_CRANKS_MM.map((size) => (
                <option key={size} value={size}>
                  {size} mm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-style">
              Riding position
            </label>
            <select
              id="sh-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {Object.entries(SETBACK_RANGES_CM).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sh-current">
              Current saddle height (mm, optional)
            </label>
            <input
              id="sh-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="e.g. 720"
              value={currentHeight}
              onChange={(event) => setCurrentHeight(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Measure saddle height along the seat tube, from the centre of the bottom bracket axle to
          the top of the saddle at the point you actually sit on.
        </p>
      </section>

      {result.error ? (
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
              Saddle height, BB centre to saddle top
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? mm(result.recommendedMm) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${cm(result.recommendedMm)} — working range ${mm(result.rangeMm[0])} to ${mm(result.rangeMm[1])}`
                : "Fix the inputs above to see a setting"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy saddle height setup"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {check ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              check.direction === "keep"
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : check.inRange
                  ? "bg-[var(--info-soft)] text-[var(--info)]"
                  : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {check.direction === "keep"
              ? "Your current saddle height already matches the recommendation."
              : `${check.direction === "raise" ? "Raise" : "Lower"} the saddle by ${mm(Math.abs(check.deltaMm))} — about ${check.steps} adjustment${check.steps === 1 ? "" : "s"} of ${ADJUSTMENT_STEP_MM} mm, riding between each one.${check.inRange ? " You are already inside the acceptable window." : ""}`}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [`LeMond method (inseam x ${LEMOND_FACTOR})`, ok ? mm(result.lemondMm) : "—"],
            [
              `Hamley method (${Math.round(HAMLEY_FACTOR * 100)}% of inseam)`,
              ok ? mm(result.hamleyMm) : "—",
            ],
            ["Spread between the two methods", ok ? mm(result.methodSpreadMm) : "—"],
            [
              "Working range",
              ok ? `${mm(result.rangeMm[0])} to ${mm(result.rangeMm[1])}` : "—",
            ],
            [
              "Saddle top to pedal at bottom dead centre",
              ok ? mm(result.toPedalAtBdcMm) : "—",
            ],
            [
              "Saddle nose behind the bottom bracket",
              ok ? `${result.setbackRangeCm[0]} to ${result.setbackRangeCm[1]} cm` : "—",
            ],
            [
              "Knee flexion at bottom dead centre",
              ok
                ? `${result.kneeFlexionRangeDeg[0]}-${result.kneeFlexionRangeDeg[1]} degrees`
                : "—",
            ],
            [
              "Crank length guide",
              ok
                ? `${mm(result.crankTargetMm[0])} to ${mm(result.crankTargetMm[1])} — nearest stock ${result.crankSuggestionMm} mm`
                : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Setting it on the bike</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Set the saddle level first — a saddle tipped nose-down shifts weight onto your hands and
            makes any height figure misleading.
          </li>
          <li>
            Measure along the seat tube from the bottom-bracket axle centre to the top of the saddle
            and set the recommended height.
          </li>
          <li>
            Check setback with the cranks horizontal: drop a plumb line from the bony bump just below
            your kneecap. On a road bike it should fall on or just behind the pedal spindle.
          </li>
          <li>
            Ride for at least half an hour, then change by no more than {ADJUSTMENT_STEP_MM} mm at a
            time. Pain at the front of the knee usually means too low; pain behind the knee, rocking
            hips or sore Achilles usually mean too high.
          </li>
          <li>
            If you change crank length, move the saddle by the same amount in the opposite direction
            to keep leg extension identical.
          </li>
        </ol>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Crank length guide uses {Math.round(CRANK_INSEAM_RANGE[0] * 100)}-
          {Math.round(CRANK_INSEAM_RANGE[1] * 100)}% of cycling inseam.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These formulas were derived from populations of able-bodied cyclists and are a starting
        point, not a prescription. Shoe stack height, cleat position, pedal type, flexibility and
        leg-length differences all shift the answer. If you have persistent knee, hip or back pain,
        see a professional bike fitter or a physiotherapist rather than adjusting by numbers alone.
      </p>
    </main>
  );
}
