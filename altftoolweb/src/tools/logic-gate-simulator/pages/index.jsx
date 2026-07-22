"use client";

import React, { useState } from "react";
import { GitBranch, Check } from "lucide-react";

const GATES = {
  AND: { label: "AND", symbol: "&", desc: "Output is 1 only when both inputs are 1", fn: (a, b) => a && b },
  OR: { label: "OR", symbol: "≥1", desc: "Output is 1 when at least one input is 1", fn: (a, b) => a || b },
  NOT: { label: "NOT", symbol: "¬", desc: "Output is the opposite of the input", fn: (a) => !a, unary: true },
  NAND: { label: "NAND", symbol: "⊼", desc: "Output is 0 only when both inputs are 1", fn: (a, b) => !(a && b) },
  NOR: { label: "NOR", symbol: "⊽", desc: "Output is 1 only when both inputs are 0", fn: (a, b) => !(a || b) },
  XOR: { label: "XOR", symbol: "⊕", desc: "Output is 1 when inputs are different", fn: (a, b) => a !== b },
  XNOR: { label: "XNOR", symbol: "⊙", desc: "Output is 1 when inputs are the same", fn: (a, b) => a === b },
};

export default function ToolHome() {
  const [selectedGate, setSelectedGate] = useState("AND");
  const [inputA, setInputA] = useState(0);
  const [inputB, setInputB] = useState(0);

  const gate = GATES[selectedGate];
  const output = gate.unary ? gate.fn(inputA) : gate.fn(inputA, inputB);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Logic Gate Simulator</h1>
              <p className="text-xs text-muted-foreground mt-1">Simulate logic gates with toggle inputs, truth tables, and visual output.</p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {Object.keys(GATES).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedGate(key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                selectedGate === key ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-foreground"
              }`}
            >
              {GATES[key].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="text-center">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">{gate.label} Gate</h2>
                <p className="text-xs text-muted-foreground">{gate.desc}</p>
              </div>

              <div className="flex items-center justify-center gap-8 p-8">
                <div className="text-center space-y-3">
                  <div className="text-xs font-bold text-muted-foreground uppercase">Input A</div>
                  <button
                    onClick={() => setInputA(inputA ? 0 : 1)}
                    className={`w-16 h-16 rounded-2xl text-2xl font-black border-2 transition ${
                      inputA ? "bg-primary/20 border-primary text-primary" : "bg-surface-soft border-border text-muted-foreground"
                    }`}
                  >
                    {inputA}
                  </button>
                </div>

                {!gate.unary && (
                  <div className="text-center space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase">Input B</div>
                    <button
                      onClick={() => setInputB(inputB ? 0 : 1)}
                      className={`w-16 h-16 rounded-2xl text-2xl font-black border-2 transition ${
                        inputB ? "bg-primary/20 border-primary text-primary" : "bg-surface-soft border-border text-muted-foreground"
                      }`}
                    >
                      {inputB}
                    </button>
                  </div>
                )}

                <div className="text-2xl text-muted-foreground">{gate.symbol}</div>

                <div className="text-center space-y-3">
                  <div className="text-xs font-bold text-muted-foreground uppercase">Output</div>
                  <div className={`w-16 h-16 rounded-2xl text-2xl font-black border-2 flex items-center justify-center transition ${
                    output ? "bg-green-500/20 border-green-500 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"
                  }`}>
                    {output ? 1 : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Truth Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="bg-surface-soft border-b border-border">
                      <th className="p-3 text-left text-muted-foreground font-bold">A</th>
                      {!gate.unary && <th className="p-3 text-left text-muted-foreground font-bold">B</th>}
                      <th className="p-3 text-left text-muted-foreground font-bold">Q ({gate.label})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gate.unary
                      ? [0, 1].map((a) => (
                          <tr key={a} className="border-b border-border/50">
                            <td className="p-3 font-bold">{a}</td>
                            <td className={`p-3 font-bold ${gate.fn(a) ? "text-green-500" : "text-red-500"}`}>{gate.fn(a) ? 1 : 0}</td>
                          </tr>
                        ))
                      : [0, 1].flatMap((a) => [0, 1].map((b) => (
                          <tr key={`${a}${b}`} className={`border-b border-border/50 ${a === inputA && b === inputB ? "bg-primary/5" : ""}`}>
                            <td className={`p-3 font-bold ${a === inputA ? "text-primary" : ""}`}>{a}</td>
                            <td className={`p-3 font-bold ${b === inputB ? "text-primary" : ""}`}>{b}</td>
                            <td className={`p-3 font-bold ${gate.fn(a, b) ? "text-green-500" : "text-red-500"}`}>{gate.fn(a, b) ? 1 : 0}</td>
                          </tr>
                        )))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
