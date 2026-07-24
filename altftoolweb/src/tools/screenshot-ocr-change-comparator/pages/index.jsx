"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  EyeOff,
  FileImage,
  FileText,
  Info,
  LoaderCircle,
  RefreshCcw,
  ScanSearch,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  compareOcrTranscripts,
  detectRasterImageType,
  ocrComparatorDefaultOptions,
  ocrComparatorLimits,
  parseRasterImageDimensions,
  serializeCountsOnlyOcrReport,
  validateRasterImageDimensions,
} from "../lib/compareOcrTranscripts.mjs";

const OPTION_ROWS = [
  {
    key: "ignoreCase",
    label: "Ignore letter case",
    helper: "Treat Save and SAVE as equal.",
  },
  {
    key: "collapseWhitespace",
    label: "Collapse repeated spaces",
    helper: "Treat runs of spaces and tabs as one space.",
  },
  {
    key: "ignorePunctuation",
    label: "Ignore punctuation",
    helper: "Remove punctuation before comparing text.",
  },
  {
    key: "ignoreBlankLines",
    label: "Ignore blank lines",
    helper: "Exclude empty normalized lines from line counts.",
  },
  {
    key: "trimLineEdges",
    label: "Trim line edges",
    helper: "Ignore spaces at the start and end of each line.",
  },
];

function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_024 ** 2) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_024 ** 2).toFixed(1)} MB`;
}

function downloadReport(content) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "screenshot-ocr-change-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function ScreenshotPanel({
  id,
  label,
  image,
  loading,
  inputRef,
  onChoose,
  onClear,
  onPreviewError,
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-foreground">{label}</h3>
        {image ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={onClear}
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        ) : null}
      </div>

      <label
        htmlFor={id}
        className="relative mt-4 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border-strong bg-surface-soft text-center transition hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-5">
            <LoaderCircle
              className="h-8 w-8 animate-spin text-primary motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-foreground">
              Validating local image…
            </span>
          </div>
        ) : image ? (
          <Image
            src={image.url}
            alt={`${label} local preview`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            unoptimized
            className="pointer-events-none object-contain"
            draggable={false}
            onError={onPreviewError}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 p-5">
            <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
            <span className="font-bold text-foreground">Choose screenshot</span>
            <span className="text-sm text-muted-foreground">
              PNG, JPEG, or WebP · up to 20 MB
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          className="sr-only"
          disabled={loading}
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            event.target.value = "";
            onChoose(file);
          }}
        />
      </label>

      {image ? (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Local filename
            </dt>
            <dd className="mt-1 truncate font-semibold text-foreground" title={image.name}>
              {image.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              File details
            </dt>
            <dd className="mt-1 font-semibold text-foreground">
              {formatBytes(image.size)} · {image.mediaType} · {image.width} ×{" "}
              {image.height}
            </dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

function TranscriptEditor({
  id,
  label,
  value,
  reviewed,
  onChange,
  onReviewed,
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <label htmlFor={id} className="font-bold text-foreground">
        {label}
      </label>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Paste text from your OS, device, browser, or chosen OCR workflow, then correct
        recognition mistakes against the screenshot.
      </p>
      <textarea
        id={id}
        value={value}
        rows={14}
        maxLength={ocrComparatorLimits.maxTranscriptCharacters}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste and review the OCR transcript here…"
        className="mt-3 w-full resize-y rounded-lg border border-border bg-surface-soft p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        spellCheck={false}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            checked={reviewed}
            onChange={(event) => onReviewed(event.target.checked)}
          />
          <span>
            <strong>I reviewed this transcript</strong>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              It matches the visible text as closely as I can verify.
            </span>
          </span>
        </label>
        <span className="text-xs text-muted-foreground">
          {[...value].length.toLocaleString("en-US")} /{" "}
          {ocrComparatorLimits.maxTranscriptCharacters.toLocaleString("en-US")}
        </span>
      </div>
    </article>
  );
}

function CountGroup({ title, result }) {
  const rows = [
    { label: "Added", value: result.counts.additions, tone: "text-success" },
    { label: "Removed", value: result.counts.removals, tone: "text-danger" },
    {
      label: "Replaced",
      value: result.counts.replacements,
      tone: "text-warning",
    },
  ];
  return (
    <section className="tool-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.beforeCount} before · {result.afterCount} after ·{" "}
            {result.counts.unchanged} unchanged
          </p>
        </div>
        <span className="rounded-pill bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
          {result.similarityPercent}% matched
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-lg border border-border bg-surface-soft p-3 text-center"
          >
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {row.label}
            </dt>
            <dd className={`mt-1 text-2xl font-black ${row.tone}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DetailText({ item, label }) {
  return (
    <div className="min-w-0 rounded-lg bg-surface-soft p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label} · line {item.lineNumber}
      </p>
      <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm text-foreground">
        {item.text || "(blank line)"}
      </pre>
    </div>
  );
}

