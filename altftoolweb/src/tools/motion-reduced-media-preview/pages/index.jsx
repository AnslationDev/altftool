"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  EyeOff,
  FileVideo2,
  ImageDown,
  Info,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  buildMotionPreviewReport,
  normalizeCaptureTime,
  readGifDimensions,
  reviewMotionDelivery,
  validateDecodedMedia,
  validateMediaFile,
} from "../lib/motionPreview.mjs";

const DEFAULT_CHOICES = {
  autoplay: false,
  loops: false,
  lastsMoreThanFiveSeconds: false,
  runsInParallel: false,
  pauseControl: true,
  respectsPreference: true,
  motionEssential: false,
  meaningfulStill: true,
};

const SOURCES = [
  {
    title: "W3C Understanding SC 2.2.2 — Pause, Stop, Hide",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html",
  },
  {
    title: "W3C Understanding SC 2.3.3 — Animation from Interactions",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions",
  },
  {
    title: "MDN — prefers-reduced-motion",
    href: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion",
  },
];

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadJson(value) {
  downloadBlob(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
    "motion-reduced-media-local-review-report.json",
  );
}

function canvasToPng(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The browser could not encode the still frame.")),
      "image/png",
    );
  });
}

function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas image processing is unavailable.");
  return { canvas, context };
}

function probeVideo(url) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    let settled = false;
    let timer;
    const cleanup = () => {
      window.clearTimeout(timer);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
    };
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      if (settled) return;
      settled = true;
      const result = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      };
      cleanup();
      resolve(result);
    };
    video.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("The browser could not read this video."));
    };
    timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Reading video metadata timed out."));
    }, 8_000);
    video.src = url;
  });
}

function waitForSeek(video, time) {
  return new Promise((resolve, reject) => {
    let timer;
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("The browser could not seek to that frame."));
    };
    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Seeking the video timed out."));
    }, 8000);
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = time;
  });
}

function Choice({ checked, label, detail, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {detail}
        </span>
      </span>
    </label>
  );
}

