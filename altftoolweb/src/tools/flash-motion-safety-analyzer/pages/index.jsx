"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileVideo2,
  Gauge,
  Info,
  LoaderCircle,
  Pause,
  RefreshCw,
  ScanEye,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  FLASH_MOTION_LIMITS,
  FLASH_THRESHOLDS,
  buildCountsTimingReport,
  buildSampleTimes,
  buildSamplingWarnings,
  calculateWorkingDimensions,
  createFlashMotionAnalyzer,
  validateEncodedVideo,
  validateSamplingSettings,
  validateVideoMetadata,
} from "../lib/flashMotionAnalysis.mjs";

const SOURCES = [
  {
    title: "Understanding WCAG 2.3.1 — Three Flashes or Below Threshold",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html",
  },
  {
    title: "Understanding WCAG 2.3.2 — Three Flashes",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html",
  },
  {
    title: "Technique G19 — no more than three flashes in one second",
    href: "https://www.w3.org/WAI/WCAG22/Techniques/general/G19",
  },
  {
    title: "Technique G176 — keeping the flashing area small enough",
    href: "https://www.w3.org/WAI/WCAG22/Techniques/general/G176",
  },
  {
    title: "Technique G15 — time-continuous flash analysis tools",
    href: "https://www.w3.org/WAI/WCAG22/Techniques/general/G15",
  },
];

