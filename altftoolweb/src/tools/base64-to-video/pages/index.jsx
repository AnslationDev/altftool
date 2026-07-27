"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Video } from "lucide-react";

import { analyzeBase64Video, MAX_PREVIEW_BYTES, formatBytes } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/**
 * A hand-built ISO-BMFF header (ftyp + moov + empty mdat) declaring a 1280x720
 * clip of 4.5 s, so the metadata panel is populated at first paint. It carries
 * no encoded frames, which the tool reports rather than hides.
 */
const SAMPLE_BASE64 =
  "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAADYbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAEZQAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAGR0cmFrAAAAXHRraGQAAAAHAAAAAAAAAAAAAAABAAAAAAAAEZQAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAABQAAAALQAAAAAAAQbWRhdAAAAAAAAAAA";

const DASH = "—";
const integer = new Intl.NumberFormat("en-US");

function base64ToBlob(base64, mime) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function ToolHome() {
  const [input, setInput] = useState(SAMPLE_BASE64);
  const [copied, setCopied] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const copyTimer = useRef(null);

  const result = useMemo(() => analyzeBase64Video(input), [input]);
  const failed = Boolean(result.error);
  const payload = failed ? "" : result.base64;
  const mime = failed ? "" : result.mime;
  const canPlay = !failed && result.playable && result.hasMediaData;

  useEffect(() => {
    if (!payload || !mime) {
      setBlobUrl("");
      return undefined;
    }
    let url = "";
    try {
      url = URL.createObjectURL(base64ToBlob(payload, mime));
    } catch {
      url = "";
    }
    setBlobUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [payload, mime]);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const download = () => {
    if (!blobUrl) return;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const frameSize =
    !failed && result.width ? `${integer.format(result.width)} × ${integer.format(result.height)} px` : DASH;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Video aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Base64 to Video
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Paste raw Base64 or a <code>data:video/...</code> URL. The container is identified from its magic bytes, and
          for MP4/MOV files the running time and frame size are read from the <code>mvhd</code> and <code>tkhd</code>{" "}
          boxes defined in ISO/IEC 14496-12. Playback and download happen locally.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="video-b64">
            Base64 video data
          </label>
          <textarea
            id="video-b64"
            className={`${TEXTAREA_CLASS} mt-1.5 min-h-40`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="AAAAIGZ0eXBpc29t... or data:video/mp4;base64,AAAAIGZ0eXBpc29t..."
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            MP4, MOV, WebM, MKV, Ogg, AVI, FLV, WMV, MPEG-PS and MPEG-TS are recognised. Limit{" "}
            {formatBytes(MAX_PREVIEW_BYTES)} decoded.
          </p>
        </div>

        {failed ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Decoded video
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{failed ? DASH : result.sizeLabel}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {failed ? DASH : `${result.label}${result.durationLabel ? ` · ${result.durationLabel}` : ""}`}
          </p>

          <div className="mt-4 flex min-h-40 items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            {canPlay && blobUrl ? (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video src={blobUrl} controls className="max-h-72 w-full" />
            ) : (
              <span className="px-2 text-center text-sm text-[var(--muted-foreground)]">
                {failed
                  ? `No preview ${DASH} fix the input above.`
                  : !result.hasMediaData
                    ? "Header only: this file has no mdat box, so there are no encoded frames to play. The metadata below is still read from the real header."
                    : `Your browser cannot play ${result.label} inline. Download it and open it in a media player.`}
              </span>
            )}
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Container</dt>
              <dd className="font-semibold text-[var(--foreground)]">{failed ? DASH : result.label}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">MIME type</dt>
              <dd className="font-mono text-xs font-semibold text-[var(--foreground)]">
                {failed ? DASH : result.mime}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Duration</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed || !result.durationLabel ? DASH : result.durationLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Frame size</dt>
              <dd className="font-semibold text-[var(--foreground)]">{frameSize}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Average bitrate</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed || result.bitrateKbps == null ? DASH : result.bitrateLabel}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Decoded bytes</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.bytes)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Base64 characters</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.base64Length)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Encoding overhead</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `+${result.overheadPercent}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Brand / doctype</dt>
              <dd className="font-mono text-xs font-semibold text-[var(--foreground)]">
                {failed || !result.brand ? DASH : result.brand.trim()}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Suggested file name</dt>
              <dd className="font-mono text-xs font-semibold text-[var(--foreground)]">
                {failed ? DASH : result.fileName}
              </dd>
            </div>
          </dl>

          {!failed && result.mimeMismatch ? (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
              The data URL declares <strong>{result.declaredMime}</strong> but the bytes are{" "}
              <strong>{result.mime}</strong>. The real container wins.
            </p>
          ) : null}
          {!failed && !result.mimeMismatch && result.hasMediaData ? (
            <p className="mt-3 text-xs text-[var(--success)]">
              Valid {result.label} container{result.urlSafe ? " (URL-safe Base64 converted)" : ""}.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={download}
              disabled={failed}
              aria-label="Download the decoded video file"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Download video
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => copy("dataurl", failed ? "" : result.dataUrl)}
              disabled={failed}
              aria-label="Copy the video data URL to the clipboard"
            >
              {copied === "dataurl" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "dataurl" ? "Copied!" : "Copy data URL"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() =>
                copy(
                  "summary",
                  failed
                    ? ""
                    : `${result.label}, ${result.sizeLabel} (${result.bytes} bytes)${
                        result.durationLabel ? `, ${result.durationLabel}` : ""
                      }${result.width ? `, ${result.width}x${result.height}` : ""}, ${result.mime}`,
                )
              }
              disabled={failed}
              aria-label="Copy the video summary to the clipboard"
            >
              {copied === "summary" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => {
                setInput(SAMPLE_BASE64);
                setCopied("");
              }}
              aria-label="Reset to the sample video header"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
