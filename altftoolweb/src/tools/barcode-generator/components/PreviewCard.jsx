"use client";

import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { AlertTriangle, Bookmark, Check, Copy, Download } from "lucide-react";

const EXPORT_FORMATS = ["PNG", "SVG", "PDF", "EPS"];

export default function PreviewCard({
  canvasRef,
  svgRef,
  qrContainerRef,
  isQr,
  qrProps,
  data,
  showCode,
  error,
  exportFormat,
  onExportFormatChange,
  onDownload,
  onCopy,
  copied,
  onSaveHistory,
  saved,
}) {
  const actionsDisabled = !!error || !data.trim();

  return (
    <section
      aria-label="Barcode preview"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          {/* Export format tabs */}
          <div role="group" aria-label="Export format" className="mb-3 flex flex-wrap gap-1.5">
            {EXPORT_FORMATS.map((format) => {
              const disabled = format === "EPS" && isQr;
              const active = exportFormat === format;
              return (
                <button
                  key={format}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  title={disabled ? "EPS export is available for 1D barcodes only" : undefined}
                  onClick={() => onExportFormatChange(format)}
                  className={`inline-flex min-h-8 items-center rounded-lg px-3.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {format}
                </button>
              );
            })}
          </div>

          {/* Preview surface */}
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 overflow-auto rounded-xl border border-border bg-background p-4">
            {error ? (
              <div className="flex flex-col items-center gap-2 text-center" role="alert">
                <AlertTriangle aria-hidden="true" size={28} className="text-danger" />
                <p className="text-sm font-semibold text-danger">{error}</p>
                <p className="text-xs text-muted-foreground">
                  Check the format&apos;s requirements in step 1 or load its example.
                </p>
              </div>
            ) : (
              <>
                <canvas ref={canvasRef} className={isQr ? "hidden" : "max-w-full"} />
                <div ref={qrContainerRef} className={isQr ? "" : "hidden"}>
                  {isQr && <QRCodeCanvas {...qrProps} />}
                </div>
                {showCode && data.trim() && (
                  <p className="max-w-full truncate font-mono text-sm font-bold tracking-wider text-foreground">
                    {data}
                  </p>
                )}
              </>
            )}
            {/* Hidden vector twins used by SVG / EPS export */}
            <svg ref={svgRef} className="hidden" aria-hidden="true" />
            {isQr && (
              <div className="hidden" aria-hidden="true" data-qr-svg>
                <QRCodeSVG {...qrProps} />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-row flex-wrap gap-2 lg:w-44 lg:flex-col">
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={onDownload}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
          >
            <Download aria-hidden="true" size={15} /> Download
          </button>
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={onCopy}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
          >
            {copied ? (
              <Check aria-hidden="true" size={15} className="text-success" />
            ) : (
              <Copy aria-hidden="true" size={15} />
            )}
            {copied ? "Copied!" : "Copy Image"}
          </button>
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={onSaveHistory}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
          >
            {saved ? (
              <Check aria-hidden="true" size={15} className="text-success" />
            ) : (
              <Bookmark aria-hidden="true" size={15} />
            )}
            {saved ? "Saved!" : "Save to History"}
          </button>
        </div>
      </div>
    </section>
  );
}
