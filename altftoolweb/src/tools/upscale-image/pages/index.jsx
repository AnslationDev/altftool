"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Download, RotateCcw, ZoomIn } from "lucide-react";
import {
  KERNELS,
  MAX_SHARPEN,
  SCALE_PRESETS,
  computeTargetSize,
  formatBytes,
  upscaleImage,
} from "../lib";

const DASH = "—";
const integerFormat = new Intl.NumberFormat("en-US");
const decimalFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const OUTPUT_FORMATS = [
  { value: "image/png", label: "PNG (lossless)", extension: "png" },
  { value: "image/jpeg", label: "JPEG (smaller)", extension: "jpg" },
  { value: "image/webp", label: "WebP", extension: "webp" },
];

function outputFileName(sourceName, extension, width, height) {
  const base = (sourceName || "image").replace(/\.[^.]+$/, "");
  return `${base}-${width}x${height}.${extension}`;
}

export default function UpscaleImage() {
  const [sourceName, setSourceName] = useState("");
  const [sourceSize, setSourceSize] = useState(0);
  const [source, setSource] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [scale, setScale] = useState(2);
  const [kernel, setKernel] = useState("lanczos3");
  const [sharpen, setSharpen] = useState(0.3);
  const [format, setFormat] = useState("image/png");
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sourceUrl) return undefined;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    if (!outputUrl) return undefined;
    return () => URL.revokeObjectURL(outputUrl);
  }, [outputUrl]);

  const clearOutput = useCallback(() => {
    setOutput(null);
    setOutputUrl("");
    setError("");
    setCopied(false);
  }, []);

  const handleFile = useCallback(
    async (file) => {
      clearOutput();
      setSource(null);
      setSourceUrl("");
      if (!file) {
        setSourceName("");
        setSourceSize(0);
        return;
      }
      setSourceName(file.name);
      setSourceSize(file.size);
      setBusy(true);
      try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(bitmap, 0, 0);
        const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);
        bitmap.close?.();
        setSource({ data: imageData.data, width: imageData.width, height: imageData.height });
        setSourceUrl(URL.createObjectURL(file));
      } catch {
        setError("That image could not be decoded. Try a PNG, JPEG or WebP file.");
      } finally {
        setBusy(false);
      }
    },
    [clearOutput],
  );

  const run = useCallback(async () => {
    if (!source) {
      setError("Choose an image first.");
      return;
    }
    clearOutput();
    setBusy(true);
    // Yield once so the "Working…" label paints before the synchronous resample.
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    try {
      const result = upscaleImage(source, { scale, kernel, sharpen });
      if (result.error) {
        setError(result.error);
        setBusy(false);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = result.width;
      canvas.height = result.height;
      const context = canvas.getContext("2d");
      context.putImageData(new ImageData(result.data, result.width, result.height), 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, format, 0.92));
      if (!blob) {
        setError("This browser could not encode the result in that format. Try PNG.");
        setBusy(false);
        return;
      }
      setOutput({ ...result, byteLength: blob.size });
      setOutputUrl(URL.createObjectURL(blob));
    } catch {
      setError("Upscaling failed. The image may be too large for this browser tab.");
    } finally {
      setBusy(false);
    }
  }, [source, scale, kernel, sharpen, format, clearOutput]);

  const reset = useCallback(() => {
    clearOutput();
    setSource(null);
    setSourceUrl("");
    setSourceName("");
    setSourceSize(0);
    setScale(2);
    setKernel("lanczos3");
    setSharpen(0.3);
    setFormat("image/png");
  }, [clearOutput]);

  const copySummary = useCallback(async () => {
    if (!output) return;
    const text = [
      `Upscaled ${output.sourceWidth}x${output.sourceHeight} to ${output.width}x${output.height}`,
      `Scale: ${output.scale}x`,
      `Method: ${KERNELS[output.kernel].label}`,
      `Sharpening: ${sharpen}`,
      `Output: ${formatBytes(output.byteLength)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [output, sharpen]);

  const projected = source ? computeTargetSize(source.width, source.height, scale) : null;
  const projectionError = projected && projected.error ? projected.error : "";
  const shownError = error || projectionError;
  const extension =
    OUTPUT_FORMATS.find((entry) => entry.value === format)?.extension || "png";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <ZoomIn aria-hidden="true" className="mt-1 h-6 w-6 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Upscale Image</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Enlarge a picture with proper filtered resampling — Lanczos 3, bicubic, bilinear or
            nearest neighbour — right in your browser. Nothing is uploaded.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ui-file" className="text-sm font-medium text-[var(--foreground)]">
          Image to enlarge
        </label>
        <input
          id="ui-file"
          type="file"
          accept="image/*"
          onChange={(event) => handleFile(event.target.files?.[0] || null)}
          className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] file:mr-3 file:rounded file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ui-scale" className="text-sm font-medium text-[var(--foreground)]">
            Scale factor
          </label>
          <select
            id="ui-scale"
            value={scale}
            onChange={(event) => {
              setScale(Number(event.target.value));
              clearOutput();
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {SCALE_PRESETS.map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ui-kernel" className="text-sm font-medium text-[var(--foreground)]">
            Resampling method
          </label>
          <select
            id="ui-kernel"
            value={kernel}
            onChange={(event) => {
              setKernel(event.target.value);
              clearOutput();
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {Object.entries(KERNELS).map(([key, entry]) => (
              <option key={key} value={key}>
                {entry.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--muted-foreground)]">{KERNELS[kernel].hint}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ui-sharpen" className="text-sm font-medium text-[var(--foreground)]">
            Sharpening ({decimalFormat.format(sharpen)})
          </label>
          <input
            id="ui-sharpen"
            type="range"
            min={0}
            max={MAX_SHARPEN}
            step={0.1}
            value={sharpen}
            onChange={(event) => {
              setSharpen(Number(event.target.value));
              clearOutput();
            }}
            className="h-11 w-full accent-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ui-format" className="text-sm font-medium text-[var(--foreground)]">
            Output format
          </label>
          <select
            id="ui-format"
            value={format}
            onChange={(event) => {
              setFormat(event.target.value);
              clearOutput();
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {OUTPUT_FORMATS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={run}
          disabled={busy || !source || Boolean(projectionError)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <ZoomIn aria-hidden="true" className="h-4 w-4" />
          {busy ? "Working…" : "Upscale image"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset
        </button>
        <button
          type="button"
          onClick={copySummary}
          disabled={!output}
          aria-label="Copy upscale summary to clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-[var(--success)]" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy summary"}
        </button>
      </div>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Output size</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          {shownError
            ? DASH
            : output
              ? `${integerFormat.format(output.width)} × ${integerFormat.format(output.height)}`
              : projected && !projected.error
                ? `${integerFormat.format(projected.width)} × ${integerFormat.format(projected.height)}`
                : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {output ? "Ready to download" : source ? "Projected — press Upscale image" : "Choose an image"}
        </p>

        {shownError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {shownError}
          </p>
        ) : null}

        {output && outputUrl ? (
          <a
            href={outputUrl}
            download={outputFileName(sourceName, extension, output.width, output.height)}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download upscaled image
          </a>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source dimensions</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {source ? `${integerFormat.format(source.width)} × ${integerFormat.format(source.height)}` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source file size</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {sourceSize ? formatBytes(sourceSize) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Output megapixels</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || !output ? DASH : decimalFormat.format(output.megapixels)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Output file size</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || !output ? DASH : formatBytes(output.byteLength)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Method used</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || !output ? DASH : KERNELS[output.kernel].label}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Scale applied</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || !output ? DASH : `${decimalFormat.format(output.scale)}x`}
            </dd>
          </div>
        </dl>
      </section>

      {sourceUrl || outputUrl ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {sourceUrl ? (
            <figure className="rounded-xl bg-[var(--card)] p-3 ring-1 ring-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sourceUrl}
                alt="Original image before upscaling"
                className="mx-auto block h-auto max-w-full rounded-md"
              />
              <figcaption className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
                Original
              </figcaption>
            </figure>
          ) : null}
          {outputUrl ? (
            <figure className="rounded-xl bg-[var(--card)] p-3 ring-1 ring-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={outputUrl}
                alt="Upscaled result"
                className="mx-auto block h-auto max-w-full rounded-md"
              />
              <figcaption className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
                Upscaled
              </figcaption>
            </figure>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Resampling redistributes the detail that is already in the file. It cannot invent detail
        that was never captured, so heavily compressed or very small sources will still look soft.
      </p>
    </div>
  );
}
