"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpDown, CheckCircle2, Copy, FileDown, FileText } from "lucide-react";

export default function ToolHome() {
  const [input, setInput] = useState("Orange\nApple\nbanana\nPineapple\nGrape");
  const [output, setOutput] = useState("");
  const [sortMode, setSortMode] = useState("alpha-asc"); // 'alpha-asc' | 'alpha-desc' | 'num-asc' | 'num-desc' | 'len-asc' | 'len-desc' | 'reverse' | 'shuffle'
  const [separator, setSeparator] = useState("\n");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimItems, setTrimItems] = useState(true);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    // Split items by separator
    let items = [];
    if (separator === "\n") {
      items = input.split(/\r?\n/);
    } else {
      items = input.split(separator);
    }

    // Optional Trim
    if (trimItems) {
      items = items.map((item) => item.trim()).filter((item) => item !== "");
    }

    // Sort operations
    switch (sortMode) {
      case "alpha-asc":
        items.sort((a, b) => {
          const valA = caseSensitive ? a : a.toLowerCase();
          const valB = caseSensitive ? b : b.toLowerCase();
          return valA.localeCompare(valB);
        });
        break;
      case "alpha-desc":
        items.sort((a, b) => {
          const valA = caseSensitive ? a : a.toLowerCase();
          const valB = caseSensitive ? b : b.toLowerCase();
          return valB.localeCompare(valA);
        });
        break;
      case "num-asc":
        items.sort((a, b) => {
          const numA = parseFloat(a.replace(/[^0-9.-]/g, "")) || 0;
          const numB = parseFloat(b.replace(/[^0-9.-]/g, "")) || 0;
          return numA - numB;
        });
        break;
      case "num-desc":
        items.sort((a, b) => {
          const numA = parseFloat(a.replace(/[^0-9.-]/g, "")) || 0;
          const numB = parseFloat(b.replace(/[^0-9.-]/g, "")) || 0;
          return numB - numA;
        });
        break;
      case "len-asc":
        items.sort((a, b) => a.length - b.length || a.localeCompare(b));
        break;
      case "len-desc":
        items.sort((a, b) => b.length - a.length || b.localeCompare(a));
        break;
      case "reverse":
        items.reverse();
        break;
      case "shuffle":
        // Fisher-Yates shuffle
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        break;
      default:
        break;
    }

    setOutput(items.join(separator));
  }, [input, sortMode, separator, caseSensitive, trimItems]);

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
    link.download = `sorted-list.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const loadSample = (type) => {
    if (type === "num") {
      setInput("100\n5\n42\n23.5\n-10\n18");
      setSortMode("num-asc");
    } else {
      setInput("Banana\nApple\ncherry\nDate\nFig\nApricot");
      setSortMode("alpha-asc");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <ArrowUpDown className="h-5 w-5 text-primary group-hover:translate-y-[-2px] group-hover:scale-115 transition-all duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    List Sorter
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Sort collections of names, numbers, or records. Customize delimiters, casing rules, or sort by word length.
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

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "alpha-asc", label: "A-Z" },
                { id: "alpha-desc", label: "Z-A" },
                { id: "num-asc", label: "0-9 Ascending" },
                { id: "num-desc", label: "9-0 Descending" },
                { id: "len-asc", label: "Shortest First" },
                { id: "len-desc", label: "Longest First" },
                { id: "reverse", label: "Reverse List" },
                { id: "shuffle", label: "Shuffle List" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSortMode(btn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    sortMode === btn.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-surface-soft text-foreground"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => loadSample("text")}
                className="text-[10px] font-bold text-primary hover:underline px-2 py-1 bg-primary/5 rounded"
              >
                Text Sample
              </button>
              <button
                onClick={() => loadSample("num")}
                className="text-[10px] font-bold text-primary hover:underline px-2 py-1 bg-primary/5 rounded"
              >
                Numeric Sample
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                Original List Input
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter list lines..."
                rows={10}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* Output Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-primary" />
                  Sorted List Output
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
                  >
                    {copied ? <CheckCircle2 size={12} className="text-primary" /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!output}
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
                placeholder="Sorted results..."
                rows={10}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none resize-none cursor-text"
              />
            </div>

          </div>

          {/* Configuration Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border mt-4">
            
            {/* List Delimiter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                List Separator
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="\n">New Line</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            {/* Other checkboxes */}
            <div className="flex flex-col justify-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  disabled={sortMode.includes("num") || sortMode === "reverse" || sortMode === "shuffle"}
                  className="rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                />
                Case Sensitive Sorting
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trimItems}
                  onChange={(e) => setTrimItems(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Trim Whitespace & Skip Empty
              </label>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