function ChangeDetail({ change }) {
  const style =
    change.kind === "addition"
      ? "border-success"
      : change.kind === "removal"
        ? "border-danger"
        : "border-warning";
  return (
    <li className={`rounded-xl border p-4 ${style}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Line {change.kind}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {change.before ? <DetailText item={change.before} label="Before" /> : null}
        {change.after ? <DetailText item={change.after} label="After" /> : null}
      </div>
    </li>
  );
}

export default function ScreenshotOcrChangeComparator() {
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const beforeUrlRef = useRef("");
  const afterUrlRef = useRef("");
  const beforeSelectionRef = useRef(0);
  const afterSelectionRef = useRef(0);
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [beforeText, setBeforeText] = useState("");
  const [afterText, setAfterText] = useState("");
  const [beforeReviewed, setBeforeReviewed] = useState(false);
  const [afterReviewed, setAfterReviewed] = useState(false);
  const [options, setOptions] = useState({ ...ocrComparatorDefaultOptions });
  const [loadingSides, setLoadingSides] = useState({
    after: false,
    before: false,
  });
  const [errors, setErrors] = useState([]);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState(
    "Add both screenshots and reviewed transcripts. Comparison runs only in this tab.",
  );

  const report = useMemo(
    () => (result ? serializeCountsOnlyOcrReport(result) : ""),
    [result],
  );

  const canCompare =
    beforeImage &&
    afterImage &&
    beforeReviewed &&
    afterReviewed &&
    !loadingSides.before &&
    !loadingSides.after;

  useEffect(
    () => () => {
      if (beforeUrlRef.current) URL.revokeObjectURL(beforeUrlRef.current);
      if (afterUrlRef.current) URL.revokeObjectURL(afterUrlRef.current);
    },
    [],
  );

  const invalidate = () => {
    setResult(null);
    setCopied(false);
  };

  const clearImage = (side) => {
    const isBefore = side === "before";
    const urlRef = isBefore ? beforeUrlRef : afterUrlRef;
    const selectionRef = isBefore ? beforeSelectionRef : afterSelectionRef;
    selectionRef.current += 1;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    if (isBefore) {
      setBeforeImage(null);
      setBeforeReviewed(false);
      if (beforeInputRef.current) beforeInputRef.current.value = "";
    } else {
      setAfterImage(null);
      setAfterReviewed(false);
      if (afterInputRef.current) afterInputRef.current.value = "";
    }
    setLoadingSides((current) => ({ ...current, [side]: false }));
    setErrors([]);
    invalidate();
  };

  const chooseImage = async (side, file) => {
    const isBefore = side === "before";
    const selectionRef = isBefore ? beforeSelectionRef : afterSelectionRef;
    const urlRef = isBefore ? beforeUrlRef : afterUrlRef;
    const setImage = isBefore ? setBeforeImage : setAfterImage;
    const selection = selectionRef.current + 1;
    selectionRef.current = selection;
    setErrors([]);
    invalidate();
    if (!file) return;
    if (file.size <= 0 || file.size > ocrComparatorLimits.maxFileBytes) {
      setErrors([
        `${isBefore ? "Before" : "After"} screenshot must be larger than 0 bytes and no more than 20 MB.`,
      ]);
      return;
    }

    setLoadingSides((current) => ({ ...current, [side]: true }));
    try {
      const header = new Uint8Array(
        await file
          .slice(
            0,
            Math.min(file.size, ocrComparatorLimits.maxHeaderBytes),
          )
          .arrayBuffer(),
      );
      const mediaType = detectRasterImageType(header);
      const dimensions = parseRasterImageDimensions(header);
      if (selectionRef.current !== selection) return;
      if (!mediaType || !dimensions || dimensions.mediaType !== mediaType) {
        setErrors([
          `${isBefore ? "Before" : "After"} screenshot does not have a complete supported PNG, JPEG, or WebP header.`,
        ]);
        return;
      }
      const dimensionCheck = validateRasterImageDimensions(dimensions, {
        maxEdge: ocrComparatorLimits.maxImageEdge,
        maxPixels: ocrComparatorLimits.maxImagePixels,
      });
      if (!dimensionCheck.ok) {
        setErrors([
          `${isBefore ? "Before" : "After"} screenshot dimensions exceed the local preview limit of ${ocrComparatorLimits.maxImageEdge.toLocaleString("en-US")}px per edge and ${ocrComparatorLimits.maxImagePixels.toLocaleString("en-US")} total pixels.`,
        ]);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      if (selectionRef.current !== selection) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = objectUrl;
      setImage({
        mediaType,
        name: file.name,
        size: file.size,
        url: objectUrl,
        width: dimensions.width,
        height: dimensions.height,
      });
      if (isBefore) setBeforeReviewed(false);
      else setAfterReviewed(false);
      setNotice(
        `${isBefore ? "Before" : "After"} preview loaded locally. Paste and review its OCR transcript.`,
      );
    } catch {
      if (selectionRef.current === selection) {
        setErrors([
          `The ${isBefore ? "before" : "after"} screenshot could not be read in this browser.`,
        ]);
      }
    } finally {
      if (selectionRef.current === selection) {
        setLoadingSides((current) => ({ ...current, [side]: false }));
      }
    }
  };

  const runComparison = (event) => {
    event.preventDefault();
    if (!canCompare) {
      setErrors([
        "Add both screenshots and confirm that both OCR transcripts were reviewed.",
      ]);
      return;
    }
    const nextResult = compareOcrTranscripts(beforeText, afterText, options);
    setResult(nextResult);
    setErrors([]);
    setCopied(false);
    setNotice(
      `${nextResult.line.totalChanges} line changes and ${nextResult.word.totalChanges} word changes found under the selected normalization options.`,
    );
  };

  const reset = () => {
    clearImage("before");
    clearImage("after");
    setBeforeText("");
    setAfterText("");
    setBeforeReviewed(false);
    setAfterReviewed(false);
    setOptions({ ...ocrComparatorDefaultOptions });
    setLoadingSides({ after: false, before: false });
    setResult(null);
    setErrors([]);
    setCopied(false);
    setNotice("Screenshots, transcripts, and comparison discarded from this page.");
  };

  const copyReport = async () => {
    if (!report) return;
    const didCopy = await safeCopyText(report);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1_600);
  };

  const truncated =
    result &&
    Object.values(result.bounds).some((value) => value === true);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ScanSearch className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Local reviewed-text comparison
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  Screenshot OCR Change Comparator
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Preview two local screenshots, paste OCR text you have reviewed, and
              compare deterministic line and word additions, removals, and replacements.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-success">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              No upload · No OCR download
            </p>
            <p className="mt-2 leading-relaxed">
              Images use temporary local previews. No CDN model is fetched, and no
              screenshot or transcript is sent or persisted.
            </p>
          </div>
        </div>
      </header>

      <section
        className="rounded-xl border border-warning bg-warning-soft p-4 text-foreground"
        aria-labelledby="ocr-limits-title"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <h2 id="ocr-limits-title" className="font-bold">
              Text comparison has important blind spots
            </h2>
            <p className="mt-1 text-sm leading-relaxed">
              OCR errors can create false changes. Layout, styling, color, pixels,
              cropping, icons, hidden or omitted text, authenticity, capture time, and
              tamper detection are outside this tool.
            </p>
          </div>
        </div>
      </section>

      <form className="space-y-6" onSubmit={runComparison}>
        <section className="tool-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileImage className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                1. Add local screenshot previews
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Previews help you review OCR text. This tool does not compare image
                pixels.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ScreenshotPanel
              id="ocr-before-screenshot"
              label="Before screenshot"
              image={beforeImage}
              loading={loadingSides.before}
              inputRef={beforeInputRef}
              onChoose={(file) => chooseImage("before", file)}
              onClear={() => clearImage("before")}
              onPreviewError={() => {
                clearImage("before");
                setErrors(["The before screenshot could not be decoded for preview."]);
              }}
            />
            <ScreenshotPanel
              id="ocr-after-screenshot"
              label="After screenshot"
              image={afterImage}
              loading={loadingSides.after}
              inputRef={afterInputRef}
              onChoose={(file) => chooseImage("after", file)}
              onClear={() => clearImage("after")}
              onPreviewError={() => {
                clearImage("after");
                setErrors(["The after screenshot could not be decoded for preview."]);
              }}
            />
          </div>
        </section>

        <section className="tool-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                2. Paste and review both OCR transcripts
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Use OCR already available on your device or OS. Blank text is allowed
                when you confirm that no visible text was recognized.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <TranscriptEditor
              id="ocr-before-transcript"
              label="Before transcript"
              value={beforeText}
              reviewed={beforeReviewed}
              onChange={(value) => {
                setBeforeText(value);
                setBeforeReviewed(false);
                setErrors([]);
                invalidate();
              }}
              onReviewed={(value) => {
                setBeforeReviewed(value);
                setErrors([]);
                invalidate();
              }}
            />
            <TranscriptEditor
              id="ocr-after-transcript"
              label="After transcript"
              value={afterText}
              reviewed={afterReviewed}
              onChange={(value) => {
                setAfterText(value);
                setAfterReviewed(false);
                setErrors([]);
                invalidate();
              }}
              onReviewed={(value) => {
                setAfterReviewed(value);
                setErrors([]);
                invalidate();
              }}
            />
          </div>
        </section>

        <section className="tool-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Settings2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                3. Choose normalization options
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Options change what counts as equal; they do not alter your transcript
                inputs.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OPTION_ROWS.map((option) => (
              <label
                key={option.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-4"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  checked={options[option.key]}
                  onChange={(event) => {
                    setOptions((current) => ({
                      ...current,
                      [option.key]: event.target.checked,
                    }));
                    invalidate();
                  }}
                />
                <span>
                  <strong className="text-sm text-foreground">{option.label}</strong>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {option.helper}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {errors.length ? (
          <div
            className="rounded-xl border border-danger bg-danger-soft p-4"
            role="alert"
          >
            <p className="flex items-center gap-2 font-bold text-danger">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              Review {errors.length === 1 ? "this issue" : "these issues"}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="tool-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex min-w-0 items-start gap-3 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="leading-relaxed">{notice}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={!canCompare}>
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Compare reviewed text
            </button>
            <button type="button" className="btn-secondary" onClick={reset}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </form>

      {result ? (
        <section className="space-y-6" aria-label="OCR transcript comparison result">
          <div
            className={`rounded-xl border p-5 sm:p-6 ${
              result.assessment.level === "same"
                ? "border-success bg-success-soft"
                : "border-warning bg-warning-soft"
            }`}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {result.assessment.level === "same" ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-6 w-6 shrink-0 text-warning" aria-hidden="true" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Reviewed transcript result
                </p>
                <h2 className="mt-1 text-xl font-black text-foreground">
                  {result.assessment.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {result.assessment.description}
                </p>
              </div>
            </div>
          </div>

          {truncated ? (
            <div className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-foreground">
              <p className="font-bold">Comparison bounds were reached</p>
              <p className="mt-1 leading-relaxed">
                At least one transcript, line list, word list, or detail list was
                truncated. Use smaller focused transcripts for a complete comparison.
              </p>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <CountGroup title="Line changes" result={result.line} />
            <CountGroup title="Word changes" result={result.word} />
          </div>

          <section className="tool-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Changed lines</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Displayed content stays in this tab and is omitted from the counts-only
                  export.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => downloadReport(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download counts
                </button>
                <button type="button" className="btn-secondary" onClick={copyReport}>
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied" : "Copy counts"}
                </button>
              </div>
            </div>

            {result.line.details.length ? (
              <ul className="mt-5 space-y-3">
                {result.line.details.map((change, index) => (
                  <ChangeDetail
                    key={`${change.kind}-${change.before?.lineNumber || 0}-${change.after?.lineNumber || 0}-${index}`}
                    change={change}
                  />
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground">
                No line additions, removals, or replacements remain after normalization.
              </div>
            )}

            {result.line.detailsTruncated ? (
              <p className="mt-4 text-sm font-semibold text-warning">
                Only the first {ocrComparatorLimits.maxChangeDetails} line changes are
                displayed.
              </p>
            ) : null}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface-soft p-5">
              <div className="flex items-start gap-3">
                <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="font-bold text-foreground">Counts-only export</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Includes options, line and word counts, bounds, and limitations. It
                    excludes screenshot pixels, filenames, object URLs, and transcript
                    content.
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-border bg-surface-soft p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="font-bold text-foreground">Not tamper detection</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    A text difference can come from page content, OCR, or transcript
                    editing. Preserve originals and use an appropriate forensic process
                    when authenticity matters.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
}
