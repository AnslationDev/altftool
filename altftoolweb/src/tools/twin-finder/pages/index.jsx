"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Upload, Users } from "lucide-react";

import { HASH_SIZE, buildShareText, compareImages } from "../lib";

/** Both photos are resampled to this square before comparison, so size never skews the score. */
const WORK_SIZE = 128;
/** Browsers choke on huge uploads; 12 MB is generous for a phone photo. */
const MAX_FILE_BYTES = 12 * 1024 * 1024;

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const FILE_CLASS =
  "block w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)] file:mr-3 file:min-h-9 file:rounded file:border-0 file:bg-[var(--primary)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

function drawToWorkCanvas(source) {
  const canvas = document.createElement("canvas");
  canvas.width = WORK_SIZE;
  canvas.height = WORK_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(source, 0, 0, WORK_SIZE, WORK_SIZE);
  const imageData = context.getImageData(0, 0, WORK_SIZE, WORK_SIZE);
  return {
    pixels: imageData.data,
    width: WORK_SIZE,
    height: WORK_SIZE,
    dataUrl: canvas.toDataURL("image/png"),
  };
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error("That file is not an image the browser can open."));
      image.onload = () => {
        const sampled = drawToWorkCanvas(image);
        if (!sampled) {
          reject(new Error("This browser blocked canvas access, so the photo cannot be measured."));
          return;
        }
        resolve({ ...sampled, name: file.name, previewUrl: reader.result, isDemo: false });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Two procedurally drawn demo portraits so the page shows a real score at first paint. */
function makeDemoImage(hueShift, tilt) {
  const canvas = document.createElement("canvas");
  canvas.width = WORK_SIZE;
  canvas.height = WORK_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  const backdrop = context.createLinearGradient(0, 0, 0, WORK_SIZE);
  backdrop.addColorStop(0, `hsl(${190 + hueShift} 60% 82%)`);
  backdrop.addColorStop(1, `hsl(${210 + hueShift} 55% 45%)`);
  context.fillStyle = backdrop;
  context.fillRect(0, 0, WORK_SIZE, WORK_SIZE);

  context.save();
  context.translate(WORK_SIZE / 2, WORK_SIZE / 2 + tilt);
  context.rotate((tilt * Math.PI) / 180);
  context.fillStyle = `hsl(${28 + hueShift} 55% 70%)`;
  context.beginPath();
  context.ellipse(0, 0, WORK_SIZE * 0.26, WORK_SIZE * 0.33, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = `hsl(${220 + hueShift} 30% 20%)`;
  context.beginPath();
  context.ellipse(-WORK_SIZE * 0.1, -WORK_SIZE * 0.06, 6, 4, 0, 0, Math.PI * 2);
  context.ellipse(WORK_SIZE * 0.1, -WORK_SIZE * 0.06, 6, 4, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  const imageData = context.getImageData(0, 0, WORK_SIZE, WORK_SIZE);
  return {
    pixels: imageData.data,
    width: WORK_SIZE,
    height: WORK_SIZE,
    dataUrl: canvas.toDataURL("image/png"),
    previewUrl: canvas.toDataURL("image/png"),
    name: "Demo photo",
    isDemo: true,
  };
}

export default function ToolHome() {
  const [photoA, setPhotoA] = useState(null);
  const [photoB, setPhotoB] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const first = makeDemoImage(0, 0);
      const second = makeDemoImage(24, 6);
      if (first && second) {
        setPhotoA({ ...first, name: "Demo photo A" });
        setPhotoB({ ...second, name: "Demo photo B" });
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const result = useMemo(() => compareImages(photoA, photoB), [photoA, photoB]);
  const error = loadError || result.error || null;

  const share = useMemo(
    () =>
      result.error
        ? { error: result.error }
        : buildShareText(result, {
            labelA: photoA?.name || "Photo A",
            labelB: photoB?.name || "Photo B",
          }),
    [result, photoA, photoB]
  );

  const handleFile = async (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCopied(false);
    if (!file.type.startsWith("image/")) {
      setLoadError("Pick an image file (JPG, PNG, WebP or GIF).");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setLoadError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_FILE_BYTES / 1024 / 1024} MB.`
      );
      return;
    }
    try {
      const loaded = await readImageFile(file);
      setLoadError("");
      setter(loaded);
    } catch (readError) {
      setLoadError(readError.message);
    }
  };

  const handleCopy = async () => {
    if (share.error) return;
    try {
      await navigator.clipboard.writeText(share.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Reset to the demo photos? This clears both photo slots and cannot be undone.")) {
      return;
    }
    const first = makeDemoImage(0, 0);
    const second = makeDemoImage(24, 6);
    setPhotoA(first ? { ...first, name: "Demo photo A" } : null);
    setPhotoB(second ? { ...second, name: "Demo photo B" } : null);
    setLoadError("");
    setCopied(false);
  };

  const dash = "—";
  const percentFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
  const demoA = Boolean(photoA?.isDemo);
  const demoB = Boolean(photoB?.isDemo);
  const demoNotice =
    demoA && demoB
      ? "Showing two generated demo photos — upload your own to replace them. "
      : demoA
        ? "The first photo is still a generated demo — upload a photo to replace it. "
        : demoB
          ? "The second photo is still a generated demo — upload a photo to replace it. "
          : "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Users className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">Twin Finder</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Drop in two photos and get a playful similarity score built from perceptual
            hashes, colour histograms and brightness. Everything runs in your browser.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["photo-a", "First photo", photoA, setPhotoA],
          ["photo-b", "Second photo", photoB, setPhotoB],
        ].map(([id, label, photo, setter]) => (
          <div key={id}>
            <label className={LABEL_CLASS} htmlFor={id}>
              {label}
            </label>
            <input
              id={id}
              type="file"
              accept="image/*"
              className={`${FILE_CLASS} mt-1.5`}
              onChange={(event) => handleFile(event, setter)}
            />
            <div className="mt-2 aspect-square w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]">
              {photo?.previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo.previewUrl}
                  alt={`${label} preview`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm text-[var(--muted-foreground)]">
                  <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                  No photo yet
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
              {photo?.name || "—"}
            </p>
          </div>
        ))}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Similarity score
        </p>
        <p className="mt-1 text-5xl font-bold text-[var(--foreground)]">
          {error ? dash : `${result.score}%`}
        </p>
        <p className="mt-1 text-base font-semibold text-[var(--primary)]">
          {error ? dash : result.verdict}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {error ? dash : result.blurb}
        </p>

        <div
          className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={error ? "No score yet" : `Similarity ${result.score} percent`}
        >
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all motion-reduce:transition-none"
            style={{ width: error ? "0%" : `${result.score}%` }}
          />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Structure match</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : result.structurePercent === null
                  ? "n/a (flat image)"
                  : `${percentFmt.format(result.structurePercent)}%`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Colour match</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${percentFmt.format(result.colourPercent)}%`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Tone match</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${percentFmt.format(result.tonePercent)}%`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Hash distance</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : `${result.aHashDistance + result.dHashDistance} / ${result.hashBits} bits`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Brightness</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : `${percentFmt.format(result.brightnessA)} vs ${percentFmt.format(result.brightnessB)}`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Contrast</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : `${percentFmt.format(result.contrastA)} vs ${percentFmt.format(result.contrastB)}`}
            </dd>
          </div>
        </dl>

        {!error ? (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Difference heat map ({HASH_SIZE}×{HASH_SIZE})
            </p>
            <div
              className="mt-2 grid w-full max-w-[240px] gap-0.5"
              style={{ gridTemplateColumns: `repeat(${result.gridSize}, minmax(0, 1fr))` }}
              role="img"
              aria-label="Grid showing which regions of the two photos differ most"
            >
              {result.heatmap.map((value, index) => (
                <span
                  key={`cell-${index}`}
                  className="aspect-square rounded-sm bg-[var(--danger)]"
                  style={{ opacity: 0.12 + value * 0.88 }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Darker cells are the regions where the two photos disagree most.
            </p>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy the similarity result to clipboard"
          disabled={Boolean(share.error)}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset to the demo photos">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        {demoNotice}
        Photos are resampled to {WORK_SIZE}×{WORK_SIZE} in your browser and never uploaded. This is
        a party trick, not face recognition, and it says nothing about who anyone is related to.
      </p>
    </div>
  );
}
