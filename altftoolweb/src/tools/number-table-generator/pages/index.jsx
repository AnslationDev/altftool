"use client";

import React, { useState, useMemo } from "react";
import { Table2, Download, Settings2, RefreshCw } from "lucide-react";

export default function ToolHome() {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(12);
  const [highlight, setHighlight] = useState("");

  const tables = useMemo(() => {
    const s = Math.max(1, Math.min(start, 100));
    const e = Math.max(s, Math.min(end, 100));
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }, [start, end]);

  const hlNum = parseInt(highlight) || null;

  const copyTable = (n) => {
    const rows = Array.from({ length: 10 }, (_, i) => `${n} × ${i + 1} = ${n * (i + 1)}`).join("\n");
    navigator.clipboard.writeText(rows);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
                <Table2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Number Table Generator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Math</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Generate multiplication tables for any range of numbers.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0 self-start md:self-auto text-[10px] font-semibold text-muted-foreground">
              {["Tables 1–12", "Custom Range", "Copy Output"].map(l => (
                <span key={l} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Table2 className="h-3 w-3 text-primary" />{l}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Controls */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Number (1–100)</label>
              <input type="number" min={1} max={100} value={start}
                onChange={e => setStart(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Number (1–100)</label>
              <input type="number" min={1} max={100} value={end}
                onChange={e => setEnd(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Highlight Multiples Of</label>
              <input type="number" min={1} max={100} value={highlight} placeholder="e.g. 5"
                onChange={e => setHighlight(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map(n => (
            <div key={n} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-primary/5">
                <span className="text-sm font-bold text-primary">Table of {n}</span>
                <button onClick={() => copyTable(n)}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Download className="h-3 w-3" /> Copy
                </button>
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 10 }, (_, i) => {
                  const result = n * (i + 1);
                  const isHighlighted = hlNum && result % hlNum === 0;
                  return (
                    <div key={i} className={`flex items-center justify-between px-4 py-1.5 text-xs font-mono ${isHighlighted ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
                      <span className="text-muted-foreground">{n} × {i + 1}</span>
                      <span className="font-bold">{result}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
