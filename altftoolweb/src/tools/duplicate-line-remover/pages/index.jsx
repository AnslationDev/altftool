"use client";

import React, { useState, useEffect } from "react";
import { ListX, CheckCircle2, Copy, FileDown, FileText, BarChart3 } from "lucide-react";

export default function ToolHome() {
  const [input, setInput] = useState(
    "Apple\nOrange\nBanana\nApple\nbanana\nOrange\n\nGrape"
  );
  const [output, setOutput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  
  const [stats, setStats] = useState({
    original: 0,
    unique: 0,
    removed: 0,
    pct: 0
  });

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput("");
      setStats({ original: 0, unique: 0, removed: 0, pct: 0 });
      return;
    }

    const lines = input.split(/\r?\n/);
    const originalCount = lines.length;

    const seen = new Set();
    const uniqueLines = [];

    lines.forEach((line) => {
      let processed = line;
      if (trimWhitespace) {
        processed = processed.trim();
      }

      if (removeEmpty && processed === "") {
        return; // skip empty
      }

      const matchKey = caseSensitive ? processed : processed.toLowerCase();

      if (!seen.has(matchKey)) {
        seen.add(matchKey);
        uniqueLines.push(line); // keep original format line
      }
    });

    const resultText = uniqueLines.join("\n");
    setOutput(resultText);

    const uniqueCount = uniqueLines.length;
    const removedCount = originalCount - uniqueCount;
    const pct = originalCount > 0 ? ((removedCount / originalCount) * 100).toFixed(1) : 0;

    setStats({
      original: originalCount,
      unique: uniqueCount,
      removed: removedCount,
      pct
    });
  }, [input, caseSensitive, trimWhitespace, removeEmpty]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const textBlob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deduplicated-text.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const loadSample = () => {
    setInput(
      "item1\nitem2\nitem1\nitem3\n  item2  \nITEM1\n\nitem4"
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <ListX className="h-5 w-5 text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Duplicate Line Remover
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Deduplicate lists, code scripts, or log files. Filter out recurring elements with custom case, trimming, and empty line options.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Clean"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs & Outputs Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Input Text Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} className="text-primary" />
                      Original Text
                    </label>
                    <button
                      onClick={loadSample}
                      className="text-[10px] font-bold text-primary hover:underline px-2 py-0.5 bg-primary/5 rounded"
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter list lines..."
                    rows={12}
                    className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                {/* Output Text Area */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <ListX size={14} className="text-primary" />
                      Deduplicated Output
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={handleCopy}
                        disabled={!output}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2 py-1 hover:border-primary transition disabled:opacity-50 shrink-0"
                      >
                        {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={!output}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2 py-1 hover:border-primary transition disabled:opacity-50 shrink-0"
                      >
                        {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                        {downloaded ? "Downloaded" : "Download"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={output}
                    readOnly
                    placeholder="Deduplicated results..."
                    rows={12}
                    className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none resize-none cursor-text"
                  />
                </div>

              </div>

              {/* Checkbox Options */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border mt-4">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Case Sensitive Match (e.g. apple ≠ Apple)
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={trimWhitespace}
                    onChange={(e) => setTrimWhitespace(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Trim Spacing (Ignore leading/trailing spaces)
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={removeEmpty}
                    onChange={(e) => setRemoveEmpty(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Remove Empty Lines
                </label>
              </div>

            </div>
          </div>

          {/* Sidebar: Statistics & Analysis */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-primary" />
                Deduplication Analysis
              </h2>

              <div className="flex flex-col gap-3">
                
                {/* Original Lines */}
                <div className="bg-surface-soft border border-border rounded-xl p-3.5 flex items-center justify-between min-w-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Lines</span>
                  <span className="text-lg sm:text-xl font-black text-foreground font-mono">{stats.original}</span>
                </div>

                {/* Unique Lines */}
                <div className="bg-surface-soft border border-border rounded-xl p-3.5 flex items-center justify-between min-w-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">Unique Lines</span>
                  <span className="text-lg sm:text-xl font-black text-primary font-mono">{stats.unique}</span>
                </div>

                {/* Removed Lines */}
                <div className="bg-surface-soft border border-border rounded-xl p-3.5 flex items-center justify-between min-w-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">Removed</span>
                  <span className="text-lg sm:text-xl font-black text-red-500 font-mono">{stats.removed}</span>
                </div>

                {/* Duplicate Percentage */}
                <div className="bg-surface-soft border border-border rounded-xl p-3.5 flex items-center justify-between min-w-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">Duplicate Pct</span>
                  <span className="text-lg sm:text-xl font-black text-primary font-mono">{stats.pct}%</span>
                </div>

              </div>

              {stats.removed > 0 && (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-xs leading-relaxed text-primary">
                  🎉 Successfully scanned list and purged **{stats.removed} duplicate lines** from final output.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
