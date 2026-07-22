"use client";

import React, { useState, useCallback } from "react";
import { Shuffle, Copy, Check, RefreshCw, Type } from "lucide-react";

function shuffleString(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

export default function ToolHome() {
  const [input, setInput] = useState("listen");
  const [count, setCount] = useState(10);
  const [anagrams, setAnagrams] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateAnagrams = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const result = new Set();
    result.add(text);

    let attempts = 0;
    while (result.size < Math.min(count, 100) && attempts < 1000) {
      result.add(shuffleString(text));
      attempts++;
    }

    setAnagrams(Array.from(result));
  }, [input, count]);

  const copyAnagram = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Shuffle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Anagram Generator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Text, Fun</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Rearrange any word or phrase into multiple anagram variations for wordplay and puzzles.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Type size={14} className="text-primary" />
                Input
              </h2>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a word or phrase..."
                rows={3}
                className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Number of Anagrams ({count})</label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <button
                onClick={generateAnagrams}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Generate Anagrams
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Shuffle size={14} className="text-primary" />
                Anagrams
              </h2>

              {anagrams.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {anagrams.map((word, index) => (
                    <div
                      key={index}
                      className="group relative px-4 py-2.5 bg-surface-soft rounded-lg border border-border hover:border-primary transition"
                    >
                      <span className="text-sm font-mono font-bold text-foreground">{word}</span>
                      <button
                        onClick={() => copyAnagram(word, index)}
                        className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition inline-flex"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3 h-3 text-primary" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-12">
                  Enter a word or phrase above and click "Generate Anagrams" to get started.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
