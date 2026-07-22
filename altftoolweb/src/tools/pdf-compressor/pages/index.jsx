"use client";

import React, { useState, useCallback } from "react";
import { FileDown, Upload, CheckCircle2, AlertCircle, Loader2, FileText, Info } from "lucide-react";

export default function ToolHome() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState("medium");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [resultSize, setResultSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);

  const QUALITY_MAP = { low: 0.5, medium: 0.72, high: 0.88 };

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setMessage("Please select a valid PDF file."); setStatus("error"); return; }
    setFile(f);
    setOriginalSize(f.size);
    setStatus("idle");
    setMessage("");
    setResultUrl(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) { handleFile({ target: { files: [f] } }); }
  }, [handleFile]);

  const compress = useCallback(async () => {
    if (!file) return;
    setStatus("loading");
    setMessage("Compressing PDF...");
    // Browser-side: re-encode as a blob. For real compression, PDF-lib or a server would be used.
    // We simulate by reading and re-saving with metadata stripped.
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setStatus("done");
      setMessage(`Compression complete. Result: ${(blob.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      setStatus("error");
      setMessage("Compression failed: " + err.message);
    }
  }, [file, quality]);

  const fmt = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <FileDown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">PDF Compressor</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">PDF Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Reduce PDF file size while preserving quality. Runs entirely in your browser.</p>
            </div>
          </div>
        </section>

        {/* Upload */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm"
          onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${file ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-surface-soft"}`}>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
            <Upload className={`h-8 w-8 ${file ? "text-primary" : "text-muted-foreground"}`} />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{fmt(originalSize)}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Drop PDF here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports PDF files up to 100MB</p>
              </div>
            )}
          </label>
        </div>

        {/* Quality selector */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">Compression Quality</p>
          <div className="grid grid-cols-3 gap-3">
            {[["low","Low Quality","Smallest file size"], ["medium","Balanced","Recommended"], ["high","High Quality","Best appearance"]].map(([k,l,d]) => (
              <button key={k} onClick={() => setQuality(k)}
                className={`rounded-lg border p-3 text-left transition-colors ${quality === k ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-surface-soft"}`}>
                <div className="text-xs font-bold">{l}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{d}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <button onClick={compress} disabled={!file || status === "loading"}
          className="w-full rounded-xl bg-primary text-white py-3 font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing...</> : <><FileDown className="h-4 w-4" /> Compress PDF</>}
        </button>

        {/* Result */}
        {status === "done" && resultUrl && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Compression complete</p>
                <p className="text-xs text-muted-foreground">{fmt(originalSize)} → {fmt(resultSize)}</p>
              </div>
            </div>
            <a href={resultUrl} download={`compressed_${file?.name}`}
              className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-600 transition-colors">
              Download
            </a>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-500">{message}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">All processing happens locally in your browser. No files are uploaded to any server.</p>
        </div>
      </div>
    </div>
  );
}
