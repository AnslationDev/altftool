"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  AudioLines,
  Captions,
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
  ALIGNMENT_LIMITS,
  DEFAULT_ALIGNMENT_SETTINGS,
  analyzeAudioTranscriptCoverage,
  buildTranscriptAlignmentReport,
  compareTimedTranscripts,
  parseTimedTranscript,
  validateAlignmentAudioBuffer,
  validateAlignmentAudioFile,
} from "../lib/transcriptAlignment.mjs";

const SAMPLE_CANDIDATE = `1
00:00:00,000 --> 00:00:02,500
Speaker: Welcome to the demonstration.

2
00:00:03,000 --> 00:00:05,200
[Door closes] Let us begin.`;

const SOURCES = [
  {
    title: "W3C Understanding SC 1.2.2 — Captions (Prerecorded)",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded",
  },
  {
    title: "W3C — Captions/Subtitles",
    href: "https://www.w3.org/WAI/media/av/captions/",
  },
  {
    title: "W3C — Transcripts",
    href: "https://www.w3.org/WAI/media/av/transcripts/",
  },
];

function formatTime(milliseconds) {
  const safe = Math.max(0, Number(milliseconds) || 0);
  const minutes = Math.floor(safe / 60_000);
  const seconds = (safe - minutes * 60_000) / 1_000;
  return `${String(minutes).padStart(2, "0")}:${seconds
    .toFixed(3)
    .padStart(6, "0")}`;
}

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "audio-transcript-alignment-screen.json";
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

