"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  AudioLines,
  Captions,
  CheckCircle2,
  Clock3,
  Download,
  EyeOff,
  FileAudio2,
  FileText,
  Gauge,
  LoaderCircle,
  Music2,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  DEFAULT_SETTINGS,
  LIMITS,
  analyzePcmChannels,
  buildCountsTimingReport,
  formatTime,
  validateDecodedAudio,
  validateMediaFile,
  validateSettings,
} from "../lib/gapAnalysis.mjs";

const INITIAL_SETTINGS = Object.freeze({
  windowMs: String(DEFAULT_SETTINGS.windowMs),
  quietThresholdDbfs: String(DEFAULT_SETTINGS.quietThresholdDbfs),
  minimumGapSeconds: String(DEFAULT_SETTINGS.minimumGapMs / 1_000),
  bridgeMs: String(DEFAULT_SETTINGS.bridgeMs),
  dialoguePaddingMs: String(DEFAULT_SETTINGS.dialoguePaddingMs),
  boundaryGuardMs: String(DEFAULT_SETTINGS.boundaryGuardMs),
});

const SAMPLE_CUES = `WEBVTT

00:00:02.000 --> 00:00:04.400
Dialogue text may be present but is never included in the report.

00:00:08.100 --> 00:00:10.000
Another dialogue interval`;

function numericSettings(settings) {
  return {
    windowMs: Number(settings.windowMs),
    quietThresholdDbfs: Number(settings.quietThresholdDbfs),
    minimumGapMs: Number(settings.minimumGapSeconds) * 1_000,
    bridgeMs: Number(settings.bridgeMs),
    dialoguePaddingMs: Number(settings.dialoguePaddingMs),
    boundaryGuardMs: Number(settings.boundaryGuardMs),
  };
}

function formatFileSize(bytes) {
  const megabytes = Number(bytes) / (1024 * 1024);
  return `${megabytes < 1 ? megabytes.toFixed(2) : megabytes.toFixed(1)} MB`;
}

function downloadReport(result) {
  const report = buildCountsTimingReport(result);
  if (!report) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "audio-description-gap-counts-timing-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function probeMediaDuration(file) {
  return new Promise((resolve, reject) => {
    const media = document.createElement("video");
    const url = URL.createObjectURL(file);
    let timer;
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timer);
      media.onloadedmetadata = null;
      media.onerror = null;
      media.removeAttribute("src");
      media.load();
      URL.revokeObjectURL(url);
    };
    media.preload = "metadata";
    media.muted = true;
    media.onloadedmetadata = () => {
      if (settled) return;
      settled = true;
      const duration = media.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("The media duration is missing or invalid."));
        return;
      }
      resolve(duration);
    };
    media.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("The browser could not read this media file."));
    };
    timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Reading media metadata timed out."));
    }, 8_000);
    media.src = url;
  });
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-black text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function SettingField({ label, hint, value, onChange, min, max, step }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[var(--foreground)]">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        className="input-field mt-2 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
        {hint}
      </span>
    </label>
  );
}

function CandidateFlags({ candidate }) {
  const flags = [];
  if (candidate.nearMediaBoundary) flags.push("media edge");
  if (candidate.nearDialogue) flags.push("near dialogue");
  if (candidate.dialogueTrimmed) flags.push("dialogue subtracted");
  if (candidate.bridgedMs > 0) flags.push("brief audio bridged");

  if (!flags.length) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success)] bg-[var(--success-soft)] px-2 py-1 text-xs font-bold text-[var(--foreground)]">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        No timing caution
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Timing cautions">
      {flags.map((flag) => (
        <span
          key={flag}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--warning)] bg-[var(--warning-soft)] px-2 py-1 text-xs font-bold text-[var(--foreground)]"
        >
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          {flag}
        </span>
      ))}
    </div>
  );
}

