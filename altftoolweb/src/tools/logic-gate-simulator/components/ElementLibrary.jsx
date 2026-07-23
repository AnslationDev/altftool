"use client";

import { ToggleRight, Clock, GitBranch, Layers, Zap, Cpu, Lightbulb, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export const ELEMENT_PRESETS = [
  {
    type: "input",
    gateType: "toggle",
    name: "Input Toggle",
    desc: "Manual high/low signal source",
    inputsCount: 0,
    outputsCount: 1,
    symbol: "TOG",
    Icon: ToggleRight,
  },
  {
    type: "input",
    gateType: "clock",
    name: "Clock Gen",
    desc: "Oscillates signal automatically (1Hz)",
    inputsCount: 0,
    outputsCount: 1,
    symbol: "CLK",
    Icon: Clock,
  },
  {
    type: "gate",
    gateType: "AND",
    name: "AND Gate",
    desc: "High if all inputs are high",
    inputsCount: 2,
    outputsCount: 1,
    symbol: "&",
    Icon: Cpu,
  },
  {
    type: "gate",
    gateType: "OR",
    name: "OR Gate",
    desc: "High if any input is high",
    inputsCount: 2,
    outputsCount: 1,
    symbol: "≥1",
    Icon: Layers,
  },
  {
    type: "gate",
    gateType: "NOT",
    name: "NOT Inverter",
    desc: "Inverts input signal",
    inputsCount: 1,
    outputsCount: 1,
    symbol: "¬",
    Icon: Zap,
  },
  {
    type: "gate",
    gateType: "NAND",
    name: "NAND Gate",
    desc: "Inverted AND logic output",
    inputsCount: 2,
    outputsCount: 1,
    symbol: "⊼",
    Icon: Cpu,
  },
  {
    type: "gate",
    gateType: "NOR",
    name: "NOR Gate",
    desc: "Inverted OR logic output",
    inputsCount: 2,
    outputsCount: 1,
    symbol: "⊽",
    Icon: Layers,
  },
  {
    type: "gate",
    gateType: "XOR",
    name: "XOR Gate",
    desc: "High if inputs are different",
    inputsCount: 2,
    outputsCount: 1,
    symbol: "⊕",
    Icon: GitBranch,
  },
  {
    type: "gate",
    gateType: "XNOR",
    name: "XNOR Gate",
    desc: "High if inputs are equal",
    inputsCount: 2,
    outputsCount: 1,
    symbol: "⊙",
    Icon: GitBranch,
  },
  {
    type: "output",
    gateType: "lamp",
    name: "Signal Lamp",
    desc: "Visualizes final output state",
    inputsCount: 1,
    outputsCount: 0,
    symbol: "💡",
    Icon: Lightbulb,
  },
];

export default function ElementLibrary({ onAddNode, horizontal = false, isCollapsed = false, onToggleCollapse }) {
  if (horizontal) {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1 shrink-0 mr-1">
          <Sparkles size={12} /> Add:
        </span>
        {ELEMENT_PRESETS.map((preset) => {
          const Icon = preset.Icon;
          return (
            <button
              key={preset.gateType}
              onClick={() => onAddNode(preset)}
              title={`${preset.name}: ${preset.desc}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-xs font-medium transition-all shrink-0 active:scale-95 group shadow-2xs"
            >
              <Icon size={13} className="text-[var(--primary)] shrink-0" />
              <span className="text-[11px] text-[var(--foreground)] group-hover:text-[var(--primary)]">
                {preset.name.replace(" Gate", "").replace(" Inverter", "")}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-xs h-full">
      {/* Sidebar Header with Collapse Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] shrink-0">
        {!isCollapsed && (
          <span className="font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5 text-[11px]">
            <Sparkles size={13} /> Element Library
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors ml-auto"
            title={isCollapsed ? "Expand Library" : "Collapse Library"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Preset Buttons Grid/List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5">
        {ELEMENT_PRESETS.map((preset) => {
          const Icon = preset.Icon;
          if (isCollapsed) {
            return (
              <button
                key={preset.gateType}
                onClick={() => onAddNode(preset)}
                title={`${preset.name}: ${preset.desc}`}
                className="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] transition-all active:scale-95"
              >
                <Icon size={16} />
              </button>
            );
          }

          return (
            <button
              key={preset.gateType}
              onClick={() => onAddNode(preset)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]/60 hover:border-[var(--primary)]/40 hover:bg-[var(--surface-soft)] text-left transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--background)] border border-[var(--border)] text-[var(--primary)] shrink-0 group-hover:border-[var(--primary)]/50 transition-colors">
                  <Icon size={14} />
                </div>
                <div className="space-y-0.5 truncate">
                  <span className="font-semibold text-[11px] text-[var(--foreground)] block truncate group-hover:text-[var(--primary)] transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[9px] text-[var(--muted-foreground)] block truncate">
                    {preset.desc}
                  </span>
                </div>
              </div>

              <span className="font-mono font-bold text-[10px] text-[var(--muted-foreground)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)] shrink-0 ml-1">
                {preset.symbol}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