function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatTimeMs(value) {
  const totalSeconds = Math.max(0, Number(value) || 0) / 1_000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${seconds
    .toFixed(3)
    .padStart(6, "0")}`;
}

function formatPercent(value) {
  return `${((Number(value) || 0) * 100).toFixed(2)}%`;
}

function downloadJson(value) {
  if (!value) return;
  const objectUrl = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "flash-motion-counts-and-timings-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function clearVideoElement(video) {
  if (!video) return;
  video.pause();
  video.removeAttribute("src");
  video.load();
}

function waitForMetadata(video, sourceUrl) {
  return new Promise((resolve, reject) => {
    let timer;
    const cleanUp = () => {
      window.clearTimeout(timer);
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("error", handleError);
    };
    const handleMetadata = () => {
      cleanUp();
      resolve();
    };
    const handleError = () => {
      cleanUp();
      reject(
        new Error("This browser could not decode the video metadata or codec."),
      );
    };
    video.addEventListener("loadedmetadata", handleMetadata, { once: true });
    video.addEventListener("error", handleError, { once: true });
    timer = window.setTimeout(() => {
      cleanUp();
      reject(new Error("Video metadata loading timed out."));
    }, 12_000);
    video.preload = "metadata";
    video.src = sourceUrl;
    video.load();
  });
}

function waitForFrameData(video) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    let timer;
    const cleanUp = () => {
      window.clearTimeout(timer);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };
    const handleLoadedData = () => {
      cleanUp();
      resolve();
    };
    const handleError = () => {
      cleanUp();
      reject(new Error("The browser could not decode a video frame."));
    };
    video.addEventListener("loadeddata", handleLoadedData, { once: true });
    video.addEventListener("error", handleError, { once: true });
    timer = window.setTimeout(() => {
      cleanUp();
      reject(new Error("Initial video-frame decoding timed out."));
    }, 12_000);
    video.preload = "auto";
    video.load();
  });
}

function settlePaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

function seekVideo(video, time) {
  if (
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    Math.abs(video.currentTime - time) <= 0.002
  ) {
    return settlePaint();
  }
  return new Promise((resolve, reject) => {
    let timer;
    const cleanUp = () => {
      window.clearTimeout(timer);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    };
    const handleSeeked = async () => {
      cleanUp();
      await settlePaint();
      resolve();
    };
    const handleError = () => {
      cleanUp();
      reject(new Error("The browser could not seek to a sampled frame."));
    };
    video.addEventListener("seeked", handleSeeked, { once: true });
    video.addEventListener("error", handleError, { once: true });
    timer = window.setTimeout(() => {
      cleanUp();
      reject(new Error("Seeking to a sampled frame timed out."));
    }, 12_000);
    video.currentTime = time;
  });
}

function MetricCard({ detail, icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {detail}
          </p>
        </div>
      </div>
    </article>
  );
}

function NumericField({
  disabled,
  hint,
  id,
  label,
  max,
  min,
  onChange,
  placeholder,
  value,
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step="1"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field mt-2 w-full"
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
        {hint}
      </span>
    </label>
  );
}

export default function FlashMotionSafetyAnalyzer() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const objectUrlRef = useRef("");
  const operationRef = useRef(0);
  const busyRef = useRef(false);

  const [media, setMedia] = useState(null);
  const [sampleRate, setSampleRate] = useState(15);
  const [sourceFps, setSourceFps] = useState("");
  const [displayWidth, setDisplayWidth] = useState("");
  const [displayHeight, setDisplayHeight] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  const settingsCheck = useMemo(
    () =>
      validateSamplingSettings({
        displayHeight,
        displayWidth,
        sampleRate,
        sourceFps,
      }),
    [displayHeight, displayWidth, sampleRate, sourceFps],
  );

  const samplingPlan = useMemo(() => {
    if (!media || !settingsCheck.ok) return [];
    try {
      return buildSampleTimes(media.durationSeconds, sampleRate);
    } catch {
      return [];
    }
  }, [media, sampleRate, settingsCheck.ok]);

  const samplingWarnings = useMemo(
    () =>
      settingsCheck.ok
        ? buildSamplingWarnings({ sampleRate, sourceFps })
        : settingsCheck.errors,
    [sampleRate, settingsCheck, sourceFps],
  );

  const privacyReport = useMemo(
    () =>
      result && media
        ? buildCountsTimingReport({
            durationMs: media.durationSeconds * 1_000,
            result,
            sampleRate,
          })
        : null,
    [media, result, sampleRate],
  );

  const releaseObjectUrl = () => {
    clearVideoElement(videoRef.current);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
  };

  const reset = () => {
    operationRef.current += 1;
    busyRef.current = false;
    releaseObjectUrl();
    setMedia(null);
    setSampleRate(15);
    setSourceFps("");
    setDisplayWidth("");
    setDisplayHeight("");
    setResult(null);
    setBusy(false);
    setProgress({ current: 0, total: 0 });
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const cancelSampling = () => {
    operationRef.current += 1;
    busyRef.current = false;
    videoRef.current?.pause();
    setBusy(false);
    setProgress({ current: 0, total: 0 });
    setResult(null);
    setError("Sampling was cancelled. The local video remains available.");
  };

  useEffect(
    () => () => {
      operationRef.current += 1;
      clearVideoElement(videoRef.current);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
    },
    [],
  );

  const processFile = async (file) => {
    if (!file || busyRef.current) return;
    const operation = operationRef.current + 1;
    operationRef.current = operation;
    busyRef.current = true;
    setBusy(true);
    setError("");

    let newObjectUrl = "";
    try {
      const headerBytes = new Uint8Array(
        await file
          .slice(0, Math.min(file.size, FLASH_MOTION_LIMITS.maxHeaderBytes))
          .arrayBuffer(),
      );
      if (operation !== operationRef.current) return;
      const preflight = validateEncodedVideo(file, headerBytes);
      if (!preflight.ok) throw new Error(preflight.error);

      releaseObjectUrl();
      setMedia(null);
      setResult(null);
      setProgress({ current: 0, total: 0 });
      newObjectUrl = URL.createObjectURL(file);
      objectUrlRef.current = newObjectUrl;

      const video = videoRef.current;
      if (!video) throw new Error("The local video decoder is unavailable.");
      await waitForMetadata(video, newObjectUrl);
      if (operation !== operationRef.current) return;
      const metadata = validateVideoMetadata({
        duration: video.duration,
        videoHeight: video.videoHeight,
        videoWidth: video.videoWidth,
      });
      if (!metadata.ok) throw new Error(metadata.error);
      const working = calculateWorkingDimensions(
        metadata.width,
        metadata.height,
      );
      video.pause();
      setMedia({
        bytes: preflight.bytes,
        durationSeconds: metadata.durationSeconds,
        height: metadata.height,
        mimeType: preflight.mimeType,
        width: metadata.width,
        workingHeight: working.height,
        workingPixels: working.pixels,
        workingWidth: working.width,
      });
      if (inputRef.current) inputRef.current.value = "";
    } catch (cause) {
      if (operation === operationRef.current) {
        if (newObjectUrl && objectUrlRef.current === newObjectUrl) {
          releaseObjectUrl();
          setMedia(null);
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "The local video could not be opened.",
        );
        if (inputRef.current) inputRef.current.value = "";
      }
    } finally {
      if (operation === operationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const updateSetting = (setter, value) => {
    setter(value);
    setResult(null);
    setError("");
  };

  const runScreen = async () => {
    const video = videoRef.current;
    if (
      !video ||
      !media ||
      busyRef.current ||
      !settingsCheck.ok ||
      samplingPlan.length < 2
    ) {
      return;
    }

    const operation = operationRef.current + 1;
    operationRef.current = operation;
    busyRef.current = true;
    setBusy(true);
    setResult(null);
    setError("");
    setProgress({ current: 0, total: samplingPlan.length });

    try {
      video.pause();
      await waitForFrameData(video);
      if (operation !== operationRef.current) return;
      const metadataCheck = validateVideoMetadata({
        duration: video.duration,
        videoHeight: video.videoHeight,
        videoWidth: video.videoWidth,
      });
      if (!metadataCheck.ok) throw new Error(metadataCheck.error);
      if (
        metadataCheck.width !== media.width ||
        metadataCheck.height !== media.height ||
        Math.abs(metadataCheck.durationSeconds - media.durationSeconds) > 0.1
      ) {
        throw new Error(
          "Decoded video metadata changed before sampling. Clear and reopen the file.",
        );
      }

      const canvas = document.createElement("canvas");
      canvas.width = media.workingWidth;
      canvas.height = media.workingHeight;
      const context = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: true,
      });
      if (!context) {
        throw new Error(
          "Canvas frame analysis is unavailable in this browser.",
        );
      }
      const analyzer = createFlashMotionAnalyzer({
        displayHeight: settingsCheck.settings.displayHeight,
        displayWidth: settingsCheck.settings.displayWidth,
        pixelCount: media.workingPixels,
        sampleRate: settingsCheck.settings.sampleRate,
      });
      const progressStep = Math.max(1, Math.ceil(samplingPlan.length / 50));

      for (let index = 0; index < samplingPlan.length; index += 1) {
        await seekVideo(video, samplingPlan[index]);
        if (operation !== operationRef.current) return;
        context.drawImage(video, 0, 0, media.workingWidth, media.workingHeight);
        const imageData = context.getImageData(
          0,
          0,
          media.workingWidth,
          media.workingHeight,
        );
        analyzer.ingest({
          rgba: imageData.data,
          timeMs: video.currentTime * 1_000,
        });
        if (
          index === samplingPlan.length - 1 ||
          (index + 1) % progressStep === 0
        ) {
          setProgress({
            current: index + 1,
            total: samplingPlan.length,
          });
        }
      }
      if (operation !== operationRef.current) return;
      video.pause();
      setResult(analyzer.finish());
    } catch (cause) {
      if (operation === operationRef.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Paused video-frame sampling could not be completed.",
        );
      }
    } finally {
      if (operation === operationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const flashEventRows = result
    ? [
        ...result.generalEvents.map((event) => ({
          ...event,
          kind: "General",
        })),
        ...result.redEvents.map((event) => ({ ...event, kind: "Red" })),
      ]
        .sort((first, second) => first.timeMs - second.timeMs)
        .slice(0, FLASH_MOTION_LIMITS.maxRetainedEvents)
    : [];
  const rollingReviewCue =
    result &&
    (result.maximumGeneralPairsInOneSecond > 3 ||
      result.maximumRedPairsInOneSecond > 3 ||
      result.maximumGeneralFlashEquivalentInOneSecond > 3 ||
      result.maximumRedFlashEquivalentInOneSecond > 3);

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <ScanEye className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">Flash &amp; Motion Safety Analyzer</h1>
          <p className="tool-description">
            Screen bounded, paused samples from a local video for flash-pair and
            large frame-change cues without uploading the media.
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-warning/30 bg-warning-soft p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-foreground">
              Screening aid—not a safety, medical, or WCAG verdict
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              This browser-local tool seeks to paused samples; it never
              autoplays the video. Sparse sampling can miss unsampled or
              sub-frame flashes, so an absence of cues does not show that
              content is safe or conforms to WCAG.
            </p>
          </div>
        </div>
      </section>

      <video
        ref={videoRef}
        hidden
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      {!media ? (
        <section className="tool-card p-5 sm:p-6">
          <button
            type="button"
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-soft p-6 text-center transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <span className="rounded-lg bg-primary-soft p-3 text-primary">
              {busy ? (
                <LoaderCircle
                  className="h-6 w-6 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Upload className="h-6 w-6" aria-hidden="true" />
              )}
            </span>
            <span className="mt-4 font-bold text-foreground">
              {busy ? "Validating local media…" : "Choose a local video"}
            </span>
            <span className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              MP4 or WebM only • matching MIME and encoded signature • up to 80
              MB • up to 2 decoded minutes • no upload
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="sr-only"
            aria-label="Choose a local MP4 or WebM video for flash and motion screening"
            disabled={busy}
            onChange={(event) => processFile(event.target.files?.[0])}
          />
          {busy ? (
            <div className="mt-4 flex justify-center">
              <button type="button" className="btn-secondary" onClick={reset}>
                <Pause className="h-4 w-4" aria-hidden="true" />
                Cancel and clear
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <>
          <section className="tool-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-foreground">
                  <FileVideo2
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Validated local media
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {formatBytes(media.bytes)} •{" "}
                  {formatTimeMs(media.durationSeconds * 1_000)} • {media.width}{" "}
                  × {media.height} • {media.mimeType}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Analysis is downscaled to {media.workingWidth} ×{" "}
                  {media.workingHeight} ({media.workingPixels.toLocaleString()}{" "}
                  pixels). The filename is neither retained nor reported.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Replace
                </button>
                <button type="button" className="btn-secondary" onClick={reset}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Clear
                </button>
              </div>
            </div>
          </section>

          <section className="tool-card p-4 sm:p-5" aria-busy={busy}>
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
                Bounded sampling plan
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Sampling is user-initiated and remains paused. Choose the
                highest available rate unless you specifically need a faster
                preliminary screen.
              </p>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <label htmlFor="flash-sample-rate" className="block">
                <span className="text-sm font-semibold text-foreground">
                  Sample rate
                </span>
                <select
                  id="flash-sample-rate"
                  value={sampleRate}
                  disabled={busy}
                  className="input-field mt-2 w-full"
                  onChange={(event) =>
                    updateSetting(setSampleRate, Number(event.target.value))
                  }
                >
                  <option value="8">8 sampled frames/second</option>
                  <option value="10">10 sampled frames/second</option>
                  <option value="12">12 sampled frames/second</option>
                  <option value="15">15 sampled frames/second</option>
                </select>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Maximum 15 fps and{" "}
                  {FLASH_MOTION_LIMITS.maxSampledFrames.toLocaleString()}{" "}
                  sampled frames.
                </span>
              </label>

              <NumericField
                id="flash-source-fps"
                label="Known source frame rate (optional)"
                min="1"
                max={FLASH_MOTION_LIMITS.maxDeclaredSourceFps}
                placeholder="Example: 30"
                value={sourceFps}
                disabled={busy}
                hint="Browsers do not reliably expose encoded FPS. This declaration is used only for sampling-gap warnings."
                onChange={(value) => updateSetting(setSourceFps, value)}
              />

              <div className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="text-sm font-semibold text-foreground">
                  Current sample plan
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {samplingPlan.length
                    ? samplingPlan.length.toLocaleString()
                    : "—"}{" "}
                  frames
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {samplingPlan.length
                    ? `${Math.max(0, samplingPlan.length - 1).toLocaleString()} consecutive frame comparisons`
                    : "Correct the settings to create a bounded plan."}
                </p>
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-foreground">
                Planned largest rendered video size (optional)
              </legend>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Enter both CSS-pixel dimensions for a rough mapping of sampled
                affected fractions. Fullscreen, zoom, viewing distance,
                contiguity, and other page flashes remain outside this screen.
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <NumericField
                  id="flash-display-width"
                  label="Width in CSS pixels"
                  min="1"
                  max={FLASH_MOTION_LIMITS.maxSourceEdge}
                  placeholder="Example: 1024"
                  value={displayWidth}
                  disabled={busy}
                  hint="Leave both display fields empty if unknown."
                  onChange={(value) => updateSetting(setDisplayWidth, value)}
                />
                <NumericField
                  id="flash-display-height"
                  label="Height in CSS pixels"
                  min="1"
                  max={FLASH_MOTION_LIMITS.maxSourceEdge}
                  placeholder="Example: 576"
                  value={displayHeight}
                  disabled={busy}
                  hint="The mapped number is not a G176 determination."
                  onChange={(value) => updateSetting(setDisplayHeight, value)}
                />
              </div>
            </fieldset>

            <div
              className="mt-5 rounded-lg border border-warning/30 bg-warning-soft p-4"
              role="status"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold text-foreground">
                    Sampling limitation
                  </p>
                  <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
                    {samplingWarnings.map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                disabled={busy || !settingsCheck.ok || samplingPlan.length < 2}
                onClick={runScreen}
              >
                {busy ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                {busy ? "Screening paused frames…" : "Run paused-frame screen"}
              </button>
              {busy ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelSampling}
                >
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  Cancel sampling
                </button>
              ) : null}
            </div>

            {busy && progress.total ? (
              <div className="mt-4" role="status" aria-live="polite">
                <progress
                  className="h-2 w-full accent-primary"
                  max={progress.total}
                  value={progress.current}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Sampled {progress.current.toLocaleString()} of{" "}
                  {progress.total.toLocaleString()} paused frames.
                </p>
              </div>
            ) : null}
          </section>
        </>
      )}

      {media ? (
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="sr-only"
          aria-label="Replace the local MP4 or WebM video"
          disabled={busy}
          onChange={(event) => processFile(event.target.files?.[0])}
        />
      ) : null}

      {error ? (
        <div
          className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <section
            role="status"
            aria-live="polite"
            className={`rounded-lg border p-4 ${
              rollingReviewCue
                ? "border-warning/30 bg-warning-soft"
                : "border-info/30 bg-info-soft"
            }`}
          >
            <div className="flex items-start gap-3">
              {rollingReviewCue ? (
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                  aria-hidden="true"
                />
              ) : (
                <Info
                  className="mt-0.5 h-5 w-5 shrink-0 text-info"
                  aria-hidden="true"
                />
              )}
              <div>
                <h2 className="font-bold text-foreground">
                  {rollingReviewCue
                    ? "Sampled rolling-window cues need specialist review"
                    : "Sampled screen complete—no safety conclusion"}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {rollingReviewCue
                    ? "At least one sampled rolling second contained more than three completed pair cues or transition-equivalent flashes. This is a review signal, not a violation finding."
                    : "No sampled rolling second contained more than three qualifying pair cues. Unsampled flashes, downscaling, source FPS, spatial contiguity, HDR, and page context still prevent a safety or conformance conclusion."}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Clock3}
              label="Sampled frames"
              value={result.frameCount.toLocaleString()}
              detail={`${result.validTransitionCount.toLocaleString()} valid consecutive comparisons; ${result.samplingGapCount} sampling gaps`}
            />
            <MetricCard
              icon={BarChart3}
              label="General pair cues"
              value={result.generalFlashPairCount.toLocaleString()}
              detail={`Maximum ${result.maximumGeneralPairsInOneSecond} completed pairs; ${result.maximumGeneralFlashEquivalentInOneSecond} transition-equivalent flashes in a rolling sampled second`}
            />
            <MetricCard
              icon={ScanEye}
              label="Red pair cues"
              value={result.redFlashPairCount.toLocaleString()}
              detail={`Maximum ${result.maximumRedPairsInOneSecond} completed pairs; ${result.maximumRedFlashEquivalentInOneSecond} transition-equivalent flashes in a rolling sampled second`}
            />
            <MetricCard
              icon={Activity}
              label="Large frame-change cues"
              value={result.motionCueCount.toLocaleString()}
              detail="Non-normative comfort-review cue; not a seizure threshold"
            />
          </section>

          <section className="tool-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Sampled flash-pair cues
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Affected area is the fraction of the downscaled analysis
                  raster that formed an opposing qualifying pair. Rows are
                  limited to {FLASH_MOTION_LIMITS.maxRetainedEvents}; totals
                  above remain complete.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={!privacyReport}
                onClick={() => downloadJson(privacyReport)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export counts + timings
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-soft p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Largest general affected fraction
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {formatPercent(result.maximumGeneralAreaFraction)}
                </p>
              </div>
              <div className="rounded-lg bg-surface-soft p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Largest red affected fraction
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {formatPercent(result.maximumRedAreaFraction)}
                </p>
              </div>
              <div className="rounded-lg bg-surface-soft p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Mapped-area boundary type-cues
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {settingsCheck.settings.displayWidth === null
                    ? "Not mapped"
                    : result.mappedBoundaryCueCount.toLocaleString()}
                </p>
              </div>
            </div>

            {flashEventRows.length ? (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-xl w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-3 font-semibold">Timing</th>
                      <th className="px-3 py-3 font-semibold">Cue type</th>
                      <th className="px-3 py-3 font-semibold">
                        Affected fraction
                      </th>
                      <th className="px-3 py-3 font-semibold">
                        Rough mapped CSS pixels
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flashEventRows.map((event, index) => (
                      <tr
                        key={`${event.kind}-${event.timeMs}-${index}`}
                        className="border-b border-border"
                      >
                        <td className="px-3 py-3 font-mono text-foreground">
                          {formatTimeMs(event.timeMs)}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {event.kind}
                        </td>
                        <td className="px-3 py-3 text-foreground">
                          {formatPercent(event.affectedAreaFraction)}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {event.estimatedCssPixels === null
                            ? "Not mapped"
                            : Math.round(
                                event.estimatedCssPixels,
                              ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-border bg-surface-soft p-4">
                <p className="text-sm font-semibold text-foreground">
                  No qualifying opposing flash pairs were found in the sampled
                  frames.
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This is not a pass or evidence of safety; unsampled events and
                  spatial approximation remain.
                </p>
              </div>
            )}
          </section>

          <section className="tool-card p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Activity
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Non-normative motion comfort review
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  This separate heuristic flags comparisons where at least 25%
                  of analysis pixels changed relative luminance by 0.10 or more.
                  Cuts, camera movement, edits, fades, animation, and decoding
                  differences can all create cues. It is not part of the WCAG
                  flash threshold and does not diagnose discomfort.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-surface-soft p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Cue count
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {result.motionCueCount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-surface-soft p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Largest changed fraction
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {formatPercent(result.maximumMotionAreaFraction)}
                </p>
              </div>
              <div className="rounded-lg bg-surface-soft p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Largest mean luminance delta
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {result.maximumMeanLuminanceDifference.toFixed(3)}
                </p>
              </div>
            </div>
            {result.motionCues.length ? (
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                First retained cue timings:{" "}
                {result.motionCues
                  .slice(0, 12)
                  .map(({ timeMs }) => formatTimeMs(timeMs))
                  .join(", ")}
                {result.motionCues.length > 12 ? "…" : ""}
              </p>
            ) : null}
          </section>

          {result.samplingGapCount ? (
            <section className="rounded-lg border border-warning/30 bg-warning-soft p-4">
              <h2 className="font-bold text-foreground">
                Sampling-gap caution
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {result.samplingGapCount.toLocaleString()} interval(s) exceeded{" "}
                {FLASH_MOTION_LIMITS.maximumGapRatio}× the requested spacing.
                Transitions spanning those intervals were excluded from pair
                counting, which can miss cues.
              </p>
            </section>
          ) : null}
        </>
      ) : null}

      <section className="tool-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          What this sampled math does—and cannot do
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-soft p-4">
            <h3 className="font-bold text-foreground">
              Threshold-related calculations
            </h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                • Linearized sRGB relative luminance is compared between
                consecutive samples.
              </li>
              <li>
                • A general transition needs a luminance change of at least 0.10
                and a darker state below 0.80; opposite transitions form one
                sampled pair.
              </li>
              <li>
                • A red transition needs a saturated-red state with R/(R+G+B) at
                least 0.80 and CIE 1976 UCS chromaticity difference above 0.20;
                opposing vectors form one sampled pair.
              </li>
              <li>
                • General and red pair timings are counted independently inside
                rolling one-second windows. Transitions are consumed in
                non-overlapping pairs; a remaining transition contributes the
                half-flash caution described by G19.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-soft p-4">
            <h3 className="font-bold text-foreground">
              Spatial and temporal approximations
            </h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                • Downscaling can merge, weaken, or remove small and
                fine-pattern flashes; the tool does not establish spatial
                contiguity.
              </li>
              <li>
                • Optional area mapping compares a rough scaled area with the
                21,824 CSS-pixel web-content boundary described by G176. It
                cannot determine that technique.
              </li>
              <li>
                • Source FPS, unsampled frames, sub-frame events, looping,
                fullscreen scale, other page flashes, HDR luminance, zoom, and
                viewing distance require separate review.
              </li>
              <li>
                • W3C G15 describes time-continuous tool analysis for complex
                cases; paused browser seeking is not equivalent.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-foreground">
              Local-only and deliberately minimal export
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              The video, decoded frames, pixels, and analysis canvas stay in
              this browser tab. Nothing is uploaded or stored. The JSON export
              contains only counts, cue timings, duration, sample rate, and
              limitations—never the filename, frames, pixels, images, or
              thumbnails.
            </p>
          </div>
        </div>
      </section>

      <section className="tool-card p-4 sm:p-5">
        <h2 className="text-lg font-bold text-foreground">
          Official references
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          W3C WCAG 2.2 Understanding documents and techniques, accessed 24 July
          2026.
        </p>
        <ul className="mt-4 space-y-2">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
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
