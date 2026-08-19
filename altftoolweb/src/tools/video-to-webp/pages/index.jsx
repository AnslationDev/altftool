"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, ImagePlay, RotateCcw } from "lucide-react";
import {
  FPS_PRESETS,
  MAX_SEGMENT_SECONDS,
  WIDTH_PRESETS,
  buildAnimatedWebp,
  computeOutputSize,
  formatBytes,
  formatClock,
  planFrameTimes,
} from "../lib";

const DASH = "—";
const integerFormat = new Intl.NumberFormat("en-US");
const decimalFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

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

export default function VideoToWebp() {
  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [fps, setFps] = useState(12);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [targetWidth, setTargetWidth] = useState(480);
  const [quality, setQuality] = useState(0.8);
  const [loopForever, setLoopForever] = useState(true);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!videoUrl) return undefined;
    return () => URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  useEffect(() => {
    if (!resultUrl) return undefined;
    return () => URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const plan = useMemo(
    () => planFrameTimes({ duration, fps, startTime, endTime }),
    [duration, fps, startTime, endTime],
  );
  const sizePlan = useMemo(
    () => computeOutputSize(dimensions.width, dimensions.height, targetWidth),
    [dimensions.width, dimensions.height, targetWidth],
  );
  const planError = duration > 0 ? plan.error || sizePlan.error || "" : "";
  const shownError = error || planError;

  const clearOutput = useCallback(() => {
    setResult(null);
    setResultUrl("");
    setError("");
    setCopied(false);
    setProgress(0);
  }, []);

  const handleFile = useCallback(
    (file) => {
      clearOutput();
      setDuration(0);
      setDimensions({ width: 0, height: 0 });
      if (!file) {
        setVideoName("");
        setVideoUrl("");
        return;
      }
      setVideoName(file.name);
      setVideoUrl(URL.createObjectURL(file));
    },
    [clearOutput],
  );

  const onMetadata = useCallback((event) => {
    const video = event.currentTarget;
    const readDuration = Number.isFinite(video.duration) ? video.duration : 0;
    setDuration(readDuration);
    setDimensions({ width: video.videoWidth, height: video.videoHeight });
    setStartTime(0);
    setEndTime(Math.min(readDuration, 5));
  }, []);

  const onVideoError = useCallback(() => {
    setDuration(0);
    setDimensions({ width: 0, height: 0 });
    setVideoUrl("");
    setVideoName("");
    setError("This file couldn't be played as a video — try a different file or format.");
  }, []);

  const convert = useCallback(async () => {
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
    clearOutput();
    setBusy(true);

    const canvas = document.createElement("canvas");
    canvas.width = sizePlan.width;
    canvas.height = sizePlan.height;
    const context = canvas.getContext("2d");

    try {
      video.pause();
      const frames = [];
      for (let index = 0; index < plan.times.length; index += 1) {
        await seekTo(video, plan.times[index]);
        context.drawImage(video, 0, 0, sizePlan.width, sizePlan.height);
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/webp", quality),
        );
        if (!blob || blob.type !== "image/webp") {
          throw new Error("webp-unsupported");
        }
        const buffer = await blob.arrayBuffer();
        frames.push({ data: new Uint8Array(buffer), durationMs: plan.frameDurationMs });
        setProgress(Math.round(((index + 1) / plan.times.length) * 100));
      }

      const animation = buildAnimatedWebp({
        frames,
        width: sizePlan.width,
        height: sizePlan.height,
        loopCount: loopForever ? 0 : 1,
      });
      if (animation.error) {
        setError(animation.error);
        return;
      }
      setResult(animation);
      setResultUrl(
        URL.createObjectURL(new Blob([animation.bytes], { type: "image/webp" })),
      );
    } catch (cause) {
      if (String(cause && cause.message) === "webp-unsupported") {
        setError(
          "This browser cannot encode WebP from a canvas, so an animated WebP cannot be built here. Chrome, Edge and Firefox can.",
        );
      } else {
        setError(
          "Frames could not be read from this video. Some codecs, and any DRM-protected file, cannot be drawn to a canvas.",
        );
      }
    } finally {
      setBusy(false);
    }
  }, [videoUrl, plan, sizePlan, quality, loopForever, clearOutput]);

  const reset = useCallback(() => {
    clearOutput();
    setVideoName("");
    setVideoUrl("");
    setDuration(0);
    setDimensions({ width: 0, height: 0 });
    setFps(12);
    setStartTime(0);
    setEndTime(5);
    setTargetWidth(480);
    setQuality(0.8);
    setLoopForever(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [clearOutput]);

  const copySummary = useCallback(async () => {
    if (!result) return;
    const text = [
      `Animated WebP: ${result.width} × ${result.height}`,
      `Frames: ${result.frameCount} at ${fps} fps`,
      `Playback length: ${(result.durationMs / 1000).toFixed(2)} s`,
      `File size: ${formatBytes(result.byteLength)}`,
      `Loop: ${loopForever ? "forever" : "once"}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [result, fps, loopForever]);

  const outputName = `${(videoName || "clip").replace(/\.[^.]+$/, "")}.webp`;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <ImagePlay aria-hidden="true" className="mt-1 h-6 w-6 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Video to WebP</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Sample a short section of a clip and mux the frames into a single animated WebP. The
            video is decoded and encoded by your own browser — nothing is uploaded.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vtw-file" className="text-sm font-medium text-[var(--foreground)]">
          Video file
        </label>
        <input
          id="vtw-file"
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(event) => handleFile(event.target.files?.[0] || null)}
          disabled={busy}
          className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] file:mr-3 file:rounded file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60"
        />
      </div>

      {videoUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-[var(--border)]">
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={onMetadata}
            onError={onVideoError}
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
          <label htmlFor="vtw-start" className="text-sm font-medium text-[var(--foreground)]">
            Start time (seconds)
          </label>
          <input
            id="vtw-start"
            type="number"
            min={0}
            step={0.1}
            value={startTime}
            onChange={(event) => {
              setStartTime(Number(event.target.value));
              clearOutput();
            }}
            disabled={busy}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vtw-end" className="text-sm font-medium text-[var(--foreground)]">
            End time (seconds)
          </label>
          <input
            id="vtw-end"
            type="number"
            min={0}
            step={0.1}
            value={endTime}
            onChange={(event) => {
              setEndTime(Number(event.target.value));
              clearOutput();
            }}
            disabled={busy}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vtw-fps" className="text-sm font-medium text-[var(--foreground)]">
            Frames per second
          </label>
          <select
            id="vtw-fps"
            value={fps}
            onChange={(event) => {
              setFps(Number(event.target.value));
              clearOutput();
            }}
            disabled={busy}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60"
          >
            {FPS_PRESETS.map((value) => (
              <option key={value} value={value}>
                {value} fps
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vtw-width" className="text-sm font-medium text-[var(--foreground)]">
            Output width
          </label>
          <select
            id="vtw-width"
            value={targetWidth}
            onChange={(event) => {
              setTargetWidth(Number(event.target.value));
              clearOutput();
            }}
            disabled={busy}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60"
          >
            {WIDTH_PRESETS.map((value) => (
              <option key={value} value={value}>
                {value} px wide
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vtw-quality" className="text-sm font-medium text-[var(--foreground)]">
            WebP quality ({decimalFormat.format(quality)})
          </label>
          <input
            id="vtw-quality"
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={quality}
            onChange={(event) => {
              setQuality(Number(event.target.value));
              clearOutput();
            }}
            disabled={busy}
            className="h-11 w-full accent-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-60"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="vtw-loop"
            type="checkbox"
            checked={loopForever}
            onChange={(event) => {
              setLoopForever(event.target.checked);
              clearOutput();
            }}
            disabled={busy}
            className="h-5 w-5 accent-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-60"
          />
          <label htmlFor="vtw-loop" className="text-sm font-medium text-[var(--foreground)]">
            Loop forever
          </label>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={convert}
          disabled={busy || !videoUrl || Boolean(planError)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <ImagePlay aria-hidden="true" className="h-4 w-4" />
          {busy ? `Converting… ${progress}%` : "Convert to WebP"}
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
          disabled={!result}
          aria-label="Copy conversion summary to clipboard"
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm text-[var(--muted-foreground)]">Animated WebP size</p>
        <p className="mt-1 text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          {shownError || !result ? DASH : formatBytes(result.byteLength)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {result
            ? `${result.frameCount} frames · ${(result.durationMs / 1000).toFixed(2)} s loop`
            : videoUrl
              ? "Press Convert to WebP"
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

        {result && resultUrl ? (
          <a
            href={resultUrl}
            download={outputName}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download {outputName}
          </a>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Video length</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {duration > 0 ? formatClock(duration) : DASH}
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
            <dt className="text-sm text-[var(--muted-foreground)]">Output resolution</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || sizePlan.error
                ? DASH
                : `${integerFormat.format(sizePlan.width)} × ${integerFormat.format(sizePlan.height)}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Frames planned</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || plan.error ? DASH : integerFormat.format(plan.times.length)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Frame duration</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || plan.error ? DASH : `${plan.frameDurationMs} ms`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Clip span</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {shownError || plan.error ? DASH : `${decimalFormat.format(plan.spanSeconds)} s`}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Clips are capped at {MAX_SEGMENT_SECONDS} seconds. Each frame is a separately encoded WebP
          still, so lower frame rates and narrower widths make a much smaller file.
        </p>
      </section>

      {result && resultUrl ? (
        <figure className="mt-6 rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt="Animated WebP preview"
            className="mx-auto block h-auto max-w-full rounded-md"
          />
          <figcaption className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
            Preview of the animated WebP
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}
