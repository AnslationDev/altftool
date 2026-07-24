"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Captions,
  CheckCircle2,
  Clock3,
  Download,
  FileUp,
  Gauge,
  Play,
  RotateCcw,
  Rows3,
  ShieldCheck,
} from "lucide-react";

import {
  DEFAULT_THRESHOLDS,
  MAX_CAPTION_CHARACTERS,
  RULE_LABELS,
  auditCaptions,
  buildCountsOnlyCaptionReport,
  formatTimestamp,
} from "../lib/captionAudit.mjs";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const SAMPLE_CAPTIONS = `WEBVTT

intro
00:00.500 --> 00:02.800
Welcome to this local caption check.

fast-cue
00:02.600 --> 00:03.300
This deliberately crowded caption should trigger reading-speed and overlap signals.

three-lines
00:04.000 --> 00:06.300
Line one
Line two
Line three`;

const INITIAL_SETTINGS = {
  maxCps: String(DEFAULT_THRESHOLDS.maxCps),
  maxWpm: String(DEFAULT_THRESHOLDS.maxWpm),
  minDurationSeconds: String(DEFAULT_THRESHOLDS.minDurationMs / 1_000),
  maxDurationSeconds: String(DEFAULT_THRESHOLDS.maxDurationMs / 1_000),
  maxLines: String(DEFAULT_THRESHOLDS.maxLines),
  maxCharsPerLine: String(DEFAULT_THRESHOLDS.maxCharsPerLine),
};

const FORMAT_LABELS = {
  srt: "SRT",
  vtt: "WebVTT",
  unknown: "Unknown",
};

function thresholdInput(settings) {
  return {
    maxCps: Number(settings.maxCps),
    maxWpm: Number(settings.maxWpm),
    minDurationMs: Number(settings.minDurationSeconds) * 1_000,
    maxDurationMs: Number(settings.maxDurationSeconds) * 1_000,
    maxLines: Number(settings.maxLines),
    maxCharsPerLine: Number(settings.maxCharsPerLine),
  };
}

function downloadJson(value) {
  if (!value) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "caption-audit-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatMetric(value, suffix = "") {
  return value === null ? "Not calculated" : `${value}${suffix}`;
}

function evidenceText(finding) {
  const evidence = finding.evidence || {};
  switch (finding.rule) {
    case "overlap":
      return `${evidence.overlapMs} ms collision with cue ${evidence.previousCue}`;
    case "nonpositive-duration":
      return `${evidence.durationMs} ms duration`;
    case "duration-too-short":
    case "duration-too-long":
      return `${evidence.actualMs} ms measured · ${evidence.limitMs} ms setting`;
    case "cps-too-high":
      return `${evidence.actual} CPS measured · ${evidence.limit} CPS setting`;
    case "wpm-too-high":
      return `${evidence.actual} WPM measured · ${evidence.limit} WPM setting`;
    case "too-many-lines":
      return `${evidence.actual} visible lines · ${evidence.limit} line setting`;
    case "line-too-long":
      return `${evidence.actual} characters on longest line · ${evidence.limit} character setting`;
    case "empty-text":
      return "0 visible lines";
    default:
      return `Block ${evidence.block}, source line ${evidence.line}`;
  }
}

function SettingField({ label, hint, value, onChange, min, step = "1" }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[var(--foreground)]">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        className="input-field mt-2 w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
        {hint}
      </span>
    </label>
  );
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

