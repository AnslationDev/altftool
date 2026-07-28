"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Monitor, RotateCcw } from "lucide-react";

import { ASPECT_RATIOS, USE_CASES, computeViewingDistance } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  diagonal: "27",
  aspect: "16:9",
  pxWidth: "2560",
  pxHeight: "1440",
  useCase: "desk",
  current: "70",
};

const PRESETS = [
  { label: '24" 1080p', diagonal: "24", aspect: "16:9", pxWidth: "1920", pxHeight: "1080" },
  { label: '27" 1440p', diagonal: "27", aspect: "16:9", pxWidth: "2560", pxHeight: "1440" },
  { label: '32" 4K', diagonal: "32", aspect: "16:9", pxWidth: "3840", pxHeight: "2160" },
  { label: '34" ultrawide', diagonal: "34", aspect: "21:9", pxWidth: "3440", pxHeight: "1440" },
  { label: '55" 4K TV', diagonal: "55", aspect: "16:9", pxWidth: "3840", pxHeight: "2160" },
];

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [diagonal, setDiagonal] = useState(DEFAULTS.diagonal);
  const [aspect, setAspect] = useState(DEFAULTS.aspect);
  const [pxWidth, setPxWidth] = useState(DEFAULTS.pxWidth);
  const [pxHeight, setPxHeight] = useState(DEFAULTS.pxHeight);
  const [useCase, setUseCase] = useState(DEFAULTS.useCase);
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeViewingDistance({
        diagonalInches: toNumber(diagonal),
        aspectId: aspect,
        pixelWidth: toNumber(pxWidth),
        pixelHeight: toNumber(pxHeight),
        useCaseId: useCase,
        currentCm: toNumber(current),
      }),
    [diagonal, aspect, pxWidth, pxHeight, useCase, current],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Screen Viewing Distance Calculator",
      `Screen: ${diagonal} inch ${result.aspect.id}, ${pxWidth} x ${pxHeight}`,
      `Panel size: ${result.widthCm} x ${result.heightCm} cm`,
      `Pixel density: ${result.ppi} PPI (${result.pitchMm} mm pitch)`,
      `Recommended distance: ${result.recommendedCm} cm (${result.recommendedIn} in)`,
      `Basis: ${result.recommendedBasis}`,
      `Horizontal field at that distance: ${result.recommendedAngle} degrees`,
      `Pixel-free distance (1 arcminute): ${result.pixelFreeCm} cm`,
      `SMPTE 30 degrees: ${result.smpteCm} cm, THX 40 degrees: ${result.thxCm} cm`,
      result.currentAngle !== null
        ? `Your current ${result.currentCm} cm gives a ${result.currentAngle} degree field. ${result.verdict}`
        : "No current distance entered.",
    ].join("\n");
  }, [result, hasError, diagonal, pxWidth, pxHeight]);

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
    setDiagonal(DEFAULTS.diagonal);
    setAspect(DEFAULTS.aspect);
    setPxWidth(DEFAULTS.pxWidth);
    setPxHeight(DEFAULTS.pxHeight);
    setUseCase(DEFAULTS.useCase);
    setCurrent(DEFAULTS.current);
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setDiagonal(preset.diagonal);
    setAspect(preset.aspect);
    setPxWidth(preset.pxWidth);
    setPxHeight(preset.pxHeight);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Basis for the recommendation", DASH],
        ["Panel size", DASH],
        ["Pixel density", DASH],
        ["Pixel pitch", DASH],
        ["Pixel-free distance (20/20 eye)", DASH],
        ["SMPTE 30 degree distance", DASH],
        ["THX 40 degree distance", DASH],
        ["Field of view at the recommendation", DASH],
        ["Your current distance", DASH],
        ["Screen centre below the top edge", DASH],
      ]
    : [
        ["Basis for the recommendation", result.recommendedBasis],
        ["Panel size", `${NUM.format(result.widthCm)} x ${NUM.format(result.heightCm)} cm`],
        ["Pixel density", `${NUM.format(result.ppi)} PPI`],
        ["Pixel pitch", `${NUM2.format(result.pitchMm)} mm`],
        ["Pixel-free distance (20/20 eye)", `${NUM.format(result.pixelFreeCm)} cm`],
        ["SMPTE 30 degree distance", `${NUM.format(result.smpteCm)} cm`],
        ["THX 40 degree distance", `${NUM.format(result.thxCm)} cm`],
        ["Field of view at the recommendation", `${NUM.format(result.recommendedAngle)}°`],
        [
          "Your current distance",
          result.currentAngle !== null
            ? `${NUM.format(result.currentCm)} cm — ${NUM.format(result.currentAngle)}° field`
            : "Not entered",
        ],
        ["Screen centre below the top edge", `${NUM.format(result.centreBelowTopCm)} cm`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Screen Viewing Distance Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out how far your eyes should sit from the screen using pixel density, the SMPTE and
          THX viewing angles and the 50-100 cm ergonomic window used for desk work.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="svd-diagonal">
              Screen diagonal (inches)
            </label>
            <input
              id="svd-diagonal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="200"
              step="0.1"
              value={diagonal}
              onChange={(event) => setDiagonal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svd-aspect">
              Aspect ratio
            </label>
            <select
              id="svd-aspect"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aspect}
              onChange={(event) => setAspect(event.target.value)}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.id} value={ratio.id}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svd-px-width">
              Horizontal resolution (px)
            </label>
            <input
              id="svd-px-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={pxWidth}
              onChange={(event) => setPxWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svd-px-height">
              Vertical resolution (px)
            </label>
            <input
              id="svd-px-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={pxHeight}
              onChange={(event) => setPxHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svd-use">
              Mostly used for
            </label>
            <select
              id="svd-use"
              className={`mt-2 ${INPUT_CLASS}`}
              value={useCase}
              onChange={(event) => setUseCase(event.target.value)}
            >
              {USE_CASES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svd-current">
              Your current distance (cm)
            </label>
            <input
              id="svd-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
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
              Recommended eye-to-screen distance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.recommendedCm)} cm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a distance."
                : `about ${NUM.format(result.recommendedIn)} inches · ${result.useCase.note}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the viewing distance result"
              className={GHOST_BTN}
              disabled={hasError}
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

        {!hasError && result.verdict && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
            {result.verdict}
            {result.pixelsVisibleNow
              ? " At your current distance a 20/20 eye can still resolve individual pixels."
              : ""}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Height and tilt, not just distance</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
            <span>
              Put the top of the screen at or just below seated eye level, which places the centre of
              the panel about {hasError ? DASH : `${NUM.format(result.centreBelowTopCm)} cm`} below
              your eye line — a slight downgaze that keeps more of the eye surface covered by the lid.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
            <span>Tilt the screen back 10 to 20 degrees so it faces your eyes squarely.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
            <span>
              Keep desk viewing inside the 50-100 cm window. If text is unreadable at that distance,
              raise the operating system scaling rather than leaning in.
            </span>
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Distance figures assume normal or fully corrected vision — if you find
        yourself leaning in, or if text blurs at a comfortable distance, book an eye examination
        rather than moving the monitor.
      </p>
    </main>
  );
}
