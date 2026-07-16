"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, CheckCircle2, AlertCircle, Type, Grid, BarChart3 } from "lucide-react";

export default function ToolHome() {
  const [input, setInput] = useState("A man, a plan, a canal: Panama");
  const [cleanedOriginal, setCleanedOriginal] = useState("");
  const [cleanedReversed, setCleanedReversed] = useState("");
  const [isPalindrome, setIsPalindrome] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [ignorePunctuation, setIgnorePunctuation] = useState(true);

  useEffect(() => {
    if (!input.trim()) {
      setCleanedOriginal("");
      setCleanedReversed("");
      setIsPalindrome(false);
      return;
    }

    let text = input;
    if (ignoreCase) {
      text = text.toLowerCase();
    }
    if (ignorePunctuation) {
      // Regex matches only alphanumeric characters
      text = text.replace(/[^a-z0-9]/gi, "");
    }

    const reversed = text.split("").reverse().join("");
    setCleanedOriginal(text);
    setCleanedReversed(reversed);
    setIsPalindrome(text.length > 0 && text === reversed);
  }, [input, ignoreCase, ignorePunctuation]);

  const loadSample = (sample) => {
    setInput(sample);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <CheckCircle className="h-5 w-5 text-primary group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Palindrome Checker
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Analyze if a word, sentence, or number reads identically in both directions, with customizable spacing and case options.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Fast"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form and Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Type size={14} className="text-primary" />
                  Verify Input String
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["Radar", "Racecar", "12321", "Was it a car or a cat I saw?"].map((s) => (
                    <button
                      key={s}
                      onClick={() => loadSample(s)}
                      className="text-[10px] font-bold text-primary hover:underline px-2 py-1 bg-primary/5 rounded"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your word, sentence, or digits here..."
                rows={4}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />

              {/* Options */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-border mt-4">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ignoreCase}
                    onChange={(e) => setIgnoreCase(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Ignore Letter Case (e.g. A = a)
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ignorePunctuation}
                    onChange={(e) => setIgnorePunctuation(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Ignore Spaces & Punctuation
                </label>
              </div>
            </div>

            {/* Character Analysis Grid */}
            {cleanedOriginal && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Grid size={14} className="text-primary" />
                  Character Comparison Grid
                </label>
                <div className="flex flex-wrap gap-2 p-4 bg-surface-soft rounded-xl min-h-[80px] items-center">
                  {cleanedOriginal.split("").map((char, idx) => {
                    const matchesReverse = char === cleanedReversed[idx];
                    return (
                      <div
                        key={idx}
                        className={`h-10 w-10 border rounded-lg flex flex-col justify-center items-center font-bold text-sm ${
                          matchesReverse
                            ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                            : "border-red-500/30 bg-red-500/5 text-red-500"
                        }`}
                      >
                        <span>{char}</span>
                        <span className="text-[7px] leading-none opacity-60 uppercase mt-0.5">
                          {idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-muted-foreground leading-normal">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-500 mr-1.5"></span>
                  Teal cells indicate exact character matches between original and reversed positions.
                </div>
              </div>
            )}
          </div>

          {/* Results Sidebar Panel */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-primary" />
                Validation Report
              </h2>

              {!input.trim() ? (
                <div className="text-center p-6 text-xs text-muted-foreground italic">
                  Waiting for input validation...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-surface-soft">
                    {isPalindrome ? (
                      <div className="text-center space-y-2">
                        <CheckCircle2 size={48} className="text-primary mx-auto animate-bounce" />
                        <div className="text-lg font-black text-primary">PALINDROME</div>
                        <p className="text-[10px] text-muted-foreground max-w-[180px] mx-auto">
                          Reads the exact same forwards and backwards.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <AlertCircle size={48} className="text-red-500 mx-auto" />
                        <div className="text-lg font-black text-red-500">NOT A PALINDROME</div>
                        <p className="text-[10px] text-muted-foreground max-w-[180px] mx-auto">
                          Does not read the same in reverse.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comparisons */}
                  <div className="space-y-3 font-mono text-xs text-foreground bg-surface-soft p-4 rounded-xl border border-border leading-relaxed">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-sans font-bold mb-0.5">Original (Parsed)</span>
                      <span className="break-all">{cleanedOriginal || "-"}</span>
                    </div>
                    <div className="border-t border-border/60 pt-2 mt-2">
                      <span className="text-muted-foreground block text-[10px] uppercase font-sans font-bold mb-0.5">Reversed (Parsed)</span>
                      <span className="break-all">{cleanedReversed || "-"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
