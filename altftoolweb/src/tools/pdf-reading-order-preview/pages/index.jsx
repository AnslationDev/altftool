"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownAZ,
  CheckCircle2,
  CircleStop,
  Download,
  ExternalLink,
  FileSearch,
  FileUp,
  Info,
  ListOrdered,
  LoaderCircle,
  RotateCcw,
  ScanText,
  ShieldCheck,
} from "lucide-react";

import { extractPdfReadingOrder } from "../lib/extractPdfReadingOrder";
import {
  READING_ORDER_LIMITS,
  buildCountsOnlyReadingOrderReport,
  getReadingOrderReferences,
} from "../lib/readingOrderEstimate.mjs";

const MAX_VISIBLE_ITEMS = 250;
const MAX_VISIBLE_TEXT_CHARACTERS = 500;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCoordinate(value) {
  return Number.isFinite(value) ? value.toFixed(1) : "unknown";
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
  anchor.download = "pdf-reading-order-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Metric({ detail, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-3xl font-black text-foreground">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </article>
  );
}

function Notice({ notice }) {
  const isInfo = notice.tone === "info";
  return (
    <li
      className={`flex items-start gap-3 rounded-lg border p-3 text-sm leading-6 ${
        isInfo ? "border-info bg-info-soft" : "border-warning bg-warning-soft"
      }`}
    >
      {isInfo ? (
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-info"
          aria-hidden="true"
        />
      ) : (
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-warning"
          aria-hidden="true"
        />
      )}
      <span className="text-foreground">{notice.message}</span>
    </li>
  );
}