export default function MotionReducedMediaPreview() {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const sourceUrlRef = useRef("");
  const stillUrlRef = useRef("");
  const generationRef = useRef(0);
  const busyRef = useRef(false);

  const [media, setMedia] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [stillUrl, setStillUrl] = useState("");
  const [showOriginalGif, setShowOriginalGif] = useState(false);
  const [captureTime, setCaptureTime] = useState(0);
  const [choices, setChoices] = useState(DEFAULT_CHOICES);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const review = useMemo(() => reviewMotionDelivery(choices), [choices]);
  const report = useMemo(
    () => buildMotionPreviewReport({ media, captureTime, review }),
    [captureTime, media, review],
  );

  const revokeUrls = () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (stillUrlRef.current) URL.revokeObjectURL(stillUrlRef.current);
    sourceUrlRef.current = "";
    stillUrlRef.current = "";
  };

  const reset = () => {
    generationRef.current += 1;
    busyRef.current = false;
    revokeUrls();
    setMedia(null);
    setSourceUrl("");
    setStillUrl("");
    setShowOriginalGif(false);
    setCaptureTime(0);
    setChoices(DEFAULT_CHOICES);
    setBusy(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(
    () => () => {
      generationRef.current += 1;
      revokeUrls();
    },
    [],
  );

  const replaceStill = (blob) => {
    if (stillUrlRef.current) URL.revokeObjectURL(stillUrlRef.current);
    const url = URL.createObjectURL(blob);
    stillUrlRef.current = url;
    setStillUrl(url);
  };

  const processFile = async (file) => {
    if (!file || busyRef.current) return;
    const validation = validateMediaFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setError("");
    revokeUrls();
    setMedia(null);
    setSourceUrl("");
    setStillUrl("");
    setShowOriginalGif(false);
    setCaptureTime(0);

    const url = URL.createObjectURL(file);
    sourceUrlRef.current = url;

    try {
      let decoded;
      if (validation.kind === "gif") {
        const header = readGifDimensions(await file.slice(0, 10).arrayBuffer());
        if (!header.ok) throw new Error(header.error);
        decoded = validateDecodedMedia({ ...header, kind: "gif" });
        if (!decoded.ok) throw new Error(decoded.error);

        const bitmap = await createImageBitmap(file);
        try {
          if (
            bitmap.width !== decoded.width ||
            bitmap.height !== decoded.height
          ) {
            throw new Error(
              "The decoded GIF dimensions do not match its declared canvas.",
            );
          }
          const { canvas, context } = makeCanvas(decoded.width, decoded.height);
          context.drawImage(bitmap, 0, 0);
          const blob = await canvasToPng(canvas);
          if (generation !== generationRef.current) return;
          replaceStill(blob);
        } finally {
          bitmap.close();
        }
      } else {
        const metadata = await probeVideo(url);
        decoded = validateDecodedMedia({ ...metadata, kind: "video" });
        if (!decoded.ok) throw new Error(decoded.error);
      }

      if (generation !== generationRef.current) return;
      setSourceUrl(url);
      setMedia({
        kind: validation.kind,
        mimeType: file.type,
        bytes: file.size,
        width: decoded.width,
        height: decoded.height,
        duration: decoded.duration,
      });
    } catch (cause) {
      if (generation !== generationRef.current) return;
      URL.revokeObjectURL(url);
      sourceUrlRef.current = "";
      setError(cause instanceof Error ? cause.message : "Media read failed.");
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const captureVideoFrame = async () => {
    const video = videoRef.current;
    if (!video || !media || media.kind !== "video" || busyRef.current) return;
    const generation = generationRef.current;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      video.pause();
      const target = normalizeCaptureTime(captureTime, media.duration);
      if (Math.abs(video.currentTime - target) > 0.01) {
        await waitForSeek(video, target);
      }
      if (generation !== generationRef.current) return;
      const { canvas, context } = makeCanvas(media.width, media.height);
      context.drawImage(video, 0, 0, media.width, media.height);
      const blob = await canvasToPng(canvas);
      if (generation !== generationRef.current) return;
      replaceStill(blob);
    } catch (cause) {
      if (generation === generationRef.current) {
        setError(
          cause instanceof Error ? cause.message : "Frame capture failed.",
        );
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const updateChoice = (key, value) => {
    setChoices((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <Pause className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">Motion-Reduced Media Preview</h1>
          <p className="tool-description">
            Inspect a user-controlled GIF or video, capture a still alternative,
            and plan how your real interface should respond to reduced-motion
            preferences.
          </p>
        </div>
      </header>

      <div className="rounded-lg border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold text-foreground">
              Local preview with motion off by default
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Your file stays in this browser tab. GIF motion appears only after
              an explicit button press; videos never autoplay. The 80 MB,
              16.8-megapixel, and 60-minute limits protect the page.
            </p>
          </div>
        </div>
      </div>

      {!media ? (
        <section className="tool-card p-5 sm:p-6">
          <button
            type="button"
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-soft p-6 text-center transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="rounded-lg bg-primary-soft p-3 text-primary">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-4 font-bold text-foreground">
              {busy ? "Reading media locally…" : "Choose a GIF, MP4, or WebM"}
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              No upload, cloud processing, or automatic playback
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/gif,video/mp4,video/webm"
            className="sr-only"
            aria-label="Choose GIF, MP4, or WebM media"
            disabled={busy}
            onChange={(event) => processFile(event.target.files?.[0])}
          />
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
          <section className="tool-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-soft p-4">
              <div>
                <h2 className="font-bold text-foreground">
                  {media.kind === "gif" ? "GIF preview" : "Video preview"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {media.width} × {media.height}
                  {media.kind === "video"
                    ? ` • ${media.duration.toFixed(2)} seconds`
                    : " • static fallback shown"}
                </p>
              </div>
              <button type="button" className="btn-secondary" onClick={reset}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>

            <div className="space-y-5 p-4 sm:p-5">
              {media.kind === "video" ? (
                <>
                  <video
                    ref={videoRef}
                    src={sourceUrl}
                    controls
                    preload="metadata"
                    className="aspect-video w-full rounded-lg bg-canvas object-contain"
                    onPlay={() =>
                      setCaptureTime(videoRef.current?.currentTime || 0)
                    }
                    onTimeUpdate={() =>
                      setCaptureTime(videoRef.current?.currentTime || 0)
                    }
                  >
                    This browser does not support video playback.
                  </video>
                  <div>
                    <div className="flex justify-between gap-3 text-xs font-bold text-foreground">
                      <label htmlFor="fallback-time">Fallback frame time</label>
                      <span className="font-mono text-muted-foreground">
                        {captureTime.toFixed(2)}s
                      </span>
                    </div>
                    <input
                      id="fallback-time"
                      type="range"
                      min="0"
                      max={media.duration}
                      step="0.01"
                      value={captureTime}
                      className="mt-2 w-full accent-primary"
                      onChange={(event) => {
                        const next = normalizeCaptureTime(
                          event.target.value,
                          media.duration,
                        );
                        setCaptureTime(next);
                        if (videoRef.current) {
                          videoRef.current.pause();
                          videoRef.current.currentTime = next;
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={busy}
                    onClick={captureVideoFrame}
                  >
                    <ImageDown className="h-4 w-4" aria-hidden="true" />
                    {busy ? "Capturing…" : "Capture still fallback"}
                  </button>
                </>
              ) : (
                <>
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-canvas">
                    <Image
                      src={showOriginalGif ? sourceUrl : stillUrl}
                      alt={
                        showOriginalGif
                          ? "Animated original GIF preview"
                          : "Static first-frame fallback preview"
                      }
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    className={
                      showOriginalGif ? "btn-secondary" : "btn-primary"
                    }
                    onClick={() => setShowOriginalGif((current) => !current)}
                  >
                    {showOriginalGif ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4" aria-hidden="true" />
                    )}
                    {showOriginalGif
                      ? "Stop and hide GIF motion"
                      : "Show original GIF motion"}
                  </button>
                </>
              )}

              {stillUrl ? (
                <div className="rounded-lg border border-border bg-surface-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-foreground">
                        Static fallback ready
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Review whether this frame plus nearby text preserves the
                        media&apos;s purpose.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={async () => {
                        const response = await fetch(stillUrl);
                        downloadBlob(
                          await response.blob(),
                          "motion-reduced-fallback.png",
                        );
                      }}
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download PNG
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="tool-card p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <FileVideo2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Delivery checklist
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Describe the intended website behavior. These cues are not an
              automated WCAG verdict.
            </p>
            <div className="mt-4 space-y-3">
              <Choice
                checked={choices.autoplay}
                label="Starts automatically"
                detail="Motion begins without an intentional play action."
                onChange={(value) => updateChoice("autoplay", value)}
              />
              <Choice
                checked={choices.loops}
                label="Loops after it starts"
                detail="Motion repeats, whether it starts automatically or after user action."
                onChange={(value) => updateChoice("loops", value)}
              />
              <Choice
                checked={choices.lastsMoreThanFiveSeconds}
                label="Lasts more than five seconds"
                detail="The automatic moving, blinking, or scrolling content continues beyond five seconds."
                onChange={(value) =>
                  updateChoice("lastsMoreThanFiveSeconds", value)
                }
              />
              <Choice
                checked={choices.runsInParallel}
                label="Runs alongside other content"
                detail="The motion appears in parallel with other page content."
                onChange={(value) => updateChoice("runsInParallel", value)}
              />
              <Choice
                checked={choices.pauseControl}
                label="Pause, stop, or hide control"
                detail="The real experience offers an immediate keyboard-operable control."
                onChange={(value) => updateChoice("pauseControl", value)}
              />
              <Choice
                checked={choices.respectsPreference}
                label="Responds to reduced-motion preference"
                detail="The implementation removes, reduces, or replaces non-essential motion."
                onChange={(value) => updateChoice("respectsPreference", value)}
              />
              <Choice
                checked={choices.motionEssential}
                label="Motion is believed essential"
                detail="Removing the motion would fundamentally change information or function."
                onChange={(value) => updateChoice("motionEssential", value)}
              />
              <Choice
                checked={choices.meaningfulStill}
                label="Still fallback preserves purpose"
                detail="The selected frame and nearby text communicate the intended information."
                onChange={(value) => updateChoice("meaningfulStill", value)}
              />
            </div>
          </section>
        </div>
      )}

      {error ? (
        <div
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {media ? (
        <section className="tool-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                {review.level === "no-obvious-risk" ? (
                  <CheckCircle2
                    className="h-5 w-5 text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <Info className="h-5 w-5 text-primary" aria-hidden="true" />
                )}
                Implementation review
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {review.counts.high} action-needed • {review.counts.review}{" "}
                review • {review.counts.note} note
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              disabled={!report}
              onClick={() => downloadJson(report)}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export local review report
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {review.findings.map((finding) => (
              <li
                key={finding.code}
                className="rounded-lg border border-border bg-surface-soft p-4"
              >
                <span className="text-xs font-black uppercase tracking-wide text-primary">
                  {finding.severity}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {finding.message}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            The local review report includes media metadata, selected settings,
            finding counts, and review findings. It excludes the media, file
            name, and still image. This tool does not analyze flashes, diagnose
            motion sensitivity, or establish WCAG conformance.
          </p>
        </section>
      ) : null}

      <section className="tool-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          Scope and references
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This is a local authoring preview, not a medical or conformance test.
          Requirements depend on context and the complete delivered experience.
          References accessed 24 July 2026.
        </p>
        <ul className="mt-4 space-y-2">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"
              >
                {source.title}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
