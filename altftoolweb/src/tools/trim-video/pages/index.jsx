"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Scissors } from "lucide-react";

import {
  DEFAULT_CRF,
  MAX_CRF,
  MIN_CRF,
  TRIM_MODES,
  buildFfmpegArgs,
  formatBytes,
  formatTimecode,
  planTrim,
} from "../lib";

const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("10");
  const [mode, setMode] = useState("copy");
  const [keepAudio, setKeepAudio] = useState(true);
  const [crf, setCrf] = useState(DEFAULT_CRF);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const ffmpegRef = useRef(null);

  const plan = useMemo(
    () =>
      planTrim({
        start,
        end,
        durationSeconds: duration,
        sourceBytes: file?.size || 0,
        mode,
      }),
    [start, end, duration, file, mode],
  );
  const hasError = Boolean(plan.error);

  const args = useMemo(
    () =>
      hasError
        ? null
        : buildFfmpegArgs({
            plan,
            inputName: "input.mp4",
            outputName: mode === "copy" ? "trimmed.mp4" : "trimmed-reencoded.mp4",
            keepAudio,
            crf,
          }),
    [hasError, plan, mode, keepAudio, crf],
  );

  useEffect(
    () => () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    },
    [videoUrl],
  );

  useEffect(
    () => () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    },
    [outputUrl],
  );

  useEffect(() => () => {
    ffmpegRef.current?.terminate?.();
  }, []);

  const onPickFile = (event) => {
    const picked = event.target.files?.[0];
    setStatus("");
    setOutputUrl("");
    setOutputSize(0);
    if (!picked) return;
    setFile(picked);
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(picked);
    });
  };

  const onLoadedMetadata = (event) => {
    const seconds = event.currentTarget.duration;
    if (Number.isFinite(seconds) && seconds > 0) {
      setDuration(seconds);
      setStart("0");
      setEnd(String(Math.min(10, Math.round(seconds * 100) / 100)));
    }
  };

  const loadFfmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    setStatus("Loading the FFmpeg engine…");
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
      import("@ffmpeg/ffmpeg"),
      import("@ffmpeg/util"),
    ]);
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: value }) => {
      if (Number.isFinite(value)) setProgress(Math.min(98, Math.round(value * 100)));
    });
    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    ]);
    await ffmpeg.load({ coreURL, wasmURL });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }, []);

  const runTrim = async () => {
    if (hasError || !file || busy) return;
    setBusy(true);
    setProgress(0);
    setOutputUrl("");
    setOutputSize(0);
    try {
      const ffmpeg = await loadFfmpeg();
      const { fetchFile } = await import("@ffmpeg/util");
      setStatus("Trimming…");
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      const outputName = args[args.length - 1];
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data.buffer ?? data], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      setProgress(100);
      setStatus(`Clip ready — ${formatBytes(blob.size)}.`);
    } catch {
      setStatus(
        "The trim failed. Stream copy only works on some containers — try the precise re-encode mode.",
      );
    } finally {
      setBusy(false);
    }
  };

  const summary = useMemo(() => {
    if (hasError || !args) return "";
    return [
      `Trim: ${plan.startTimecode} → ${plan.endTimecode}`,
      `Clip length: ${plan.clipTimecode} (${NUM.format(plan.clipDuration)} s)`,
      `Source length: ${formatTimecode(plan.durationSeconds)}`,
      `Keeping ${NUM.format(plan.keptPercent)}% of the video`,
      plan.averageBitrateKbps
        ? `Source average bitrate: ${NUM.format(plan.averageBitrateKbps)} kbps`
        : null,
      plan.estimatedBytes ? `Estimated clip size: ${formatBytes(plan.estimatedBytes)}` : null,
      `Mode: ${TRIM_MODES[plan.mode]}`,
      `ffmpeg ${args.join(" ")}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, plan, args]);

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
    setStart("0");
    setEnd(duration > 0 ? String(Math.min(10, Math.round(duration * 100) / 100)) : "10");
    setMode("copy");
    setKeepAudio(true);
    setCrf(DEFAULT_CRF);
    setStatus("");
    setOutputUrl("");
    setOutputSize(0);
    setProgress(0);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Video editing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Trim Video</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a video, set a start and end time, and download just that section. Everything
          runs in your browser with FFmpeg compiled to WebAssembly — the file is never
          uploaded. The engine is fetched once on first use.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="trim-file">
          Video file (MP4, MOV, WebM)
        </label>
        <input
          id="trim-file"
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={onPickFile}
          className="mt-1 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
        />

        {videoUrl && (
          <video
            src={videoUrl}
            controls
            onLoadedMetadata={onLoadedMetadata}
            className="mt-4 w-full rounded-lg border border-[var(--border)]"
          >
            <track kind="captions" />
          </video>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="trim-start">
              Start time (s or mm:ss)
            </label>
            <input
              id="trim-start"
              type="text"
              inputMode="decimal"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trim-end">
              End time (s or mm:ss)
            </label>
            <input
              id="trim-end"
              type="text"
              inputMode="decimal"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trim-mode">
              Output mode
            </label>
            <select
              id="trim-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            >
              {Object.entries(TRIM_MODES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {mode === "reencode" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="trim-crf">
                Quality (CRF {crf} — lower is better)
              </label>
              <input
                id="trim-crf"
                type="range"
                min={MIN_CRF}
                max={MAX_CRF}
                step="1"
                value={crf}
                onChange={(e) => setCrf(Number(e.target.value))}
                className="mt-4 h-11 w-full accent-[var(--primary)]"
              />
            </div>
          )}
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={keepAudio}
            onChange={(e) => setKeepAudio(e.target.checked)}
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
          />
          Keep the audio track
        </label>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {plan.error}
          </p>
        )}

        <p className="text-sm text-[var(--muted-foreground)]">Clip length</p>
        <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {hasError ? DASH : plan.clipTimecode}
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Selection</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${plan.startTimecode} → ${plan.endTimecode}`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source length</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : formatTimecode(plan.durationSeconds)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Kept</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${NUM.format(plan.keptPercent)}%`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source bitrate</dt>
            <dd className="text-sm font-semibold">
              {hasError || !plan.averageBitrateKbps
                ? DASH
                : `${NUM.format(plan.averageBitrateKbps)} kbps`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Estimated clip size</dt>
            <dd className="text-sm font-semibold">
              {hasError || !plan.estimatedBytes ? DASH : formatBytes(plan.estimatedBytes)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Actual output</dt>
            <dd className="text-sm font-semibold">
              {outputSize ? formatBytes(outputSize) : DASH}
            </dd>
          </div>
        </dl>

        {!hasError && plan.endWasClamped && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            The end time was past the end of the video, so it was clamped to{" "}
            {plan.endTimecode}.
          </p>
        )}
        {!hasError && plan.mode === "copy" && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Stream copy cuts on the nearest earlier keyframe, so the clip can start up to
            about {plan.worstCaseDriftSeconds} seconds early. Switch to the precise mode for
            a frame-exact cut.
          </p>
        )}

        {!hasError && args && (
          <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <code className="text-xs whitespace-pre">ffmpeg {args.join(" ")}</code>
          </div>
        )}

        {busy && (
          <div className="mt-4">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-[var(--primary)] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {status && (
          <p role="status" aria-live="polite" className="mt-3 text-sm text-[var(--muted-foreground)]">
            {status}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runTrim}
            disabled={hasError || !file || busy}
            className={PRIMARY_BTN}
          >
            <Scissors className="h-4 w-4" aria-hidden="true" />
            {busy ? "Working…" : "Trim video"}
          </button>
          {outputUrl && (
            <a
              href={outputUrl}
              download={mode === "copy" ? "trimmed.mp4" : "trimmed-reencoded.mp4"}
              className={GHOST_BTN}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download clip
            </a>
          )}
          <button
            type="button"
            onClick={copyResult}
            disabled={hasError}
            className={GHOST_BTN}
            aria-label="Copy the trim details and FFmpeg command"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy details"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset trim settings">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
