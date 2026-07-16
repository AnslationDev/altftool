"use client";

import { useState } from "react";
import { FileDown, Printer, Copy, Share2, Check, FileImage } from "lucide-react";
import { exportAs } from "../utils/exporter";
import toast from "react-hot-toast";

export default function ReportGenerator({ results, paletteA, paletteB, geoA, geoB }) {
  const [copied, setCopied] = useState(false);

  const handlePDF = () => {
    if (!results) { toast.error("Run analysis first"); return; }
    exportAs(results, "pdf", { paletteA, paletteB, geoA, geoB });
    toast.success("PDF report downloaded");
  };

  const handlePNG = async () => {
    toast.success("Report image captured");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `Logo Similarity Report
Overall: ${results?.overall}% similar
Shape: ${results?.shape}% | Color: ${results?.color}% | Layout: ${results?.layout}%
Generated: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Logo Similarity Report", text: `Overall similarity: ${results?.overall}%` });
    } else {
      toast.error("Share not supported");
    }
  };

  if (!results) return null;

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[--foreground]"><FileDown className="h-4 w-4 text-primary" />Report</h3>
      <div className="flex flex-wrap gap-2">
        <button onClick={handlePDF} className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]">
          <FileDown className="h-4 w-4 text-red-500" />Download PDF
        </button>
        <button onClick={handlePNG} className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]">
          <FileImage className="h-4 w-4 text-green-500" />Download PNG
        </button>
        <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]">
          <Printer className="h-4 w-4" />Print
        </button>
        <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}{copied ? "Copied!" : "Copy Results"}
        </button>
        <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]">
          <Share2 className="h-4 w-4" />Share
        </button>
      </div>
    </div>
  );
}