function SequencePanel({ description, items, title, visual }) {
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          {visual ? (
            <ArrowDownAZ className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ListOrdered className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {items.length ? (
        <>
          <ol className="mt-5 max-h-screen space-y-2 overflow-y-auto pr-1">
            {visibleItems.map((item, index) => {
              const textPreview = item.text.slice(
                0,
                MAX_VISIBLE_TEXT_CHARACTERS,
              );
              return (
                <li
                  key={`${item.id}-${visual ? "visual" : "source"}`}
                  className="rounded-lg border border-border bg-surface-soft p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold leading-6 text-foreground">
                        {textPreview}
                        {item.text.length > MAX_VISIBLE_TEXT_CHARACTERS
                          ? "…"
                          : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Source #{item.sourceIndex + 1} · X{" "}
                        {formatCoordinate(item.x)} · Y{" "}
                        {formatCoordinate(item.y)}
                        {visual && item.lineIndex !== null
                          ? ` · estimated line ${item.lineIndex + 1}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {items.length > MAX_VISIBLE_ITEMS ? (
            <p className="mt-4 rounded-lg border border-warning bg-warning-soft p-3 text-sm text-foreground">
              The page contains {items.length.toLocaleString("en-US")} text
              items. Only the first {MAX_VISIBLE_ITEMS.toLocaleString("en-US")}{" "}
              are rendered here to keep this preview responsive.
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-5 rounded-lg border border-border bg-surface-soft p-4 text-sm leading-6 text-muted-foreground">
          No visible text-layer items were available for this page. The PDF may
          be scanned or image-only; OCR is not performed.
        </p>
      )}
    </section>
  );
}

export default function PdfReadingOrderPreview() {
  const fileInputRef = useRef(null);
  const operationRef = useRef(0);
  const [result, setResult] = useState(null);
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [fileState, setFileState] = useState({
    busy: false,
    error: "",
  });
  const references = useMemo(() => getReadingOrderReferences(), []);
  const report = useMemo(
    () => (result ? buildCountsOnlyReadingOrderReport(result) : null),
    [result],
  );
  const activePage = result?.pages.find(
    (page) => page.pageNumber === activePageNumber,
  );

  const inspectFile = async (file) => {
    if (!file) return;
    const operation = operationRef.current + 1;
    operationRef.current = operation;
    setResult(null);
    setActivePageNumber(1);
    setFileState({ busy: true, error: "" });

    try {
      const nextResult = await extractPdfReadingOrder(file, {
        shouldContinue: () => operationRef.current === operation,
      });
      if (operationRef.current !== operation) return;
      setResult(nextResult);
      setActivePageNumber(nextResult.pages[0]?.pageNumber || 1);
      setFileState({ busy: false, error: "" });
    } catch (error) {
      if (operationRef.current !== operation) return;
      setFileState({
        busy: false,
        error:
          error instanceof Error
            ? error.message
            : "The PDF could not be inspected locally.",
      });
    } finally {
      if (operationRef.current === operation && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const reset = () => {
    operationRef.current += 1;
    setResult(null);
    setActivePageNumber(1);
    setFileState({ busy: false, error: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 text-foreground sm:p-6">
      <header className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ScanText className="h-4 w-4" aria-hidden="true" />
              Browser-local review aid
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              PDF Reading-Order Preview
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              Compare a PDF text layer&apos;s extracted source sequence with a
              simple visual estimate that groups nearby text into lines, then
              orders each page primarily from top to bottom and left to right.
            </p>
          </div>
          <aside className="rounded-lg border border-warning bg-warning-soft p-4 lg:max-w-sm">
            <p className="font-bold text-foreground">Estimate, not semantics</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This tool does not inspect the PDF tag tree, simulate a screen
              reader, determine the author&apos;s intended meaning, or establish
              accessibility or WCAG conformance.
            </p>
          </aside>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <FileSearch
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Open a text-based PDF
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Files stay in this browser tab. Maximum{" "}
                {READING_ORDER_LIMITS.maxFileBytes / (1024 * 1024)} MB and{" "}
                {READING_ORDER_LIMITS.maxPages} pages; extraction also has
                strict per-page and document-wide text limits.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="btn-primary inline-flex min-h-11 cursor-pointer items-center gap-2 px-5">
                {fileState.busy ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <FileUp className="h-4 w-4" aria-hidden="true" />
                )}
                {fileState.busy ? "Inspecting…" : "Choose PDF"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  aria-label="Choose a PDF for local reading-order preview"
                  disabled={fileState.busy}
                  onChange={(event) =>
                    void inspectFile(event.target.files?.[0] || null)
                  }
                />
              </label>
              {fileState.busy ? (
                <button
                  type="button"
                  className="btn-secondary min-h-11 px-4"
                  onClick={reset}
                >
                  <CircleStop className="h-4 w-4" aria-hidden="true" />
                  Cancel inspection
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ShieldCheck
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                No upload
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Parsing runs in the browser with the bundled PDF library.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CheckCircle2
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                Counts-only export
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Downloaded findings omit extracted text and the filename.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <AlertTriangle
                  className="h-4 w-4 text-warning"
                  aria-hidden="true"
                />
                No OCR
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Image-only pages need a separate reviewed OCR workflow.
              </p>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Official references
          </h2>
          <ul className="mt-4 space-y-3">
            {references.map((reference) => (
              <li key={reference.url}>
                <a
                  className="inline-flex items-start gap-2 text-sm font-semibold leading-6 text-primary underline-offset-4 hover:underline"
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {reference.title}
                  <ExternalLink
                    className="mt-1 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Official W3C/WAI material reviewed 24 July 2026. W3C PDF3 applies to
            tagged PDFs; this tool does not inspect tags.
          </p>
        </aside>
      </div>

      {fileState.error ? (
        <p
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
          role="alert"
        >
          {fileState.error}
        </p>
      ) : null}

      {result ? (
        <section className="space-y-6" aria-live="polite">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Local file inspected
              </p>
              <p className="mt-1 truncate text-lg font-bold text-foreground">
                {result.fileName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatBytes(result.fileBytes)} · filename is shown only in this
                local view and excluded from export
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-secondary min-h-11 px-4"
                onClick={() => downloadJson(report)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download counts-only findings
              </button>
              <button
                type="button"
                className="btn-secondary min-h-11 px-4"
                onClick={reset}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Pages processed"
              value={`${result.summary.processedPages}/${result.summary.pageCount}`}
              detail="Page count is checked before any page text is read."
            />
            <Metric
              label="Text items"
              value={result.summary.itemCount.toLocaleString("en-US")}
              detail={`${result.summary.characterCount.toLocaleString("en-US")} bounded text characters`}
            />
            <Metric
              label="Position changes"
              value={result.summary.changedPositions.toLocaleString("en-US")}
              detail="Items whose source and estimated positions differ."
            />
            <Metric
              label="Ambiguous pages"
              value={result.summary.ambiguousPages.toLocaleString("en-US")}
              detail="Columns, rotation, or incomplete coordinate metadata."
            />
          </div>

          {result.warnings.length ? (
            <ul className="space-y-2">
              {result.warnings.map((notice) => (
                <Notice key={notice.code} notice={notice} />
              ))}
            </ul>
          ) : null}

          {result.pages.length ? (
            <>
              <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Page comparison
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Review both lists with the rendered PDF. Neither list is
                      the PDF tag-tree order or a prediction of screen-reader
                      output.
                    </p>
                  </div>
                  <label className="block sm:min-w-52">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Select page
                    </span>
                    <select
                      className="input-field min-h-11 w-full"
                      value={activePageNumber}
                      onChange={(event) =>
                        setActivePageNumber(Number(event.target.value))
                      }
                    >
                      {result.pages.map((page) => (
                        <option key={page.pageNumber} value={page.pageNumber}>
                          Page {page.pageNumber}
                          {page.estimate.ambiguous ? " · review" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              {activePage ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                      label="Page items"
                      value={activePage.itemCount.toLocaleString("en-US")}
                      detail={`${activePage.characterCount.toLocaleString("en-US")} text characters`}
                    />
                    <Metric
                      label="Estimated lines"
                      value={activePage.estimate.lineCount.toLocaleString(
                        "en-US",
                      )}
                      detail="Coordinate-based grouping, not semantic structure."
                    />
                    <Metric
                      label="Changed positions"
                      value={activePage.estimate.changedPositions.toLocaleString(
                        "en-US",
                      )}
                      detail="Difference between the two local sequences."
                    />
                    <Metric
                      label="Page status"
                      value={
                        activePage.estimate.ambiguous ? "Review" : "Estimated"
                      }
                      detail={
                        activePage.truncated
                          ? "Extraction limit reached; this page is partial."
                          : "Extraction stayed within configured limits."
                      }
                    />
                  </div>

                  {activePage.warnings.length ? (
                    <ul className="space-y-2">
                      {activePage.warnings.map((notice) => (
                        <Notice
                          key={`${activePage.pageNumber}-${notice.code}`}
                          notice={notice}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
                      No configured ambiguity cue matched this page. Manual
                      inspection of the rendered PDF and its tag tree is still
                      required.
                    </p>
                  )}

                  <div className="grid gap-6 xl:grid-cols-2">
                    <SequencePanel
                      title="Extracted source sequence"
                      description="Order returned by PDF.js text-content extraction. This is not asserted to be tag-tree or assistive-technology order."
                      items={activePage.estimate.sourceItems}
                      visual={false}
                    />
                    <SequencePanel
                      title="Estimated visual sequence"
                      description="Nearby Y positions are grouped into lines; lines run top-to-bottom and items left-to-right. Columns and rotated text can make this estimate wrong."
                      items={activePage.estimate.estimatedItems}
                      visual
                    />
                  </div>
                </>
              ) : null}
            </>
          ) : null}
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-surface p-5 text-sm leading-6 text-muted-foreground shadow-sm">
          Choose a local text-based PDF to begin. Nothing is uploaded, stored,
          or added to the counts-only report until you create it in this tab.
        </section>
      )}
    </main>
  );
}
