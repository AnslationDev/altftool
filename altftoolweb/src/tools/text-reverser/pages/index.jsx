"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftRight, CheckCircle2, Copy, FileDown, FileText, RefreshCw } from "lucide-react";

export default function ToolHome() {
  const [input, setInput] = useState("Hello World! This text is reversed.");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("char"); // 'char' | 'word' | 'word-char' | 'line'
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    let result = "";
    switch (mode) {
      case "char":
        // Reverse everything character-by-character
        result = input.split("").reverse().join("");
        break;
      case "word":
        // Reverse word order, keeping character direction inside words
        result = input
          .split(/\s+/)
          .filter((token) => token !== "")
          .reverse()
          .join(" ");
        break;
      case "word-char":
        // Keep word order, but reverse characters inside each word.
        // Split on captured whitespace runs (including newlines) so line
        // breaks and word order are preserved; only non-whitespace tokens
        // get their letters reversed.
        result = input
          .split(/(\s+)/)
          .map((token) => (/\s/.test(token) ? token : token.split("").reverse().join("")))
          .join("");
        break;
      case "line":
        // Reverse order of lines
        result = input.split("\n").reverse().join("\n");
        break;
      default:
        result = input;
    }
    setOutput(result);
  }, [input, mode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  const handleDownload = () => {
    const textBlob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reversed-text.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <ArrowLeftRight className="h-5 w-5 text-primary group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Text Reverser
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Flip your text backwards, reverse word orders, or invert line hierarchies locally and securely in your browser.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Fast"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {[
              { id: "char", label: "Reverse Characters" },
              { id: "word", label: "Reverse Word Order" },
              { id: "word-char", label: "Reverse Words Internally" },
              { id: "line", label: "Reverse Lines" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setMode(btn.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  mode === btn.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border hover:bg-surface-soft text-foreground"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                Original Input Text
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or paste your text to reverse..."
                rows={8}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* Output */}
            <div className="space-y-2" aria-live="polite">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-primary" />
                  Reversed Output
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    aria-label={copyError ? "Copy failed" : copied ? "Copied to clipboard" : "Copy output"}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
                  >
                    {copied ? <CheckCircle2 size={12} className="text-primary" /> : <Copy size={12} />}
                    {copyError ? "Copy failed" : copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!output}
                    aria-label={downloaded ? "Downloaded" : "Download output"}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
                  >
                    {downloaded ? <CheckCircle2 size={12} className="text-primary" /> : <FileDown size={12} />}
                    {downloaded ? "Downloaded" : "Download"}
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Reversed output will appear here..."
                rows={8}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none resize-none cursor-text"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
