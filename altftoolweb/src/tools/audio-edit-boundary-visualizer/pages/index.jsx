"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  AudioWaveform,
  Download,
  ExternalLink,
  FileAudio2,
  Info,
  Play,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  AUDIO_LIMITS,
  DEFAULT_BOUNDARY_SETTINGS,
  analyzeAudioBoundaries,
  buildAudioBoundaryReport,
  validateAudioFile,
  validateDecodedAudio,
} from "../lib/audioBoundaries.mjs";

const SOURCES = [
  {
    title: "W3C Web Audio API — AudioBuffer and decoding",
    href: "https://www.w3.org/TR/webaudio/",
  },
  {
    title: "MDN — BaseAudioContext.decodeAudioData()",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData",
  },
];

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remainder = safe - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${remainder
    .toFixed(3)
    .padStart(6, "0")}`;
}

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "audio-boundary-candidates.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function probeAudioDuration(url) {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    let settled = false;
    let timer;
    const cleanup = () => {
      window.clearTimeout(timer);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.removeAttribute("src");
      audio.load();
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (settled) return;
      settled = true;
      const duration = audio.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("The audio duration is missing or invalid."));
        return;
      }
      resolve(duration);
    };
    audio.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("The browser could not read this audio file."));
    };
    timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Reading audio metadata timed out."));
    }, 8_000);
    audio.src = url;
  });
}

function waveformPath(waveform, key) {
  if (!waveform?.length) return "";
  const points = waveform.map((bucket, index) => {
    const x = (index / Math.max(1, waveform.length - 1)) * 1000;
    const value = key === "maximum" ? bucket.maximum : bucket.minimum;
    const y = 120 - value * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return points.join(" ");
}

export default function AudioEditBoundaryVisualizer() {
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const audioBufferRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceUrlRef = useRef("");
  const busyRef = useRef(false);
  const generationRef = useRef(0);

  const [media, setMedia] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_BOUNDARY_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const report = useMemo(
    () => buildAudioBoundaryReport(analysis, media),
    [analysis, media],
  );

  useEffect(
    () => () => {
      generationRef.current += 1;
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = "";
      audioBufferRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    },
    [],
  );

  const clear = async () => {
    generationRef.current += 1;
    busyRef.current = false;
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    audioBufferRef.current = null;
    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMedia(null);
    setSourceUrl("");
    setAnalysis(null);
    setSettings(DEFAULT_BOUNDARY_SETTINGS);
    setBusy(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const runAnalysis = (buffer, nextSettings = settings) => {
    const channels = Array.from(
      { length: buffer.numberOfChannels },
      (_, index) => buffer.getChannelData(index),
    );
    return analyzeAudioBoundaries(channels, buffer.sampleRate, nextSettings);
  };

  const processFile = async (file) => {
    if (!file || busyRef.current) return;
    const validation = validateAudioFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setAnalysis(null);
    setMedia(null);
    setSourceUrl("");
    audioBufferRef.current = null;

    let url = "";
    try {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = "";
      if (audioContextRef.current) {
        await audioContextRef.current.close().catch(() => {});
      }
      url = URL.createObjectURL(file);
      sourceUrlRef.current = url;
      const probedDuration = await probeAudioDuration(url);
      if (generation !== generationRef.current) return;
      if (probedDuration > AUDIO_LIMITS.durationSeconds) {
        throw new Error("The audio exceeds the 10-minute duration limit.");
      }
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio decoding is unavailable in this browser.");
      }
      const context = new AudioContextClass();
      audioContextRef.current = context;
      const bytes = await file.arrayBuffer();
      if (generation !== generationRef.current) return;
      const buffer = await context.decodeAudioData(bytes.slice(0));
      if (generation !== generationRef.current) return;
      const decoded = validateDecodedAudio(buffer);
      if (!decoded.ok) throw new Error(decoded.error);
      const nextAnalysis = runAnalysis(buffer);
      if (generation !== generationRef.current) return;

      audioBufferRef.current = buffer;
      setSourceUrl(url);
      setMedia({
        mimeType: file.type,
        bytes: file.size,
        duration: decoded.duration,
        channels: decoded.channels,
        sampleRate: decoded.sampleRate,
      });
      setAnalysis(nextAnalysis);
    } catch (cause) {
      if (generation === generationRef.current) {
        if (url && sourceUrlRef.current === url) {
          URL.revokeObjectURL(url);
          sourceUrlRef.current = "";
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "The audio could not be analyzed.",
        );
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const updateSettings = (key, value) => {
    const next = { ...settings, [key]: Number(value) };
    setSettings(next);
    if (!audioBufferRef.current) return;
    setError("");
    try {
      setAnalysis(runAnalysis(audioBufferRef.current, next));
    } catch {
      setError("The decoded samples could not be re-analyzed.");
    }
  };

  const seek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, time - 0.25);
    audio.play().catch(() => {});
  };

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <AudioWaveform className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">Audio Edit Boundary Visualizer</h1>
          <p className="tool-description">
            Decode user-owned audio locally, draw a bounded waveform, and
            identify abrupt sample or DC-offset changes for careful listening.
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
              Local signal screen—not audio forensics
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Nothing is uploaded. A candidate may be a normal drum hit,
              clipping, codec artifact, recording start, or intentional edit.
              Absence of a cue does not prove continuous or authentic audio.
            </p>
          </div>
        </div>
      </div>

      {!analysis ? (
        <section className="tool-card p-5 sm:p-6">
          <button
            type="button"
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-soft p-6 text-center transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <span className="rounded-lg bg-primary-soft p-3 text-primary">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-4 font-bold text-foreground">
              {busy ? "Decoding and screening…" : "Choose an audio file"}
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              Up to 30 MB; decoded limits: 10 minutes, stereo, 96 kHz
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="sr-only"
            aria-label="Choose audio file for local boundary screening"
            disabled={busy}
            onChange={(event) => processFile(event.target.files?.[0])}
          />
        </section>
      ) : (
        <>
          <section className="tool-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-foreground">
                  <FileAudio2
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Local playback and summary
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatBytes(media.bytes)} • {formatTime(media.duration)} •{" "}
                  {media.channels} channel(s) •{" "}
                  {media.sampleRate.toLocaleString()} Hz after browser decoding
                </p>
              </div>
              <button type="button" className="btn-secondary" onClick={clear}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
            <audio
              ref={audioRef}
              src={sourceUrl}
              controls
              preload="metadata"
              className="mt-4 w-full"
            >
              This browser does not support audio playback.
            </audio>
          </section>

          <section className="tool-card overflow-hidden">
            <div className="border-b border-border bg-surface-soft p-4">
              <h2 className="font-bold text-foreground">Waveform overview</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Bounded min/max envelope; candidate lines are screening cues.
              </p>
            </div>
            <div className="overflow-x-auto p-4">
              <svg
                viewBox="0 0 1000 240"
                className="min-w-full text-primary"
                role="img"
                aria-label={`Audio waveform with ${analysis.candidates.length} candidate boundary markers`}
              >
                <line
                  x1="0"
                  y1="120"
                  x2="1000"
                  y2="120"
                  className="stroke-border"
                />
                <polyline
                  points={waveformPath(analysis.waveform, "maximum")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={waveformPath(analysis.waveform, "minimum")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {analysis.candidates.map((candidate) => {
                  const x =
                    (candidate.timeSeconds / analysis.durationSeconds) * 1000;
                  return (
                    <line
                      key={`${candidate.timeSeconds}-${candidate.cue}`}
                      x1={x}
                      y1="10"
                      x2={x}
                      y2="230"
                      className="stroke-warning"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
            <section className="tool-card p-4 sm:p-5">
              <h2 className="font-bold text-foreground">Screen settings</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-foreground">
                    Outlier sensitivity
                  </span>
                  <select
                    className="input-field mt-2 w-full"
                    value={settings.scoreThreshold}
                    onChange={(event) =>
                      updateSettings("scoreThreshold", event.target.value)
                    }
                  >
                    <option value="4">Sensitive</option>
                    <option value="6">Balanced</option>
                    <option value="9">Conservative</option>
                    <option value="12">Very conservative</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-foreground">
                    Minimum sample jump
                  </span>
                  <select
                    className="input-field mt-2 w-full"
                    value={settings.absoluteJump}
                    onChange={(event) =>
                      updateSettings("absoluteJump", event.target.value)
                    }
                  >
                    <option value="0.04">0.04</option>
                    <option value="0.08">0.08</option>
                    <option value="0.15">0.15</option>
                    <option value="0.25">0.25</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-foreground">
                    Merge nearby cues
                  </span>
                  <select
                    className="input-field mt-2 w-full"
                    value={settings.mergeMilliseconds}
                    onChange={(event) =>
                      updateSettings("mergeMilliseconds", event.target.value)
                    }
                  >
                    <option value="25">25 ms</option>
                    <option value="50">50 ms</option>
                    <option value="100">100 ms</option>
                    <option value="200">200 ms</option>
                  </select>
                </label>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Browser decoding may resample compressed audio. Threshold
                changes rerun the same local PCM screen and are not confidence
                values.
              </p>
            </section>

            <section className="tool-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-foreground">
                    <ScanSearch
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    {analysis.candidates.length} review candidate(s)
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Listen before and after each time; visual cues alone cannot
                    identify an edit.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={!report}
                  onClick={() => downloadJson(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export timings JSON
                </button>
              </div>

              {analysis.candidates.length ? (
                <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-surface-soft text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">Time</th>
                        <th className="px-3 py-3">Cue</th>
                        <th className="px-3 py-3">Jump</th>
                        <th className="px-3 py-3">Listen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.candidates.map((candidate) => (
                        <tr
                          key={`${candidate.timeSeconds}-${candidate.cue}`}
                          className="border-t border-border"
                        >
                          <td className="px-3 py-3 font-mono text-foreground">
                            {formatTime(candidate.timeSeconds)}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {candidate.cue.replaceAll("-", " ")}
                          </td>
                          <td className="px-3 py-3 font-mono text-muted-foreground">
                            {candidate.jump.toFixed(4)}
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              className="btn-ghost min-h-10"
                              onClick={() => seek(candidate.timeSeconds)}
                              aria-label={`Play near ${formatTime(candidate.timeSeconds)}`}
                            >
                              <Play className="h-4 w-4" aria-hidden="true" />
                              Play near
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-border bg-surface-soft p-5 text-sm text-muted-foreground">
                  No cue crossed the current thresholds. This is not proof that
                  the recording is unedited.
                </div>
              )}
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Export contains timings and numeric cues only. It excludes the
                file name, audio samples, and displayed waveform.
              </p>
            </section>
          </div>
        </>
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
            {error}
          </div>
        </div>
      ) : null}

      <section className="tool-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          Method and limits
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The screen records the largest adjacent-sample jump in each 10 ms bin,
          compares it with a median/MAD baseline, and also measures a short
          before/after mean shift. It does not inspect provenance, codecs,
          spectral phase, room acoustics, or original capture hardware.
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
