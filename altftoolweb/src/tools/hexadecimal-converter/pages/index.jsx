"use client";

import React, { useState } from "react";
import { Divide, Copy, Check, RefreshCw } from "lucide-react";

const BASE_PATTERNS = { dec: /^[0-9]+$/, hex: /^[0-9a-fA-F]+$/, bin: /^[01]+$/ };

export default function ToolHome() {
  const [input, setInput] = useState({ value: "255", base: "dec" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedLabel, setCopiedLabel] = useState(null);

  const convert = () => {
    const val = input.value.trim();

    if (!BASE_PATTERNS[input.base].test(val)) {
      setResult(null);
      setError("Enter a valid whole number in the selected base — no fractions, signs, or invalid digits.");
      return;
    }

    let dec;
    if (input.base === "dec") dec = parseInt(val, 10);
    else if (input.base === "hex") dec = parseInt(val, 16);
    else dec = parseInt(val, 2);

    if (isNaN(dec) || dec < 0) {
      setResult(null);
      setError("Enter a valid whole number in the selected base — no fractions, signs, or invalid digits.");
      return;
    }
    if (dec > 4294967295) {
      setResult(null);
      setError("Value is too large — the maximum accepted is 4,294,967,295 (32-bit unsigned range).");
      return;
    }

    const hex = dec.toString(16).toUpperCase();
    const paddedHex = hex.padStart(Math.ceil(hex.length / 2) * 2, "0");
    const bin = dec.toString(2);
    const nibbles = paddedHex.split("").map((h) => ({
      hex: h,
      bin: parseInt(h, 16).toString(2).padStart(4, "0"),
      dec: parseInt(h, 16),
    }));

    setError(null);
    setResult({ dec, hex: paddedHex, bin, nibbles });
  };

  const copyBase = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 1500);
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <Divide className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Hexadecimal Converter</h1>
              <p className="text-xs text-muted-foreground mt-1">Convert between hex, decimal, and binary with nibble-level visualization.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Enter Value</h2>
              <div className="flex gap-2">
                {["dec", "hex", "bin"].map((b) => (
                  <button
                    key={b}
                    onClick={() => setInput({ ...input, base: b })}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                      input.base === b ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-foreground"
                    }`}
                  >
                    {b === "dec" ? "Decimal" : b === "hex" ? "Hex" : "Binary"}
                  </button>
                ))}
              </div>
              <input
                value={input.value}
                onChange={(e) => setInput({ ...input, value: e.target.value })}
                placeholder={input.base === "dec" ? "255" : input.base === "hex" ? "FF" : "11111111"}
                className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              <button
                onClick={convert}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Convert
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {result ? (
              <>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Results</h2>
                  {[
                    { label: "Decimal", value: result.dec.toLocaleString(), base: "dec" },
                    { label: "Hexadecimal", value: `0x${result.hex}`, base: "hex" },
                    { label: "Binary", value: result.bin, base: "bin" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between px-4 py-3 bg-surface-soft rounded-xl border border-border">
                      <span className="text-xs font-bold text-muted-foreground">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-black text-foreground">{r.value}</span>
                        <button
                          onClick={() => copyBase(r.value, r.label)}
                          aria-label={`Copy ${r.label} value`}
                          className="p-1 rounded hover:bg-background transition"
                        >
                          {copiedLabel === r.label ? (
                            <Check size={12} className="text-primary" aria-hidden="true" />
                          ) : (
                            <Copy size={12} className="text-muted-foreground" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {result.nibbles.length > 1 && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Nibble Breakdown</h2>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.nibbles.map((n, i) => (
                        <div key={i} className="text-center p-3 bg-surface-soft rounded-xl border border-border min-w-[80px]">
                          <div className="text-lg font-black text-primary">{n.hex}</div>
                          <div className="text-[9px] font-mono text-muted-foreground">{n.bin}</div>
                          <div className="text-[9px] text-muted-foreground">{n.dec}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[200px]"
                aria-live="polite"
              >
                {error ? (
                  <p role="alert" className="text-xs font-medium text-danger">
                    {error}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Enter a value and click Convert.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
