"use client";

import React, { useState } from "react";
import { Building2, Copy, Check, Sparkles, Heart, RefreshCw } from "lucide-react";

const PREFIXES = ["Apex", "Bright", "Core", "Delta", "Elite", "Fusion", "Global", "Horizon", "Ion", "Jade", "Kai", "Lume", "Merit", "Nova", "Optima", "Peak", "Quest", "Rise", "Strata", "Terra", "Ultra", "Vault", "Wave", "Xeno", "Zen"];
const SUFFIXES = ["Labs", "Studio", "Works", "Group", "Media", "Solutions", "Ventures", "Capital", "Partners", "Co", "Collective", "Global", "Digital", "Systems", "Dynamics", "Consulting", "Technologies", "Industries", "Brands", "Creative"];
const MODIFIERS = ["AI", "Pro", "Max", "Plus", "Next", "One", "First", "Smart", "Prime", "Edge", "Pure", "Shift", "Sync", "Forge", "Hub"];

const INDUSTRY_WORDS = {
  tech: ["Nexus", "Byte", "Cloud", "Data", "Code", "Pixel", "Circuit", "Logic", "Vector", "Matrix"],
  health: ["Vital", "Pulse", "Helix", "Cure", "Life", "Bloom", "Care", "Well", "Pure", "Core"],
  finance: ["Ledger", "Trust", "Equity", "Treasury", "Vault", "Capital", "Ally", "Shield", "Prime", "Summit"],
  creative: ["Canvas", "Palette", "Muse", "Craft", "Quill", "Lens", "Story", "Vision", "Arc", "Form"],
};

export default function ToolHome() {
  const [industry, setIndustry] = useState("general");
  const [style, setStyle] = useState("modern");
  const [count, setCount] = useState(10);
  const [names, setNames] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateNames = () => {
    const words = industry !== "general" ? INDUSTRY_WORDS[industry] || [] : [];
    const allWords = [...PREFIXES, ...words];
    const allSuffixes = [...SUFFIXES, ...MODIFIERS];

    const makeName = () => {
      const prefix = allWords[Math.floor(Math.random() * allWords.length)];
      const suffix = allSuffixes[Math.floor(Math.random() * allSuffixes.length)];

      if (style === "modern") {
        return `${prefix}${suffix}`;
      } else if (style === "classic") {
        return `${prefix} ${suffix}`;
      } else if (style === "prefixed") {
        let p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
        let guard = 0;
        while (p === prefix && PREFIXES.length > 1 && guard < 10) {
          p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
          guard++;
        }
        return `${p} ${prefix}`;
      }
      const m = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
      return `${prefix} ${m} ${suffix}`;
    };

    const result = [];
    const seen = new Set();
    const maxAttempts = count * 50;
    let attempts = 0;
    while (result.length < count && attempts < maxAttempts) {
      const name = makeName();
      attempts++;
      if (!seen.has(name)) {
        seen.add(name);
        result.push(name);
      }
    }
    setNames(result);
  };

  const toggleFavorite = (name) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const copyName = (text, index) => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1200);
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Building2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Business Name Generator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Marketing, Business</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Generate professional, creative business names for your brand, startup, or venture.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Industry-aware", "Multiple styles", "Free"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={14} className="text-primary" />
                Configuration
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Industry</label>
                  <div className="flex flex-wrap gap-2">
                    {["general", "tech", "health", "finance", "creative"].map((ind) => (
                      <button
                        key={ind}
                        onClick={() => setIndustry(ind)}
                        aria-pressed={industry === ind}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          industry === ind
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-soft border border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {ind.charAt(0).toUpperCase() + ind.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Style</label>
                  <div className="flex flex-wrap gap-2">
                    {["modern", "classic", "prefixed", "descriptive"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        aria-pressed={style === s}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          style === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-soft border border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bng-count" className="text-xs font-bold text-foreground uppercase tracking-wider">How Many? ({count})</label>
                  <input
                    id="bng-count"
                    type="range"
                    min={1}
                    max={30}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <button
                  onClick={generateNames}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Generate Business Names
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" />
                Suggested Names
              </h2>

              <div aria-live="polite" aria-atomic="true">
                {names.length > 0 ? (
                  <ul className="space-y-2">
                    {names.map((name, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-4 py-3 bg-surface-soft rounded-lg border border-border group/item"
                      >
                        <span className="text-sm font-bold text-foreground">{name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFavorite(name)}
                            aria-label={favorites.includes(name) ? `Remove ${name} from shortlist` : `Add ${name} to shortlist`}
                            className="p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 transition hover:bg-surface-soft"
                          >
                            <Heart
                              size={14}
                              className={favorites.includes(name) ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                            />
                          </button>
                          <button
                            onClick={() => copyName(name, index)}
                            aria-label={`Copy ${name}`}
                            className="p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 transition border border-border bg-background hover:bg-primary/10"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-12">
                    Configure options above and click "Generate Business Names" to get started.
                  </p>
                )}
              </div>
            </div>

            {favorites.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Shortlisted</h3>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((name) => (
                    <span key={name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                      {name}
                      <button onClick={() => toggleFavorite(name)} className="hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
