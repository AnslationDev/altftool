"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Film, RotateCcw } from "lucide-react";

import {
  alignedFpsOptions,
  buildSpriteCss,
  COMMON_FPS,
  computeSpriteTiming,
  REFRESH_RATES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  frameCount: "12",
  fps: "12",
  frameWidth: "64",
  frameHeight: "64",
  columns: "4",
  refreshHz: "60",
  selector: ".sprite",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [frameCount, setFrameCount] = useState(DEFAULTS.frameCount);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [frameWidth, setFrameWidth] = useState(DEFAULTS.frameWidth);
  const [frameHeight, setFrameHeight] = useState(DEFAULTS.frameHeight);
  const [columns, setColumns] = useState(DEFAULTS.columns);
  const [refreshHz, setRefreshHz] = useState(DEFAULTS.refreshHz);
  const [selector, setSelector] = useState(DEFAULTS.selector);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSpriteTiming({
        frameCount: Number(frameCount),
        fps: Number(fps),
        frameWidth: Number(frameWidth),
        frameHeight: Number(frameHeight),
        columns: Number(columns),
        refreshHz: Number(refreshHz),
      }),
    [frameCount, fps, frameWidth, frameHeight, columns, refreshHz],
  );

  const error = result.error || null;
  const css = error ? "" : buildSpriteCss(result, selector.trim() || ".sprite");

  const alignedOptions = useMemo(
    () => alignedFpsOptions(Number(refreshHz), 60).slice(0, 6),
    [refreshHz],
  );

  const copyCss = async () => {
    if (!css) return;
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFrameCount(DEFAULTS.frameCount);
    setFps(DEFAULTS.fps);
    setFrameWidth(DEFAULTS.frameWidth);
    setFrameHeight(DEFAULTS.frameHeight);
    setColumns(DEFAULTS.columns);
    setRefreshHz(DEFAULTS.refreshHz);
    setSelector(DEFAULTS.selector);
    setCopied(false);
  };

  const cells = error
    ? []
    : Array.from({ length: result.rows * result.columns }, (_, index) => ({
        index,
        used: index < result.frames,
      }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Film className="h-4 w-4" aria-hidden="true" />
          Sprite animation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sprite Animation Timing Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a frame count and a target frame rate into frame duration, sheet dimensions,
          refresh-rate alignment and a CSS <code>steps()</code> animation you can paste straight in.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="satc-frames">
              Frame count
            </label>
            <input
              id="satc-frames"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={frameCount}
              onChange={(event) => setFrameCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="satc-fps">
              Frame rate (fps)
            </label>
            <input
              id="satc-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="satc-width">
              Frame width (px)
            </label>
            <input
              id="satc-width"
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
            <label className={LABEL_CLASS} htmlFor="satc-height">
              Frame height (px)
            </label>
            <input
              id="satc-height"
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
            <label className={LABEL_CLASS} htmlFor="satc-cols">
              Frames per row on the sheet
            </label>
            <input
              id="satc-cols"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={columns}
              onChange={(event) => setColumns(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="satc-hz">
              Display refresh rate (Hz)
            </label>
            <select
              id="satc-hz"
              className={`mt-2 ${INPUT_CLASS}`}
              value={refreshHz}
              onChange={(event) => setRefreshHz(event.target.value)}
            >
              {REFRESH_RATES.map((hz) => (
                <option key={hz} value={String(hz)}>
                  {hz} Hz
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="satc-selector">
              CSS selector
            </label>
            <input
              id="satc-selector"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={selector}
              onChange={(event) => setSelector(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {COMMON_FPS.map((value) => (
            <button key={value} type="button" onClick={() => setFps(String(value))} className={CHIP_BTN}>
              {value} fps
            </button>
          ))}
        </div>
        {alignedOptions.length > 0 ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Rates that divide {refreshHz} Hz evenly:{" "}
            {alignedOptions.map((option) => NUM2.format(option.fps)).join(", ")} fps
          </p>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Duration of one frame
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${NUM2.format(result.frameDurationMs)} ms`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the input above to see the timing."
                : `${NUM.format(result.frames)} frames · full cycle ${NUM2.format(result.totalDurationMs)} ms`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCss}
              aria-label="Copy the sprite animation CSS"
              className={GHOST_BTN}
              disabled={!css}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy CSS"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sheet layout", error ? "—" : `${NUM.format(result.columns)} across × ${NUM.format(result.rows)} down`],
            ["Sheet dimensions", error ? "—" : `${NUM.format(result.sheetWidth)} × ${NUM.format(result.sheetHeight)} px`],
            ["Full cycle length", error ? "—" : `${NUM2.format(result.totalDurationMs)} ms (${NUM2.format(result.totalDurationS)} s)`],
            [
              "Display refreshes per frame",
              error
                ? "—"
                : `${NUM2.format(result.refreshesPerFrame)} at ${NUM.format(result.refreshHz)} Hz${result.alignedToRefresh ? " (even)" : " (uneven)"}`,
            ],
            ["Nearest evenly divided rate", error ? "—" : `${NUM2.format(result.nearestAlignedFps)} fps`],
            ["GIF frame delay", error ? "—" : `${NUM.format(result.gifDelayCs)} centiseconds`],
            ["Empty cells on the sheet", error ? "—" : NUM.format(result.emptyCells)],
            ["Uncompressed sheet size", error ? "—" : `${NUM1.format(result.uncompressedKiB)} KiB as RGBA`],
            ["Final background position", error ? "—" : `${NUM.format(result.endPositionX)}px, ${NUM.format(result.endPositionY)}px`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? null : (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Sheet layout</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Frames run left to right, then down. Faded cells are padding you would be shipping for
              nothing.
            </p>
            <div className="mt-3 overflow-x-auto">
              <div
                className="grid min-w-fit gap-1"
                style={{ gridTemplateColumns: `repeat(${result.columns}, minmax(2.25rem, 1fr))` }}
              >
                {cells.map((cell) => (
                  <div
                    key={cell.index}
                    className={`flex aspect-square min-w-9 items-center justify-center rounded-sm text-xs font-semibold ${
                      cell.used
                        ? "bg-[var(--primary)]/20 text-[var(--foreground)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] opacity-50"
                    }`}
                  >
                    {cell.used ? cell.index + 1 : "·"}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">CSS</h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--foreground)]">
              {css}
            </pre>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        <code>steps()</code> defaults to jump-end, so the final keyframe position is never held —
        that is what makes exactly one cycle show every frame once. The generated CSS switches the
        animation off under <code>prefers-reduced-motion</code>.
      </p>
    </main>
  );
}
