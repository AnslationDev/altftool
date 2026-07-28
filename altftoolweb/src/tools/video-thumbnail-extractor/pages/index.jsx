"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Film, RotateCcw } from "lucide-react";
import {
  MAX_THUMBNAILS,
  MIN_INTERVAL_SECONDS,
  MODES,
  OUTPUT_FORMATS,
  WIDTH_PRESETS,
  computeThumbnailSize,
  formatBytes,
  formatTimecode,
  parseTimecode,
  planTimestamps,
  thumbnailFileName,
} from "../lib";

const DASH = "—";
const integerFormat = new Intl.NumberFormat("en-US");

function seekTo(video, time) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("seek failed"));
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = time;
  });
}

export default function VideoThumbnailExtractor() {
  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [mode, setMode] = useState("even");
  const [count, setCount] = useState(6);
  const [interval, setIntervalSeconds] = useState(10);
  const [startText, setStartText] = useState("0");
  const [atText, setAtText] = useState("00:00:05");
  const [targetWidth, setTargetWidth] = useState(640);
  const [format, setFormat] = useState("image/jpeg");

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [thumbnails, setThumbnails] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!videoUrl) return undefined;
    return () => URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  useEffect(() => {
    if (!thumbnails.length) return undefined;
    return () => thumbnails.forEach((thumb) => URL.revokeObjectURL(thumb.url));
  }, [thumbnails]);

  const startOffset = parseTimecode(startText) ?? Number.NaN;
  const at = parseTimecode(atText) ?? Number.NaN;

  const plan = useMemo(
    () => planTimestamps({ duration, mode, count, interval, startOffset, at }),
    [duration, mode, count, interval, startOffset, at],
  );
  const sizePlan = useMemo(
    () => computeThumbnailSize(dimensions.width, dimensions.height, targetWidth),
    [dimensions.width, dimensions.height, targetWidth],
  );

  const planError = duration > 0 ? plan.error || sizePlan.error || "" : "";
  const shownError = error || planError;
  const timestamps = useMemo(() => (plan.error ? [] : plan.timestamps), [plan]);

  const handleFile = useCallback((file) => {
    setThumbnails([]);
    setError("");
    setCopied(false);
    setProgress(0);
    setDuration(0);
    setDimensions({ width: 0, height: 0 });
    if (!file) {
      setVideoName("");
      setVideoUrl("");
      return;
    }
    setVideoName(file.name);
    setVideoUrl(URL.createObjectURL(file));
  }, []);

  const onMetadata = useCallback((event) => {
    const video = event.currentTarget;
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setDimensions({ width: video.videoWidth, height: video.videoHeight });
  }, []);

  const extract = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) {
      setError("Choose a video file first.");
      return;
    }
    if (plan.error) {
      setError(plan.error);
      return;
    }
    if (sizePlan.error) {
      setError(sizePlan.error);
      return;
    }
    setThumbnails([]);
    setError("");
    setCopied(false);
    setBusy(true);
    setProgress(0);

    const chosenFormat =
      OUTPUT_FORMATS.find((entry) => entry.value === format) || OUTPUT_FORMATS[0];
    const canvas = document.createElement("canvas");
    canvas.width = sizePlan.width;
    canvas.height = sizePlan.height;
    const context = canvas.getContext("2d");
    const collected = [];

    try {
      video.pause();
      for (let index = 0; index < plan.timestamps.length; index += 1) {
        const time = plan.timestamps[index];
        await seekTo(video, time);
        context.drawImage(video, 0, 0, sizePlan.width, sizePlan.height);
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, chosenFormat.value, 0.92),
        );
        if (!blob) {
          throw new Error("encode failed");
        }
        collected.push({
          time,
          url: URL.createObjectURL(blob),
          name: thumbnailFileName(videoName, index, time, chosenFormat.extension),
          size: blob.size,
        });
        setProgress(Math.round(((index + 1) / plan.timestamps.length) * 100));
      }
      setThumbnails(collected);
    } catch {
      collected.forEach((thumb) => URL.revokeObjectURL(thumb.url));
      setError(
        "Frames could not be read from this video. Some codecs (and DRM-protected files) cannot be drawn to a canvas.",
      );
    } finally {
      setBusy(false);
    }
  }, [videoUrl, plan, sizePlan, format, videoName]);

  const downloadZip = useCallback(async () => {
    if (!thumbnails.length) return;
    try {
      const JSZipModule = await import("jszip");
      const JSZip = JSZipModule.default || JSZipModule;
      const zip = new JSZip();
      for (const thumb of thumbnails) {
        const data = await fetch(thumb.url).then((response) => response.blob());
        zip.file(thumb.name, data);
      }
      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(videoName || "video").replace(/\.[^.]+$/, "")}-thumbnails.zip`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      setError("The ZIP file could not be built. Download the frames individually instead.");
    }
  }, [thumbnails, videoName]);

  const copyTimestamps = useCallback(async () => {
    if (!timestamps.length) return;
    const text = timestamps.map((time, index) => `${index + 1}. ${formatTimecode(time)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [timestamps]);

  const reset = useCallback(() => {
    setThumbnails([]);
    setError("");
    setCopied(false);
    setProgress(0);
    setVideoName("");
    setVideoUrl("");
    setDuration(0);
    setDimensions({ width: 0, height: 0 });
    setMode("even");
    setCount(6);
    setIntervalSeconds(10);
    setStartText("0");
    setAtText("00:00:05");
    setTargetWidth(640);
    setFormat("image/jpeg");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const totalBytes = thumbnails.reduce((sum, thumb) => sum + thumb.size, 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <Film aria-hidden="true" className="mt-1 h-6 w-6 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Video Thumbnail Extractor
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Pick a video, choose how the frames should be spaced, and download the stills. The file
            is decoded by your own browser and never uploaded.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vte-file" className="text-sm font-medium text-[var(--foreground)]">
          Video file
        </label>
        <input
          id="vte-file"
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(event) => handleFile(event.target.files?.[0] || null)}
          className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] file:mr-3 file:rounded file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      {videoUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-[var(--border)]">
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={onMetadata}
            preload="metadata"
            playsInline
            muted
            controls
            className="block h-auto w-full bg-[var(--card)]"
          />
        </div>
      ) : null}

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vte-mode" className="text-sm font-medium text-[var(--foreground)]">
            Frame selection
          </label>
          <select
            id="vte-mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value);
              setError("");
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {Object.entries(MODES).map(([key, entry]) => (
              <option key={key} value={key}>
                {entry.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--muted-foreground)]">{MODES[mode].hint}</p>
        </div>

        {mode === "even" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vte-count" className="text-sm font-medium text-[var(--foreground)]">
              How many thumbnails
            </label>
            <input
              id="vte-count"
              type="number"
              min={1}
              max={MAX_THUMBNAILS}
              step={1}
              value={count}
              onChange={(event) => {
                setCount(Number(event.target.value));
                setError("");
              }}
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        ) : null}

        {mode === "interval" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vte-interval" className="text-sm font-medium text-[var(--foreground)]">
              Seconds between frames
            </label>
            <input
              id="vte-interval"
              type="number"
              min={MIN_INTERVAL_SECONDS}
              step={0.5}
              value={interval}
              onChange={(event) => {
                setIntervalSeconds(Number(event.target.value));
                setError("");
              }}
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        ) : null}

        {mode === "single" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vte-at" className="text-sm font-medium text-[var(--foreground)]">
              Timecode (HH:MM:SS)
            </label>
            <input
              id="vte-at"
              type="text"
              inputMode="numeric"
              value={atText}
              onChange={(event) => {
                setAtText(event.target.value);
                setError("");
              }}
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        ) : null}

        {mode !== "single" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vte-start" className="text-sm font-medium text-[var(--foreground)]">
              Start offset (HH:MM:SS)
            </label>
            <input
              id="vte-start"
              type="text"
              inputMode="numeric"
              value={startText}
              onChange={(event) => {
                setStartText(event.target.value);
                setError("");
              }}
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vte-width" className="text-sm font-medium text-[var(--foreground)]">
            Thumbnail width
          </label>
          <select
            id="vte-width"
            value={targetWidth}
            onChange={(event) => {
              setTargetWidth(Number(event.target.value));
              setError("");
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            {WIDTH_PRESETS.map((value) => (
              <option key={value} value={value}>
                {value} px wide
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vte-format" className="text-sm font-medium text-[var(--foreground)]">
            Image format
          </label>
          <select
            id="vte-format"
            value={format}
            onChange={(event) => {
              setFormat(event.target.value);
              setError("");
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
          onClick={extract}
          disabled={busy || !videoUrl || Boolean(planError)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <Film aria-hidden="true" className="h-4 w-4" />
          {busy ? `Extracting… ${progress}%` : "Extract thumbnails"}
        </button>
        <button
          type="button"
          onClick={downloadZip}
          disabled={!thumbnails.length}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Download all as ZIP
        </button>
        <button
          type="button"
          onClick={copyTimestamps}
          disabled={!timestamps.length}
          aria-label="Copy the planned timestamps to clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-[var(--success)]" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy timestamps"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset
        </button>
      </div>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Frames planned</p>
        <p className="mt-1 text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          {shownError ? DASH : timestamps.length ? integerFormat.format(timestamps.length) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {thumbnails.length
            ? `${thumbnails.length} extracted · ${formatBytes(totalBytes)} total`
            : videoUrl
              ? "Press Extract thumbnails"
              : "Choose a video to begin"}
        </p>

        {shownError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {shownError}
          </p>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Video length</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {duration > 0 ? formatTimecode(duration) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source resolution</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {dimensions.width
                ? `${integerFormat.format(dimensions.width)} × ${integerFormat.format(dimensions.height)}`
                : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Thumbnail size</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || sizePlan.error
                ? DASH
                : `${integerFormat.format(sizePlan.width)} × ${integerFormat.format(sizePlan.height)}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">First frame at</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || !timestamps.length ? DASH : formatTimecode(timestamps[0])}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Last frame at</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || !timestamps.length
                ? DASH
                : formatTimecode(timestamps[timestamps.length - 1])}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source file</dt>
            <dd className="max-w-[60%] truncate font-medium text-[var(--foreground)]">
              {videoName || DASH}
            </dd>
          </div>
        </dl>
      </section>

      {thumbnails.length ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {thumbnails.map((thumb) => (
            <figure
              key={thumb.name}
              className="rounded-xl bg-[var(--card)] p-3 ring-1 ring-[var(--border)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb.url}
                alt={`Frame at ${formatTimecode(thumb.time)}`}
                className="block h-auto w-full rounded-md"
              />
              <figcaption className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className="font-mono text-[var(--muted-foreground)]">
                  {formatTimecode(thumb.time)}
                </span>
                <a
                  href={thumb.url}
                  download={thumb.name}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 font-medium text-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Save
                </a>
              </figcaption>
            </figure>
          ))}
        </section>
      ) : null}
    </div>
  );
}
