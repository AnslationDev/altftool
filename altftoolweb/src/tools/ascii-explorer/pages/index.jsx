"use client";

import React, { useState } from "react";
import { Table, Copy, Check, ArrowRightLeft } from "lucide-react";

const ASCII_TABLE = Array.from({ length: 128 }, (_, i) => ({
  dec: i,
  hex: i.toString(16).toUpperCase().padStart(2, "0"),
  bin: i.toString(2).padStart(8, "0"),
  char: i >= 32 && i <= 126 ? String.fromCharCode(i) : "•",
  desc: i === 0 ? "NUL" : i === 9 ? "TAB" : i === 10 ? "LF" : i === 13 ? "CR" : i === 27 ? "ESC" : i === 32 ? "SPACE" : i === 127 ? "DEL" : "",
}));

export default function ToolHome() {
  const [mode, setMode] = useState("table");
  const [textInput, setTextInput] = useState("Hello");
  const [asciiOutput, setAsciiOutput] = useState([]);
  const [asciiInput, setAsciiInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const textToAscii = () => {
    const result = textInput.split("").map((char) => ({
      char,
      dec: char.charCodeAt(0),
      hex: char.charCodeAt(0).toString(16).toUpperCase(),
      bin: char.charCodeAt(0).toString(2).padStart(8, "0"),
    }));
    setAsciiOutput(result);
  };

  const asciiToText = () => {
    const codes = asciiInput.split(/[\s,]+/).filter(Boolean);
    const text = codes
      .map((c) => {
        const num = parseInt(c, 10);
        return num >= 0 && num <= 127 ? String.fromCharCode(num) : "?";
      })
      .join("");
    setTextOutput(text);
  };

  const copyTable = () => {
    const text = ASCII_TABLE.map((r) => `${r.dec}\t${r.hex}\t${r.bin}\t${r.char}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <Table className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">ASCII Explorer</h1>
              <p className="text-xs text-muted-foreground mt-1">Explore the full ASCII table — convert text to ASCII codes and vice versa.</p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {["table", "text-to-ascii", "ascii-to-text"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-foreground"
              }`}
            >
              {m === "table" ? "ASCII Table" : m === "text-to-ascii" ? "Text → ASCII" : "ASCII → Text"}
            </button>
          ))}
        </div>

        {mode === "table" ? (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-foreground uppercase">ASCII Reference Table (0–127)</h2>
              <button onClick={copyTable} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-surface-soft border-b border-border">
                    <th className="p-2 text-left text-muted-foreground font-bold">Dec</th>
                    <th className="p-2 text-left text-muted-foreground font-bold">Hex</th>
                    <th className="p-2 text-left text-muted-foreground font-bold">Bin</th>
                    <th className="p-2 text-left text-muted-foreground font-bold">Char</th>
                  </tr>
                </thead>
                <tbody>
                  {ASCII_TABLE.map((row) => (
                    <tr key={row.dec} className="border-b border-border/50 hover:bg-surface-soft/50 transition">
                      <td className="p-2 text-foreground">{row.dec}</td>
                      <td className="p-2 text-primary font-bold">{row.hex}</td>
                      <td className="p-2 text-muted-foreground">{row.bin}</td>
                      <td className="p-2 text-foreground font-bold">{row.char}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : mode === "text-to-ascii" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <label className="text-xs font-bold text-foreground uppercase">Enter Text</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={textToAscii} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2">
                <ArrowRightLeft size={16} /> Convert
              </button>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-foreground uppercase mb-4">ASCII Codes</h2>
              {asciiOutput.length > 0 ? (
                <div className="space-y-1.5">
                  {asciiOutput.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2 bg-surface-soft rounded-lg border border-border text-xs font-mono">
                      <span className="font-bold text-foreground w-6">"{item.char}"</span>
                      <span className="text-primary font-bold">Dec: {item.dec}</span>
                      <span className="text-cyan-500">Hex: {item.hex}</span>
                      <span className="text-muted-foreground">Bin: {item.bin}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-12">Enter text and click Convert.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <label className="text-xs font-bold text-foreground uppercase">ASCII Codes (space or comma separated)</label>
              <textarea
                value={asciiInput}
                onChange={(e) => setAsciiInput(e.target.value)}
                placeholder="e.g., 72 101 108 108 111"
                rows={4}
                className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              <button onClick={asciiToText} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2">
                <ArrowRightLeft size={16} /> Decode
              </button>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-foreground uppercase mb-4">Decoded Text</h2>
              {textOutput ? (
                <div className="p-6 bg-surface-soft rounded-xl border border-border text-center">
                  <span className="text-2xl font-bold text-foreground">{textOutput}</span>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-12">Enter ASCII codes and click Decode.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
