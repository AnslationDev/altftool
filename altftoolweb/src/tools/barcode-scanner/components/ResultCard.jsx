"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  ScanBarcode,
} from "lucide-react";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-xs font-semibold text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}

export default function ResultCard({ scan, error, onCopy, copied, onDownloadTxt, onExportJson }) {
  return (
    <section aria-label="Scan result" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Scan Result</h2>
        {scan && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
            <CheckCircle2 aria-hidden="true" size={13} /> Success
          </span>
        )}
        {!scan && error && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
            <AlertTriangle aria-hidden="true" size={13} /> Not detected
          </span>
        )}
      </div>

      {!scan && !error && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-6 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ScanBarcode aria-hidden="true" size={22} />
          </span>
          <h3 className="text-sm font-semibold text-foreground">No scan yet</h3>
          <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            Upload an image or start the camera — the decoded barcode appears here.
          </p>
        </div>
      )}

      {!scan && error && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-danger/40 bg-danger-soft/40 p-6 text-center" role="alert">
          <AlertTriangle aria-hidden="true" size={26} className="mb-3 text-danger" />
          <h3 className="text-sm font-semibold text-foreground">{error}</h3>
          <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            Try a sharper, well-lit image where the code fills more of the frame.
          </p>
        </div>
      )}

      {scan && (
        <>
          <div className="flex flex-col gap-5 lg:flex-row">
            {/* Scanned image */}
            <div className="flex shrink-0 items-center justify-center self-start rounded-xl border border-border bg-background p-3 lg:w-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scan.image}
                alt={`Scanned ${scan.format}`}
                className="max-h-52 w-full rounded-lg object-contain"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-sm font-semibold text-foreground">Barcode Type</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {scan.format}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-foreground">Decoded Value</p>
              <div className="mt-1.5 flex items-stretch gap-0 overflow-hidden rounded-xl border border-primary/30 bg-primary/5">
                <p className="min-w-0 flex-1 break-all px-3 py-2.5 font-mono text-sm font-semibold text-foreground">
                  {scan.value}
                </p>
                <button
                  type="button"
                  onClick={onCopy}
                  className="flex shrink-0 items-center gap-1.5 border-l border-primary/20 bg-card px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {copied ? (
                    <Check aria-hidden="true" size={13} className="text-success" />
                  ) : (
                    <Copy aria-hidden="true" size={13} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="mt-4 text-sm font-semibold text-foreground">Additional Info</p>
              <div className="mt-1.5 grid gap-x-6 sm:grid-cols-2">
                <dl className="divide-y divide-border">
                  <InfoRow label="Format" value={scan.format} />
                  <InfoRow label="Dimensions" value={scan.dimensions} />
                  <InfoRow label="Scan Time" value={scan.scannedAtLabel} />
                </dl>
                <dl className="divide-y divide-border">
                  <InfoRow label="File Name" value={scan.fileName} />
                  <InfoRow label="File Size" value={scan.fileSize} />
                  <InfoRow label="Scan Source" value={scan.source} />
                </dl>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {copied ? (
                <Check aria-hidden="true" size={14} className="text-success" />
              ) : (
                <Copy aria-hidden="true" size={14} />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={onDownloadTxt}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Download aria-hidden="true" size={14} /> Download TXT
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <FileCode2 aria-hidden="true" size={14} /> Export JSON
            </button>
          </div>
        </>
      )}
    </section>
  );
}
