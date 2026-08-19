"use client";

import React, { useState, useCallback, useEffect } from "react";
import { KeyRound, Upload, CheckCircle2, AlertCircle, Loader2, Info, Lock } from "lucide-react";
import { decryptPDF } from "@pdfsmaller/pdf-decrypt";

export default function ToolHome() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [resultUrl, setResultUrl] = useState(null);

  // Revoke the blob URL on unmount so we don't leak it.
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setMessage("Please select a valid PDF file."); setStatus("error"); return; }
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(f);
    setStatus("idle");
    setMessage("");
    setResultUrl(null);
  }, [resultUrl]);

  const handleRemove = useCallback(async () => {
    if (!file || !password) return;
    setStatus("loading");
    setMessage("Processing PDF...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decryptedBytes = await decryptPDF(new Uint8Array(arrayBuffer), password);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const blob = new Blob([decryptedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus("done");
      setMessage("Password removed successfully. Download your unlocked PDF.");
    } catch (err) {
      setStatus("error");
      setMessage("Failed to remove password: " + (err?.message || "Unknown error."));
    }
  }, [file, password, resultUrl]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">PDF Delete Password</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">PDF Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Remove password protection from PDF files. Runs in your browser.</p>
            </div>
          </div>
        </section>

        {/* Upload */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${file ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-surface-soft"}`}>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
            <Upload className={`h-8 w-8 ${file ? "text-primary" : "text-muted-foreground"}`} />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Drop password-protected PDF here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </div>
            )}
          </label>
        </div>

        {/* Password Input */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <label htmlFor="pdf-password" className="text-xs font-medium text-muted-foreground mb-1.5 block">Current PDF Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input id="pdf-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter current password..."
              className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm font-mono text-foreground outline-none focus:border-primary" />
          </div>
        </div>

        <button onClick={handleRemove} disabled={!file || !password || status === "loading"}
          className="w-full rounded-xl bg-primary text-white py-3 font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><KeyRound className="h-4 w-4" /> Remove Password</>}
        </button>

        {status === "done" && resultUrl && (
          <div role="status" aria-live="polite" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <p className="text-sm font-semibold text-foreground">Password removed successfully</p>
            </div>
            <a href={resultUrl} download={`unlocked_${file?.name}`}
              className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-600 transition-colors">
              Download
            </a>
          </div>
        )}
        {status === "error" && (
          <div role="alert" aria-live="assertive" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-500">{message}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">Files are processed locally. No data is sent to any server. Only remove passwords from PDFs you own or have explicit permission to modify.</p>
        </div>
      </div>
    </div>
  );
}
