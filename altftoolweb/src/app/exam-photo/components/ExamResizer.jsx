"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SCAN_DPI as DERIVED_DPI,
  auditAgainstSpec,
  describeTarget,
  fitContain,
  resolveTargetPixels,
  searchQualityForTargetKB,
} from "../lib/specMath";

const OUTPUT_MIME = "image/jpeg";
const EM_DASH = "—";
// The notices in the preset table all specify a white background for the
// photograph and white paper for the signature, so the canvas is filled white
// before the scan is drawn. This is a spec value, not a theme colour.
const BACKDROP = "white";

const TARGET_SOURCE_LABEL = {
  stated: "The pixel size printed in the notice",
  derived: `The notice's cm/mm box at ${DERIVED_DPI} DPI`,
  "long-edge": "The px band in the notice, applied to the long edge",
  unconstrained: "Your own file, because the notice prints no pixel size",
};

const numberFormat = new Intl.NumberFormat("en-IN");

function formatPx(value) {
  return typeof value === "number" ? numberFormat.format(value) : EM_DASH;
}

export default function ExamResizer({ exam }) {
  const assets = useMemo(() => exam.assets || [], [exam.assets]);
  const [assetId, setAssetId] = useState(assets[0]?.id || "");
  const [image, setImage] = useState(null);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const asset = useMemo(
    () => assets.find((item) => item.id === assetId) || assets[0] || null,
    [assets, assetId],
  );

  const previewTarget = useMemo(
    () => (asset ? resolveTargetPixels(asset, {}, DERIVED_DPI) : { error: "No asset." }),
    [asset],
  );

  const targetLine = useMemo(
    () => (asset ? describeTarget(asset, previewTarget.error ? null : previewTarget) : ""),
    [asset, previewTarget],
  );

  const process = useCallback((sourceImage, nextAsset) => {
    if (!sourceImage || !nextAsset) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const target = resolveTargetPixels(
      nextAsset,
      { width: sourceImage.naturalWidth, height: sourceImage.naturalHeight },
      DERIVED_DPI,
    );
    if (target.error) {
      setOutput(null);
      setError(target.error);
      return;
    }

    const boxWidth = target.width || sourceImage.naturalWidth;
    const boxHeight = target.height || sourceImage.naturalHeight;
    const placement = fitContain({
      srcWidth: sourceImage.naturalWidth,
      srcHeight: sourceImage.naturalHeight,
      boxWidth,
      boxHeight,
    });
    if (placement.error) {
      setOutput(null);
      setError(placement.error);
      return;
    }

    canvas.width = boxWidth;
    canvas.height = boxHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setOutput(null);
      setError("This browser did not give the page a 2D canvas to draw on.");
      return;
    }
    ctx.fillStyle = BACKDROP;
    ctx.fillRect(0, 0, boxWidth, boxHeight);
    ctx.drawImage(sourceImage, placement.offsetX, placement.offsetY, placement.width, placement.height);

    const result = searchQualityForTargetKB({
      encode: (quality) => canvas.toDataURL(OUTPUT_MIME, quality),
      minKB: nextAsset.minKB,
      maxKB: nextAsset.maxKB,
    });
    if (result.error) {
      setOutput(null);
      setError(result.error);
      return;
    }

    const audit = auditAgainstSpec({
      sizeKB: result.sizeKB,
      width: boxWidth,
      height: boxHeight,
      asset: nextAsset,
      // Only assert a pixel rule when the notice actually printed one. For
      // "unconstrained" and "long-edge" targets there is no fixed size to fail.
      target: target.source === "stated" || target.source === "derived" ? target : null,
    });
    if (audit.error) {
      setOutput(null);
      setError(audit.error);
      return;
    }

    setError("");
    setOutput({
      dataUrl: result.dataUrl,
      sizeKB: result.sizeKB,
      quality: result.quality,
      width: boxWidth,
      height: boxHeight,
      withinTarget: result.withinTarget,
      underMinimum: result.underMinimum,
      steps: result.steps,
      checks: audit.checks,
      targetSource: target.source,
      assetId: nextAsset.id,
    });
  }, []);

  const handleFile = useCallback(
    (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setImage(null);
        setOutput(null);
        setError("That file is not an image. Pick a JPG, PNG or WEBP scan.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (loaded) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          process(img, asset);
        };
        img.onerror = () => {
          setImage(null);
          setOutput(null);
          setError("That image could not be decoded. Save it again as a standard JPG or PNG.");
        };
        img.src = loaded.target.result;
      };
      reader.onerror = () => {
        setImage(null);
        setOutput(null);
        setError("The file could not be read from this device.");
      };
      reader.readAsDataURL(file);
    },
    [asset, process],
  );

  const handleAsset = useCallback(
    (nextId) => {
      const nextAsset = assets.find((item) => item.id === nextId);
      setAssetId(nextId);
      setCopied(false);
      if (image && nextAsset) process(image, nextAsset);
      else setOutput(null);
    },
    [assets, image, process],
  );

  const handleReset = useCallback(() => {
    setImage(null);
    setOutput(null);
    setError("");
    setCopied(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleCopy = useCallback(async () => {
    if (!asset) return;
    const lines = [
      `${exam.name} ${EM_DASH} ${asset.label}`,
      `Required: ${targetLine}`,
      output
        ? `Produced: ${output.sizeKB} KB at ${output.width} x ${output.height} px (JPEG quality ${output.quality.toFixed(2)})`
        : "Produced: no file yet",
      `Source: ${exam.source.doc}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
    } catch {
      setError("This browser blocked clipboard access, so nothing was copied.");
    }
  }, [asset, exam.name, exam.source.doc, output, targetLine]);

  const handleDownload = useCallback(() => {
    if (!output || !asset) return;
    const link = document.createElement("a");
    link.href = output.dataUrl;
    link.download = `${exam.slug}-${asset.id}-${output.sizeKB}kb.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [asset, exam.slug, output]);

  if (!asset) {
    return (
      <div
        role="alert"
        className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
      >
        This exam has no uploadable image in its notice, so there is nothing to resize.
      </div>
    );
  }

  const showFigures = Boolean(output) && !error;

  return (
    <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Resize to the {exam.name} target
      </h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Runs in this browser. The file never leaves the device.
      </p>

      {assets.length > 1 ? (
        <div className="mt-4">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            Which file are you fixing?
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose the file to resize">
            {assets.map((item) => {
              const active = item.id === asset.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAsset(item.id)}
                  aria-pressed={active}
                  className={`min-h-11 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    active
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="exam-resizer-file"
            className="mb-1 block text-sm font-medium text-[var(--foreground)]"
          >
            Your {asset.label.toLowerCase()} file
          </label>
          <input
            id="exam-resizer-file"
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          />
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Target from the notice
          </span>
          <p className="flex min-h-11 items-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]">
            {targetLine}
          </p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 rounded-xl bg-[var(--background)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">File size produced</p>
        <p className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {showFigures ? `${numberFormat.format(output.sizeKB)} KB` : EM_DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {asset.minKB} to {asset.maxKB} KB is what the notice allows
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">Canvas</dt>
            <dd className="text-sm font-medium text-[var(--foreground)]">
              {showFigures ? `${formatPx(output.width)} x ${formatPx(output.height)} px` : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">JPEG quality found</dt>
            <dd className="text-sm font-medium text-[var(--foreground)]">
              {showFigures ? output.quality.toFixed(2) : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">Search steps</dt>
            <dd className="text-sm font-medium text-[var(--foreground)]">
              {showFigures ? numberFormat.format(output.steps) : EM_DASH}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted-foreground)]">Pixel size comes from</dt>
            <dd className="text-sm font-medium text-[var(--foreground)]">
              {showFigures ? TARGET_SOURCE_LABEL[output.targetSource] || EM_DASH : EM_DASH}
            </dd>
          </div>
        </dl>

        {showFigures ? (
          <ul className="mt-4 space-y-1">
            {output.checks.map((check) => (
              <li key={check.id} className="text-sm">
                <span
                  className={
                    check.ok ? "font-medium text-[var(--success)]" : "font-medium text-[var(--danger)]"
                  }
                >
                  {check.ok ? "Meets" : "Misses"}
                </span>{" "}
                <span className="text-[var(--foreground)]">{check.label}</span>{" "}
                <span className="text-[var(--muted-foreground)]">{check.detail}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {showFigures && output.underMinimum ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            Even at the top of the quality range this file encodes below the {asset.minKB} KB floor
            the notice sets. That happens when the scan carries very little detail at{" "}
            {formatPx(output.width)} x {formatPx(output.height)} px.
          </p>
        ) : null}

        {showFigures ? (
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <img
              src={output.dataUrl}
              alt={`${exam.name} ${asset.label} resized to ${output.sizeKB} KB`}
              className="max-h-40 max-w-full rounded-md ring-1 ring-[var(--border)]"
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!showFigures}
            className="min-h-11 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition-transform active:scale-[0.98] disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none motion-reduce:transform-none"
          >
            Download JPEG
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy the ${exam.name} ${asset.label} specification and result`}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition-transform active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none motion-reduce:transform-none"
          >
            {copied ? "Copied!" : "Copy spec"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition-transform active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none motion-reduce:transform-none"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
