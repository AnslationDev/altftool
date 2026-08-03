"use client";

import { Download, Copy, Printer, Image } from "lucide-react";
import { exportFormats } from "../constants/styles";
import { downloadCanvas, copyCanvasToClipboard } from "../utils/imageFilters";

export default function ExportOptions({ canvasRef, format, setFormat, quality, setQuality, previewUrl, isProcessing }) {
  const handleDownload = () => {
    const selectedFormat = exportFormats.find((f) => f.id === format);
    if (!selectedFormat || !canvasRef?.current) return;
    downloadCanvas(canvasRef.current, format, quality, `cartoon.${selectedFormat.extension}`);
  };

  const handleCopy = async () => {
    if (!canvasRef?.current) return;
    const copied = await copyCanvasToClipboard(canvasRef.current);
    if (copied) {
      alert("Image copied to clipboard!");
    } else {
      alert("Couldn't copy the image — your browser may not support copying images to the clipboard. Try Download HD instead.");
    }
  };

  const handlePrint = () => {
    if (!canvasRef?.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const win = window.open("");
    if (win) {
      win.document.write(`<img src="${dataUrl}" alt="Cartoon image" style="max-width:100%" />`);
      win.print();
    }
  };

  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-5 w-5 text-(--primary)" />
        <h3 className="text-lg font-semibold text-(--foreground)">Export Options</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-(--foreground) block mb-2">Format</label>
          <div className="tool-tab-grid">
            {exportFormats.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border transition ${
                  format === f.id
                    ? "border-(--primary) bg-(--primary) text-white"
                    : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {format !== "png" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-(--foreground)" htmlFor="export-quality">
                Quality
              </label>
              <span className="text-xs font-semibold text-(--primary)">{Math.round(quality * 100)}%</span>
            </div>
            <input
              id="export-quality"
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-(--muted) accent-(--primary)"
            />
          </div>
        )}

        <div className="tool-action-grid">
          <button
            onClick={handleDownload}
            disabled={!previewUrl || isProcessing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-(--primary) text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Download HD
          </button>
          <button
            onClick={handleCopy}
            disabled={!previewUrl || isProcessing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-(--card) border border-(--border) text-(--foreground) rounded-lg hover:border-(--primary) transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="h-4 w-4" />
            Copy Image
          </button>
          <button
            onClick={handlePrint}
            disabled={!previewUrl || isProcessing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-(--card) border border-(--border) text-(--foreground) rounded-lg hover:border-(--primary) transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
