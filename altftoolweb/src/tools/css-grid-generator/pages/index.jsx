"use client";

import React, { useState, useEffect, useRef } from "react";
import { Grid, CheckCircle2, Copy, FileDown, Sliders, RefreshCw, LayoutGrid } from "lucide-react";

export default function ToolHome() {
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);
  const [colGap, setColGap] = useState(12);
  const [rowGap, setRowGap] = useState(12);

  // Individual track sizes state (stored as arrays of strings)
  const [colSizes, setColSizes] = useState(["1fr", "1fr", "1fr", "1fr", "1fr", "1fr", "1fr", "1fr"]);
  const [rowSizes, setRowSizes] = useState(["1fr", "1fr", "1fr", "1fr", "1fr", "1fr", "1fr", "1fr"]);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const copyTimerRef = useRef(null);
  const downloadTimerRef = useRef(null);

  // Clear any pending "Copied"/"Downloaded" reset timers on unmount so they
  // never call setState after this page has gone away.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    };
  }, []);

  const updateColumnCount = (nextCount) => {
    setCols(nextCount);
    setColSizes((current) =>
      current.length < nextCount
        ? [...current, ...Array(nextCount - current.length).fill("1fr")]
        : current,
    );
  };

  const updateRowCount = (nextCount) => {
    setRows(nextCount);
    setRowSizes((current) =>
      current.length < nextCount
        ? [...current, ...Array(nextCount - current.length).fill("1fr")]
        : current,
    );
  };

  const toggleColSize = (index) => {
    const units = ["1fr", "2fr", "auto", "120px"];
    const current = colSizes[index];
    const nextIdx = (units.indexOf(current) + 1) % units.length;
    const updated = [...colSizes];
    updated[index] = units[nextIdx];
    setColSizes(updated);
  };

  const toggleRowSize = (index) => {
    const units = ["1fr", "2fr", "auto", "80px"];
    const current = rowSizes[index];
    const nextIdx = (units.indexOf(current) + 1) % units.length;
    const updated = [...rowSizes];
    updated[index] = units[nextIdx];
    setRowSizes(updated);
  };

  const getTemplateColumnsString = () => {
    return colSizes.slice(0, cols).join(" ");
  };

  const getTemplateRowsString = () => {
    return rowSizes.slice(0, rows).join(" ");
  };

  const getCssString = () => {
    return `.grid-container {\n  display: grid;\n  grid-template-columns: ${getTemplateColumnsString()};\n  grid-template-rows: ${getTemplateRowsString()};\n  gap: ${rowGap}px ${colGap}px;\n}`;
  };

  const getHtmlString = () => {
    const totalCells = cols * rows;
    let divElements = "";
    for (let i = 1; i <= totalCells; i++) {
      divElements += `  <div class="grid-item">${i}</div>\n`;
    }
    return `<div class="grid-container">\n${divElements}</div>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCssString());
      setCopied(true);
      setStatusMessage("CSS copied to clipboard.");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
      setStatusMessage("Could not copy CSS to clipboard.");
    }
  };

  const handleDownload = () => {
    const fileContent = `/* CSS Stylesheet */\n${getCssString()}\n\n<!-- HTML Structure -->\n${getHtmlString()}`;
    const textBlob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "grid-layout-template.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setStatusMessage("Grid template file downloaded.");
    if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    downloadTimerRef.current = setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Grid className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-350" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    CSS Grid Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Design, Layout
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Design powerful CSS Grid systems. Adjust column/row tracks, interactive sizing keys (`1fr`, `2fr`, `auto`, `px`), row/column gaps, and extract clean CSS.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Grid Layout", "CSS3 Grid", "Interactive"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Preview Box (Full Width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid size={14} className="text-primary" />
            Grid Container Visualizer
          </span>

          {/* Grid Playground */}
          <div
            className="w-full min-h-[220px] rounded-xl border border-border bg-canvas p-4 transition-all overflow-auto"
            style={{
              display: "grid",
              gridTemplateColumns: getTemplateColumnsString(),
              gridTemplateRows: getTemplateRowsString(),
              gap: `${rowGap}px ${colGap}px`,
            }}
          >
            {Array.from({ length: cols * rows }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface-soft border border-border hover:border-primary/50 text-foreground text-xs font-black min-h-[50px] p-2 flex items-center justify-center rounded-lg transition select-none"
              >
                <span>{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Layout - Controls and Generated CSS Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Sliders size={14} className="text-primary" />
              Grid Structure Controls
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Column Count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <label htmlFor="grid-gen-cols">Columns</label>
                  <span className="text-primary font-mono" aria-hidden="true">{cols}</span>
                </div>
                <input
                  id="grid-gen-cols"
                  type="range"
                  min="1"
                  max="8"
                  value={cols}
                  onChange={(e) => updateColumnCount(Number.parseInt(e.target.value, 10))}
                  aria-valuetext={`${cols} columns`}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Row Count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <label htmlFor="grid-gen-rows">Rows</label>
                  <span className="text-primary font-mono" aria-hidden="true">{rows}</span>
                </div>
                <input
                  id="grid-gen-rows"
                  type="range"
                  min="1"
                  max="8"
                  value={rows}
                  onChange={(e) => updateRowCount(Number.parseInt(e.target.value, 10))}
                  aria-valuetext={`${rows} rows`}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Column Gap */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <label htmlFor="grid-gen-col-gap">Column Gap</label>
                  <span className="text-primary font-mono" aria-hidden="true">{colGap}px</span>
                </div>
                <input
                  id="grid-gen-col-gap"
                  type="range"
                  min="0"
                  max="40"
                  value={colGap}
                  onChange={(e) => setColGap(parseInt(e.target.value))}
                  aria-valuetext={`${colGap} pixels`}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Row Gap */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <label htmlFor="grid-gen-row-gap">Row Gap</label>
                  <span className="text-primary font-mono" aria-hidden="true">{rowGap}px</span>
                </div>
                <input
                  id="grid-gen-row-gap"
                  type="range"
                  min="0"
                  max="40"
                  value={rowGap}
                  onChange={(e) => setRowGap(parseInt(e.target.value))}
                  aria-valuetext={`${rowGap} pixels`}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

            </div>

            {/* Column Track Sizes list */}
            <div className="space-y-3 pt-4 border-t border-border mt-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Column Track Sizing (Click to Cycle units)
              </span>
              <div className="flex flex-wrap gap-2">
                {colSizes.slice(0, cols).map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleColSize(idx)}
                    className="px-3 py-1.5 bg-surface-soft border border-border hover:border-primary text-xs font-bold text-foreground rounded-lg transition"
                  >
                    Col {idx + 1}: <span className="text-primary font-mono">{size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row Track Sizes list */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Row Track Sizing (Click to Cycle units)
              </span>
              <div className="flex flex-wrap gap-2">
                {rowSizes.slice(0, rows).map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleRowSize(idx)}
                    className="px-3 py-1.5 bg-surface-soft border border-border hover:border-primary text-xs font-bold text-foreground rounded-lg transition"
                  >
                    Row {idx + 1}: <span className="text-primary font-mono">{size}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Generated CSS Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-primary" />
                Generated CSS Styles
              </span>
              
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  aria-label={copied ? "Copied the generated CSS to the clipboard" : "Copy the generated CSS"}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  aria-label={downloaded ? "Downloaded the grid template file" : "Download the grid template file"}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                  {downloaded ? "Downloaded" : "Download"}
                </button>
                <span className="sr-only" aria-live="polite" role="status">
                  {statusMessage}
                </span>
              </div>
            </div>

            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-[10px] text-foreground space-y-2 select-all max-h-[200px] overflow-y-auto leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre-wrap">{getCssString()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
