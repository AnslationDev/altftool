"use client";

import { useMemo, useState } from "react";
import { Armchair, Check, Copy, RotateCcw } from "lucide-react";

import { KNEE_SPACE_DEPTH_CM, KNEE_SPACE_WIDTH_CM, calculateChairHeight } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  mode: "measured",
  poplitealCm: "43",
  heightCm: "172",
  shoeHeelCm: "2",
  deskHeightCm: "74",
  deskAdjustable: false,
  deskApronCm: "4",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const cm = (value) => `${NUM.format(value)} cm`;

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [poplitealCm, setPoplitealCm] = useState(DEFAULTS.poplitealCm);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [shoeHeelCm, setShoeHeelCm] = useState(DEFAULTS.shoeHeelCm);
  const [deskHeightCm, setDeskHeightCm] = useState(DEFAULTS.deskHeightCm);
  const [deskAdjustable, setDeskAdjustable] = useState(DEFAULTS.deskAdjustable);
  const [deskApronCm, setDeskApronCm] = useState(DEFAULTS.deskApronCm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateChairHeight({
        mode,
        poplitealCm,
        heightCm,
        shoeHeelCm,
        deskHeightCm,
        deskAdjustable,
        deskApronCm,
      }),
    [mode, poplitealCm, heightCm, shoeHeelCm, deskHeightCm, deskAdjustable, deskApronCm],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Chair Height Calculator",
      `Seat height: ${cm(result.workingSeatCm)} (ideal for your legs: ${cm(result.idealSeatCm)})`,
      `Usable seat depth: ${cm(result.seatDepthCm)}`,
      `Matching desk height: ${cm(result.idealDeskCm)}`,
      `Your desk: ${cm(result.recommendedDeskCm)}`,
      result.deskAdjustable
        ? `Set the desk to ${cm(result.idealDeskCm)}.`
        : result.footrestCm > 0
          ? `Footrest needed: ${cm(result.footrestCm)}`
          : "No footrest needed.",
      `Thigh clearance under the desk: ${cm(result.thighGapCm)} (${result.thighClearanceOk ? "OK" : "too tight"})`,
      `Knee space wanted: ${KNEE_SPACE_WIDTH_CM} cm wide, ${KNEE_SPACE_DEPTH_CM} cm deep`,
    ].join("\n");
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
    setPoplitealCm(DEFAULTS.poplitealCm);
    setHeightCm(DEFAULTS.heightCm);
    setShoeHeelCm(DEFAULTS.shoeHeelCm);
    setDeskHeightCm(DEFAULTS.deskHeightCm);
    setDeskAdjustable(DEFAULTS.deskAdjustable);
    setDeskApronCm(DEFAULTS.deskApronCm);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Armchair className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Chair Height Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Seat height comes from one measurement: the floor to the crease behind your knee while
          seated. Everything else — seat depth, the desk height that matches it, and the footrest you
          need when the desk will not move — follows from there.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your legs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="chc-mode">
              What you can measure
            </label>
            <select
              id="chc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="measured">I measured floor to the back of my knee</option>
              <option value="stature">Estimate it from my body height</option>
            </select>
          </div>
          {mode === "measured" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="chc-popliteal">
                Popliteal height (cm)
              </label>
              <input
                id="chc-popliteal"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="25"
                max="65"
                step="0.5"
                value={poplitealCm}
                onChange={(event) => setPoplitealCm(event.target.value)}
              />
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Sit with your feet flat and measure from the floor to the crease behind the knee.
              </p>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="chc-height">
                Your height (cm)
              </label>
              <input
                id="chc-height"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="120"
                max="220"
                step="1"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="chc-shoe">
              Heel thickness of your usual shoes (cm)
            </label>
            <input
              id="chc-shoe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.5"
              value={shoeHeelCm}
              onChange={(event) => setShoeHeelCm(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your desk</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="chc-desk">
              Desk height, floor to surface (cm)
            </label>
            <input
              id="chc-desk"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="50"
              max="130"
              step="0.5"
              value={deskHeightCm}
              onChange={(event) => setDeskHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chc-apron">
              Desk top plus under-frame thickness (cm)
            </label>
            <input
              id="chc-apron"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.5"
              value={deskApronCm}
              onChange={(event) => setDeskApronCm(event.target.value)}
            />
          </div>
        </div>
        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
          htmlFor="chc-adjustable"
        >
          <input
            id="chc-adjustable"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            checked={deskAdjustable}
            onChange={(event) => setDeskAdjustable(event.target.checked)}
          />
          My desk height can be adjusted
        </label>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Set your seat to
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : cm(result.workingSeatCm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your numbers."
                : result.deskAdjustable
                  ? `Then bring the desk down to ${cm(result.idealDeskCm)}`
                  : result.footrestCm > 0
                    ? `Raised to reach the desk — add a ${cm(result.footrestCm)} footrest`
                    : "Your desk already matches this seat height"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy chair and desk measurements"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Seat height for feet flat on the floor",
              hasError ? DASH : cm(result.idealSeatCm),
            ],
            ["Usable seat depth", hasError ? DASH : cm(result.seatDepthCm)],
            ["Elbow height above the seat", hasError ? DASH : cm(result.elbowAboveSeatCm)],
            ["Desk height that matches your seat", hasError ? DASH : cm(result.idealDeskCm)],
            [
              "Your desk vs that target",
              hasError
                ? DASH
                : result.deskFits
                  ? "Within 2 cm — no change needed"
                  : result.deskDeltaCm > 0
                    ? `${cm(result.deskDeltaCm)} too high`
                    : `${cm(Math.abs(result.deskDeltaCm))} too low`,
            ],
            [
              "Footrest height",
              hasError ? DASH : result.footrestCm > 0 ? cm(result.footrestCm) : "Not needed",
            ],
            [
              "Clear space above your thighs",
              hasError
                ? DASH
                : `${cm(result.thighGapCm)} ${result.thighClearanceOk ? "(fine)" : "(too tight)"}`,
            ],
            [
              "Knee space to keep clear",
              hasError
                ? DASH
                : `${result.kneeSpaceWidthCm} cm wide × ${result.kneeSpaceDepthCm} cm deep`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.thighClearanceOk && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Your thighs do not clear the underside of the desk at this seat height. Raise the desk on
            risers by at least {cm(result.thighRiserNeededCm)}, or use a desk with a thinner
            top and no cross-brace — sitting sideways to make space is what starts twisting the
            lower back.
          </p>
        )}

        {!hasError && result.footrestCm > 0 && result.thighClearanceOk && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            A fixed {cm(result.recommendedDeskCm)} desk is {cm(result.deskDeltaCm)} above the height
            that matches your legs, so the chair goes up to meet the desk and the footrest carries
            your feet. A stack of ring binders works while you find a proper one.
          </p>
        )}

        {!hasError && result.statureEstimated && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Seat depth, elbow height and thigh thickness are scaled from an estimated body height of{" "}
            {cm(result.statureCm)}, derived from your popliteal measurement.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. These are 50th-percentile adult proportions applied to your own leg
        measurement — treat them as a starting point and fine-tune until your feet are supported,
        your thighs are level and your shoulders stay relaxed. Speak to a physiotherapist,
        occupational health adviser or doctor about persistent back, hip or leg pain at the desk.
      </p>
    </main>
  );
}
