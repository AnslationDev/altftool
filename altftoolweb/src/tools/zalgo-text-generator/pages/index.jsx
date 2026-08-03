"use client";

import React, { useState, useEffect, useId } from "react";
import { Skull, CheckCircle2, Copy, FileText, SlidersHorizontal, Flame } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { generateZalgoText } from "../lib";

// Unicode combining diacritics, classified by their official Unicode name
// (COMBINING ... ABOVE / BELOW / OVERLAY) so each slider only ever draws
// marks that actually render in the direction it claims to control.
const ZALGO_UP = [
  "\u0300", "\u0301", "\u0302", "\u0303", "\u0304", "\u0305", "\u0306", "\u0307", "\u0308", "\u0309", "\u030a", "\u030b", "\u030c", "\u030d",
  "\u030e", "\u030f", "\u0310", "\u0311", "\u0312", "\u0313", "\u0314", "\u0315", "\u031a", "\u031b", "\u033d", "\u0340", "\u0341", "\u0342",
  "\u0343", "\u0344", "\u0346", "\u034a", "\u034b", "\u034c", "\u0350", "\u0351", "\u0352", "\u0357", "\u035b", "\u035d", "\u035e", "\u0360",
  "\u0361", "\u0363", "\u0364", "\u0365", "\u0366", "\u0367", "\u0368", "\u0369", "\u036a", "\u036b", "\u036c", "\u036d", "\u036e", "\u036f"
];

// Only genuine "COMBINING ... OVERLAY" marks (they draw a stroke/solidus
// straight through the glyph) belong here \u2014 anything named ABOVE/BELOW
// belongs in ZALGO_UP/ZALGO_DOWN instead, and invisible formatting
// characters (e.g. GRAPHEME JOINER) don't belong in any pool.
const ZALGO_MID = ["\u0334", "\u0335", "\u0336", "\u0337", "\u0338"];

const ZALGO_DOWN = [
  "\u0316", "\u0317", "\u0318", "\u0319", "\u031c", "\u031d", "\u031e", "\u031f", "\u0320", "\u0321", "\u0322", "\u0323", "\u0324", "\u0325",
  "\u0326", "\u0327", "\u0328", "\u0329", "\u032a", "\u032b", "\u032c", "\u032d", "\u032e", "\u032f", "\u0330", "\u0331", "\u0332", "\u0333",
  "\u0339", "\u033a", "\u033b", "\u033c", "\u0345", "\u0347", "\u0348", "\u0349", "\u034d", "\u034e", "\u0353", "\u0354", "\u0355", "\u0356",
  "\u0359", "\u035a", "\u035c", "\u035f", "\u0362"
];

const MAX_INPUT_LENGTH = 20000;
// Slow the regeneration down to one run per animation tick instead of one
// per keystroke, so pasting a long block of text (or dragging a slider)
// doesn't synchronously re-run the corruption loop for every intermediate
// value and stutter the tab.
const REGEN_DEBOUNCE_MS = 120;

