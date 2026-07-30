"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Info, RotateCcw, Thermometer, Upload } from "lucide-react";

import {
  SEVERITY_BANDS,
  analyzeFacialRedness,
  buildRednessSummary,
  buildSampleFrame,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

/** Long edge the photo is scaled to before pixels are read, to keep memory sane. */
const MAX_EDGE = 1600;
const PREVIEW_MAX_WIDTH = 480;

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

export default function ToolHome() {
  const [frame, setFrame] = useState(null);
  const [source, setSource] = useState("sample");
  const [fileName, setFileName] = useState("");
  const [loadError, setLoadError] = useState("");
  const [showOverlay, setShowOverlay] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  // Build the synthetic sample after mount so the server and client markup match.
  useEffect(() => {
    setFrame(buildSampleFrame({ width: 320, height: 400 }));
  }, []);

  const result = useMemo(() => (frame ? analyzeFacialRedness(frame) : null), [frame]);
  const hasError = Boolean(result?.error);
  const report = hasError ? null : result;

  // Preview with the sampled face box and region windows drawn on top.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;
    const scale = Math.min(1, PREVIEW_MAX_WIDTH / frame.width);
    const displayW = Math.round(frame.width * scale);
    const displayH = Math.round(frame.height * scale);
    canvas.width = displayW;
    canvas.height = displayH;

    const offscreen = document.createElement("canvas");
    offscreen.width = frame.width;
    offscreen.height = frame.height;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;
    offCtx.putImageData(new ImageData(frame.data, frame.width, frame.height), 0, 0);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, displayW, displayH);
    ctx.drawImage(offscreen, 0, 0, displayW, displayH);

    if (!showOverlay || !report) return;
    ctx.lineWidth = 2;
    ctx.strokeStyle = getComputedStyle(canvas).color;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(
      report.face.x * scale,
      report.face.y * scale,
      report.face.w * scale,
      report.face.h * scale,
    );
    ctx.setLineDash([]);
    for (const region of report.regions) {
      if (!region.enough) continue;
      ctx.strokeRect(
        region.box.x * scale,
        region.box.y * scale,
        region.box.w * scale,
        region.box.h * scale,
      );
    }
  }, [frame, report, showOverlay]);

  const loadFile = useCallback((file) => {
    if (!file) return;
    setLoadError("");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const longest = Math.max(img.naturalWidth, img.naturalHeight);
        const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, width, height);
        const pixels = ctx.getImageData(0, 0, width, height);
        setFrame({ data: pixels.data, width, height });
        setSource("file");
        setFileName(file.name);
      } catch {
        setLoadError(
          "The browser refused to read the pixels of that file. Try a JPEG or PNG saved on this device.",
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setLoadError("That file could not be decoded as an image.");
    };
    img.src = url;
  }, []);

  const summary = useMemo(() => (report ? buildRednessSummary(report) : ""), [report]);

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
    setFrame(buildSampleFrame({ width: 320, height: 400 }));
    setSource("sample");
    setFileName("");
    setLoadError("");
    setShowOverlay(true);
    setCopied(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Thermometer className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Redness Analyzer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          This measures colour, in the open. Skin-toned pixels are converted from sRGB to CIELAB and
          the a* axis — green to red — is averaged for the cheeks, nose, forehead and chin. The
          headline number is Δa*: how much redder an area is than the calmest skin in the same
          photo, which cancels most of the skin tone and the lighting. The photo is decoded in this
          browser and never uploaded.
        </p>
      </header>

      <section
        aria-label="Photo"
        className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ra-file">
              Photo
            </label>
            <input
              id="ra-file"
              ref={inputRef}
              type="file"
              accept="image/*"
              className="mt-1 block h-11 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] file:mr-3 file:rounded file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              onChange={(event) => loadFile(event.target.files?.[0])}
            />
            <p className={HINT_CLASS}>
              Straight-on, even daylight, no filter or beauty mode. Nothing is uploaded.
            </p>
          </div>

          <div className="flex flex-col justify-end gap-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
              htmlFor="ra-overlay"
            >
              <input
                id="ra-overlay"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={showOverlay}
                onChange={(event) => setShowOverlay(event.target.checked)}
              />
              Show the areas that were sampled
            </label>
            <p className={HINT_CLASS}>
              {source === "sample"
                ? "Showing the built-in synthetic test card — a drawn colour target, not a person. Load a photo to measure your own skin."
                : `Measuring ${fileName || "your photo"}.`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            disabled={!summary}
            aria-label="Copy the measurement summary"
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
            className={GHOST_BTN}
            onClick={() => inputRef.current?.click()}
            aria-label="Choose a photo"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose photo
          </button>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={reset}
            aria-label="Clear the photo and go back to the sample"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {loadError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {loadError}
        </p>
      ) : null}

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[auto_1fr]">
        <section
          aria-label="Preview"
          className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]"
        >
          <canvas
            ref={canvasRef}
            className="mx-auto block h-auto w-full max-w-[480px] rounded-md text-[var(--primary)]"
          />
          <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
            {frame ? `${NUM.format(frame.width)} × ${NUM.format(frame.height)} px` : DASH}
            {report ? ` · sampled every ${report.image.sampleStep} px` : ""}
          </p>
        </section>

        <section
          aria-label="Measurement"
          className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
        >
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">
            Reddest area vs the calmest skin in this photo
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--primary)]">
            {report ? `Δa* ${report.peak.delta}` : DASH}
          </p>
          <p className="mt-1 text-sm font-medium">
            {report ? `${report.peak.label} · ${report.peak.severity.label}` : DASH}
          </p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Baseline area
              </dt>
              <dd className="text-sm font-semibold">
                {report ? `${report.baseline.label} · a* ${report.baseline.aStar}` : DASH}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Whole face a*
              </dt>
              <dd className="text-sm font-semibold tabular-nums">
                {report ? report.overall.aStar : DASH}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Whole face lightness L*
              </dt>
              <dd className="text-sm font-semibold tabular-nums">
                {report ? report.overall.lStar : DASH}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Skin pixels sampled
              </dt>
              <dd className="text-sm font-semibold tabular-nums">
                {report ? NUM.format(report.quality.skinSamples) : DASH}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {report
              ? `${report.method.metric}. ${report.method.comparison}. "Affected" is the ${report.method.affected}.`
              : "Load a photo to measure."}
          </p>
        </section>
      </div>

      <section
        aria-label="Region readings"
        className="mt-4 rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
      >
        <h2 className="text-base font-semibold">Region by region</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Area
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  a*
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Δa*
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Band
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Affected
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Pixels
                </th>
              </tr>
            </thead>
            <tbody>
              {!report ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={6}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                report.regions.map((region) => (
                  <tr key={region.id} className="border-b border-[var(--border)]/60">
                    <td className="py-2 pr-3 font-medium">{region.label}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {region.enough ? region.aStar : DASH}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {region.enough ? region.delta : DASH}
                    </td>
                    <td className="py-2 pr-3">
                      {region.enough ? region.severity.label : "not enough visible skin"}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {region.enough ? `${region.affectedShare}%` : DASH}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{NUM.format(region.samples)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 grid gap-2 text-sm">
          {SEVERITY_BANDS.map((band) => (
            <div key={band.id} className="grid gap-0.5">
              <dt className="font-semibold">
                {band.label} — Δa* {band.min}
                {Number.isFinite(band.max) ? ` to ${band.max}` : " and above"}
              </dt>
              <dd className="text-[var(--muted-foreground)]">{band.blurb}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-label="Photo quality"
        className="mt-4 rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Info className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          What this photo actually supports
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Skin share of frame
            </dt>
            <dd className="text-sm font-semibold tabular-nums">
              {report ? `${report.quality.skinShare}%` : DASH}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Near-clipped pixels
            </dt>
            <dd className="text-sm font-semibold tabular-nums">
              {report ? `${report.quality.clippedShare}%` : DASH}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Very dark pixels
            </dt>
            <dd className="text-sm font-semibold tabular-nums">
              {report ? `${report.quality.darkShare}%` : DASH}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Background channel balance
            </dt>
            <dd className="text-sm font-semibold tabular-nums">
              {report && report.quality.castIndex !== null ? `${report.quality.castIndex}:1` : DASH}
            </dd>
          </div>
        </dl>

        {report && report.quality.flags.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {report.quality.flags.map((flag) => (
              <li
                key={flag}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {flag}
              </li>
            ))}
          </ul>
        ) : null}

        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
          <li>
            There is no confidence percentage here, because nothing in a single photo can produce one
            honestly. The pixel counts above are the real measure of how much the reading rests on.
          </li>
          <li>
            This reads the colour of light leaving the skin, not blood flow, inflammation or
            vascular activity — a camera cannot see those.
          </li>
          <li>
            It is not a diagnosis. Persistent flushing, burning or visible vessels are worth taking
            to a clinician rather than to a colour tool.
          </li>
        </ul>
      </section>
    </div>
  );
}