export default function AudioTranscriptAlignmentChecker() {
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const sourceUrlRef = useRef("");
  const contextRef = useRef(null);
  const generationRef = useRef(0);
  const busyRef = useRef(false);

  const [file, setFile] = useState(null);
  const [candidateText, setCandidateText] = useState(SAMPLE_CANDIDATE);
  const [referenceText, setReferenceText] = useState("");
  const [settings, setSettings] = useState(DEFAULT_ALIGNMENT_SETTINGS);
  const [result, setResult] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const report = useMemo(
    () => buildTranscriptAlignmentReport(result),
    [result],
  );

  useEffect(
    () => () => {
      generationRef.current += 1;
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = "";
      if (contextRef.current) {
        contextRef.current.close().catch(() => {});
        contextRef.current = null;
      }
    },
    [],
  );

  const clearResult = () => {
    generationRef.current += 1;
    busyRef.current = false;
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    if (contextRef.current) {
      contextRef.current.close().catch(() => {});
      contextRef.current = null;
    }
    setFile(null);
    setResult(null);
    setSourceUrl("");
    setBusy(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const chooseFile = (nextFile) => {
    if (!nextFile || busyRef.current) return;
    const validation = validateAlignmentAudioFile(nextFile);
    setResult(null);
    setError("");
    if (!validation.ok) {
      setFile(null);
      setError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(nextFile);
  };

  const analyze = async () => {
    if (!file || busyRef.current) return;
    const candidateParse = parseTimedTranscript(candidateText);
    if (!candidateParse.ok) {
      setError(`Candidate transcript: ${candidateParse.error}`);
      return;
    }
    const referenceParse = referenceText.trim()
      ? parseTimedTranscript(referenceText)
      : null;
    if (referenceParse && !referenceParse.ok) {
      setError(`Reference transcript: ${referenceParse.error}`);
      return;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setResult(null);
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    setSourceUrl("");

    let url = "";
    try {
      if (contextRef.current) {
        await contextRef.current.close().catch(() => {});
      }
      url = URL.createObjectURL(file);
      sourceUrlRef.current = url;
      const probedDuration = await probeAudioDuration(url);
      if (generation !== generationRef.current) return;
      if (probedDuration > ALIGNMENT_LIMITS.durationSeconds) {
        throw new Error("The audio exceeds the 10-minute duration limit.");
      }
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio decoding is unavailable in this browser.");
      }
      const context = new AudioContextClass();
      contextRef.current = context;
      const bytes = await file.arrayBuffer();
      if (generation !== generationRef.current) return;
      const buffer = await context.decodeAudioData(bytes.slice(0));
      if (generation !== generationRef.current) return;
      const decoded = validateAlignmentAudioBuffer(buffer);
      if (!decoded.ok) throw new Error(decoded.error);
      const channels = Array.from(
        { length: buffer.numberOfChannels },
        (_, index) => buffer.getChannelData(index),
      );
      const coverage = analyzeAudioTranscriptCoverage(
        channels,
        buffer.sampleRate,
        candidateParse.cues,
        settings,
      );
      const comparison = referenceParse
        ? compareTimedTranscripts(
            candidateParse.cues,
            referenceParse.cues,
            settings,
          )
        : null;
      if (generation !== generationRef.current) return;
      setSourceUrl(url);
      setResult({
        media: {
          mimeType: file.type,
          bytes: file.size,
          channels: decoded.channels,
          sampleRate: decoded.sampleRate,
        },
        candidateParse,
        referenceParse,
        coverage,
        comparison,
      });
    } catch (cause) {
      if (generation === generationRef.current) {
        if (url && sourceUrlRef.current === url) {
          URL.revokeObjectURL(url);
          sourceUrlRef.current = "";
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "Alignment screening failed.",
        );
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  const seek = (milliseconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, milliseconds / 1_000 - 0.25);
    audioRef.current.play().catch(() => {});
  };

  const updateSetting = (key, value) => {
    if (busyRef.current) return;
    setSettings((current) => ({ ...current, [key]: Number(value) }));
    setResult(null);
  };

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <Captions className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">Audio-Transcript Alignment Checker</h1>
          <p className="tool-description">
            Screen timed transcript coverage against local audio energy, then
            optionally compare cue text and timing with a separate reference
            transcript.
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
              Local signals, separate claims
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Audio energy cannot distinguish speech from music or noise. Text
              differences are reported only against the optional reference you
              supply—not against automatic speech recognition or ground truth.
            </p>
          </div>
        </div>
      </div>

      <section className="tool-card p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-foreground">
              Local audio
            </label>
            <button
              type="button"
              className="mt-2 flex min-h-28 w-full items-center gap-4 rounded-lg border border-dashed border-border-strong bg-surface-soft p-4 text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="rounded-lg bg-primary-soft p-3 text-primary">
                <Upload className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold text-foreground">
                  {file ? file.name : "Choose an audio file"}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {file
                    ? `${formatBytes(file.size)} • local only`
                    : "Maximum 30 MB; decoded maximum 10 minutes"}
                </span>
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="sr-only"
              aria-label="Choose audio file for transcript alignment"
              disabled={busy}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-foreground">
                Audio activity threshold
              </span>
              <select
                className="input-field mt-2 w-full"
                value={settings.activityThresholdDb}
                disabled={busy}
                onChange={(event) =>
                  updateSetting("activityThresholdDb", event.target.value)
                }
              >
                <option value="-50">Sensitive (−50 dBFS)</option>
                <option value="-40">Balanced (−40 dBFS)</option>
                <option value="-30">Conservative (−30 dBFS)</option>
                <option value="-20">Strong audio only (−20 dBFS)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-foreground">
                Cue timing tolerance
              </span>
              <select
                className="input-field mt-2 w-full"
                value={settings.timingToleranceMilliseconds}
                disabled={busy}
                onChange={(event) =>
                  updateSetting(
                    "timingToleranceMilliseconds",
                    event.target.value,
                  )
                }
              >
                <option value="250">250 ms</option>
                <option value="500">500 ms</option>
                <option value="1000">1 second</option>
                <option value="2000">2 seconds</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-foreground">
              Candidate timed transcript
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Required SRT or WebVTT; text stays in this tab.
            </span>
            <textarea
              className="input-field mt-2 min-h-72 w-full resize-y font-mono text-xs"
              value={candidateText}
              spellCheck="false"
              disabled={busy}
              onChange={(event) => {
                setCandidateText(event.target.value);
                setResult(null);
              }}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-foreground">
              Reference timed transcript
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Optional; treated as user-supplied comparison material, not truth.
            </span>
            <textarea
              className="input-field mt-2 min-h-72 w-full resize-y font-mono text-xs"
              value={referenceText}
              spellCheck="false"
              disabled={busy}
              placeholder="Paste a separate SRT or WebVTT reference…"
              onChange={(event) => {
                setReferenceText(event.target.value);
                setResult(null);
              }}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            disabled={!file || busy}
            aria-busy={busy}
            onClick={analyze}
          >
            <ScanSearch className="h-4 w-4" aria-hidden="true" />
            {busy ? "Screening locally…" : "Run alignment screen"}
          </button>
          <button type="button" className="btn-secondary" onClick={clearResult}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Clear file and result
          </button>
        </div>
      </section>

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

      {result ? (
        <div aria-live="polite" aria-atomic="true">
          <section className="tool-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-foreground">
                  <FileAudio2
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  Playback and coverage
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.candidateParse.cues.length} candidate cues •{" "}
                  {result.coverage.activeCoveragePercent === null
                    ? "No window crossed the activity threshold"
                    : `${result.coverage.activeCoveragePercent}% of active windows overlap a cue`}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={!report}
                onClick={() => downloadJson(report)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export counts and timings
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
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                [
                  "Uncovered activity spans",
                  result.coverage.uncoveredActivity.length,
                ],
                ["Mostly quiet cues", result.coverage.quietCues.length],
                ["Out-of-range cues", result.coverage.outOfRangeCues.length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-surface-soft p-4"
                >
                  <p className="text-xs font-bold text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {result.coverage.findingLimitReached ? (
              <p className="mt-3 rounded-lg border border-warning bg-warning-soft p-3 text-xs font-bold text-foreground">
                Showing the first {ALIGNMENT_LIMITS.findings} — more uncovered
                spans, quiet cues, or out-of-range cues exist but were not
                listed.
              </p>
            ) : null}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="tool-card p-4 sm:p-5">
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                <AudioLines
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Audio-activity cues
              </h2>
              <div className="mt-4 max-h-96 space-y-3 overflow-auto">
                {result.coverage.uncoveredActivity.map((item) => (
                  <article
                    key={`activity-${item.startMs}-${item.endMs}`}
                    className="rounded-lg border border-warning bg-warning-soft p-4"
                  >
                    <p className="font-mono text-sm font-bold text-foreground">
                      {formatTime(item.startMs)} → {formatTime(item.endMs)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Audio crossed the selected energy threshold outside a
                      candidate cue. It may be speech, music, noise, or an
                      effect.
                    </p>
                    <button
                      type="button"
                      className="btn-ghost mt-3 min-h-10"
                      onClick={() => seek(item.startMs)}
                    >
                      <Play className="h-4 w-4" aria-hidden="true" />
                      Play near
                    </button>
                  </article>
                ))}
                {result.coverage.quietCues.map((item) => (
                  <article
                    key={`quiet-${item.cueNumber}`}
                    className="rounded-lg border border-border bg-surface-soft p-4"
                  >
                    <p className="font-bold text-foreground">
                      Candidate cue {item.cueNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fewer than 20% of overlapping windows crossed the chosen
                      threshold. Quiet speech remains possible.
                    </p>
                    <button
                      type="button"
                      className="btn-ghost mt-3 min-h-10"
                      onClick={() => seek(item.startMs)}
                    >
                      <Play className="h-4 w-4" aria-hidden="true" />
                      Play near
                    </button>
                  </article>
                ))}
                {!result.coverage.uncoveredActivity.length &&
                !result.coverage.quietCues.length &&
                !result.coverage.outOfRangeCues.length ? (
                  <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
                    No audio-coverage cue crossed the current thresholds. This
                    is not a completeness or accuracy verdict.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="tool-card p-4 sm:p-5">
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                <Captions className="h-5 w-5 text-primary" aria-hidden="true" />
                Reference comparison
              </h2>
              {!result.comparison ? (
                <p className="mt-4 rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
                  No reference transcript was supplied. Semantic text mismatches
                  are not evaluated from audio.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {result.comparison.findings.length} bounded comparison
                    cue(s)
                  </p>
                  {result.comparison.findingLimitReached ? (
                    <p className="mt-2 rounded-lg border border-warning bg-warning-soft p-3 text-xs font-bold text-foreground">
                      Showing the first {ALIGNMENT_LIMITS.findings} — more
                      comparison findings exist but were not listed.
                    </p>
                  ) : null}
                  <div className="mt-4 max-h-96 space-y-3 overflow-auto">
                    {result.comparison.findings.map((finding, index) => (
                      <article
                        key={`${finding.code}-${finding.referenceNumber}-${finding.candidateNumber}-${index}`}
                        className="rounded-lg border border-border bg-surface-soft p-4"
                      >
                        <p className="text-xs font-black uppercase tracking-wide text-primary">
                          {finding.code.replaceAll("-", " ")}
                        </p>
                        <p className="mt-2 text-sm text-foreground">
                          {finding.message}
                        </p>
                        {finding.referenceText ? (
                          <p className="mt-2 break-words text-xs text-muted-foreground">
                            Reference: {finding.referenceText}
                          </p>
                        ) : null}
                        {finding.candidateText ? (
                          <p className="mt-1 break-words text-xs text-muted-foreground">
                            Candidate: {finding.candidateText}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          className="btn-ghost mt-3 min-h-10"
                          onClick={() => seek(finding.startMs)}
                        >
                          <Play className="h-4 w-4" aria-hidden="true" />
                          Play near
                        </button>
                      </article>
                    ))}
                    {!result.comparison.findings.length ? (
                      <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
                        No reference difference crossed the selected token or
                        timing thresholds. Both transcripts can still share the
                        same error.
                      </p>
                    ) : null}
                  </div>
                </>
              )}
            </section>
          </div>

          <section className="tool-card p-4 sm:p-5">
            <h2 className="font-bold text-foreground">
              Parser and export scope
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Candidate parser issues: {result.candidateParse.issues.length}.
              Reference parser issues:{" "}
              {result.referenceParse?.issues.length || 0}. The JSON export
              excludes transcript text, audio samples, file name, and audio
              content; it includes bounded cue numbers and timings for review.
            </p>
          </section>
        </div>
      ) : null}

      <section className="tool-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          Accessibility context and limits
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Captions can include dialogue, speaker identification, music, and
          meaningful sound effects. This tool performs no speech recognition,
          translation, meaning analysis, or full media review and cannot
          establish WCAG conformance. References accessed 24 July 2026.
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
