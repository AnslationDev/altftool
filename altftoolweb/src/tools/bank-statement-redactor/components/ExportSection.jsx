"use client";

import {
  CheckCircle2,
  Download,
  Eye,
  FileLock2,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { formatBytes } from "../lib/redactorModel.mjs";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ExportSection({
  sourceInfo,
  totalRedactions,
  rasterDpi,
  onChangeRasterDpi,
  exportAcknowledged,
  onChangeExportAcknowledged,
  pagesWithoutRedactions,
  isBusy,
  onExportResult,
  result,
  inspectionConfirmed,
  onChangeInspectionConfirmed,
}) {
  return (
    <div className="space-y-6">
      {/* Export Configuration Card */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
            <FileLock2 className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
              Flatten &amp; Export Redacted Document
            </h2>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)] sm:text-sm">
              Generates fresh rasterized pixel layers. Original PDF selectable text, metadata, and underlying vector objects are permanently destroyed.
            </p>
          </div>
        </div>

        {sourceInfo?.type === "pdf" && (
          <div className="mt-5">
            <label className="block text-xs font-bold text-[var(--muted-foreground)]">
              Raster Resolution (DPI Quality)
              <select
                value={rasterDpi}
                onChange={(e) => onChangeRasterDpi(Number(e.target.value))}
                className="mt-1.5 h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                <option value="96">Standard (96 DPI) · Fast export &amp; smaller file size</option>
                <option value="144">Balanced (144 DPI) · Recommended clarity &amp; web quality</option>
                <option value="216">Ultra High (216 DPI) · Maximum crispness for high-res displays &amp; print</option>
              </select>
            </label>
          </div>
        )}

        {pagesWithoutRedactions.length > 0 && (
          <div className="mt-5 rounded-2xl border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-xs font-semibold leading-relaxed text-[var(--foreground)]">
            ⚠️ Attention: No redaction masks are placed on page(s): {pagesWithoutRedactions.join(", ")}. Please confirm all sensitive areas have been inspected.
          </div>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-colors hover:bg-[var(--surface)]">
          <input
            type="checkbox"
            checked={exportAcknowledged}
            onChange={(e) => onChangeExportAcknowledged(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--primary)]"
          />
          <span className="text-xs font-semibold leading-relaxed text-[var(--foreground)]">
            I have manually reviewed all document pages and placed opaque redaction masks over all sensitive financial information.
          </span>
        </label>

        <button
          type="button"
          onClick={() => void onExportResult()}
          disabled={isBusy || !exportAcknowledged || totalRedactions === 0}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--primary)] px-6 text-sm font-extrabold text-[var(--primary-foreground)] shadow-md transition-all hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:shadow-none"
        >
          {isBusy ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="size-5" aria-hidden="true" />
          )}
          <span>Generate Permanently Flattened Document</span>
        </button>
      </section>

      {/* Mandatory Inspection & Download Section */}
      {result && (
        <section className="rounded-3xl border-2 border-[var(--success)] bg-[var(--surface)] p-6 shadow-md sm:p-8">
          <div className="flex items-start gap-3.5 border-b border-[var(--border)] pb-5">
            <CheckCircle2 className="size-7 shrink-0 text-[var(--success)]" aria-hidden="true" />
            <div>
              <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
                Mandatory Final Inspection
              </h2>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)] sm:text-sm">
                Inspect every page in the output viewport below before unlocking the final download copy.
              </p>
            </div>
          </div>

          {/* Inspection Viewport */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--canvas)]">
            {result.type === "pdf" ? (
              <iframe
                src={result.url}
                title="Flattened redacted PDF preview"
                className="h-96 w-full bg-[var(--surface)]"
              />
            ) : (
              <div className="flex max-h-[70vh] justify-center overflow-auto p-4">
                <img
                  src={result.url}
                  alt="Flattened redacted image preview"
                  className="max-w-full rounded-xl border border-[var(--border)] shadow-sm"
                />
              </div>
            )}
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3.5 rounded-2xl border border-[var(--success)] bg-[var(--success-soft)] p-4">
            <input
              type="checkbox"
              checked={inspectionConfirmed}
              onChange={(e) => onChangeInspectionConfirmed(e.target.checked)}
              className="mt-0.5 size-4.5 accent-[var(--success)]"
            />
            <span className="text-xs font-bold leading-relaxed text-[var(--foreground)]">
              I have inspected the flattened output preview above across all {result.pageCount} page(s) and confirm no sensitive details are exposed.
            </span>
          </label>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold text-[var(--muted-foreground)]">
              <Eye className="size-4 text-[var(--primary)]" aria-hidden="true" />
              {result.name} · {formatBytes(result.blob.size)} · {result.redactionCount} Redactions Applied
            </span>

            <button
              type="button"
              disabled={!inspectionConfirmed}
              onClick={() => downloadBlob(result.blob, result.name)}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-[var(--success)] px-7 text-sm font-extrabold text-[var(--primary-foreground)] shadow-md transition-all hover:opacity-90 disabled:opacity-40 disabled:shadow-none"
            >
              <Download className="size-5" aria-hidden="true" />
              <span>Download Redacted Copy</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