export default function CaptionSpeedCollisionChecker() {
  const fileInputRef = useRef(null);
  const [source, setSource] = useState("");
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [fileLabel, setFileLabel] = useState("");

  const report = useMemo(
    () => (result?.ok ? buildCountsOnlyCaptionReport(result) : null),
    [result],
  );

  const updateSource = (nextSource) => {
    setSource(nextSource);
    setResult(null);
    setError("");
  };

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError("");
  };

  const readFile = async (file) => {
    setResult(null);
    setError("");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("Choose an SRT or WebVTT text file up to 2 MB.");
      return;
    }
    try {
      const text = await file.text();
      if (text.length > MAX_CAPTION_CHARACTERS) {
        setError(
          "Caption text exceeds the 2,000,000-character local safety limit.",
        );
        return;
      }
      setSource(text);
      setFileLabel(file.name);
    } catch {
      setError("The selected file could not be read as text.");
    }
  };

  const runAudit = () => {
    const next = auditCaptions(source, thresholdInput(settings));
    if (!next.ok) {
      setResult(null);
      setError(next.error);
      return;
    }
    setError("");
    setResult(next);
  };

  const loadSample = () => {
    setSource(SAMPLE_CAPTIONS);
    setFileLabel("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAll = () => {
    setSource("");
    setSettings(INITIAL_SETTINGS);
    setFileLabel("");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <Captions className="h-4 w-4" aria-hidden="true" />
              Local caption QA
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Caption Speed &amp; Collision Checker
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Inspect SRT or WebVTT cue timing, overlaps, reading-speed signals,
              duration, and line limits. Every threshold is an editable
              editorial setting.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <ShieldCheck
                className="h-5 w-5 text-[var(--primary)]"
                aria-hidden="true"
              />
              Browser-only processing
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Files and pasted captions stay in this tab. There are no network
              requests, accounts, or saved scan histories.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                1. Caption source
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Paste caption text or open a local .srt or .vtt file.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
                <FileUp className="h-4 w-4" aria-hidden="true" />
                Open file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".srt,.vtt,text/vtt,application/x-subrip,text/plain"
                  className="sr-only"
                  onChange={(event) =>
                    void readFile(event.target.files?.[0] || null)
                  }
                />
              </label>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                onClick={loadSample}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Load sample
              </button>
            </div>
          </div>

          {fileLabel ? (
            <p className="mt-4 text-xs font-bold text-[var(--muted-foreground)]">
              Opened locally: {fileLabel}
            </p>
          ) : null}

          <label className="mt-4 block">
            <span className="sr-only">SRT or WebVTT caption text</span>
            <textarea
              className="input-field min-h-96 w-full resize-y font-mono text-sm leading-6"
              value={source}
              onChange={(event) => updateSource(event.target.value)}
              placeholder={"1\n00:00:01,000 --> 00:00:03,000\nCaption text"}
              spellCheck="false"
            />
          </label>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Up to 2 MB / 2,000,000 characters. Cue text is not included in the
            downloadable report.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            2. Editorial settings
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            Use the limits required by your publisher, language, audience, and
            caption style.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <SettingField
              label="Maximum CPS"
              hint="Non-whitespace visible characters per second."
              value={settings.maxCps}
              onChange={(value) => updateSetting("maxCps", value)}
              min="0.1"
              step="0.1"
            />
            <SettingField
              label="Maximum WPM"
              hint="Whitespace-separated word tokens per minute."
              value={settings.maxWpm}
              onChange={(value) => updateSetting("maxWpm", value)}
              min="1"
              step="1"
            />
            <SettingField
              label="Minimum duration (seconds)"
              hint="Positive cues shorter than this are flagged."
              value={settings.minDurationSeconds}
              onChange={(value) => updateSetting("minDurationSeconds", value)}
              min="0"
              step="0.1"
            />
            <SettingField
              label="Maximum duration (seconds)"
              hint="Positive cues longer than this are flagged."
              value={settings.maxDurationSeconds}
              onChange={(value) => updateSetting("maxDurationSeconds", value)}
              min="0.1"
              step="0.1"
            />
            <SettingField
              label="Maximum visible lines"
              hint="Markup-only lines are excluded."
              value={settings.maxLines}
              onChange={(value) => updateSetting("maxLines", value)}
              min="1"
            />
            <SettingField
              label="Maximum characters per line"
              hint="Spaces count; simple caption tags do not."
              value={settings.maxCharsPerLine}
              onChange={(value) => updateSetting("maxCharsPerLine", value)}
              min="1"
            />
          </div>
        </section>
      </div>

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
          onClick={runAudit}
          disabled={!source.trim()}
        >
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Check captions
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={clearAll}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      {result ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard
              icon={Captions}
              label="Valid cues"
              value={result.summary.cues}
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Cues flagged"
              value={result.summary.cuesWithFindings}
            />
            <SummaryCard
              icon={Clock3}
              label="Overlaps"
              value={result.summary.overlaps}
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Errors"
              value={result.summary.errors}
            />
            <SummaryCard
              icon={Rows3}
              label="Warnings"
              value={result.summary.warnings}
            />
          </div>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Cue evidence
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {FORMAT_LABELS[result.format]} detected · numeric timing and
                  layout evidence only; caption meaning is not interpreted.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                onClick={() => downloadJson(report)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download counts-only report
              </button>
            </div>

            {result.parseFindings.length ? (
              <div className="mt-5 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4">
                <h3 className="font-bold text-[var(--foreground)]">
                  Invalid caption blocks
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.parseFindings.map((finding, index) => (
                    <li
                      key={`${finding.evidence.line}-${index}`}
                      className="text-sm leading-6 text-[var(--foreground)]"
                    >
                      <span className="font-bold">
                        Block {finding.evidence.block}, source line{" "}
                        {finding.evidence.line}:
                      </span>{" "}
                      {finding.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.cues.length ? (
              <ol className="mt-5 space-y-4">
                {result.cues.map((cue) => {
                  const hasError = cue.findings.some(
                    (finding) => finding.severity === "error",
                  );
                  const hasWarning = cue.findings.some(
                    (finding) => finding.severity === "warning",
                  );
                  const stateClasses = hasError
                    ? "border-[var(--danger)] bg-[var(--danger-soft)]"
                    : hasWarning
                      ? "border-[var(--warning)] bg-[var(--warning-soft)]"
                      : "border-[var(--success)] bg-[var(--success-soft)]";

                  return (
                    <li
                      key={cue.cueNumber}
                      className={`rounded-lg border p-4 ${stateClasses}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-[var(--foreground)]">
                            Cue {cue.cueNumber}
                          </p>
                          <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                            {formatTimestamp(cue.startMs)} →{" "}
                            {formatTimestamp(cue.endMs)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-strong)] px-2 py-1 text-xs font-bold text-[var(--foreground)]">
                          {cue.findings.length ? (
                            <AlertTriangle
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          ) : (
                            <CheckCircle2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          )}
                          {cue.findings.length
                            ? `${cue.findings.length} finding${cue.findings.length === 1 ? "" : "s"}`
                            : "Within settings"}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3 lg:grid-cols-6">
                        {[
                          ["Duration", `${cue.metrics.durationMs} ms`],
                          ["CPS", formatMetric(cue.metrics.cps)],
                          ["WPM", formatMetric(cue.metrics.wpm)],
                          ["Characters", cue.metrics.characters],
                          ["Visible lines", cue.metrics.lineCount],
                          [
                            "Longest line",
                            `${cue.metrics.longestLineCharacters} chars`,
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3"
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

                      {cue.findings.length ? (
                        <ul className="mt-4 space-y-2">
                          {cue.findings.map((finding) => (
                            <li
                              key={finding.rule}
                              className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm"
                            >
                              <p className="font-bold text-[var(--foreground)]">
                                {RULE_LABELS[finding.rule]}
                              </p>
                              <p className="mt-1 leading-6 text-[var(--muted-foreground)]">
                                {finding.message} {evidenceText(finding)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-5 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
                No valid cue was parsed. Correct the invalid block evidence
                above and check again.
              </p>
            )}
          </section>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5 sm:p-6">
        <h2 className="font-bold text-[var(--foreground)]">
          Scope and calibration
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Thresholds are editorial settings, not universal accessibility
            certification or legal compliance.
          </li>
          <li>
            CPS excludes whitespace after simple markup removal. WPM counts
            whitespace-separated tokens, so it may not suit every language or
            writing system.
          </li>
          <li>
            This checker does not judge wording, translation accuracy, speaker
            identity, audio sync, font rendering, placement, contrast, or
            viewport fit.
          </li>
          <li>
            Review flagged cues in your target player and follow the caption
            standard required by your publisher or jurisdiction.
          </li>
        </ul>
      </section>
    </main>
  );
}
