"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Upload, Video } from "lucide-react";

import {
  analyzeVideo,
  ASPECT_PRESETS,
  bitrateForTargetSize,
  BYTES_PER_MB,
  compareToReference,
  estimateSize,
  fitToAspect,
  H264_REFERENCE_BITRATES,
  parseDuration,
} from "../lib";

const DEFAULTS = {
  duration: "00:01:00",
  width: "1920",
  height: "1080",
  fps: "30",
  fileSizeMB: "50",
  targetSizeMB: "25",
  audioKbps: "128",
  targetAspect: "9:16",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const num = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);
const int = (v) => (Number.isFinite(v) ? INT.format(v) : DASH);
const three = (v) => (Number.isFinite(v) ? NUM3.format(v) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [fileSizeMB, setFileSizeMB] = useState(DEFAULTS.fileSizeMB);
  const [targetSizeMB, setTargetSizeMB] = useState(DEFAULTS.targetSizeMB);
  const [audioKbps, setAudioKbps] = useState(DEFAULTS.audioKbps);
  const [targetAspect, setTargetAspect] = useState(DEFAULTS.targetAspect);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseDuration(duration), [duration]);
  const seconds = parsed.error ? NaN : parsed.seconds;

  const result = useMemo(() => {
    if (parsed.error) return { error: parsed.error };
    return analyzeVideo({
      durationSeconds: seconds,
      width: toNumber(width),
      height: toNumber(height),
      fps: toNumber(fps),
      fileSizeMB: toNumber(fileSizeMB),
    });
  }, [parsed, seconds, width, height, fps, fileSizeMB]);

  const target = useMemo(
    () =>
      parsed.error
        ? { error: parsed.error }
        : bitrateForTargetSize({
            durationSeconds: seconds,
            targetSizeMB: toNumber(targetSizeMB),
            audioKbps: toNumber(audioKbps),
          }),
    [parsed, seconds, targetSizeMB, audioKbps],
  );

  const targetCheck = useMemo(() => {
    if (target.error) return null;
    return estimateSize({
      durationSeconds: seconds,
      videoKbps: target.videoKbps,
      audioKbps: toNumber(audioKbps),
    });
  }, [target, seconds, audioKbps]);

  const preset = ASPECT_PRESETS.find((p) => p.id === targetAspect) ?? ASPECT_PRESETS[0];

  const fit = useMemo(
    () => fitToAspect({ width: toNumber(width), height: toNumber(height), targetRatio: preset.ratio }),
    [width, height, preset],
  );

  const reference = useMemo(() => {
    if (result.error) return { error: result.error };
    return compareToReference({
      height: toNumber(height),
      fps: toNumber(fps),
      bitrateKbps: result.bitrateKbps,
    });
  }, [result, height, fps]);

  const errorMessage = result.error || null;

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFileError("");
    setFileName(file.name);
    setFileSizeMB(String(Math.round((file.size / BYTES_PER_MB) * 100) / 100));
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.muted = true;
    const done = () => URL.revokeObjectURL(url);
    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration) && probe.duration > 0) {
        setDuration(String(Math.round(probe.duration * 1000) / 1000));
      }
      if (probe.videoWidth > 0) setWidth(String(probe.videoWidth));
      if (probe.videoHeight > 0) setHeight(String(probe.videoHeight));
      done();
    };
    probe.onerror = () => {
      setFileError("This browser could not decode that file's metadata. Type the numbers in below instead.");
      done();
    };
    probe.src = url;
  }

  function reset() {
    setDuration(DEFAULTS.duration);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setFps(DEFAULTS.fps);
    setFileSizeMB(DEFAULTS.fileSizeMB);
    setTargetSizeMB(DEFAULTS.targetSizeMB);
    setAudioKbps(DEFAULTS.audioKbps);
    setTargetAspect(DEFAULTS.targetAspect);
    setFileName("");
    setFileError("");
    setCopied(false);
  }

  async function copyResult() {
    if (errorMessage) return;
    const lines = [
      fileName ? `File: ${fileName}` : "Video specs",
      `Duration: ${duration} (${int(result.totalFrames)} frames at ${fps} fps)`,
      `Frame: ${width} x ${height} — ${result.ratioLabel} ${result.orientation}`,
      `Size: ${num(result.fileSizeMB)} MB`,
      `Bitrate: ${num(result.bitrateMbps)} Mbit/s (${int(result.bitrateKbps)} kbit/s)`,
      `Bits per pixel: ${three(result.bitsPerPixel)}`,
      `Timecode: ${result.timecode}`,
      target.error ? `Target size: ${target.error}` : `To hit ${targetSizeMB} MB: ${int(target.videoKbps)} kbit/s video + ${audioKbps} kbit/s audio`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Video className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Video Tools
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Bitrate, aspect ratio, frame count, timecode, letterbox bars and target-size transcode maths. Files stay in your browser.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="grid gap-4">
          <div className="rounded-xl border border-dashed border-[var(--border)] p-4">
            <label className={LABEL_CLASS} htmlFor="vt-file">
              Read specs from a video file (optional)
            </label>
            <input
              id="vt-file"
              type="file"
              accept="video/*"
              onChange={handleFile}
              className="mt-2 block w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-4 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
            />
            <p className="mt-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              {fileName ? `Loaded ${fileName}` : "Nothing uploaded — the file is read locally and never leaves this device."}
            </p>
            {fileError ? (
              <p className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {fileError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-duration">
                Duration (s, MM:SS or HH:MM:SS)
              </label>
              <input id="vt-duration" className={`mt-1 ${INPUT_CLASS}`} value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="text" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-fps">
                Frame rate (fps)
              </label>
              <input id="vt-fps" className={`mt-1 ${INPUT_CLASS}`} value={fps} onChange={(e) => setFps(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-width">
                Frame width (px)
              </label>
              <input id="vt-width" className={`mt-1 ${INPUT_CLASS}`} value={width} onChange={(e) => setWidth(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-height">
                Frame height (px)
              </label>
              <input id="vt-height" className={`mt-1 ${INPUT_CLASS}`} value={height} onChange={(e) => setHeight(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-size">
                File size (MB)
              </label>
              <input id="vt-size" className={`mt-1 ${INPUT_CLASS}`} value={fileSizeMB} onChange={(e) => setFileSizeMB(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-audio">
                Audio bitrate (kbit/s)
              </label>
              <input id="vt-audio" className={`mt-1 ${INPUT_CLASS}`} value={audioKbps} onChange={(e) => setAudioKbps(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-target">
                Target file size (MB)
              </label>
              <input id="vt-target" className={`mt-1 ${INPUT_CLASS}`} value={targetSizeMB} onChange={(e) => setTargetSizeMB(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vt-aspect">
                Fit into aspect ratio
              </label>
              <select id="vt-aspect" className={`mt-1 ${INPUT_CLASS}`} value={targetAspect} onChange={(e) => setTargetAspect(e.target.value)}>
                {ASPECT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={PRIMARY_BTN} onClick={copyResult} aria-label="Copy the video spec sheet to the clipboard">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all fields to their defaults">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            {errorMessage ? (
              <p className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <p className="text-sm text-[var(--muted-foreground)]">Average bitrate</p>
            <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {errorMessage ? DASH : `${num(result.bitrateMbps)} Mbit/s`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {errorMessage ? DASH : `${int(result.bitrateKbps)} kbit/s · ${three(result.bitsPerPixel)} bits per pixel`}
            </p>

            <dl className="mt-4">
              <Row label="Aspect ratio" value={errorMessage ? DASH : `${result.ratioLabel} (${num(result.ratioDecimal)})`} />
              <Row label="Orientation" value={errorMessage ? DASH : result.orientation} />
              <Row label="Megapixels per frame" value={errorMessage ? DASH : `${num(result.megapixels)} MP`} />
              <Row label="Total frames" value={errorMessage ? DASH : int(result.totalFrames)} />
              <Row label="Timecode (HH:MM:SS:FF)" value={errorMessage ? DASH : result.timecode} />
              <Row label="Size per minute" value={errorMessage ? DASH : `${num(result.mbPerMinute)} MB`} />
            </dl>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Hit a target file size</h2>
            {target.error ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {target.error}
              </p>
            ) : null}
            <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {target.error ? DASH : `${int(target.videoKbps)} kbit/s`}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">video bitrate, with audio held at {audioKbps} kbit/s</p>
            <dl className="mt-3">
              <Row label="Total bitrate budget" value={target.error ? DASH : `${int(target.totalKbps)} kbit/s`} />
              <Row label="Resulting file size" value={targetCheck && !targetCheck.error ? `${num(targetCheck.sizeMB)} MB` : DASH} />
            </dl>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Quality check vs H.264 reference</h2>
            {reference.error ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {reference.error}
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-[var(--foreground)]">{reference.verdict}</p>
                <dl className="mt-2">
                  <Row label="Closest tier" value={`${reference.tierLabel}${reference.highFps ? " (high frame rate)" : ""}`} />
                  <Row label="Reference bitrate" value={`${int(reference.recommendedKbps)} kbit/s`} />
                  <Row label="Your bitrate vs reference" value={`${num(reference.ratio * 100)}%`} />
                </dl>
              </>
            )}
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Fit into {preset.id} without cropping</h2>
            {fit.error ? (
              <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {fit.error}
              </p>
            ) : (
              <dl className="mt-2">
                <Row label="Canvas size" value={`${int(fit.canvasWidth)} x ${int(fit.canvasHeight)} px`} />
                <Row label="Bars" value={fit.barType} />
                <Row label="Bar thickness" value={fit.barWidth > 0 ? `${int(fit.barWidth)} px each side` : fit.barHeight > 0 ? `${int(fit.barHeight)} px top and bottom` : "0 px"} />
                <Row label="Share of canvas that is bar" value={`${num(fit.barSharePercent)}%`} />
              </dl>
            )}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">H.264 upload bitrate reference (YouTube, SDR)</h2>
        <div className="mt-2 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-[var(--card)] text-left text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Resolution</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">24-30 fps</th>
                <th scope="col" className="px-4 py-2 text-right font-medium">48-60 fps</th>
              </tr>
            </thead>
            <tbody>
              {H264_REFERENCE_BITRATES.map((row) => (
                <tr key={row.label} className="border-t border-[var(--border)]">
                  <td className="px-4 py-2 text-[var(--foreground)]">{row.label}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[var(--foreground)]">{num(row.standardKbps / 1000)} Mbit/s</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[var(--foreground)]">{num(row.highFpsKbps / 1000)} Mbit/s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">Sizes use the decimal convention: 1 MB = 1,000,000 bytes and 1 kbit/s = 1000 bit/s.</p>
      </section>
    </div>
  );
}
