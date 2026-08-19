"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, Shrink } from "lucide-react";
import { MAX_PRECISION, optimizeSvg, toDataUri } from "../lib";

const DASH = "—";

const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: Sketch 62 -->
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     width="24" height="24" viewBox="0 0.0000 24.000000 24.000000">
  <metadata>Created with an editor</metadata>
  <defs></defs>
  <g inkscape:label="Layer 1" fill-opacity="1" stroke-width="1">
    <path d="M 12.0000000 2.5000000 L 21.5000000 20.0000000 L 2.5000000 20.0000000 Z"
          fill="currentColor" stroke-linejoin="miter" fill-rule="nonzero"/>
  </g>
</svg>`;

const TOGGLES = [
  ["removeComments", "Remove comments"],
  ["removeMetadata", "Remove <metadata> and editor state"],
  ["removeEditorAttributes", "Remove editor namespace attributes"],
  ["removeDoctype", "Remove XML declaration and DOCTYPE"],
  ["removeDefaultAttributes", "Remove spec-default attributes"],
  ["removeEmptyContainers", "Remove empty <g> and <defs>"],
  ["removeUnusedIds", "Remove unreferenced ids"],
  ["collapseWhitespace", "Collapse whitespace between tags"],
  ["removeTitleDesc", "Remove <title> and <desc> (hurts accessibility)"],
];

const numberFmt = new Intl.NumberFormat("en-US");
const percentFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return DASH;
  if (Math.abs(bytes) < 1024) return `${numberFmt.format(bytes)} B`;
  return `${numberFmt.format(Math.round((bytes / 1024) * 10) / 10)} KB`;
}

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

const INITIAL_OPTIONS = {
  precision: 3,
  removeComments: true,
  removeMetadata: true,
  removeEditorAttributes: true,
  removeDoctype: true,
  removeDefaultAttributes: true,
  removeEmptyContainers: true,
  removeUnusedIds: true,
  collapseWhitespace: true,
  removeTitleDesc: false,
};

export default function SvgOptimizerPage() {
  const [source, setSource] = useState(SAMPLE_SVG);
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => optimizeSvg(source, options), [source, options]);
  const hasError = Boolean(result.error);

  const previewUri = useMemo(
    () => (hasError ? "" : toDataUri(result.output)),
    [hasError, result.output],
  );

  async function handleCopy() {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleDownload() {
    if (hasError) return;
    const blob = new Blob([result.output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setSource(SAMPLE_SVG);
    setOptions(INITIAL_OPTIONS);
    setCopied(false);
  }

  function toggle(key) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-start gap-3">
        <Shrink className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">SVG Optimizer</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Paste SVG markup to strip editor metadata, drop spec-default attributes and round
            coordinate precision. Everything runs in your browser.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="svg-source" className="text-sm font-medium text-[var(--foreground)]">
          SVG source
        </label>
        <textarea
          id="svg-source"
          rows={10}
          value={source}
          spellCheck={false}
          onChange={(e) => setSource(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="precision" className="text-sm font-medium text-[var(--foreground)]">
            Coordinate precision ({options.precision} decimals)
          </label>
          <input
            id="precision"
            type="range"
            min={0}
            max={MAX_PRECISION}
            step={1}
            value={options.precision}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, precision: Number(e.target.value) }))
            }
            className="h-11 w-full accent-[var(--primary)]"
          />
        </div>
        <div className="flex flex-col justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <p className="text-xs text-[var(--muted-foreground)]">
            Lower precision means smaller files. 2–3 decimals is invisible on an icon-sized
            viewBox; drop to 0 only for pixel-grid artwork.
          </p>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-[var(--foreground)]">What to remove</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {TOGGLES.map(([key, label]) => (
            <label
              key={key}
              htmlFor={`opt-${key}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)]"
            >
              <input
                id={`opt-${key}`}
                type="checkbox"
                checked={options[key]}
                onChange={() => toggle(key)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasError}
          aria-label="Copy the optimized SVG to the clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={hasError}
          aria-label="Download the optimized SVG file"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset to the sample SVG and default options"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm text-[var(--muted-foreground)]">Size saved</p>
        <p className="mt-1 text-4xl leading-tight font-semibold text-[var(--foreground)]">
          {hasError ? DASH : `${percentFmt.format(result.savedPercent)}%`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${formatBytes(result.originalBytes)} → ${formatBytes(result.optimizedBytes)}`}
        </p>

        <dl className="mt-4">
          <Row label="Original size" value={hasError ? DASH : formatBytes(result.originalBytes)} />
          <Row
            label="Optimized size"
            value={hasError ? DASH : formatBytes(result.optimizedBytes)}
          />
          <Row label="Bytes removed" value={hasError ? DASH : formatBytes(result.savedBytes)} />
          <Row
            label="Comments removed"
            value={hasError ? DASH : numberFmt.format(result.removed.comments)}
          />
          <Row
            label="Elements removed"
            value={hasError ? DASH : numberFmt.format(result.removed.elements)}
          />
          <Row
            label="Attributes removed"
            value={hasError ? DASH : numberFmt.format(result.removed.attributes)}
          />
          <Row
            label="Unused ids removed"
            value={hasError ? DASH : numberFmt.format(result.removed.ids)}
          />
        </dl>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-medium text-[var(--foreground)]">Optimized markup</h2>
          <pre className="max-h-72 overflow-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs break-all whitespace-pre-wrap text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {hasError ? DASH : result.output}
          </pre>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium text-[var(--foreground)]">Preview</h2>
          <div className="flex min-h-40 items-center justify-center rounded-xl bg-[var(--card)] p-4 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {hasError ? (
              <span className="text-[var(--muted-foreground)]">{DASH}</span>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUri}
                alt="Preview of the optimized SVG"
                className="max-h-40 max-w-full"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
