"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ImageIcon, RotateCcw } from "lucide-react";

import {
  THUMBNAIL_CANVAS_WIDTH,
  TITLE_TRUNCATION_CHARS,
  testTitleAndThumbnail,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const statusClass = {
  ok: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  error: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [title, setTitle] = useState("I Tried Building a Tiny AI Business in 7 Days");
  const [thumbnailText, setThumbnailText] = useState("DAY 7 RESULTS");
  const [fontSizePx, setFontSizePx] = useState("96");
  const [canvasWidth, setCanvasWidth] = useState(String(THUMBNAIL_CANVAS_WIDTH));
  const [truncationChars, setTruncationChars] = useState(String(TITLE_TRUNCATION_CHARS));
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () =>
      testTitleAndThumbnail({
        title,
        thumbnailText,
        fontSizePx: Number(fontSizePx),
        canvasWidth: Number(canvasWidth),
        truncationChars: Number(truncationChars),
      }),
    [title, thumbnailText, fontSizePx, canvasWidth, truncationChars],
  );

  const copyReport = async () => {
    if (report.error) return;
    const text = [
      "Thumbnail Title Length Tester",
      `Title: ${report.titleChars}/${report.titleLimit} characters`,
      `Visible listing text: ${report.titleVisible}${report.titleTruncated ? "…" : ""}`,
      `Thumbnail words: ${report.thumbWordCountRaw}; repeated content words: ${report.shared.join(", ") || "none"}`,
      `On-screen text size: ${report.onScreenPx.toFixed(1)}px; minimum recommended canvas font: ${report.minFont}px`,
      ...report.issues.map((issue) => `- ${issue.message}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTitle("I Tried Building a Tiny AI Business in 7 Days");
    setThumbnailText("DAY 7 RESULTS");
    setFontSizePx("96");
    setCanvasWidth(String(THUMBNAIL_CANVAS_WIDTH));
    setTruncationChars(String(TITLE_TRUNCATION_CHARS));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Thumbnail/title fit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Thumbnail Title Length Tester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check the 100-character title limit, likely listing truncation and whether thumbnail text adds
          a new idea instead of repeating the title.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className={LABEL_CLASS} htmlFor="tt-title">Video title</label>
            <textarea id="tt-title" className="mt-2 min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <label className={LABEL_CLASS} htmlFor="tt-thumb">Thumbnail text</label>
            <input id="tt-thumb" className={`mt-2 ${INPUT_CLASS}`} value={thumbnailText} onChange={(event) => setThumbnailText(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-font">Canvas font px</label>
            <input id="tt-font" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={fontSizePx} onChange={(event) => setFontSizePx(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-canvas">Canvas width</label>
            <input id="tt-canvas" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={canvasWidth} onChange={(event) => setCanvasWidth(event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tt-cut">Listing cut chars</label>
            <input id="tt-cut" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" value={truncationChars} onChange={(event) => setTruncationChars(event.target.value)} />
          </div>
        </div>
      </section>

      {report.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {report.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Status</p>
              <h2 className={`mt-1 text-2xl font-semibold ${statusClass[report.status]}`}>
                {report.status === "ok" ? "Clean pairing" : report.status === "warning" ? "Tighten it" : "Needs rewrite"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={GHOST_BTN} type="button" onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
              <button className={PRIMARY_BTN} type="button" onClick={copyReport}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Title length</p>
              <p className="mt-1 font-semibold">{report.titleChars}/{report.titleLimit}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Repeated words</p>
              <p className="mt-1 font-semibold">{report.shared.length}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Combined ideas</p>
              <p className="mt-1 font-semibold">{report.combinedIdeas}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Screen text</p>
              <p className="mt-1 font-semibold">{report.onScreenPx.toFixed(1)}px</p>
            </div>
          </div>
          <p className="mt-4 rounded-lg bg-[var(--surface-soft)] p-3 text-sm">
            Listing preview: <span className="font-semibold">{report.titleVisible}{report.titleTruncated ? "…" : ""}</span>
          </p>
          {report.issues.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {report.issues.map((issue) => (
                <li key={issue.message}>• {issue.message}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
