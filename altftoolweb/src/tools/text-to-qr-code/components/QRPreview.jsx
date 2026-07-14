"use client";

import { useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Download,
  Copy,
  Printer,
  Share2,
  Check,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

export default function QRPreview({
  computedValue,
  fgColor,
  bgColor,
  transparentBg,
  size,
  margin,
  errorLevel,
  customLogo,
}) {
  const [downloadFormat, setDownloadFormat] = useState("png");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const hasContent = computedValue && computedValue.trim().length > 0;

  const getCanvas = useCallback(() => {
    if (typeof document === "undefined") return null;
    return document.getElementById("qr-canvas-output");
  }, []);

  function downloadQR() {
    const canvas = getCanvas();
    if (!canvas) return;

    if (downloadFormat === "svg") {
      const parent = canvas.parentElement;
      const svgEl = parent?.querySelector("svg");
      if (!svgEl) {
        const dataUrl = canvas.toDataURL("image/png");
        triggerDownload(dataUrl, "qr-code.png");
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, "qr-code.svg");
      URL.revokeObjectURL(url);
      return;
    }

    const dataUrl = canvas.toDataURL(
      downloadFormat === "jpeg" ? "image/jpeg" : "image/png",
      0.95
    );
    triggerDownload(dataUrl, `qr-code.${downloadFormat}`);
  }

  function triggerDownload(href, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = href;
    link.click();
  }

  async function copyQRImage() {
    const canvas = getCanvas();
    if (!canvas) return;
    try {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
        return;
      }
    } catch {}
    const dataUrl = canvas.toDataURL("image/png");
    const ok = await safeCopyText(dataUrl);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1400);
  }

  function printQR() {
    const canvas = getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("");
    if (!win) return;
    win.document.write(
      `<html><head><title>Print QR Code</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;}img{max-width:90vw;max-height:90vh;}</style></head><body><img src="${dataUrl}" onload="window.print();window.close();" /></body></html>`
    );
    win.document.close();
  }

  async function shareQR() {
    const canvas = getCanvas();
    if (!canvas) return;
    if (navigator.share) {
      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          const file = new File([blob], "qr-code.png", { type: "image/png" });
          await navigator.share({ files: [file], title: "QR Code" });
          setShared(true);
          setTimeout(() => setShared(false), 1400);
          return;
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    const dataUrl = canvas.toDataURL("image/png");
    const ok = await safeCopyText(dataUrl);
    setShared(ok);
    if (ok) setTimeout(() => setShared(false), 1400);
  }

  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-md sticky top-8">
      <div
        className={`rounded-2xl p-6 shadow-inner transition-transform hover:scale-[1.02] flex items-center justify-center ${
          transparentBg
            ? "bg-[repeating-conic-gradient(rgba(128,128,128,0.15)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
            : "border border-(--border)"
        }`}
        style={!transparentBg ? { backgroundColor: bgColor } : undefined}
      >
        {hasContent ? (
          <QRCodeCanvas
            id="qr-canvas-output"
            value={computedValue}
            size={size}
            bgColor={transparentBg ? "transparent" : bgColor}
            fgColor={fgColor}
            level={errorLevel}
            includeMargin={margin > 0}
            marginSize={margin}
            imageSettings={
              customLogo
                ? {
                    src: customLogo,
                    height: Math.round(size * 0.18),
                    width: Math.round(size * 0.18),
                    excavate: true,
                  }
                : undefined
            }
          />
        ) : (
          <div className="h-48 w-48 bg-(--muted) rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-xs font-semibold text-(--muted-foreground)">
              Enter content
            </span>
          </div>
        )}
      </div>

      {hasContent && (
        <>
          <div className="mt-6 w-full space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
                Format
              </label>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                className="px-3 py-1.5 bg-(--background) border border-(--border) rounded-lg text-sm font-semibold"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>

            <button
              onClick={downloadQR}
              className="w-full py-3 rounded-xl bg-(--primary) text-white font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
          </div>

          <div className="mt-3 w-full grid grid-cols-3 gap-2">
            <button
              onClick={copyQRImage}
              className="py-2.5 rounded-xl border border-(--border) bg-(--background) text-(--foreground) font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-(--primary) hover:text-(--primary) transition-all"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={printQR}
              className="py-2.5 rounded-xl border border-(--border) bg-(--background) text-(--foreground) font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-(--primary) hover:text-(--primary) transition-all"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={shareQR}
              className="py-2.5 rounded-xl border border-(--border) bg-(--background) text-(--foreground) font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-(--primary) hover:text-(--primary) transition-all"
            >
              {shared ? <Check size={14} /> : <Share2 size={14} />}
              {shared ? "Shared" : "Share"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
