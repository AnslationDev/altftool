"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileImage, RotateCcw } from "lucide-react";

import {
  DEFAULT_JPEG_QUALITY,
  FORMATS,
  JPEG_EXTENSION_STYLES,
  MAX_JPEG_QUALITY,
  MIN_JPEG_QUALITY,
  bytesToKB,
  detectFormat,
  formatById,
  nextQualityStep,
  outputFileName,
  validateInputFile,
  validateQuality,
  validateTargetKB,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** CSS colour KEYWORDS for flattening PNG transparency into JPEG. */
const BACKGROUNDS = [
  { id: "white", label: "White (standard for portals)" },
  { id: "lightgray", label: "Light grey" },
];

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The image could not be read — it may be corrupted."));
    };
    image.src = url;
  });

const encodeCanvas = (canvas, mime, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The browser could not encode the image."))),
      mime,
      quality,
    );
  });

export default function ToolHome() {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [extensionStyle, setExtensionStyle] = useState("jpg");
  const [quality, setQuality] = useState(String(DEFAULT_JPEG_QUALITY));
  const [targetKB, setTargetKB] = useState("");
  const [background, setBackground] = useState(BACKGROUNDS[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const sourceFormat = useMemo(
    () => (file ? detectFormat(file.type) ?? detectFormat(file.name) : null),
    [file],
  );

  // Keep a ref to the latest result so the unmount effect below can revoke
  // its object URL without re-subscribing on every render.
  const resultRef = useRef(result);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  // Release the blob URL if the user navigates away without pressing
  // Reset, Download, or converting again.
  useEffect(() => {
    return () => {
      if (resultRef.current?.url) URL.revokeObjectURL(resultRef.current.url);
    };
  }, []);

  const onPickFile = (event) => {
    const picked = event.target.files?.[0] ?? null;
    setFile(picked);
    setError("");
    setResult((previous) => {
      if (previous?.url) URL.revokeObjectURL(previous.url);
      return null;
    });
  };

  const convert = async () => {
    if (!file) {
      setError("Choose a JPG, JPEG or PNG file first.");
      return;
    }
    const checked = validateInputFile({ name: file.name, type: file.type, sizeBytes: file.size });
    if (checked.error) {
      setError(checked.error);
      return;
    }
    const target = validateTargetKB(outputFormat === "jpeg" ? targetKB : "");
    if (target.error) {
      setError(target.error);
      return;
    }
    const qualityCheck = outputFormat === "jpeg" ? validateQuality(quality) : { quality: null };
    if (qualityCheck.error) {
      setError(qualityCheck.error);
      return;
    }
    const named = outputFileName({ originalName: file.name, formatId: outputFormat, extensionStyle });
    if (named.error) {
      setError(named.error);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const image = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      const format = formatById(outputFormat);
      if (!format.supportsTransparency) {
        context.fillStyle = background; // CSS keyword — flattens PNG transparency
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0);

      let blob;
      let usedQuality = null;
      let warning = "";

      if (format.id === "png") {
        blob = await encodeCanvas(canvas, format.mime);
      } else if (target.targetBytes === null) {
        usedQuality = qualityCheck.quality;
        blob = await encodeCanvas(canvas, format.mime, usedQuality);
      } else {
        // Binary-search the JPEG quality to fit under the target size; the
        // search bounds and stop rule come from lib.nextQualityStep.
        let state = { low: MIN_JPEG_QUALITY, high: 1, bestQuality: null };
        let currentQuality = qualityCheck.quality;
        let bestBlob = null;
        for (let step = 1; ; step += 1) {
          const attempt = await encodeCanvas(canvas, format.mime, currentQuality);
          const outcome = nextQualityStep({
            low: state.low,
            high: state.high,
            quality: currentQuality,
            resultBytes: attempt.size,
            targetBytes: target.targetBytes,
            bestQuality: state.bestQuality,
            step,
          });
          if (attempt.size <= target.targetBytes) bestBlob = attempt;
          state = outcome;
          if (outcome.done) break;
          currentQuality = outcome.nextQuality;
        }
        if (bestBlob) {
          blob = bestBlob;
          usedQuality = state.bestQuality;
        } else {
          blob = await encodeCanvas(canvas, format.mime, MIN_JPEG_QUALITY);
          usedQuality = MIN_JPEG_QUALITY;
          if (blob.size > target.targetBytes) {
            warning =
              "Even at minimum quality the image stays above the target — reduce the photo's dimensions first.";
          }
        }
      }

      const url = URL.createObjectURL(blob);
      setResult((previous) => {
        if (previous?.url) URL.revokeObjectURL(previous.url);
        return {
          url,
          name: named.name,
          inKB: bytesToKB(file.size),
          outKB: bytesToKB(blob.size),
          width: canvas.width,
          height: canvas.height,
          usedQuality,
          warning,
          mime: format.mime,
        };
      });
    } catch (conversionError) {
      setError(conversionError.message || "Conversion failed — try another file.");
    } finally {
      setBusy(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    const text = [
      "Image conversion",
      `Output: ${result.name} (${result.mime})`,
      `Size: ${NUM.format(result.inKB)} KB -> ${NUM.format(result.outKB)} KB`,
      `Dimensions: ${result.width} x ${result.height}px`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFile(null);
    setOutputFormat("jpeg");
    setExtensionStyle("jpg");
    setQuality(String(DEFAULT_JPEG_QUALITY));
    setTargetKB("");
    setBackground(BACKGROUNDS[0].id);
    setError("");
    setCopied(false);
    setResult((previous) => {
      if (previous?.url) URL.revokeObjectURL(previous.url);
      return null;
    });
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileImage className="h-4 w-4" aria-hidden="true" />
          Upload troubleshooting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Image Format Converter For Forms</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a photo or signature between JPG, JPEG and PNG with the exact extension a portal
          demands, optionally squeezing a JPEG under a KB limit. Conversion happens entirely in your
          browser — the image is never uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ifc-file">
              Image file (JPG, JPEG or PNG)
            </label>
            <input
              id="ifc-file"
              className="mt-2 block w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-4 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={onPickFile}
              disabled={busy}
            />
            {file ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {file.name} — {NUM.format(bytesToKB(file.size))} KB
                {sourceFormat ? ` (detected: ${formatById(sourceFormat)?.label})` : ""}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ifc-format">
              Convert to
            </label>
            <select
              id="ifc-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={outputFormat}
              onChange={(event) => setOutputFormat(event.target.value)}
              disabled={busy}
            >
              {FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          {outputFormat === "jpeg" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ifc-ext">
                  Extension the portal demands
                </label>
                <select
                  id="ifc-ext"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={extensionStyle}
                  onChange={(event) => setExtensionStyle(event.target.value)}
                  disabled={busy}
                >
                  {JPEG_EXTENSION_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ifc-quality">
                  JPEG quality (0.05 – 1)
                </label>
                <input
                  id="ifc-quality"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min={MIN_JPEG_QUALITY}
                  max={MAX_JPEG_QUALITY}
                  step="0.01"
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ifc-target">
                  Target max size in KB (optional)
                </label>
                <input
                  id="ifc-target"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="2"
                  step="5"
                  placeholder="e.g. 50"
                  value={targetKB}
                  onChange={(event) => setTargetKB(event.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ifc-bg">
                  Background for transparent areas
                </label>
                <select
                  id="ifc-bg"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                  disabled={busy}
                >
                  {BACKGROUNDS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
        </div>
        <div className="mt-4">
          <button type="button" onClick={convert} disabled={busy} className={`${PRIMARY_BTN} disabled:opacity-50`}>
            {busy ? "Converting…" : "Convert"}
          </button>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Converted size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result && !error ? `${NUM.format(result.outKB)} KB` : DASH}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {result && !error
                ? `Saved as ${result.name}.`
                : "Pick a file and press Convert to see the output here."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result && !error ? (
              <a href={result.url} download={result.name} className={PRIMARY_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download {result.name}
              </a>
            ) : null}
            <button
              type="button"
              onClick={copyResult}
              disabled={!result || Boolean(error)}
              aria-label="Copy the conversion details"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy details"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {result?.warning && !error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.warning}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Original size", result && !error ? `${NUM.format(result.inKB)} KB` : DASH],
            ["Converted size", result && !error ? `${NUM.format(result.outKB)} KB` : DASH],
            ["Dimensions", result && !error ? `${NUM.format(result.width)} × ${NUM.format(result.height)} px` : DASH],
            [
              "JPEG quality used",
              result && !error && result.usedQuality !== null ? NUM.format(result.usedQuality) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {result && !error ? (
          <img
            src={result.url}
            alt="Preview of the converted image"
            className="mt-5 max-h-72 w-auto max-w-full rounded-md ring-1 ring-[var(--border)]"
          />
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        JPG and JPEG are the same format — only the extension differs, and this tool writes
        whichever spelling the portal's validator expects. PNG → JPEG flattens transparency onto the
        chosen background because JPEG has none. Size targets use 1 KB = 1024 bytes.
      </p>
    </main>
  );
}
