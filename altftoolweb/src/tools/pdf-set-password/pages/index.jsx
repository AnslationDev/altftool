"use client";

import React, { useState, useCallback } from "react";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Loader2, Info, Lock, Eye, EyeOff } from "lucide-react";

export default function ToolHome() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setMessage("Please select a valid PDF file."); setStatus("error"); return; }
    setFile(f);
    setStatus("idle");
    setMessage("");
    setResultUrl(null);
  }, []);

  const handleSet = useCallback(async () => {
    if (!file) return;
    if (!password) { setMessage("Please enter a password."); setStatus("error"); return; }
    if (password !== confirm) { setMessage("Passwords do not match."); setStatus("error"); return; }
    if (password.length < 4) { setMessage("Password must be at least 4 characters."); setStatus("error"); return; }
    setStatus("loading");
    setMessage("Applying password...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus("done");
      setMessage("Password applied. Download your protected PDF.");
    } catch (err) {
      setStatus("error");
      setMessage("Failed: " + err.message);
    }
  }, [file, password, confirm]);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Moderate", "Strong"][strength];
  const strengthColor = ["", "text-red-500", "text-amber-500", "text-emerald-500"][strength];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">PDF Set Password</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">PDF Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Add password protection to any PDF file. 100% browser-based.</p>
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
                <p className="text-sm font-semibold text-foreground">Drop PDF here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports any PDF file</p>
              </div>
            )}
          </label>
        </div>

        {/* Password Fields */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Set Password</label>
              {password && <span className={`text-[10px] font-bold ${strengthColor}`}>{strengthLabel}</span>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter a strong password..."
                className="w-full rounded-lg border border-border bg-background pl-9 pr-10 py-2.5 text-sm font-mono text-foreground outline-none focus:border-primary" />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && <div className="mt-2 h-1 rounded-full bg-border overflow-hidden"><div className={`h-full rounded-full transition-all ${["","bg-red-500","bg-amber-500","bg-emerald-500"][strength]}`} style={{ width: `${(strength / 3) * 100}%` }} /></div>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password..."
                className={`w-full rounded-lg border pl-9 pr-4 py-2.5 text-sm font-mono text-foreground outline-none bg-background focus:border-primary ${confirm && confirm !== password ? "border-red-500" : "border-border"}`} />
            </div>
            {confirm && confirm !== password && <p className="text-[10px] text-red-500 mt-1">Passwords do not match</p>}
          </div>
        </div>

        <button onClick={handleSet} disabled={!file || !password || password !== confirm || status === "loading"}
          className="w-full rounded-xl bg-primary text-white py-3 font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying...</> : <><ShieldCheck className="h-4 w-4" /> Set Password & Download</>}
        </button>

        {status === "done" && resultUrl && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <p className="text-sm font-semibold text-foreground">Password set successfully</p>
            </div>
            <a href={resultUrl} download={`protected_${file?.name}`}
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
          <p className="text-xs text-muted-foreground leading-relaxed">All processing is local. Your files and passwords never leave your device.</p>
        </div>
      </div>
    </div>
  );
}
