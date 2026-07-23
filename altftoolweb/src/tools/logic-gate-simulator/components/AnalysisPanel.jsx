"use client";

import React, { useState } from "react";
import { Table, Zap, Activity, ShieldCheck, Cpu, Layers, Clock, Gauge, Sparkles, BarChart2 } from "lucide-react";
import { buildKarnaughMap } from "../utils/karnaughMap";
import { calculateCircuitMetrics } from "../utils/circuitEngine";

export default function AnalysisPanel({ truthTable, nodes, connections }) {
  const [selectedOutputId, setSelectedOutputId] = useState(null);

  const activeOutputId = selectedOutputId || truthTable?.outputs[0]?.id;
  const kMap = truthTable && activeOutputId ? buildKarnaughMap(truthTable, activeOutputId) : null;
  const activeOutputName = truthTable?.outputs.find((o) => o.id === activeOutputId)?.name || "Output";

  const metrics = calculateCircuitMetrics(nodes || [], connections || [], truthTable, activeOutputId);

  if (!truthTable || truthTable.rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center text-[var(--muted-foreground)] text-xs italic gap-2 shadow-sm">
        <Sparkles size={24} className="text-[var(--primary)] animate-pulse" />
        <span>Add at least one Input Toggle and one Signal Lamp to compile boolean truth tables and optimize circuits.</span>
      </div>
    );
  }

  // Calculate percentages for progress bars
  const totalRows = truthTable.rows.length;
  const highPercent = totalRows > 0 ? Math.round((metrics.totalHighOutputs / totalRows) * 100) : 0;
  const delayPercent = Math.min(100, Math.round((Number(metrics.estimatedPropagationDelayNs) / 20) * 100));

  // Gate breakdown composition percentage
  const gateTypesList = Object.keys(metrics.gateDistribution);
  const totalGateCount = metrics.gateCount || 1;

  return (
    <div className="flex flex-col gap-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-xs transition-all duration-300 shadow-sm">
      {/* Top Header & Output Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/20 shadow-2xs">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--foreground)] tracking-tight">Logic Analyzer & Optimization Engine</h3>
            <p className="text-[10px] text-[var(--muted-foreground)]">Real-time Truth Table sweep, Karnaugh Map (K-Map) reduction, and diagnostic metrics</p>
          </div>
        </div>

        {truthTable.outputs.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Output Target:</span>
            <select
              value={activeOutputId}
              onChange={(e) => setSelectedOutputId(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] font-bold text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-all cursor-pointer"
            >
              {truthTable.outputs.map((out) => (
                <option key={out.id} value={out.id}>
                  {out.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hero Metrics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 space-y-2 hover:border-[var(--primary)]/40 transition-all duration-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            <span>Logic Gates</span>
            <Cpu size={13} className="text-[var(--primary)]" />
          </div>
          <div className="text-lg font-black text-[var(--foreground)] font-mono">
            {metrics.gateCount} <span className="text-xs font-normal text-[var(--muted-foreground)]">gates</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 space-y-2 hover:border-sky-500/40 transition-all duration-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            <span>Prop Delay</span>
            <Clock size={13} className="text-sky-500" />
          </div>
          <div className="text-lg font-black text-[var(--foreground)] font-mono">
            {metrics.estimatedPropagationDelayNs} <span className="text-xs font-normal text-[var(--muted-foreground)]">ns</span>
          </div>
          {/* Animated Delay Progress Bar */}
          <div className="w-full bg-[var(--border)]/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${delayPercent}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 space-y-2 hover:border-emerald-500/40 transition-all duration-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            <span>Max Freq</span>
            <Gauge size={13} className="text-emerald-500" />
          </div>
          <div className="text-lg font-black text-[var(--foreground)] font-mono">
            {metrics.maxClockFreqMHz} <span className="text-xs font-normal text-[var(--muted-foreground)]">MHz</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 space-y-2 hover:border-amber-500/40 transition-all duration-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            <span>Active High</span>
            <Zap size={13} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-[var(--foreground)] font-mono">
            {highPercent}% <span className="text-xs font-normal text-[var(--muted-foreground)]">({metrics.totalHighOutputs}/{totalRows})</span>
          </div>
          {/* Animated High Signal Probability Bar */}
          <div className="w-full bg-[var(--border)]/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[var(--primary)] to-amber-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${highPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Analysis Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Truth Table Sweep & Minterms */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--foreground)] text-xs flex items-center gap-1.5">
                <Table size={14} className="text-[var(--primary)]" /> Exhaustive Truth Table Sweep
              </span>
              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                {truthTable.rows.length} states evaluated
              </span>
            </div>

            <div className="border border-[var(--border)] rounded-xl overflow-hidden max-h-[240px] overflow-y-auto bg-[var(--background)] shadow-2xs">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="bg-[var(--surface-soft)] border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold">
                    <th className="p-2 text-center w-12 border-r border-[var(--border)]/40">Idx</th>
                    {truthTable.inputs.map((inp) => (
                      <th key={inp.id} className="p-2 text-center border-r border-[var(--border)]/40">
                        {inp.name}
                      </th>
                    ))}
                    {truthTable.outputs.map((out) => (
                      <th
                        key={out.id}
                        className={`p-2 text-center ${out.id === activeOutputId ? "text-[var(--primary)] font-black" : ""}`}
                      >
                        {out.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {truthTable.rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-[var(--border)]/40 hover:bg-[var(--surface-soft)]/60 transition-colors">
                      <td className="p-2 text-center border-r border-[var(--border)]/40 text-[10px] text-[var(--muted-foreground)] font-bold">
                        m{idx}
                      </td>
                      {truthTable.inputs.map((inp) => (
                        <td key={inp.id} className="p-2 text-center border-r border-[var(--border)]/40 font-bold">
                          {row.inputs[inp.id]}
                        </td>
                      ))}
                      {truthTable.outputs.map((out) => (
                        <td
                          key={out.id}
                          className={`p-2 text-center font-bold ${
                            row.outputs[out.id] === 1
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-slate-400"
                          }`}
                        >
                          {row.outputs[out.id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Canonical Forms & Minterms Card */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/40 space-y-2 shadow-2xs">
            <span className="font-bold text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block">
              Canonical Expression Notation
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <div className="bg-[var(--background)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
                <span className="text-[var(--muted-foreground)] mr-1">Sum of Minterms:</span>
                <span className="font-extrabold text-[var(--primary)]">
                  {metrics.minterms.length > 0 ? `${activeOutputName} = ∑m(${metrics.minterms.map((m) => m.replace("m", "")).join(", ")})` : `${activeOutputName} = 0`}
                </span>
              </div>
            </div>
          </div>

          {/* Gate Type Distribution Bar */}
          {metrics.gateCount > 0 && (
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/40 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <BarChart2 size={12} className="text-[var(--primary)]" /> Gate Distribution Breakdown
                </span>
                <span>{metrics.gateCount} Total Gates</span>
              </div>

              {/* Stacked Gate Distribution Bar */}
              <div className="w-full bg-[var(--border)]/50 h-2 rounded-full overflow-hidden flex">
                {gateTypesList.map((gType, idx) => {
                  const count = metrics.gateDistribution[gType];
                  const pct = (count / totalGateCount) * 100;
                  const colors = ["bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-indigo-500", "bg-purple-500", "bg-amber-500"];
                  const color = colors[idx % colors.length];

                  return (
                    <div
                      key={gType}
                      className={`${color} h-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                      title={`${gType}: ${count} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>

              {/* Gate legend pills */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono pt-1">
                {gateTypesList.map((gType) => (
                  <span key={gType} className="bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)] font-bold text-[var(--foreground)]">
                    {gType}: {metrics.gateDistribution[gType]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Karnaugh Map Solver & Gate Distribution */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-2">
            <span className="font-bold text-[var(--foreground)] text-xs flex items-center gap-1.5">
              <Layers size={14} className="text-[var(--primary)]" /> Karnaugh Map (K-Map) Grid Reduction
            </span>

            {kMap ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[10px] text-[var(--muted-foreground)] uppercase">
                    Grid Mapping:
                  </span>
                  <span className="font-mono bg-[var(--surface-soft)] px-2 py-0.5 rounded-md font-bold border border-[var(--border)] text-[10px]">
                    Row: {kMap.rowVars.join("")} vs Col: {kMap.colVars.join("")}
                  </span>
                </div>

                {/* K-Map Matrix Visualizer */}
                <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface-soft)]/30 flex flex-col items-center justify-center font-mono select-none shadow-2xs">
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: `auto repeat(${kMap.colLabels.length}, minmax(36px, 1fr))` }}>
                    {/* Corner Header */}
                    <div className="text-[10px] text-right font-bold text-[var(--muted-foreground)] flex items-center justify-end pr-2 border-r border-b border-[var(--border)]">
                      Row \ Col
                    </div>

                    {/* Columns header labels */}
                    {kMap.colLabels.map((lbl, cIdx) => (
                      <div key={cIdx} className="text-center font-bold text-[10px] text-[var(--muted-foreground)] pb-1 border-b border-[var(--border)]">
                        {lbl}
                      </div>
                    ))}

                    {/* Rows */}
                    {kMap.rowLabels.map((rlbl, rIdx) => (
                      <React.Fragment key={`row-${rIdx}`}>
                        {/* Row header label */}
                        <div className="text-right pr-2 font-bold text-[10px] text-[var(--muted-foreground)] border-r border-[var(--border)] flex items-center justify-end">
                          {rlbl}
                        </div>

                        {/* Cell Values */}
                        {kMap.grid[rIdx].map((cellVal, cIdx) => (
                          <div
                            key={`c-${rIdx}-${cIdx}`}
                            className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                              cellVal === 1
                                ? "bg-emerald-500/15 border-emerald-500 text-emerald-500 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse"
                                : "bg-[var(--card)] border-[var(--border)] text-slate-400"
                            }`}
                          >
                            {cellVal}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--muted-foreground)] italic p-3 border border-dashed border-[var(--border)] rounded-xl text-center">
                Simulate 2, 3, or 4 input variables to compile Karnaugh Map matrix grids.
              </p>
            )}
          </div>

          {/* Minimized Sum-of-Products Output */}
          {kMap && (
            <div className="p-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-1.5 shadow-2xs transition-all hover:border-[var(--primary)]/50">
              <span className="font-bold text-[var(--primary)] block uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Zap size={13} className="animate-bounce" /> Minimized Sum-of-Products Expression
              </span>
              <div className="font-mono text-xs font-black text-[var(--foreground)] bg-[var(--background)] px-3 py-2.5 rounded-lg border border-[var(--border)] break-all">
                {activeOutputName} = {kMap.minimizedExpr}
              </div>
            </div>
          )}

          {/* Circuit Health & Diagnostics Card */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/40 space-y-2 shadow-2xs">
            <span className="font-bold text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-500" />
              Circuit Signal Health & Diagnostics
            </span>

            {metrics.floatingWarnings.length > 0 ? (
              <div className="space-y-1">
                {metrics.floatingWarnings.map((warn, idx) => (
                  <div key={idx} className="text-[11px] text-amber-500 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {warn}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1.5">
                <ShieldCheck size={13} /> All gate input ports are fully connected and driven cleanly.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
