"use client";

import React, { useState } from "react";
import { TextCursorInput, Copy, Check, ArrowRightLeft, Sparkles } from "lucide-react";

const THEME_WORDS = {
  tech: ["Artificial", "Intelligence", "Network", "Digital", "Cloud", "Secure", "Automated", "Virtual", "Smart", "Rapid", "Optimized", "Dynamic", "Unified", "Neural", "Quantum"],
  business: ["Global", "Strategic", "Executive", "Corporate", "Financial", "Operational", "Integrated", "Professional", "Innovative", "Analytical", "Efficient", "Scalable", "Agile", "Venture"],
  creative: ["Artistic", "Visionary", "Creative", "Original", "Bold", "Fresh", "Modern", "Unique", "Inspired", "Vivid", "Dynamic", "Expressive", "Imaginative", "Concept"],
  health: ["Vital", "Natural", "Holistic", "Clinical", "Therapeutic", "Wellness", "Healthy", "Medical", "Organic", "Pure", "Balanced", "Healing", "Active", "Nourish"],
};

export default function ToolHome() {
  const [mode, setMode] = useState("phrase-to-acronym");
  const [phrase, setPhrase] = useState("");
  const [letters, setLetters] = useState("");
  const [theme, setTheme] = useState("tech");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const makeAcronym = () => {
    if (!phrase.trim()) return;
    const words = phrase.trim().split(/\s+/);
    const acronym = words.map((w) => w.charAt(0).toUpperCase()).join("");
    const expansions = words.map((w, i) => ({
      word: w,
      first: w.charAt(0).toUpperCase(),
      index: i,
    }));
    setResult({ acronym, expansions, mode: "phrase-to-acronym" });
  };

  const expandLetters = () => {
    const chars = letters.replace(/[^a-zA-Z]/g, "").toUpperCase().split("");
    if (chars.length === 0) return;
    const words = THEME_WORDS[theme] || THEME_WORDS.tech;
    const expansions = chars.map((char) => {
      const match = words.find((w) => w.charAt(0).toUpperCase() === char);
      return { letter: char, word: match || `${char} —` };
    });
    const acronym = chars.join("");
    setResult({ acronym, expansions, mode: "letters-to-phrase" });
  };

  const copyResult = () => {
    if (!result) return;
    const text = result.expansions.map((e) => e.word || e.letter).join(" ");
    navigator.clipboard.writeText(`${result.acronym}: ${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <TextCursorInput className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Acronym Generator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Text, Content Creation</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Create acronyms from phrases or generate phrase expansions from your acronym letters.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMode("phrase-to-acronym")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    mode === "phrase-to-acronym"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-soft border border-border text-foreground hover:border-primary"
                  }`}
                >
                  Phrase → Acronym
                </button>
                <button
                  onClick={() => setMode("letters-to-phrase")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    mode === "letters-to-phrase"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-soft border border-border text-foreground hover:border-primary"
                  }`}
                >
                  Letters → Phrase
                </button>
              </div>

              {mode === "phrase-to-acronym" ? (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Enter a Phrase</label>
                  <textarea
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder="e.g., Advanced Network Technology Solutions"
                    rows={3}
                    className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                  <button
                    onClick={makeAcronym}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft size={16} />
                    Generate Acronym
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Enter Letters</label>
                  <input
                    value={letters}
                    onChange={(e) => setLetters(e.target.value)}
                    placeholder="e.g., NASA"
                    className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Theme</label>
                    <div className="flex flex-wrap gap-2">
                      {["tech", "business", "creative", "health"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                            theme === t
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-soft border border-border text-foreground hover:border-primary"
                          }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={expandLetters}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    Expand Letters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TextCursorInput size={14} className="text-primary" />
                Result
              </h2>

              {result ? (
                <div className="space-y-4">
                  <div className="p-6 bg-surface-soft rounded-xl border border-border text-center">
                    <span className="text-4xl font-black tracking-[0.2em] text-primary">{result.acronym}</span>
                  </div>

                  <div className="space-y-2">
                    {result.expansions.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2 bg-surface-soft rounded-lg border border-border">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-black">
                          {e.first || e.letter}
                        </span>
                        <span className="text-sm text-foreground">{e.word || e.letter}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={copyResult}
                    className="w-full py-2.5 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-surface-soft transition flex items-center justify-center gap-2"
                  >
                    {copied ? <><Check size={14} className="text-primary" /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-12">
                  Enter a phrase or letters above to generate an acronym.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
