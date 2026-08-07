"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, FileOutput, RotateCcw, Upload } from "lucide-react";

import {
  FIT_MODES,
  PAGE_SIZES,
  classifyFile,
  fitImage,
  textLayout,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_TEXT = `To PDF

Paste or type anything here and it becomes a clean, paginated PDF using the page size, margin and font size chosen above. You can also pick image files instead and each picture becomes one page.

Everything runs inside your browser — no file ever leaves this device.`;

export default function ToolHome() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState(SAMPLE_TEXT);
  const [sizeKey, setSizeKey] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [marginMm, setMarginMm] = useState("15");
  const [fontSizePt, setFontSizePt] = useState("11");
  const [fitMode, setFitMode] = useState("contain");
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [buildFailed, setBuildFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const textResult = useMemo(
    () => textLayout({ text, sizeKey, orientation, marginMm, fontSizePt }),
    [text, sizeKey, orientation, marginMm, fontSizePt],
  );

  const imageResults = useMemo(
    () =>
      images.map((img) => ({
        ...img,
        layout: fitImage({
          imageWidthPx: img.widthPx,
          imageHeightPx: img.heightPx,
          sizeKey,
          orientation,
          marginMm,
          mode: fitMode,
        }),
      })),
    [images, sizeKey, orientation, marginMm, fitMode],
  );

  const imageError =
    images.length === 0
      ? "Choose one or more JPG, PNG or WebP files."
      : imageResults.find((r) => r.layout.error)?.layout.error || null;

  const activeError = mode === "text" ? textResult.error : imageError;
  const hasError = Boolean(activeError);
  const pageCount = mode === "text" ? textResult.pageCount : images.length;

  const overflowingImages =
    mode === "image" && !hasError
      ? imageResults.filter((item) => item.layout.overflows)
      : [];
  const hasOverflow = overflowingImages.length > 0;

  const onPickFiles = async (event) => {
    const picked = Array.from(event.target.files || []);
    setStatus("");
    setBuildFailed(false);
    const loaded = [];
    const rejected = [];
    for (const file of picked) {
      if (classifyFile({ name: file.name, type: file.type }) !== "image") continue;
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      if (!dataUrl) {
        rejected.push(file.name);
        continue;
      }
      const dims = await new Promise((resolve) => {
        const el = new window.Image();
        el.onload = () => resolve({ widthPx: el.naturalWidth, heightPx: el.naturalHeight });
        el.onerror = () => resolve(null);
        el.src = dataUrl;
      });
      if (!dims) {
        rejected.push(file.name);
        continue;
      }
      loaded.push({ name: file.name, dataUrl, format: file.type, ...dims });
    }
    setImages(loaded);
    if (loaded.length > 0) setMode("image");
    if (rejected.length > 0) {
      setBuildFailed(true);
      setStatus(
        `${rejected.length} file${rejected.length === 1 ? "" : "s"} could not be read and ${
          rejected.length === 1 ? "was" : "were"
        } skipped: ${rejected.join(", ")}`,
      );
    }
  };

  const buildPdf = async () => {
    if (hasError || busy) return;
    setBusy(true);
    setStatus("");
    setBuildFailed(false);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        unit: "mm",
        format: [
          mode === "text" ? textResult.pageWidth : imageResults[0].layout.pageWidth,
          mode === "text" ? textResult.pageHeight : imageResults[0].layout.pageHeight,
        ],
        orientation,
      });

      if (mode === "text") {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(Number(fontSizePt));
        textResult.pages.forEach((lines, pageIndex) => {
          if (pageIndex > 0) doc.addPage();
          lines.forEach((line, lineIndex) => {
            doc.text(
              line,
              textResult.marginMm,
              textResult.marginMm + textResult.lineHeightMm * (lineIndex + 1),
            );
          });
        });
      } else {
        imageResults.forEach((item, index) => {
          if (index > 0) doc.addPage();
          const { x, y, width, height } = item.layout;
          const fmt = item.format === "image/png" ? "PNG" : item.format === "image/webp" ? "WEBP" : "JPEG";
          doc.addImage(item.dataUrl, fmt, x, y, width, height);
        });
      }

      doc.save(mode === "text" ? "document.pdf" : "images.pdf");
      setBuildFailed(false);
      setStatus(`PDF saved with ${pageCount} page${pageCount === 1 ? "" : "s"}.`);
    } catch {
      setBuildFailed(true);
      setStatus("Could not build the PDF in this browser. Try fewer or smaller files.");
    } finally {
      setBusy(false);
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const page = mode === "text" ? textResult : imageResults[0].layout;
    const base = [
      "To PDF layout",
      `Page: ${PAGE_SIZES[sizeKey].label}, ${orientation}`,
      `Page box: ${NUM.format(page.pageWidth)} x ${NUM.format(page.pageHeight)} mm`,
      `Printable area: ${NUM.format(page.contentWidth)} x ${NUM.format(page.contentHeight)} mm`,
      `Pages: ${pageCount}`,
    ];
    if (mode === "text") {
      base.push(
        `Words: ${textResult.wordCount}`,
        `Lines: ${textResult.lineCount} (${textResult.linesPerPage} per page, ${textResult.charsPerLine} chars per line)`,
      );
    } else {
      imageResults.forEach((item) => {
        base.push(
          `${item.name}: ${item.widthPx}x${item.heightPx}px placed at ${NUM.format(item.layout.width)} x ${NUM.format(item.layout.height)} mm`,
        );
      });
    }
    return base.join("\n");
  }, [hasError, mode, textResult, imageResults, sizeKey, orientation, pageCount]);

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
    setMode("text");
    setText(SAMPLE_TEXT);
    setSizeKey("a4");
    setOrientation("portrait");
    setMarginMm("15");
    setFontSizePt("11");
    setFitMode("contain");
    setImages([]);
    setStatus("");
    setBuildFailed(false);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fig = (value, suffix = "") => (hasError ? DASH : `${NUM.format(value)}${suffix}`);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileOutput className="h-4 w-4" aria-hidden="true" />
          PDF builder
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">To PDF</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn typed text or picture files into a PDF. Choose the page size, orientation and
          margin, and the layout below shows exactly how much fits on each page before you
          download. Nothing is uploaded — the file is produced in your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["text", "Text to PDF"],
            ["image", "Images to PDF"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={
                mode === value
                  ? `${PRIMARY_BTN} flex-1 sm:flex-none`
                  : `${GHOST_BTN} flex-1 sm:flex-none`
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "text" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="to-pdf-text">
              Text for the PDF
            </label>
            <textarea
              id="to-pdf-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="to-pdf-files">
              Image files (JPG, PNG, WebP) — one page each
            </label>
            <input
              id="to-pdf-files"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPickFiles}
              className="mt-1 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
            />
            {images.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
                {images.map((img) => (
                  <li key={img.name} className="flex items-center gap-2">
                    <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {img.name} — {img.widthPx}×{img.heightPx} px
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="to-pdf-size">
              Page size
            </label>
            <select
              id="to-pdf-size"
              value={sizeKey}
              onChange={(e) => setSizeKey(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            >
              {Object.entries(PAGE_SIZES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="to-pdf-orientation">
              Orientation
            </label>
            <select
              id="to-pdf-orientation"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="to-pdf-margin">
              Margin (mm)
            </label>
            <input
              id="to-pdf-margin"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={marginMm}
              onChange={(e) => setMarginMm(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            />
          </div>
          {mode === "text" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="to-pdf-font">
                Font size (pt)
              </label>
              <input
                id="to-pdf-font"
                type="number"
                min="4"
                step="1"
                inputMode="decimal"
                value={fontSizePt}
                onChange={(e) => setFontSizePt(e.target.value)}
                className={`${INPUT_CLASS} mt-1`}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="to-pdf-fit">
                Image placement
              </label>
              <select
                id="to-pdf-fit"
                value={fitMode}
                onChange={(e) => setFitMode(e.target.value)}
                className={`${INPUT_CLASS} mt-1`}
              >
                {Object.entries(FIT_MODES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {activeError}
          </p>
        )}

        {!hasError && hasOverflow && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
          >
            {overflowingImages.length === 1
              ? `"${overflowingImages[0].name}" is taller than the page and will be cut off in "Fill the page width" mode.`
              : `${overflowingImages.length} images are taller than the page and will be cut off in "Fill the page width" mode.`}{" "}
            Switch to &ldquo;Fit inside margins (keep whole image)&rdquo; or pick a different page size to avoid this.
          </p>
        )}

        <p className="text-sm text-[var(--muted-foreground)]">Pages in the PDF</p>
        <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {hasError ? DASH : NUM.format(pageCount)}
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Page box</dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : `${fig(mode === "text" ? textResult.pageWidth : imageResults[0].layout.pageWidth)} × ${fig(
                    mode === "text" ? textResult.pageHeight : imageResults[0].layout.pageHeight,
                  )} mm`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Printable area</dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : `${fig(mode === "text" ? textResult.contentWidth : imageResults[0].layout.contentWidth)} × ${fig(
                    mode === "text"
                      ? textResult.contentHeight
                      : imageResults[0].layout.contentHeight,
                  )} mm`}
            </dd>
          </div>
          {mode === "text" ? (
            <>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Lines per page</dt>
                <dd className="text-sm font-semibold">
                  {hasError ? DASH : textResult.linesPerPage}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Characters per line</dt>
                <dd className="text-sm font-semibold">
                  {hasError ? DASH : textResult.charsPerLine}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Words</dt>
                <dd className="text-sm font-semibold">
                  {hasError ? DASH : NUM.format(textResult.wordCount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Total lines</dt>
                <dd className="text-sm font-semibold">
                  {hasError ? DASH : NUM.format(textResult.lineCount)}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">First image on page</dt>
                <dd className="text-sm font-semibold">
                  {hasError
                    ? DASH
                    : `${fig(imageResults[0].layout.width)} × ${fig(imageResults[0].layout.height)} mm`}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
                <dt className="text-sm text-[var(--muted-foreground)]">Placement</dt>
                <dd className="text-sm font-semibold">
                  {hasError ? DASH : FIT_MODES[fitMode]}
                </dd>
              </div>
            </>
          )}
        </dl>

        {!hasError && mode === "image" && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Page
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    File
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Source px
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    On page (mm)
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Fits page?
                  </th>
                </tr>
              </thead>
              <tbody>
                {imageResults.map((item, index) => (
                  <tr key={item.name} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">{index + 1}</td>
                    <td className="max-w-[10rem] truncate py-2 pr-3">{item.name}</td>
                    <td className="py-2 pr-3">
                      {item.widthPx}×{item.heightPx}
                    </td>
                    <td className="py-2 pr-3">
                      {NUM.format(item.layout.width)}×{NUM.format(item.layout.height)}
                    </td>
                    <td className="py-2">
                      {item.layout.overflows ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--warning-text)]">
                          Cut off
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">Yes</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {status &&
          (buildFailed ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {status}
            </p>
          ) : (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 text-sm font-medium text-[var(--success)]"
            >
              {status}
            </p>
          ))}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={buildPdf} disabled={hasError || busy} className={PRIMARY_BTN}>
            <FileOutput className="h-4 w-4" aria-hidden="true" />
            {busy ? "Building…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={copyResult}
            disabled={hasError}
            className={GHOST_BTN}
            aria-label="Copy the page layout summary"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy summary"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset all options">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