export default function AudioDescriptionGapFinder() {
  const mediaInputRef = useRef(null);
  const captionInputRef = useRef(null);
  const operationRef = useRef(0);
  const audioContextRef = useRef(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [captionSource, setCaptionSource] = useState("");
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const stopActiveDecode = () => {
    operationRef.current += 1;
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") {
      void context.close().catch(() => {});
    }
    setBusy(false);
  };

  const invalidateResult = () => {
    stopActiveDecode();
    setResult(null);
    setError("");
  };

  useEffect(
    () => () => {
      operationRef.current += 1;
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context && context.state !== "closed") {
        void context.close().catch(() => {});
      }
    },
    [],
  );

  const selectMedia = (file) => {
    invalidateResult();
    if (!file) {
      setMediaFile(null);
      return;
    }
    const validation = validateMediaFile(file);
    if (!validation.ok) {
      setMediaFile(null);
      setError(validation.error);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
      return;
    }
    setMediaFile(file);
  };

  const readCaptionFile = async (file) => {
    invalidateResult();
    if (!file) return;
    if (file.size <= 0 || file.size > LIMITS.maxCaptionBytes) {
      setError("Choose an SRT, WebVTT, or text cue file up to 1 MB.");
      if (captionInputRef.current) captionInputRef.current.value = "";
      return;
    }

    const token = operationRef.current;
    try {
      const text = await file.text();
      if (token !== operationRef.current) return;
      if (text.length > LIMITS.maxCaptionCharacters) {
        setError("Caption input exceeds the 500,000-character safety limit.");
        return;
      }
      setCaptionSource(text);
    } catch {
      if (token === operationRef.current) {
        setError("The caption file could not be read as text.");
      }
    }
  };

  const updateCaptionSource = (value) => {
    invalidateResult();
    setCaptionSource(value.slice(0, LIMITS.maxCaptionCharacters));
  };

  const updateSetting = (key, value) => {
    invalidateResult();
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const loadSampleCues = () => {
    invalidateResult();
    setCaptionSource(SAMPLE_CUES);
    if (captionInputRef.current) captionInputRef.current.value = "";
  };

  const clearAll = () => {
    stopActiveDecode();
    setMediaFile(null);
    setCaptionSource("");
    setSettings(INITIAL_SETTINGS);
    setResult(null);
    setError("");
    if (mediaInputRef.current) mediaInputRef.current.value = "";
    if (captionInputRef.current) captionInputRef.current.value = "";
  };

  const runAnalysis = async () => {
    const mediaValidation = validateMediaFile(mediaFile);
    if (!mediaValidation.ok) {
      setError(mediaValidation.error);
      return;
    }
    const nextSettings = numericSettings(settings);
    const settingsValidation = validateSettings(nextSettings);
    if (!settingsValidation.ok) {
      setError(settingsValidation.errors.join(" "));
      return;
    }

    stopActiveDecode();
    const token = operationRef.current;
    setBusy(true);
    setResult(null);
    setError("");

    let context = null;
    try {
      const probedDuration = await probeMediaDuration(mediaFile);
      if (token !== operationRef.current) return;
      if (probedDuration > LIMITS.maxDurationSeconds) {
        throw new Error("The media exceeds the 10-minute duration limit.");
      }
      const bytes = await mediaFile.arrayBuffer();
      if (token !== operationRef.current) return;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error(
          "This browser does not provide the Web Audio decoder required for local analysis.",
        );
      }

      context = new AudioContextClass();
      audioContextRef.current = context;
      const audioBuffer = await context.decodeAudioData(bytes);
      if (token !== operationRef.current) return;

      const decodedValidation = validateDecodedAudio(audioBuffer);
      if (!decodedValidation.ok) {
        throw new Error(decodedValidation.errors.join(" "));
      }

      const channels = Array.from(
        { length: audioBuffer.numberOfChannels },
        (_, index) => audioBuffer.getChannelData(index),
      );

      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (token !== operationRef.current) return;

      const analysis = analyzePcmChannels({
        channels,
        sampleRate: audioBuffer.sampleRate,
        settings: nextSettings,
        dialogueSource: captionSource,
      });
      if (token !== operationRef.current) return;
      if (!analysis.ok) throw new Error(analysis.error);

      setResult(analysis);
    } catch (analysisError) {
      if (token === operationRef.current) {
        const knownMessage =
          analysisError instanceof Error ? analysisError.message : "";
        setError(
          knownMessage ||
            "The browser could not decode this media file. Try a supported audio track or another browser-native media format.",
        );
      }
    } finally {
      if (context && context.state !== "closed") {
        await context.close().catch(() => {});
      }
      if (audioContextRef.current === context) {
        audioContextRef.current = null;
      }
      if (token === operationRef.current) setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <AudioLines className="h-4 w-4" aria-hidden="true" />
              Human audio-description planning
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Audio-Description Gap Finder
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Measure quiet audio windows, subtract known dialogue timing, and
              rank candidate spaces for a human audio-description professional
              to review.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <ShieldCheck
                className="h-5 w-5 text-[var(--primary)]"
                aria-hidden="true"
              />
              Local and ephemeral
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Media and captions stay in this tab. There are no uploads, network
              analysis requests, accounts, or saved histories.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  1. Local media
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  Choose audio or video that you own or are allowed to process.
                </p>
              </div>
              <label className="btn-secondary inline-flex min-h-11 cursor-pointer items-center gap-2 px-4">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Choose media
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="audio/*,video/*,.m4a,.mp3,.wav,.flac,.ogg,.opus,.mp4,.webm"
                  className="sr-only"
                  aria-label="Choose a local audio or video file"
                  onChange={(event) =>
                    selectMedia(event.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            {mediaFile ? (
              <div className="mt-5 rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-4">
                <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                  <FileAudio2
                    className="h-5 w-5 text-[var(--success)]"
                    aria-hidden="true"
                  />
                  Local media ready
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {formatFileSize(mediaFile.size)} · name is not placed in the
                  report
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] p-6 text-center">
                <FileAudio2
                  className="mx-auto h-8 w-8 text-[var(--muted-foreground)]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-bold text-[var(--foreground)]">
                  No media selected
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Maximum 30 MB, 10 minutes, 2 channels, 96 kHz, and 24,000,000
                  decoded sample values.
                </p>
              </div>
            )}
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Browser codec support varies. Some video containers may need an
              extracted audio track before Web Audio can decode them.
            </p>
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  2. Optional dialogue timing
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  Paste SRT, WebVTT, or one manual seconds range per line, such
                  as 12.5,15.2.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Open cues
                  <input
                    ref={captionInputRef}
                    type="file"
                    accept=".srt,.vtt,.txt,text/plain,text/vtt,application/x-subrip"
                    className="sr-only"
                    aria-label="Choose a local SRT, WebVTT, or text cue file"
                    onChange={(event) =>
                      void readCaptionFile(event.target.files?.[0] || null)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                  onClick={loadSampleCues}
                >
                  <Captions className="h-4 w-4" aria-hidden="true" />
                  Load sample
                </button>
              </div>
            </div>

            <label className="mt-4 block">
              <span className="sr-only">
                Optional dialogue captions or manual cue timings
              </span>
              <textarea
                className="input-field min-h-64 w-full resize-y font-mono text-sm leading-6"
                value={captionSource}
                maxLength={LIMITS.maxCaptionCharacters}
                spellCheck="false"
                onChange={(event) => updateCaptionSource(event.target.value)}
                placeholder={
                  "WEBVTT\n\n00:00:02.000 --> 00:00:04.000\nDialogue\n\n12.5,15.2"
                }
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Up to 1 MB, 500,000 characters, and 5,000 timing lines.
              Overlapping cues are merged. Caption text is ignored by analysis
              and excluded from export.
            </p>
          </section>
        </div>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            3. Planning settings
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            These are adjustable signal-processing choices, not accessibility
            pass/fail thresholds.
          </p>
          <div className="mt-5 space-y-4">
            <SettingField
              label="RMS window (ms)"
              hint="Smaller windows show shorter level changes."
              value={settings.windowMs}
              onChange={(value) => updateSetting("windowMs", value)}
              min="50"
              max="2000"
              step="50"
            />
            <SettingField
              label="Quiet threshold (dBFS)"
              hint="Windows at or below this measured level are candidates."
              value={settings.quietThresholdDbfs}
              onChange={(value) => updateSetting("quietThresholdDbfs", value)}
              min="-90"
              max="-6"
              step="1"
            />
            <SettingField
              label="Minimum gap (seconds)"
              hint="Shorter remnants are left out after dialogue subtraction."
              value={settings.minimumGapSeconds}
              onChange={(value) => updateSetting("minimumGapSeconds", value)}
              min="0.25"
              max="60"
              step="0.05"
            />
            <SettingField
              label="Bridge brief audio (ms)"
              hint="Join quiet runs across a brief louder window; 0 is strict."
              value={settings.bridgeMs}
              onChange={(value) => updateSetting("bridgeMs", value)}
              min="0"
              max="2000"
              step="50"
            />
            <SettingField
              label="Dialogue padding (ms)"
              hint="Reserve time before and after merged dialogue cues."
              value={settings.dialoguePaddingMs}
              onChange={(value) => updateSetting("dialoguePaddingMs", value)}
              min="0"
              max="5000"
              step="50"
            />
            <SettingField
              label="Media-edge guard (ms)"
              hint="Annotate candidates close to the start or end."
              value={settings.boundaryGuardMs}
              onChange={(value) => updateSetting("boundaryGuardMs", value)}
              min="0"
              max="5000"
              step="50"
            />
          </div>
        </section>
      </section>

      {error ? (
        <p
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm font-medium text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary inline-flex min-h-11 items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!mediaFile || busy}
          onClick={() => void runAnalysis()}
        >
          {busy ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Gauge className="h-4 w-4" aria-hidden="true" />
          )}
          {busy ? "Decoding locally…" : "Find timing candidates"}
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={clearAll}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear local data
        </button>
      </div>

      {busy ? (
        <p
          className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 text-sm font-medium text-[var(--foreground)]"
          role="status"
          aria-live="polite"
        >
          Decoding and measuring audio in this tab. Changing an input or
          clearing the tool safely invalidates this run.
        </p>
      ) : null}

      {result ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <SummaryCard
              icon={Clock3}
              label="Duration"
              value={formatTime(result.metadata.durationMs)}
            />
            <SummaryCard
              icon={AudioLines}
              label="Quiet runs"
              value={result.summary.quietIntervals}
            />
            <SummaryCard
              icon={Gauge}
              label="Candidates"
              value={result.summary.candidateGaps}
            />
            <SummaryCard
              icon={Captions}
              label="Valid cues"
              value={result.dialogue.validTimings}
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Malformed cues"
              value={result.dialogue.malformedTimings}
            />
            <SummaryCard
              icon={EyeOff}
              label="Edge cautions"
              value={result.summary.candidatesNearBoundary}
            />
          </div>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Candidate timing gaps
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Ranking favors longer, quieter measured spans and applies
                  numeric timing cautions. It does not evaluate the video scene
                  or decide whether narration belongs there.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                onClick={() => downloadReport(result)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download counts/timing only
              </button>
            </div>

            {result.summary.truncated ? (
              <p className="mt-4 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
                Showing the first {result.summary.returnedCandidates} ranked
                candidates of {result.summary.candidateGaps}.
              </p>
            ) : null}

            {result.candidates.length ? (
              <ol className="mt-5 grid gap-4 lg:grid-cols-2">
                {result.candidates.map((candidate) => (
                  <li
                    key={`${candidate.rank}-${candidate.startMs}-${candidate.endMs}`}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                          Numeric rank {candidate.rank}
                        </p>
                        <p className="mt-2 font-mono text-sm font-black text-[var(--foreground)]">
                          {formatTime(candidate.startMs)} →{" "}
                          {formatTime(candidate.endMs)}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {(candidate.durationMs / 1_000).toFixed(2)} seconds ·{" "}
                          {candidate.meanDbfs.toFixed(1)} dBFS mean RMS
                        </p>
                      </div>
                      <span className="rounded-full border border-[var(--border-strong)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
                        Score {candidate.planningScore}
                      </span>
                    </div>
                    <div className="mt-4">
                      <CandidateFlags candidate={candidate} />
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-5 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
                <p className="font-bold text-[var(--foreground)]">
                  No candidate meets these numeric settings
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Review the waveform in an editing environment. If foreground
                  pauses are insufficient, extended audio description may be
                  relevant to human planning.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Parsing and signal notes
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["RMS windows", result.summary.rmsWindows],
                ["Cue timing format", result.dialogue.format],
                ["Overlapping cue pairs", result.dialogue.overlapPairs],
                ["Merged dialogue regions", result.dialogue.mergedIntervals],
                ["Out-of-range cues", result.dialogue.outOfRangeTimings],
                [
                  "Near-dialogue candidates",
                  result.summary.candidatesNearDialogue,
                ],
                ["Decoded channels", result.metadata.numberOfChannels],
                ["Decoded sample rate", `${result.metadata.sampleRate} Hz`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] p-3"
                >
                  <dt className="font-bold text-[var(--muted-foreground)]">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words font-black text-[var(--foreground)]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-bold text-[var(--foreground)]">
          <Music2
            className="h-5 w-5 text-[var(--warning)]"
            aria-hidden="true"
          />
          Human review is essential
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Low RMS can be quiet music, ambience, a dramatic pause, or noise; it
            is not proof of silence or semantic room for description.
          </li>
          <li>
            The tool does not inspect visuals, understand story context, write
            description, judge delivery pace, mix narration, or replace an
            audio-description professional.
          </li>
          <li>
            Caption timings can be incomplete or offset. Check every candidate
            against the final picture, dialogue, music, effects, cuts, and
            required editorial standard.
          </li>
          <li>
            Results do not establish WCAG, legal, platform, or publisher
            conformance.
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Standards context
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          WCAG 2.2 addresses audio description or a media alternative at Success
          Criterion 1.2.3, audio description for prerecorded synchronized video
          at 1.2.5, and extended audio description when foreground-audio pauses
          are insufficient at 1.2.7. This local timing aid tests none of those
          criteria by itself.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              className="font-bold text-[var(--primary)] underline-offset-4 hover:underline"
              href="https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded"
              target="_blank"
              rel="noreferrer"
            >
              W3C WCAG 2.2 — Success Criterion 1.2.3
            </a>
          </li>
          <li>
            <a
              className="font-bold text-[var(--primary)] underline-offset-4 hover:underline"
              href="https://www.w3.org/TR/WCAG22/#audio-description-prerecorded"
              target="_blank"
              rel="noreferrer"
            >
              W3C WCAG 2.2 — Success Criterion 1.2.5
            </a>
          </li>
          <li>
            <a
              className="font-bold text-[var(--primary)] underline-offset-4 hover:underline"
              href="https://www.w3.org/TR/WCAG22/#extended-audio-description-prerecorded"
              target="_blank"
              rel="noreferrer"
            >
              W3C WCAG 2.2 — Success Criterion 1.2.7
            </a>
          </li>
        </ul>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Official W3C sources accessed 24 July 2026.
        </p>
      </section>
    </main>
  );
}
