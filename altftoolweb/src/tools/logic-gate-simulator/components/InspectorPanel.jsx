"use client";

import React, { useState } from "react";
import { Sliders, Activity, Zap, Table, Layers, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { buildKarnaughMap } from "../utils/karnaughMap";

export default function InspectorPanel({
  selectedNode,
  nodeState,
  truthTable,
  onUpdateNodeName,
  onDeleteNode,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [selectedOutputId, setSelectedOutputId] = useState(null);

  const activeOutputId = selectedOutputId || truthTable?.outputs[0]?.id;
  const kMap = truthTable ? buildKarnaughMap(truthTable, activeOutputId) : null;
  const activeOutputName = truthTable?.outputs.find((o) => o.id === activeOutputId)?.name || "Output";

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3 text-xs h-full py-1">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Expand Inspector"
          >
            <ChevronLeft size={14} />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--primary)]" title="Node Inspector">
          <Sliders size={15} />
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--muted-foreground)]" title="Truth Tables">
          <Table size={15} />
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--surface-soft)] border border-[var(--border)] text-amber-500/80" title="K-Map Solver">
          <Zap size={15} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 text-xs h-full overflow-y-auto pr-0.5">
      {/* Header with Collapse Trigger */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] shrink-0">
        <span className="font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5 text-[11px]">
          <Sliders size={13} /> Inspector
        </span>
        <div className="flex items-center gap-1">
          {selectedNode && (
            <button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10 transition-colors"
              title="Delete Selected Node"
            >
              <Trash2 size={13} />
            </button>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Collapse Inspector"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Selected Node Properties */}
      {selectedNode ? (
        <div className="space-y-2.5 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/50 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase text-[var(--muted-foreground)] tracking-wider">Node Properties</span>
            <span className="font-mono text-[9px] bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 rounded font-bold border border-[var(--primary)]/20">
              {selectedNode.gateType.toUpperCase()}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-[var(--muted-foreground)] block">Label Name</label>
            <input
              type="text"
              value={selectedNode.name}
              onChange={(e) => onUpdateNodeName(selectedNode.id, e.target.value)}
              className="w-full px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--foreground)] focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-[var(--border)]/50">
            <div>
              <span className="text-[var(--muted-foreground)] block text-[9px]">Inputs Count:</span>
              <span className="font-bold text-[var(--foreground)]">{selectedNode.inputsCount}</span>
            </div>
            <div>
              <span className="text-[var(--muted-foreground)] block text-[9px]">Output Signal:</span>
              <span
                className={`font-bold ${
                  nodeState?.output === 1
                    ? "text-emerald-500 font-extrabold"
                    : nodeState?.output === 0
                    ? "text-slate-400"
                    : "text-red-500"
                }`}
              >
                {nodeState?.output === 1 ? "HIGH (1)" : nodeState?.output === 0 ? "LOW (0)" : "Hi-Z (Z)"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl border border-dashed border-[var(--border)] text-center text-[var(--muted-foreground)] text-[10px] shrink-0 bg-[var(--surface-soft)]/20">
          Click any gate or node on the canvas to inspect its parameters.
        </div>
      )}

      {/* Logic Analysis & Karnaugh Solver */}
      {truthTable && truthTable.rows.length > 0 && (
        <div className="space-y-3.5 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--foreground)] uppercase text-[9px] tracking-wider flex items-center gap-1">
              <Table size={11} className="text-[var(--primary)]" /> Truth Table Sweep
            </span>
            {truthTable.outputs.length > 1 && (
              <select
                value={activeOutputId}
                onChange={(e) => setSelectedOutputId(e.target.value)}
                className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--background)] text-[9px] font-bold"
              >
                {truthTable.outputs.map((out) => (
                  <option key={out.id} value={out.id}>
                    {out.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="border border-[var(--border)] rounded-lg overflow-hidden max-h-[130px] overflow-y-auto bg-[var(--background)]">
            <table className="w-full text-[10px] font-mono">
              <thead>
                <tr className="bg-[var(--surface-soft)] border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold">
                  {truthTable.inputs.map((inp) => (
                    <th key={inp.id} className="p-1 text-center border-r border-[var(--border)]/40">
                      {inp.name}
                    </th>
                  ))}
                  {truthTable.outputs.map((out) => (
                    <th key={out.id} className="p-1 text-center text-[var(--primary)] font-bold">
                      {out.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {truthTable.rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)]/30 hover:bg-[var(--surface-soft)]">
                    {truthTable.inputs.map((inp) => (
                      <td key={inp.id} className="p-1 text-center border-r border-[var(--border)]/30 font-semibold">
                        {row.inputs[inp.id]}
                      </td>
                    ))}
                    {truthTable.outputs.map((out) => (
                      <td
                        key={out.id}
                        className={`p-1 text-center font-bold ${
                          row.outputs[out.id] === 1 ? "text-emerald-500" : "text-slate-400"
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

          {/* K-Map */}
          {kMap && (
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <span className="font-bold text-[var(--foreground)] uppercase text-[9px] tracking-wider block">
                Karnaugh Map (K-Map)
              </span>
              <div className="border border-[var(--border)] rounded-lg p-2 bg-[var(--surface-soft)]/30 font-mono text-[9px] overflow-x-auto">
                <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${kMap.colLabels.length}, minmax(22px, 1fr))` }}>
                  <div className="text-[8px] text-right font-bold text-[var(--muted-foreground)] border-r border-b border-[var(--border)]/60 pr-1">
                    R \ C
                  </div>
                  {kMap.colLabels.map((lbl, cIdx) => (
                    <div key={cIdx} className="text-center font-bold text-[8px] text-[var(--muted-foreground)] border-b border-[var(--border)]/60 pb-0.5">
                      {lbl}
                    </div>
                  ))}
                  {kMap.rowLabels.map((rlbl, rIdx) => (
                    <React.Fragment key={`row-insp-${rIdx}`}>
                      <div key={`rl-${rIdx}`} className="text-right pr-1 font-bold text-[8px] text-[var(--muted-foreground)] border-r border-[var(--border)]/60">
                        {rlbl}
                      </div>
                      {kMap.grid[rIdx].map((cellVal, cIdx) => (
                        <div
                          key={`c-${rIdx}-${cIdx}`}
                          className={`h-5.5 rounded border flex items-center justify-center font-bold ${
                            cellVal === 1
                              ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-500 font-extrabold"
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

              {/* Minimized SOP */}
              <div className="p-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 space-y-1">
                <span className="font-bold text-[var(--primary)] block uppercase text-[9px] flex items-center gap-1">
                  <Zap size={11} /> Minimized Logic Expression
                </span>
                <div className="font-mono text-[10px] font-bold text-[var(--foreground)] truncate bg-[var(--background)] p-1.5 rounded border border-[var(--border)]">
                  {activeOutputName} = {kMap.minimizedExpr}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
