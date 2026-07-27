"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

import {
  CAP_HEIGHT_RATIOS,
  DISTANCE_UNITS,
  LEGIBILITY_LEVELS,
  buildDistanceLadder,
  computeLegibleTextSize,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULTS = {
  distance: "8",
  distanceUnit: "m",
  levelId: "comfortable",
  customArcmin: "22",
  faceId: "grotesque",
  screenHeight: "1.5",
  screenHeightUnit: "m",
  canvasHeightPx: "1080",
  includeScreen: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const UNIT_KEYS = Object.keys(DISTANCE_UNITS);

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [distanceUnit, setDistanceUnit] = useState(DEFAULTS.distanceUnit);
  const [levelId, setLevelId] = useState(DEFAULTS.levelId);
  const [customArcmin, setCustomArcmin] = useState(DEFAULTS.customArcmin);
  const [faceId, setFaceId] = useState(DEFAULTS.faceId);
  const [includeScreen, setIncludeScreen] = useState(DEFAULTS.includeScreen);
  const [screenHeight, setScreenHeight] = useState(DEFAULTS.screenHeight);
  const [screenHeightUnit, setScreenHeightUnit] = useState(DEFAULTS.screenHeightUnit);
  const [canvasHeightPx, setCanvasHeightPx] = useState(DEFAULTS.canvasHeightPx);
  const [copied, setCopied] = useState(false);

  const level = LEGIBILITY_LEVELS.find((item) => item.id === levelId) || null;
  const face = CAP_HEIGHT_RATIOS.find((item) => item.id === faceId) || null;
  const arcmin = level ? level.arcmin : toNumber(customArcmin);
  const capHeightRatio = face ? face.ratio : NaN;

  const result = useMemo(
    () =>
      computeLegibleTextSize({
        distance: toNumber(distance),
        distanceUnit,
        arcmin,
        capHeightRatio,
        screenHeight: includeScreen ? toNumber(screenHeight) : 0,
        screenHeightUnit,
        canvasHeightPx: includeScreen ? toNumber(canvasHeightPx) : 0,
      }),
    [
      distance,
      distanceUnit,
      arcmin,
      capHeightRatio,
      includeScreen,
      screenHeight,
      screenHeightUnit,
      canvasHeightPx,
    ],
  );

  const ladder = useMemo(
    () => (result.error ? [] : buildDistanceLadder(result.capHeightMm, distanceUnit)),
    [result, distanceUnit],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Text Legibility Distance Calculator",
      `Viewing distance: ${NUM2.format(toNumber(distance))} ${distanceUnit}`,
      `Target visual angle: ${NUM0.format(result.arcmin)} arcminutes`,
      `Minimum cap height: ${NUM1.format(result.capHeightMm)} mm (${NUM2.format(result.capHeightIn)} in)`,
      `Equivalent font size: ${NUM0.format(result.fontSizePt)} pt at a cap height of ${NUM2.format(result.capHeightRatio)} em`,
      `Signage rule of thumb (1 in per 10 ft): ${NUM2.format(result.ruleOfThumbCapIn)} in`,
    ];
    if (result.onScreen) {
      lines.push(
        `On a ${NUM0.format(result.onScreen.canvasHeightPx)} px canvas: ${NUM0.format(result.onScreen.fontSizePx)} px font size (${NUM2.format(result.onScreen.shareOfScreenPct)}% of screen height)`,
      );
    }
    return lines.join("\n");
  }, [result, distance, distanceUnit]);

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
    setDistance(DEFAULTS.distance);
    setDistanceUnit(DEFAULTS.distanceUnit);
    setLevelId(DEFAULTS.levelId);
    setCustomArcmin(DEFAULTS.customArcmin);
    setFaceId(DEFAULTS.faceId);
    setIncludeScreen(DEFAULTS.includeScreen);
    setScreenHeight(DEFAULTS.screenHeight);
    setScreenHeightUnit(DEFAULTS.screenHeightUnit);
    setCanvasHeightPx(DEFAULTS.canvasHeightPx);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Typography
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Text Legibility Distance Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Legibility is a matter of visual angle, not millimetres. Give a viewing distance and this
          returns the cap height and point size that subtend the angle human-factors standards ask
          for — for signage, posters, exhibition graphics and slides.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tl-distance">
              Viewing distance
            </label>
            <input
              id="tl-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tl-unit">
              Distance unit
            </label>
            <select
              id="tl-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={distanceUnit}
              onChange={(event) => setDistanceUnit(event.target.value)}
            >
              {UNIT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {DISTANCE_UNITS[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tl-level">
              Legibility target
            </label>
            <select
              id="tl-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
            >
              {LEGIBILITY_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.arcmin}′)
                </option>
              ))}
              <option value="custom">Custom angle</option>
            </select>
          </div>
          {level ? (
            <div>
              <span className={LABEL_CLASS}>Why this angle</span>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{level.note}</p>
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="tl-arcmin">
                Custom angle (minutes of arc)
              </label>
              <input
                id="tl-arcmin"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="600"
                step="1"
                value={customArcmin}
                onChange={(event) => setCustomArcmin(event.target.value)}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tl-face">
              Typeface class (sets the cap height ratio)
            </label>
            <select
              id="tl-face"
              className={`mt-2 ${INPUT_CLASS}`}
              value={faceId}
              onChange={(event) => setFaceId(event.target.value)}
            >
              {CAP_HEIGHT_RATIOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — cap {item.ratio} em
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[var(--border)] p-3">
          <label
            htmlFor="tl-screen-toggle"
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
          >
            <input
              id="tl-screen-toggle"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={includeScreen}
              onChange={(event) => setIncludeScreen(event.target.checked)}
            />
            Also convert to pixels for a slide, screen or artboard
          </label>
          {includeScreen ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="tl-screen-height">
                  Physical height
                </label>
                <input
                  id="tl-screen-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={screenHeight}
                  onChange={(event) => setScreenHeight(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="tl-screen-unit">
                  Height unit
                </label>
                <select
                  id="tl-screen-unit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={screenHeightUnit}
                  onChange={(event) => setScreenHeightUnit(event.target.value)}
                >
                  {UNIT_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {DISTANCE_UNITS[key].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="tl-canvas">
                  Canvas height (px)
                </label>
                <input
                  id="tl-canvas"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="10"
                  value={canvasHeightPx}
                  onChange={(event) => setCanvasHeightPx(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {result.error ? (
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
              Minimum cap height
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : `${NUM1.format(result.capHeightMm)} mm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `${NUM2.format(result.capHeightIn)} in · about ${NUM0.format(result.fontSizePt)} pt in this typeface class`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the legibility result"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Cap height", result.error ? DASH : `${NUM1.format(result.capHeightMm)} mm`],
            ["Cap height in inches", result.error ? DASH : `${NUM2.format(result.capHeightIn)} in`],
            ["Font size", result.error ? DASH : `${NUM0.format(result.fontSizePt)} pt`],
            ["Em box height", result.error ? DASH : `${NUM1.format(result.emHeightMm)} mm`],
            ["Typical x-height", result.error ? DASH : `${NUM1.format(result.xHeightMm)} mm`],
            ["Target visual angle", result.error ? DASH : `${NUM0.format(result.arcmin)} arcminutes`],
            [
              "Signage rule of thumb (1 in / 10 ft)",
              result.error ? DASH : `${NUM2.format(result.ruleOfThumbCapIn)} in`,
            ],
            ...(result.error || !result.onScreen
              ? []
              : [
                  [
                    "Share of screen height",
                    `${NUM2.format(result.onScreen.shareOfScreenPct)}%`,
                  ],
                  ["Cap height on canvas", `${NUM0.format(result.onScreen.capHeightPx)} px`],
                  ["Font size on canvas", `${NUM0.format(result.onScreen.fontSizePx)} px`],
                ]),
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && result.onScreen && !result.onScreen.fitsOnScreen ? (
          <p className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs font-medium text-[var(--warning)]">
            The required letter is taller than the screen itself. Move the audience closer or use a
            bigger display.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How far this cap height carries</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The same letter judged against each legibility target.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Target
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Angle
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Max distance
                </th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.label}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                    {row.arcmin}′
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {NUM2.format(row.distance)} {row.unit}
                  </td>
                </tr>
              ))}
              {ladder.length === 0 ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These figures assume normal (6/6) vision, good contrast and even lighting. Low contrast,
        glare, motion, older readers or low-vision audiences all call for larger sizes, and statutory
        accessibility or safety signage codes may set their own minimums that override this.
      </p>
    </main>
  );
}
