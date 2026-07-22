"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Type, BarChart3, List } from "lucide-react";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

const SAMPLE_PANGRAMS = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "Sphinx of black quartz, judge my vow",
  "How vexingly quick daft zebras jump",
  "The five boxing wizards jump quickly",
];

export default function ToolHome() {
  const [input, setInput] = useState("The quick brown fox jumps over the lazy dog");
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!input.trim()) {
      setAnalysis(null);
      return;
    }

    let text = input;
    if (ignoreCase) text = text.toLowerCase();

    const lettersOnly = text.replace(/[^a-z]/g, "");
    const present = new Set(lettersOnly.split(""));
    const missing = ALPHABET.filter((l) => !present.has(l));
    const used = ALPHABET.filter((l) => present.has(l));
    const totalUnique = used.length;
    const isPangram = totalUnique === 26;

    setAnalysis({
      isPangram,
      totalUnique,
      missing,
      used,
      presentCount: present.size,
      totalLetters: lettersOnly.length,
    });
  }, [input, ignoreCase]);

  const loadSample = (sample) => setInput(sample);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <CheckCircle2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Pangram Checker</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Text, Education</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Check if a sentence uses every letter of the alphabet at least once.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["26-letter check", "Visual grid", "Fast"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Type size={14} className="text-primary" />
                  Enter Text
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PANGRAMS.map((s) => (
                    <button
                      key={s}
                      onClick={() => loadSample(s)}
                      className="text-[10px] font-bold text-primary hover:underline px-2 py-1 bg-primary/5 rounded"
                    >
                      Sample {SAMPLE_PANGRAMS.indexOf(s) + 1}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a sentence to check..."
                rows={4}
                className="w-full bg-surface-soft border border-border rounded-xl text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />

              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Ignore Case (treat A = a)
              </label>
            </div>

            {analysis && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <List size={14} className="text-primary" />
                  Alphabet Coverage
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALPHABET.map((letter) => {
                    const isPresent = analysis.used.includes(letter);
                    return (
                      <div
                        key={letter}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs border transition ${
                          isPresent
                            ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                            : "border-red-500/30 bg-red-500/5 text-red-500"
                        }`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-teal-500"></span> Present ({analysis.used.length})</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500"></span> Missing ({analysis.missing.length})</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-primary" />
                Results
              </h2>

              {!analysis ? (
                <div className="text-center p-6 text-xs text-muted-foreground italic">Waiting for input...</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-surface-soft">
                    {analysis.isPangram ? (
                      <div className="text-center space-y-2">
                        <CheckCircle2 size={48} className="text-primary mx-auto animate-bounce" />
                        <div className="text-lg font-black text-primary">PANGRAM</div>
                        <p className="text-[10px] text-muted-foreground max-w-[180px] mx-auto">
                          Contains all 26 letters of the alphabet.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <AlertCircle size={48} className="text-red-500 mx-auto" />
                        <div className="text-lg font-black text-red-500">NOT A PANGRAM</div>
                        <p className="text-[10px] text-muted-foreground max-w-[180px] mx-auto">
                          Missing {analysis.missing.length} letter{analysis.missing.length !== 1 ? "s" : ""}.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-xs text-foreground bg-surface-soft p-4 rounded-xl border border-border leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unique Letters</span>
                      <span className="font-bold">{analysis.presentCount} / 26</span>
                    </div>
                    <div className="flex justify-between border-t border-border/60 pt-2">
                      <span className="text-muted-foreground">Total Letters</span>
                      <span className="font-bold">{analysis.totalLetters}</span>
                    </div>
                    {analysis.missing.length > 0 && (
                      <div className="border-t border-border/60 pt-2">
                        <span className="text-muted-foreground block mb-1">Missing Letters</span>
                        <span className="text-red-500 font-bold">{analysis.missing.join(", ").toUpperCase()}</span>
                      </div>
                    )}
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
