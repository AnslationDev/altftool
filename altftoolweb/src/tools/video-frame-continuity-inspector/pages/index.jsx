"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileVideo2,
  Film,
  Info,
  LoaderCircle,
  Pause,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  CONTINUITY_LIMITATIONS,
  CONTINUITY_THRESHOLDS,
  VIDEO_LIMITS,
  assessThumbnailSafety,
  buildPrivacySafeContinuityReport,
  buildSampleTimes,
  calculateWorkingDimensions,
  compareFramePixels,
  mergeContinuityCues,
  minimumFullCoverageInterval,
  validateVideoFile,
  validateVideoMetadata,
} from "../lib/videoContinuity.mjs";

const SOURCES = [
  {
    title: "WHATWG HTML Living Standard — media elements",
    href: "https://html.spec.whatwg.org/multipage/media.html",
  },
  {
    title: "WHATWG HTML Living Standard — canvas",
    href: "https://html.spec.whatwg.org/multipage/canvas.html",
  },
];

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}

function formatTime(secondsInput) {
  const seconds = Math.max(0, Number(secondsInput) || 0);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${remainder
    .toFixed(2)
    .padStart(5, "0")}`;
}

function formatPercent(value) {
  return `${((Number(value) || 0) * 100).toFixed(2)}%`;
}

function downloadJson(value) {
  const objectUrl = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "video-continuity-counts-and-timing.json";
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

function waitForVideoMetadata(video, sourceUrl) {
  return new Promise((resolve, reject) => {
    let timer;
    const cleanUp = () => {
      window.clearTimeout(timer);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
    };
    const handleLoadedMetadata = () => {
      cleanUp();
      resolve();
    };
    const handleError = () => {
      cleanUp();
      reject(
        new Error("This browser could not decode the video metadata or codec."),
      );
    };
    video.addEventListener("loadedmetadata", handleLoadedMetadata, {
      once: true,
    });
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
      reject(new Error("Video frame decoding timed out."));
    }, 12_000);
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

function cueLabel(cue) {
  if (cue === "near-duplicate") return "Near-duplicate cue";
  if (cue === "high-change") return "High-change cue";
  return "Ordinary sampled change";
}

function CueBadge({ cue }) {
  const className =
    cue === "near-duplicate"
      ? "border-info/30 bg-info-soft text-info"
      : cue === "high-change"
        ? "border-warning/30 bg-warning-soft text-foreground"
        : "border-border bg-surface-soft text-muted-foreground";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {cueLabel(cue)}
    </span>
  );
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

export default function VideoFrameContinuityInspector() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const objectUrlRef = useRef("");
  const generationRef = useRef(0);
  const busyRef = useRef(false);

  const [media, setMedia] = useState(null);
  const [sampleInterval, setSampleInterval] = useState(2);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  const samplingPlan = useMemo(() => {
    if (!media) return { times: [], error: "" };
    try {
      return {
        times: buildSampleTimes(media.durationSeconds, sampleInterval),
        error: "",
      };
    } catch (cause) {
      return {
        times: [],
        error:
          cause instanceof Error
            ? cause.message
            : "The sample plan is invalid.",
      };
    }
  }, [media, sampleInterval]);

  const thumbnailSafety = useMemo(
    () =>
      media
        ? assessThumbnailSafety(samplingPlan.times.length, media.workingPixels)
        : { safe: false, reason: "" },
    [media, samplingPlan.times.length],
  );

  const privacyReport = useMemo(
    () =>
      analysis && media
        ? buildPrivacySafeContinuityReport({
            durationSeconds: media.durationSeconds,
            intervalSeconds: analysis.intervalSeconds,
            sampleTimes: analysis.sampleTimes,
            comparisons: analysis.comparisons,
            ranges: analysis.ranges,
          })
        : null,
    [analysis, media],
  );

  const reset = () => {
    generationRef.current += 1;
    busyRef.current = false;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    clearVideoElement(videoRef.current);
    setMedia(null);
    setSampleInterval(2);
    setShowThumbnails(false);
    setAnalysis(null);
    setBusy(false);
    setProgress({ current: 0, total: 0 });
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(
    () => () => {
      generationRef.current += 1;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
      clearVideoElement(videoRef.current);
    },
    [],
  );

  const processFile = async (file) => {
    if (!file || busyRef.current) return;
    const preflight = validateVideoFile(file);
    if (!preflight.ok) {
      setError(preflight.error);
      return;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setAnalysis(null);
    setProgress({ current: 0, total: 0 });

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
    clearVideoElement(videoRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    try {
      const video = videoRef.current;
      if (!video) throw new Error("Video preview is unavailable.");
      await waitForVideoMetadata(video, objectUrl);
      if (generation !== generationRef.current) return;
      const metadata = validateVideoMetadata({
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
      if (!metadata.ok) throw new Error(metadata.error);
      const working = calculateWorkingDimensions(
        metadata.width,
        metadata.height,
      );
      const recommendedInterval = Math.max(
        2,
        minimumFullCoverageInterval(metadata.durationSeconds),
      );
      setSampleInterval(recommendedInterval);
      setShowThumbnails(false);
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
      video.pause();
    } catch (cause) {
      if (generation === generationRef.current) {
        if (objectUrlRef.current === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrlRef.current = "";
        }
        clearVideoElement(videoRef.current);
        setMedia(null);
        setError(
          cause instanceof Error
            ? cause.message
            : "The video could not be opened.",
        );
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const runScreen = async () => {
    const video = videoRef.current;
    if (
      !video ||
      !media ||
      busyRef.current ||
      samplingPlan.error ||
      !samplingPlan.times.length
    ) {
      return;
    }
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setAnalysis(null);
    setError("");
    setProgress({ current: 0, total: samplingPlan.times.length });

    try {
      video.pause();
      const metadataCheck = validateVideoMetadata({
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
      if (!metadataCheck.ok) throw new Error(metadataCheck.error);
      await waitForFrameData(video);
      if (generation !== generationRef.current) return;

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

      const frames = [];
      const comparisons = [];
      let previousPixels = null;
      let previousTime = null;
      const captureThumbnails = showThumbnails && thumbnailSafety.safe;

      for (let index = 0; index < samplingPlan.times.length; index += 1) {
        const time = samplingPlan.times[index];
        await seekVideo(video, time);
        if (generation !== generationRef.current) return;
        context.drawImage(video, 0, 0, media.workingWidth, media.workingHeight);
        const pixels = context.getImageData(
          0,
          0,
          media.workingWidth,
          media.workingHeight,
        ).data;
        const nextPixels = new Uint8ClampedArray(pixels);
        if (previousPixels) {
          comparisons.push(
            compareFramePixels(previousPixels, nextPixels, {
              fromTime: previousTime,
              toTime: time,
            }),
          );
        }
        frames.push({
          time,
          thumbnail: captureThumbnails
            ? canvas.toDataURL("image/jpeg", 0.68)
            : "",
        });
        previousPixels = nextPixels;
        previousTime = time;
        setProgress({
          current: index + 1,
          total: samplingPlan.times.length,
        });
      }
      if (generation !== generationRef.current) return;
      setAnalysis({
        comparisons,
        frames,
        intervalSeconds: sampleInterval,
        ranges: mergeContinuityCues(comparisons),
        sampleTimes: [...samplingPlan.times],
      });
    } catch (cause) {
      if (generation === generationRef.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "The video frames could not be sampled.",
        );
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const nearDuplicateCount =
    analysis?.comparisons.filter(({ cue }) => cue === "near-duplicate")
      .length || 0;
  const highChangeCount =
    analysis?.comparisons.filter(({ cue }) => cue === "high-change").length ||
    0;

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <Film className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">Video Frame Continuity Inspector</h1>
          <p className="tool-description">
            Sample frames from a local video and review deterministic
            near-duplicate or high-change cues without uploading the media.
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-foreground">
              Local continuity screen—not video forensics
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Nothing is uploaded or stored. Cues do not identify edits,
              deepfakes, tampering, or authenticity. Unsampled changes can be
              missed, and ordinary cuts, flashes, fades, motion, or compression
              can explain the measurements.
            </p>
          </div>
        </div>
      </section>

      <video
        ref={videoRef}
        controls={Boolean(media)}
        playsInline
        preload="metadata"
        className={
          media
            ? "max-h-96 w-full rounded-lg border border-border bg-canvas shadow-sm"
            : "sr-only"
        }
        aria-label="Local video preview used for paused frame sampling"
      >
        This browser does not support local video playback.
      </video>

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
              {busy ? "Reading local metadata…" : "Choose a local video"}
            </span>
            <span className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              MP4, WebM, Ogg video, MOV, or M4V • up to 80 MB • decoded duration
              and dimensions are checked before any frame sampling
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
            className="sr-only"
            aria-label="Choose video for local frame continuity screening"
            disabled={busy}
            onChange={(event) => processFile(event.target.files?.[0])}
          />
          {busy ? (
            <div className="mt-4 flex justify-center">
              <button type="button" className="btn-secondary" onClick={reset}>
                <Pause className="h-4 w-4" aria-hidden="true" />
                Cancel
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
                  {formatTime(media.durationSeconds)} • {media.width} ×{" "}
                  {media.height} • {media.mimeType}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analysis canvas: {media.workingWidth} × {media.workingHeight}{" "}
                  ({media.workingPixels.toLocaleString()} pixels)
                </p>
              </div>
              <button type="button" className="btn-secondary" onClick={reset}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Clear video
              </button>
            </div>
          </section>

          <section className="tool-card p-4 sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <label
                  htmlFor="continuity-sample-interval"
                  className="text-sm font-semibold text-foreground"
                >
                  Sampling interval: {sampleInterval} seconds
                </label>
                <input
                  id="continuity-sample-interval"
                  type="range"
                  min={VIDEO_LIMITS.minIntervalSeconds}
                  max={VIDEO_LIMITS.maxIntervalSeconds}
                  step="0.25"
                  value={sampleInterval}
                  disabled={busy}
                  className="mt-3 w-full accent-primary"
                  onChange={(event) => {
                    setSampleInterval(Number(event.target.value));
                    setAnalysis(null);
                  }}
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Explicit interval; the near-end frame is also sampled.
                  Increase it if the plan would exceed{" "}
                  {VIDEO_LIMITS.maxSampledFrames} frames.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="text-sm font-semibold text-foreground">
                  Current plan
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {samplingPlan.error ? "—" : samplingPlan.times.length} frames
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {samplingPlan.error
                    ? samplingPlan.error
                    : `${Math.max(0, samplingPlan.times.length - 1)} frame pairs across the clip`}
                </p>
              </div>
            </div>

            <label className="mt-5 flex min-h-11 items-start gap-3 rounded-lg border border-border bg-surface-soft p-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={showThumbnails && thumbnailSafety.safe}
                disabled={busy || !thumbnailSafety.safe}
                onChange={(event) => {
                  setShowThumbnails(event.target.checked);
                  setAnalysis(null);
                }}
              />
              <span>
                <span className="text-sm font-semibold text-foreground">
                  Keep bounded local thumbnails for this result
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Off by default. Available only for plans of{" "}
                  {VIDEO_LIMITS.maxThumbnailFrames} frames or fewer; thumbnails
                  never enter the JSON report.
                  {!thumbnailSafety.safe && thumbnailSafety.reason
                    ? ` ${thumbnailSafety.reason}`
                    : ""}
                </span>
              </span>
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                disabled={busy || Boolean(samplingPlan.error)}
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
                {busy ? "Sampling paused frames…" : "Run continuity screen"}
              </button>
              {busy ? (
                <button type="button" className="btn-secondary" onClick={reset}>
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  Cancel and clear
                </button>
              ) : null}
            </div>
            {busy && progress.total ? (
              <p
                className="mt-3 text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                Sampled {progress.current} of {progress.total} frames.
              </p>
            ) : null}
          </section>
        </>
      )}

      {error ? (
        <div
          className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {analysis ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Film}
              label="Sampled frames"
              value={analysis.sampleTimes.length}
              detail={`Requested interval: ${analysis.intervalSeconds} seconds`}
            />
            <MetricCard
              icon={BarChart3}
              label="Compared pairs"
              value={analysis.comparisons.length}
              detail="Adjacent sampled frames only"
            />
            <MetricCard
              icon={Pause}
              label="Near-duplicate cues"
              value={nearDuplicateCount}
              detail="Can be ordinary static or low-motion footage"
            />
            <MetricCard
              icon={AlertTriangle}
              label="High-change cues"
              value={highChangeCount}
              detail="Can be a cut, flash, fade, motion, or compression"
            />
          </section>

          <section className="tool-card overflow-hidden">
            <div className="border-b border-border bg-surface-soft p-4">
              <h2 className="font-bold text-foreground">
                Sample-to-sample timeline
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Pixel difference is mean absolute RGB difference; histogram
                distance compares 16 normalized luminance bins.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-3xl border-collapse text-left text-sm">
                <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Sample span
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Pixel difference
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Histogram distance
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Mean luma change
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Screening cue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analysis.comparisons.map((comparison) => (
                    <tr
                      key={`${comparison.fromTime}-${comparison.toTime}`}
                      className="bg-surface"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">
                        {formatTime(comparison.fromTime)} →{" "}
                        {formatTime(comparison.toTime)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatPercent(comparison.pixelDifference)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatPercent(comparison.histogramDistance)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatPercent(comparison.meanLuminanceDelta)}
                      </td>
                      <td className="px-4 py-3">
                        <CueBadge cue={comparison.cue} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="tool-card p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <Clock3 className="h-5 w-5 text-primary" aria-hidden="true" />
              Merged cue ranges
            </h2>
            {analysis.ranges.length ? (
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {analysis.ranges.map((range) => (
                  <li
                    key={`${range.cue}-${range.startSeconds}-${range.endSeconds}`}
                    className="rounded-lg border border-border bg-surface-soft p-4"
                  >
                    <CueBadge cue={range.cue} />
                    <p className="mt-3 font-mono text-sm font-semibold text-foreground">
                      {formatTime(range.startSeconds)} →{" "}
                      {formatTime(range.endSeconds)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {range.pairCount} adjacent sampled pair
                      {range.pairCount === 1 ? "" : "s"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-success/30 bg-success-soft p-4">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No sampled pair crossed the fixed cue thresholds. This does
                  not prove continuity; changes between sample times can still
                  be missed.
                </p>
              </div>
            )}
          </section>

          {analysis.frames.some(({ thumbnail }) => thumbnail) ? (
            <section className="tool-card p-4 sm:p-5">
              <h2 className="font-bold text-foreground">
                Opt-in local thumbnails
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                These downscaled previews remain in this page session and are
                erased when you clear the tool. They are never exported.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {analysis.frames.map((frame) => (
                  <figure
                    key={frame.time}
                    className="overflow-hidden rounded-lg border border-border bg-surface-soft"
                  >
                    <Image
                      src={frame.thumbnail}
                      alt={`Local sampled video frame at ${formatTime(frame.time)}`}
                      width={media.workingWidth}
                      height={media.workingHeight}
                      unoptimized
                      className="aspect-video h-auto w-full object-contain"
                    />
                    <figcaption className="p-3 font-mono text-xs text-muted-foreground">
                      {formatTime(frame.time)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <section className="tool-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-foreground">
                  <Download
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Privacy-safe numerical report
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  The JSON contains only sample counts, requested interval,
                  coverage timing, merged cue timing, and fixed limitations. It
                  excludes the filename, frames, pixels, thumbnails, and
                  per-frame measurements.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => downloadJson(privacyReport)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download JSON
              </button>
            </div>
          </section>
        </>
      ) : null}

      <section className="tool-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          How to interpret this screen
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-soft p-4">
            <p className="font-semibold text-foreground">
              Fixed cue thresholds
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                Near-duplicate: pixel difference ≤{" "}
                {formatPercent(
                  CONTINUITY_THRESHOLDS.nearDuplicatePixelDifference,
                )}{" "}
                and histogram distance ≤{" "}
                {formatPercent(
                  CONTINUITY_THRESHOLDS.nearDuplicateHistogramDistance,
                )}
                .
              </li>
              <li>
                High-change: pixel difference ≥{" "}
                {formatPercent(CONTINUITY_THRESHOLDS.highChangePixelDifference)}{" "}
                or histogram distance ≥{" "}
                {formatPercent(
                  CONTINUITY_THRESHOLDS.highChangeHistogramDistance,
                )}
                .
              </li>
              <li>Everything between those boundaries is shown as ordinary.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-soft p-4">
            <p className="font-semibold text-foreground">
              Important limitations
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {CONTINUITY_LIMITATIONS.map((limitation) => (
                <li key={limitation}>• {limitation}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="tool-card p-4 sm:p-5">
        <h2 className="font-bold text-foreground">Standards references</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Browser behavior references accessed 24 July 2026.
        </p>
        <ul className="mt-3 space-y-2">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
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
