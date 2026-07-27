"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, ImageIcon, RotateCcw } from "lucide-react";

import { analyzeBase64Image, MAX_PREVIEW_BYTES, formatBytes } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** A 64x64 PNG checkerboard, so the page shows a real decode at first paint. */
const SAMPLE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAbUlEQVR42u3XMQ0AIAxFQUSgAPFowAc+0ICBMnWBcAljB256+aWOHr42V/huuy8AAAAAACnAKx893QMAAAAA5ABKDAAAAGAPKDEAAACAPaDEAAAAAPaAEgMAAADYA0oMAAAAYA8oMQAAAMA3gA3wAamHh8gWNAAAAABJRU5ErkJggg==";

const DASH = "—";

const integer = new Intl.NumberFormat("en-US");
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [input, setInput] = useState(SAMPLE_BASE64);
  const [copied, setCopied] = useState("");
  const copyTimer = useRef(null);

  const result = useMemo(() => analyzeBase64Image(input), [input]);
  const failed = Boolean(result.error);

  const flagCopied = (key) => {
    setCopied(key);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(""), 1800);
  };

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      flagCopied(key);
    } catch {
      setCopied("");
    }
  };

  const download = () => {
    if (failed || !result.dataUrl) return;
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setInput(SAMPLE_BASE64);
    setCopied("");
  };

  const dimensionText =
    !failed && result.width ? `${integer.format(result.width)} × ${integer.format(result.height)} px` : DASH;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <ImageIcon aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Base64 to Image
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Paste raw Base64 or a full <code>data:image/...</code> URL. The bytes are decoded in your browser, the
          format is identified from its magic number, and the pixel size is read straight out of the file header.
          Nothing is uploaded.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="b64-input">
            Base64 image data
          </label>
          <textarea
            id="b64-input"
            className={`${TEXTAREA_CLASS} mt-1.5 min-h-40`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="iVBORw0KGgoAAAANSUhEUgAA... or data:image/png;base64,iVBOR..."
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            Line breaks, spaces and URL-safe characters ({"-"} and {"_"}) are handled automatically. Preview limit{" "}
            {formatBytes(MAX_PREVIEW_BYTES)}.
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
            Decoded image
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{dimensionText}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {failed ? DASH : `${result.label} · ${result.sizeLabel}`}
          </p>

          <div className="mt-4 flex min-h-40 items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            {failed ? (
              <span className="text-sm text-[var(--muted-foreground)]">No preview {DASH} fix the input above.</span>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={result.dataUrl}
                alt={`Decoded ${result.label} preview, ${dimensionText}`}
                className="max-h-72 max-w-full object-contain"
              />
            )}
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Format</dt>
              <dd className="font-semibold text-[var(--foreground)]">{failed ? DASH : result.label}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">MIME type</dt>
              <dd className="font-mono text-xs font-semibold text-[var(--foreground)]">
                {failed ? DASH : result.mime}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Decoded size</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `${integer.format(result.bytes)} bytes`}
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
              <dt className="text-[var(--muted-foreground)]">Aspect ratio</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed || !result.aspectRatio ? DASH : `${decimal.format(result.aspectRatio)} : 1`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Megapixels</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed || result.megapixels == null ? DASH : decimal.format(result.megapixels)}
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
              The data URL claims <strong>{result.declaredMime}</strong> but the bytes are actually{" "}
              <strong>{result.mime}</strong>. The real format wins.
            </p>
          ) : null}
          {!failed && !result.mimeMismatch ? (
            <p className="mt-3 text-xs text-[var(--success)]">
              Valid {result.label} bytes{result.urlSafe ? " (URL-safe Base64 detected and converted)" : ""}.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={PRIMARY_BTN} onClick={download} disabled={failed} aria-label="Download the decoded image file">
              <Download aria-hidden="true" className="h-4 w-4" />
              Download image
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => copy("dataurl", result.dataUrl)}
              disabled={failed}
              aria-label="Copy the data URL to the clipboard"
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
                    : `${result.label} ${result.width}x${result.height}px, ${result.sizeLabel} (${result.bytes} bytes), ${result.mime}`,
                )
              }
              disabled={failed}
              aria-label="Copy the decoded image summary to the clipboard"
            >
              {copied === "summary" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset to the sample image">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
