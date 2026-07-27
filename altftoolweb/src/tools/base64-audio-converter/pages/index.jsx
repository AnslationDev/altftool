"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Volume2 } from "lucide-react";

import {
  SAMPLE_WAV_BASE64,
  analyzeBase64Audio,
  formatBytes,
  formatDuration,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_INPUT = `data:audio/wav;base64,${SAMPLE_WAV_BASE64}`;
const DEFAULT_FILENAME = "clip";
const DASH = "—";

const integer = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [filename, setFilename] = useState(DEFAULT_FILENAME);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const result = useMemo(() => analyzeBase64Audio(input, { filename }), [input, filename]);
  const failed = Boolean(result.error);

  const rows = failed
    ? []
    : [
        ["Container", `${result.format} (${result.codec})`],
        ["MIME type", result.mimeType],
        ["Decoded size", `${formatBytes(result.byteLength)} · ${integer.format(result.byteLength)} bytes`],
        ["Base64 length", `${integer.format(result.base64Chars)} chars (+${result.overheadPercent.toFixed(1)}%)`],
        ["Duration", result.durationSeconds === null ? "not stored in this container" : `${formatDuration(result.durationSeconds)} (${result.durationSeconds.toFixed(3)} s)`],
        ["Sample rate", result.sampleRate ? `${integer.format(result.sampleRate)} Hz` : DASH],
        ["Channels", result.channels ? (result.channels === 1 ? "1 (mono)" : `${result.channels} (stereo)`) : DASH],
        ["Bit depth", result.bitsPerSample ? `${result.bitsPerSample}-bit` : DASH],
        ["Bitrate", result.bitrateKbps ? `${result.bitrateKbps} kbit/s` : DASH],
        ["Download name", result.filename],
      ];

  const handleCopy = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.dataUrl);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (failed) return;
    const blob = new Blob([result.bytes], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setFilename(DEFAULT_FILENAME);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Volume2 className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Base64 Audio Converter
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Paste a Base64 audio string or a <code>data:audio/…</code> URL. It is decoded in your browser,
          identified from its magic bytes, and offered back as a playable, downloadable file.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="b64-audio-input">
            Base64 audio or data URL
          </label>
          <textarea
            id="b64-audio-input"
            className={`${TEXTAREA_CLASS} mt-1.5 h-40`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="data:audio/wav;base64,UklGRi…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="b64-audio-filename">
              Download file name
            </label>
            <input
              id="b64-audio-filename"
              className={`${INPUT_CLASS} mt-1.5`}
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              placeholder="clip"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="button" className={PRIMARY_BTN} onClick={handleDownload} disabled={failed}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download audio
            </button>
            <button type="button" className={GHOST_BTN} onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Decoded audio</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {failed ? DASH : `${result.format} · ${formatBytes(result.byteLength)}`}
        </p>

        {failed ? null : (
          <audio
            className="mt-4 w-full"
            controls
            preload="metadata"
            src={result.dataUrl}
          >
            Your browser cannot play this audio element.
          </audio>
        )}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {(failed ? ["Container", "MIME type", "Decoded size", "Duration"] : rows).map((row) => {
            const label = failed ? row : row[0];
            const value = failed ? DASH : row[1];
            return (
              <div key={label} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-medium break-all text-[var(--foreground)]">{value}</dd>
              </div>
            );
          })}
        </dl>

        {!failed && result.warnings.length ? (
          <ul className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>· {warning}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={handleCopy}
            disabled={failed}
            aria-label="Copy the normalised data URL to the clipboard"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy data URL"}
          </button>
        </div>
      </section>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Nothing is uploaded: decoding, format detection and playback all happen in this tab.
      </p>
    </div>
  );
}