export default function ToolHome() {
  const [input, setInput] = useState("HE COMES TO REIGN");
  const [generated, setGenerated] = useState({ key: "", text: "" });
  const [upVal, setUpVal] = useState(8);
  const [midVal, setMidVal] = useState(3);
  const [downVal, setDownVal] = useState(8);
  const { copy, isCopied, announcement } = useCopyToClipboard();
  const upId = useId();
  const midId = useId();
  const downId = useId();
  const generationKey = `${input}\u0000${upVal}\u0000${midVal}\u0000${downVal}`;
  // A debounced result is usable only when it belongs to the inputs currently
  // on screen. This makes the copy button go empty immediately after a change
  // instead of copying the previous corruption during the debounce window.
  const output = generated.key === generationKey ? generated.text : "";

  useEffect(() => {
    if (!input) return undefined;

    const timer = setTimeout(() => {
      const text = generateZalgoText(input, {
        upCount: upVal,
        midCount: midVal,
        downCount: downVal,
        upMarks: ZALGO_UP,
        midMarks: ZALGO_MID,
        downMarks: ZALGO_DOWN,
      });
      setGenerated({ key: generationKey, text });
    }, REGEN_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [generationKey, input, upVal, midVal, downVal]);

  const handleCopy = () => copy("output", output, { label: "Corrupted text" });

  const loadSample = () => {
    if (input.trim() && input !== "THE GLITCH DEMON" && !window.confirm("Replace your current text with the sample? This can't be undone.")) {
      return;
    }
    setInput("THE GLITCH DEMON");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Skull className="h-5 w-5 text-primary group-hover:animate-bounce group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Zalgo Text Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Generate spooky, distorted unicode text with precise sliders to stack diacritics above, through, and below characters.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Glitchy"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="w-full space-y-6">
          
          {/* 1. Input Text Area (Full Width) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                Normal Input Text
              </label>
              <button
                onClick={loadSample}
                className="text-[10px] font-bold text-primary hover:underline px-2 py-0.5 bg-primary/5 rounded"
              >
                Load Creepy Sample
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste text to corrupt here..."
              rows={4}
              maxLength={MAX_INPUT_LENGTH}
              className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>

          {/* 2. Corrupted Zalgo Output (Full Width) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Skull size={14} className="text-primary" />
                Corrupted Zalgo Output
              </label>
              <button
                onClick={handleCopy}
                disabled={!output}
                aria-label="Copy the corrupted zalgo text"
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
              >
                {isCopied("output") ? <CheckCircle2 size={12} className="text-primary" /> : <Copy size={12} />}
                {isCopied("output") ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Z҉A҉L҉G҉O҉..."
              rows={6}
              className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none resize-none cursor-text"
            />
            <span aria-live="polite" role="status" className="sr-only">
              {announcement}
            </span>
          </div>

          {/* 3. Controls and Presets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Intensity Controls */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-3">
                <SlidersHorizontal size={14} className="text-primary" />
                Corruption Intensity Controls
              </span>

              <div className="space-y-6">
                {/* Up Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <label htmlFor={upId}>Stack Upwards (Above Text)</label>
                    <span className="text-primary font-mono">{upVal}</span>
                  </div>
                  <input
                    id={upId}
                    type="range"
                    min="0"
                    max="20"
                    value={upVal}
                    onChange={(e) => setUpVal(parseInt(e.target.value))}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Mid Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <label htmlFor={midId}>Stack Middle (Through Text)</label>
                    <span className="text-primary font-mono">{midVal}</span>
                  </div>
                  <input
                    id={midId}
                    type="range"
                    min="0"
                    max="10"
                    value={midVal}
                    onChange={(e) => setMidVal(parseInt(e.target.value))}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Down Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <label htmlFor={downId}>Stack Downwards (Below Text)</label>
                    <span className="text-primary font-mono">{downVal}</span>
                  </div>
                  <input
                    id={downId}
                    type="range"
                    min="0"
                    max="20"
                    value={downVal}
                    onChange={(e) => setDownVal(parseInt(e.target.value))}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                <Flame size={14} className="text-primary" />
                Intensity Presets
              </h2>

              <div className="space-y-3">
                {[
                  { name: "Clean / Low", up: 2, mid: 1, down: 2 },
                  { name: "Medium Chaos", up: 8, mid: 3, down: 8 },
                  { name: "Maximum Corruption", up: 20, mid: 10, down: 20 },
                  { name: "Ascending Glitch", up: 18, mid: 0, down: 0 },
                  { name: "Descending Glitch", up: 0, mid: 0, down: 18 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setUpVal(preset.up);
                      setMidVal(preset.mid);
                      setDownVal(preset.down);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-border bg-surface-soft hover:border-primary transition text-xs font-bold text-foreground flex items-center justify-between"
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
                      ↑{preset.up} - {preset.mid} - ↓{preset.down}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
