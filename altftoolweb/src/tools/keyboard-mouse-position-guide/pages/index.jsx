"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Keyboard, RotateCcw } from "lucide-react";

import { KEYBOARD_LAYOUTS, analyseKeyboardPosition } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  heightCm: "175",
  seatHeightCm: "45",
  deskHeightCm: "74",
  layout: "fullsize",
  mouseWidthCm: "7",
  gapCm: "2",
  frontHeightCm: "2",
  rearHeightCm: "3.2",
  keyboardDepthCm: "13",
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
const deg = (value) => `${NUM.format(value)}°`;

export default function ToolHome() {
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [seatHeightCm, setSeatHeightCm] = useState(DEFAULTS.seatHeightCm);
  const [deskHeightCm, setDeskHeightCm] = useState(DEFAULTS.deskHeightCm);
  const [layout, setLayout] = useState(DEFAULTS.layout);
  const [mouseWidthCm, setMouseWidthCm] = useState(DEFAULTS.mouseWidthCm);
  const [gapCm, setGapCm] = useState(DEFAULTS.gapCm);
  const [frontHeightCm, setFrontHeightCm] = useState(DEFAULTS.frontHeightCm);
  const [rearHeightCm, setRearHeightCm] = useState(DEFAULTS.rearHeightCm);
  const [keyboardDepthCm, setKeyboardDepthCm] = useState(DEFAULTS.keyboardDepthCm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseKeyboardPosition({
        heightCm,
        seatHeightCm,
        deskHeightCm,
        layout,
        mouseWidthCm,
        gapCm,
        frontHeightCm,
        rearHeightCm,
        keyboardDepthCm,
      }),
    [
      heightCm,
      seatHeightCm,
      deskHeightCm,
      layout,
      mouseWidthCm,
      gapCm,
      frontHeightCm,
      rearHeightCm,
      keyboardDepthCm,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Keyboard and Mouse Position Guide",
      `Seated elbow height: ${cm(result.elbowHeightCm)} above the floor`,
      `Key surface height: ${cm(result.keySurfaceCm)} (${result.keySurfaceDeltaCm >= 0 ? "+" : ""}${NUM.format(result.keySurfaceDeltaCm)} cm vs elbow)`,
      `Keyboard tilt: ${deg(result.tiltDeg)} (${result.tiltPositive ? "positive — extends the wrist" : result.tiltNegative ? "negative — good" : "flat"})`,
      `Mouse sits ${cm(result.mouseMidlineOffsetCm)} from your midline, ${cm(result.mouseShoulderOffsetCm)} outside the shoulder line`,
      `Verdict: ${result.band}`,
      `Forearm-only reach zone: ${cm(result.forearmReachCm)} radius`,
      result.savingCm > 0
        ? `Switching to a ${result.bestLayoutLabel} would bring the mouse ${cm(result.savingCm)} closer in.`
        : "Your layout already puts the mouse as close to the shoulder line as any of the options.",
      `Desk width needed for keyboard + mouse: ${cm(result.deskWidthNeededCm)}`,
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
    setHeightCm(DEFAULTS.heightCm);
    setSeatHeightCm(DEFAULTS.seatHeightCm);
    setDeskHeightCm(DEFAULTS.deskHeightCm);
    setLayout(DEFAULTS.layout);
    setMouseWidthCm(DEFAULTS.mouseWidthCm);
    setGapCm(DEFAULTS.gapCm);
    setFrontHeightCm(DEFAULTS.frontHeightCm);
    setRearHeightCm(DEFAULTS.rearHeightCm);
    setKeyboardDepthCm(DEFAULTS.keyboardDepthCm);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Keyboard className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Keyboard and Mouse Position Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three numbers decide whether typing is neutral: the height of the key surface, the tilt of
          the key plane, and how far your keyboard&apos;s width pushes the mouse away from your
          shoulder. This measures all three against your own body.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">You and the desk</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kmpg-height">
              Your height (cm)
            </label>
            <input
              id="kmpg-height"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="kmpg-seat">
              Seat height, floor to cushion (cm)
            </label>
            <input
              id="kmpg-seat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="70"
              step="0.5"
              value={seatHeightCm}
              onChange={(event) => setSeatHeightCm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kmpg-desk">
              Desk height, floor to surface (cm)
            </label>
            <input
              id="kmpg-desk"
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
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Keyboard and mouse</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kmpg-layout">
              Keyboard layout
            </label>
            <select
              id="kmpg-layout"
              className={`mt-2 ${INPUT_CLASS}`}
              value={layout}
              onChange={(event) => setLayout(event.target.value)}
            >
              {KEYBOARD_LAYOUTS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label} — {entry.widthCm} cm wide
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kmpg-mouse">
              Mouse width at its widest (cm)
            </label>
            <input
              id="kmpg-mouse"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="3"
              max="15"
              step="0.5"
              value={mouseWidthCm}
              onChange={(event) => setMouseWidthCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kmpg-gap">
              Gap from keyboard edge to mouse (cm)
            </label>
            <input
              id="kmpg-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={gapCm}
              onChange={(event) => setGapCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kmpg-front">
              Key height at the front edge (cm)
            </label>
            <input
              id="kmpg-front"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="6"
              step="0.1"
              value={frontHeightCm}
              onChange={(event) => setFrontHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kmpg-rear">
              Key height at the back edge (cm)
            </label>
            <input
              id="kmpg-rear"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="10"
              step="0.1"
              value={rearHeightCm}
              onChange={(event) => setRearHeightCm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kmpg-depth">
              Keyboard depth, front to back (cm)
            </label>
            <input
              id="kmpg-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="30"
              step="0.5"
              value={keyboardDepthCm}
              onChange={(event) => setKeyboardDepthCm(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Measure the key heights with the flip-out feet in the position you actually use — that is
          what sets the tilt.
        </p>
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
              Mouse offset from your shoulder line
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : cm(result.mouseShoulderOffsetCm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see your numbers." : result.band}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy keyboard and mouse position analysis"
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
            ["Seated elbow height", hasError ? DASH : cm(result.elbowHeightCm)],
            [
              "Key surface height",
              hasError
                ? DASH
                : `${cm(result.keySurfaceCm)} (${result.keySurfaceDeltaCm >= 0 ? "+" : ""}${NUM.format(result.keySurfaceDeltaCm)} cm vs elbow)`,
            ],
            [
              "Desk vs elbow height",
              hasError
                ? DASH
                : result.deskTooHigh
                  ? `${cm(result.deskDeltaCm)} too high`
                  : result.deskTooLow
                    ? `${cm(Math.abs(result.deskDeltaCm))} too low`
                    : "Matched",
            ],
            [
              "Keyboard tilt",
              hasError
                ? DASH
                : `${deg(result.tiltDeg)} ${result.tiltPositive ? "(positive)" : result.tiltNegative ? "(negative)" : "(flat)"}`,
            ],
            ["Mouse distance from your midline", hasError ? DASH : cm(result.mouseMidlineOffsetCm)],
            ["Your shoulder line", hasError ? DASH : `${cm(result.shoulderLineCm)} from the midline`],
            [
              "Forearm-only reach zone",
              hasError
                ? DASH
                : `${cm(result.forearmReachCm)} radius — mouse is ${result.withinForearmReach ? "inside it" : "outside it"}`,
            ],
            ["Full forward reach", hasError ? DASH : cm(result.forwardReachCm)],
            ["Desk width the pair needs", hasError ? DASH : cm(result.deskWidthNeededCm)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.tiltPositive && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-xs font-medium leading-5 ${
              result.tiltOverLimit
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            The back of your keyboard is higher than the front, so the key plane tips{" "}
            {deg(result.tiltDeg)} towards you and your wrists extend by about that much just to reach
            the keys
            {result.tiltOverLimit
              ? `, past the ${result.wristLimitDeg}° usually quoted as the limit for a neutral wrist. Fold the flip-out feet away.`
              : ". Folding the flip-out feet away removes it for free."}
          </p>
        )}

        {!hasError && result.savingCm > 0 && (
          <p className="mt-3 rounded-md bg-[var(--success-soft)] px-3 py-2 text-xs font-medium leading-5 text-[var(--success)]">
            A {result.bestLayoutLabel} keyboard would bring the mouse {cm(result.savingCm)} closer to
            your shoulder line without moving anything else on the desk.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where each layout puts the mouse</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Layout
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Width
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    From midline
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Outside shoulder
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.layouts.map((entry) => (
                  <tr key={entry.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span
                        className={
                          entry.key === result.layoutKey
                            ? "font-semibold text-[var(--primary)]"
                            : undefined
                        }
                      >
                        {entry.label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">{cm(entry.widthCm)}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {cm(entry.midlineOffsetCm)}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap font-semibold">
                      {cm(entry.shoulderOffsetCm)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            A numpad you rarely use still costs you about 8 cm of reach on every mouse movement, all
            day. Moving the mouse to the left hand, or using a separate numpad on the far side, has
            the same effect as a narrower board.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Reach zones and shoulder width are proportional estimates from
        50th-percentile adult body dimensions, and keyboard widths are typical values for each layout
        rather than your specific board. See a physiotherapist or doctor about wrist, forearm or
        shoulder pain, and about any numbness or tingling in the hand.
      </p>
    </main>
  );
}
