"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileText, RotateCcw } from "lucide-react";

import { SPLIT_MODES, planPdfSplit } from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

/** Pages assumed for the on-screen preview before a real PDF is loaded. */
const DEMO_PAGE_COUNT = 12;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  mode: "every",
  everyN: "3",
  rangeSpec: "1-3, 5, 9-",
  baseName: "document",
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [everyN, setEveryN] = useState(DEFAULTS.everyN);
  const [rangeSpec, setRangeSpec] = useState(DEFAULTS.rangeSpec);
  const [baseName, setBaseName] = useState(DEFAULTS.baseName);
  const [pageCount, setPageCount] = useState(DEMO_PAGE_COUNT);
  const [fileName, setFileName] = useState("");
  const [pdfBytes, setPdfBytes] = useState(null);
  const [readError, setReadError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const result = useMemo(
    () =>
      planPdfSplit({
        pageCount,
        mode,
        everyN: Number(everyN),
        rangeSpec,
        baseName,
      }),
    [pageCount, mode, everyN, rangeSpec, baseName],
  );

  const errorMessage = readError || result.error || "";
  const hasError = Boolean(errorMessage);
  const loaded = Boolean(pdfBytes);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Split PDF — ${result.partCount} file(s) from a ${result.pageCount}-page document`,
      ...result.parts.map((part) => `${part.filename}: pages ${part.pages.join(", ")}`),
    ].join("\n");
  }, [hasError, result]);

  const onPickFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setReadError("");
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      if (count < 1) {
        setReadError("That PDF has no pages.");
        return;
      }
      setPdfBytes(new Uint8Array(buffer));
      setPageCount(count);
      setFileName(file.name);
      const stem = file.name.replace(/\.[^.]+$/, "");
      if (stem) setBaseName(stem);
    } catch {
      setReadError("Could not read that PDF. Password-protected files must be unlocked first.");
    } finally {
      setBusy(false);
    }
  };

  const saveBlob = (data, name) => {
    const blob = new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const buildPart = async (PDFDocument, source, part) => {
    const out = await PDFDocument.create();
    const copied2 = await out.copyPages(source, part.zeroBased);
    copied2.forEach((page) => out.addPage(page));
    return out.save();
  };

  const downloadPart = async (part) => {
    if (!pdfBytes) return;
    setBusy(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const source = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const bytes = await buildPart(PDFDocument, source, part);
      saveBlob(bytes, part.filename);
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!pdfBytes || hasError) return;
    setBusy(true);
    try {
      const [{ PDFDocument }, { default: JSZip }] = await Promise.all([
        import("pdf-lib"),
        import("jszip"),
      ]);
      const source = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const zip = new JSZip();
      for (const part of result.parts) {
        const bytes = await buildPart(PDFDocument, source, part);
        zip.file(part.filename, bytes);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${baseName || "document"}-split.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setEveryN(DEFAULTS.everyN);
    setRangeSpec(DEFAULTS.rangeSpec);
    setBaseName(DEFAULTS.baseName);
    setPageCount(DEMO_PAGE_COUNT);
    setPdfBytes(null);
    setFileName("");
    setReadError("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const needsRanges = mode === "ranges" || mode === "extract" || mode === "remove";

  const rows = hasError
    ? [
        ["Source pages", DASH],
        ["Files produced", DASH],
        ["Pages written", DASH],
        ["Largest file", DASH],
      ]
    : [
        ["Source pages", NUM.format(result.pageCount)],
        ["Files produced", NUM.format(result.partCount)],
        ["Pages written", NUM.format(result.pagesUsed)],
        ["Largest file", `${NUM.format(result.largestPart)} page${result.largestPart === 1 ? "" : "s"}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          PDF toolkit
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Split PDF</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split a PDF into separate files — one per page, in fixed batches, by custom page ranges,
          or by extracting or removing the pages you list. Page numbers are 1-based and the file
          never leaves your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="pdf-file">
              PDF file
            </label>
            <input
              id="pdf-file"
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={onPickFile}
              className="mt-2 block w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-11 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--background)] file:px-4 file:text-sm file:font-semibold file:text-[var(--foreground)]"
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {loaded
                ? `Loaded ${fileName} — ${NUM.format(pageCount)} pages.`
                : `Previewing the plan for a ${DEMO_PAGE_COUNT}-page example. Upload a PDF to enable downloads.`}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={needsRanges ? "" : "sm:col-span-2"}>
              <label className={LABEL_CLASS} htmlFor="pdf-mode">
                Split mode
              </label>
              <select
                id="pdf-mode"
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className={`mt-2 ${INPUT_CLASS}`}
              >
                {SPLIT_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {mode === "every" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="pdf-every-n">
                  Pages per file
                </label>
                <input
                  id="pdf-every-n"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={everyN}
                  onChange={(event) => setEveryN(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                />
              </div>
            ) : null}

            {needsRanges ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="pdf-ranges">
                  Pages / ranges
                </label>
                <input
                  id="pdf-ranges"
                  type="text"
                  value={rangeSpec}
                  onChange={(event) => setRangeSpec(event.target.value)}
                  placeholder="1-3, 5, 9-"
                  className={`mt-2 ${INPUT_CLASS}`}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Use 3 for one page, 2-7 for a range, 9- to the end, or last.
                </p>
              </div>
            ) : null}

            <div>
              <label className={LABEL_CLASS} htmlFor="pdf-base-name">
                Output file name prefix
              </label>
              <input
                id="pdf-base-name"
                type="text"
                value={baseName}
                onChange={(event) => setBaseName(event.target.value)}
                className={`mt-2 ${INPUT_CLASS}`}
              />
            </div>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Files produced
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.partCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : loaded
                  ? "Download them individually or all at once as a ZIP."
                  : "Upload a PDF to turn this plan into downloadable files."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the split plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              onClick={downloadZip}
              disabled={hasError || busy || !loaded}
              aria-label="Download every split PDF as a ZIP archive"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {busy ? "Working…" : "Download ZIP"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Output files</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    File
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Source pages
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.parts.map((part) => (
                  <tr key={part.filename}>
                    <td className="py-2.5 pr-3 font-mono text-xs break-all">{part.filename}</td>
                    <td className="py-2.5 pr-3">{part.pages.join(", ")}</td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => downloadPart(part)}
                        disabled={busy || !loaded}
                        aria-label={`Download ${part.filename}`}
                        className={`${GHOST_BTN} disabled:opacity-50`}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Pages are copied with their original text, images and vector content. Interactive form
        fields, bookmarks and page-level annotations may not carry across into the split files.
      </p>
    </main>
  );
}
