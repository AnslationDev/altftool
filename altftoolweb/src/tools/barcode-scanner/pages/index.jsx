"use client";

import { useRef, useState } from "react";
import { Camera, Lightbulb, ScanBarcode, ShieldCheck, UploadCloud } from "lucide-react";
import UploadPanel from "../components/UploadPanel";
import CameraPanel from "../components/CameraPanel";
import ResultCard from "../components/ResultCard";
import RecentScans from "../components/RecentScans";
import { decodeCanvas, imageToCanvas, loadImageFromFile, makeThumbnail } from "../utils/decodeEngine";
import { addScanToHistory, deleteScanFromHistory, getScanHistory } from "../utils/scanHistory";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BarcodeScannerPage() {
  const [mode, setMode] = useState("upload");
  const [scan, setScan] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(() => getScanHistory());
  const resultRef = useRef(null);

  const applyResult = (result, canvas, fileMeta) => {
    const scannedAt = Date.now();
    const nextScan = {
      value: result.value,
      format: result.format,
      image: canvas.toDataURL("image/jpeg", 0.85),
      dimensions: `${canvas.width} × ${canvas.height}`,
      scannedAt,
      scannedAtLabel: new Date(scannedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      ...fileMeta,
    };
    setScan(nextScan);
    setError("");
    setHistory(
      addScanToHistory({
        value: result.value,
        format: result.format,
        thumb: makeThumbnail(canvas),
        source: fileMeta.source,
        scannedAt,
      }),
    );
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleFile = async (file) => {
    setBusy(true);
    setError("");
    try {
      const { img, url } = await loadImageFromFile(file);
      const canvas = imageToCanvas(img);
      URL.revokeObjectURL(url);
      const result = await decodeCanvas(canvas);
      if (result) {
        applyResult(result, canvas, {
          fileName: file.name,
          fileSize: formatBytes(file.size),
          source: "Upload",
        });
      } else {
        setScan(null);
        setError("No barcode detected in this image");
      }
    } catch {
      setScan(null);
      setError(`Couldn't read "${file.name}" as an image`);
    } finally {
      setBusy(false);
    }
  };

  const handleCameraDetect = (result, canvas) => {
    const approxBytes = Math.round((canvas.toDataURL("image/jpeg", 0.85).length * 3) / 4);
    applyResult(result, canvas, {
      fileName: "camera-capture.jpg",
      fileSize: formatBytes(approxBytes),
      source: "Camera",
    });
  };

  const handleCopy = async () => {
    if (!scan) return;
    try {
      await navigator.clipboard.writeText(scan.value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.alert("Clipboard access isn't available in this browser.");
    }
  };

  const downloadBlob = (content, type, name) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = Object.assign(document.createElement("a"), { href: url, download: name });
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (scan) downloadBlob(scan.value, "text/plain;charset=utf-8", "decoded-barcode.txt");
  };

  const handleExportJson = () => {
    if (!scan) return;
    downloadBlob(
      JSON.stringify(
        {
          value: scan.value,
          format: scan.format,
          dimensions: scan.dimensions,
          fileName: scan.fileName,
          fileSize: scan.fileSize,
          source: scan.source,
          scannedAt: new Date(scan.scannedAt).toISOString(),
        },
        null,
        2,
      ),
      "application/json",
      "decoded-barcode.json",
    );
  };

  const modeButton = (target, Icon, label) => (
    <button
      type="button"
      aria-pressed={mode === target}
      onClick={() => setMode(target)}
      className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        mode === target
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted"
      }`}
    >
      <Icon aria-hidden="true" size={15} /> {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary">
              <ScanBarcode aria-hidden="true" size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Barcode Scanner
              </h1>
              <p className="text-sm text-muted-foreground">
                Scan and decode barcodes and QR codes instantly
              </p>
            </div>
          </div>
          <div className="flex gap-2" role="group" aria-label="Scan mode">
            {modeButton("upload", UploadCloud, "Upload")}
            {modeButton("camera", Camera, "Camera")}
          </div>
        </header>

        <div className="grid items-start gap-5 xl:grid-cols-12">
          {/* Input column */}
          <div className="min-w-0 space-y-4 xl:col-span-5">
            {mode === "upload" ? (
              <UploadPanel onFile={handleFile} busy={busy} />
            ) : (
              <CameraPanel onDetect={handleCameraDetect} />
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lightbulb aria-hidden="true" size={15} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Tip</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  For best results, use clear images and ensure the barcode is not blurred.
                </p>
              </div>
            </div>
          </div>

          {/* Result column */}
          <div ref={resultRef} className="min-w-0 scroll-mt-6 xl:col-span-7">
            <ResultCard
              scan={scan}
              error={error}
              onCopy={handleCopy}
              copied={copied}
              onDownloadTxt={handleDownloadTxt}
              onExportJson={handleExportJson}
            />
          </div>
        </div>

        <RecentScans history={history} onDelete={(id) => setHistory(deleteScanFromHistory(id))} />

        <p className="flex items-center justify-center gap-2 pb-2 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden="true" size={14} className="text-primary" />
          Your data is processed locally — images never leave your browser.
        </p>
      </div>
    </main>
  );
}
