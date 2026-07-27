"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ratio, RotateCcw } from "lucide-react";
import { ASPECT_PRESETS, FRAME_PRESETS, computeBars, simplifyRatio } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  frameWidth: "1920",
  frameHeight: "1080",
  aspectWidth: "2.39",
  aspectHeight: "1",
};

const MODE_TEXT = {
  letterbox: "Letterbox — bars above and below",
  pillarbox: "Pillarbox — bars left and right",
  none: "Perfect fit — no bars",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [frameWidth, setFrameWidth] = useState(DEFAULTS.frameWidth);
  const [frameHeight, setFrameHeight] = useState(DEFAULTS.frameHeight);
  const [aspectWidth, setAspectWidth] = useState(DEFAULTS.aspectWidth);
  const [aspectHeight, setAspectHeight] = useState(DEFAULTS.aspectHeight);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBars({
        frameWidth: toNumber(frameWidth),
        frameHeight: toNumber(frameHeight),
        sourceAspectWidth: toNumber(aspectWidth),
        sourceAspectHeight: toNumber(aspectHeight),
      }),
    [frameWidth, frameHeight, aspectWidth, aspectHeight],
  );

  const hasError = Boolean(result.error);
  const frameRatio = simplifyRatio(toNumber(frameWidth), toNumber(frameHeight));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Letterbox / pillarbox",
      `Frame: ${result.frameWidth} x ${result.frameHeight} (${NUM.format(result.frameAspect)}:1)`,
      `Source aspect: ${NUM.format(result.sourceAspect)}:1`,
      MODE_TEXT[result.mode],
      `Picture area: ${NUM.format(result.pictureWidth)} x ${NUM.format(result.pictureHeight)} px`,
      `Encoder-safe even size: ${result.pictureWidthEven} x ${result.pictureHeightEven} px`,
      `Each bar: ${NUM.format(result.barSize)} px (${NUM.format(result.barPercentEach)}%)`,
      `Both bars: ${NUM.format(result.barTotal)} px`,
      `Frame area used: ${NUM.format(result.areaUsedPercent)}%`,
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
    setFrameWidth(DEFAULTS.frameWidth);
    setFrameHeight(DEFAULTS.frameHeight);
    setAspectWidth(DEFAULTS.aspectWidth);
    setAspectHeight(DEFAULTS.aspectHeight);
    setCopied(false);
  };

  const rows = [
    [
      "Bar placement",
      hasError ? DASH : MODE_TEXT[result.mode],
    ],
    [
      "Picture area inside the frame",
      hasError ? DASH : `${NUM.format(result.pictureWidth)} x ${NUM.format(result.pictureHeight)} px`,
    ],
    [
      "Rounded to even pixels (encoder safe)",
      hasError ? DASH : `${result.pictureWidthEven} x ${result.pictureHeightEven} px`,
    ],
    ["Both bars combined", hasError ? DASH : `${NUM.format(result.barTotal)} px`],
    ["Each bar as % of the frame", hasError ? DASH : `${NUM.format(result.barPercentEach)}%`],
    ["Frame area filled by picture", hasError ? DASH : `${NUM.format(result.areaUsedPercent)}%`],
    ["Frame aspect ratio", hasError ? DASH : `${NUM.format(result.frameAspect)}:1`],
    ["Source aspect ratio", hasError ? DASH : `${NUM.format(result.sourceAspect)}:1`],
  ];

  const previewStyle = hasError
    ? null
    : {
        aspectRatio: `${result.frameWidth} / ${result.frameHeight}`,
      };
  const innerStyle = hasError
    ? null
    : {
        width: `${(result.pictureWidth / result.frameWidth) * 100}%`,
        height: `${(result.pictureHeight / result.frameHeight) * 100}%`,
      };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ratio className="h-4 w-4" aria-hidden="true" />
          Framing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Letterbox Pillarbox Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fit one aspect ratio inside another and get the exact bar height or width in pixels and
          percent, plus the picture size to render at.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lb-frame-w">
              Frame width (px)
            </label>
            <input
              id="lb-frame-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={frameWidth}
              onChange={(event) => setFrameWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lb-frame-h">
              Frame height (px)
            </label>
            <input
              id="lb-frame-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={frameHeight}
              onChange={(event) => setFrameHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lb-aspect-w">
              Source aspect — width part
            </label>
            <input
              id="lb-aspect-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={aspectWidth}
              onChange={(event) => setAspectWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lb-aspect-h">
              Source aspect — height part
            </label>
            <input
              id="lb-aspect-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={aspectHeight}
              onChange={(event) => setAspectHeight(event.target.value)}
            />
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Source aspect presets
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ASPECT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setAspectWidth(String(preset.width));
                setAspectHeight(String(preset.height));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Target frame presets
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FRAME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setFrameWidth(String(preset.width));
                setFrameHeight(String(preset.height));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Each bar
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.barSize)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the bar sizes."
                : `${MODE_TEXT[result.mode]}${frameRatio ? ` · frame is ${frameRatio.width}:${frameRatio.height}` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy letterbox and pillarbox figures"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && previewStyle ? (
          <div className="mt-5">
            <div
              className="mx-auto flex w-full max-w-sm items-center justify-center rounded-md border border-[var(--border)] bg-[var(--muted)]"
              style={previewStyle}
              role="img"
              aria-label={`Preview: ${MODE_TEXT[result.mode]} inside a ${result.frameWidth} by ${result.frameHeight} frame`}
            >
              <div className="bg-[var(--primary)]/80" style={innerStyle} />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Teal block is the picture; the grey area is the bar.
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bar sizes rarely land on whole pixels. Round the picture height or width down to an even
        number for H.264 and H.265 encoding, and add the leftover pixel to a bar rather than
        stretching the image.
      </p>
    </main>
  );
}
