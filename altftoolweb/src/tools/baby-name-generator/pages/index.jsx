"use client";

import React, { useState } from "react";
import { Baby, Copy, Check, Heart, Sparkles, Filter } from "lucide-react";

const BABY_NAMES = [
  { name: "Liam", gender: "male", origin: "Irish", meaning: "Strong-willed warrior" },
  { name: "Olivia", gender: "female", origin: "Latin", meaning: "Olive tree, peace" },
  { name: "Noah", gender: "male", origin: "Hebrew", meaning: "Rest, comfort" },
  { name: "Emma", gender: "female", origin: "Germanic", meaning: "Universal, whole" },
  { name: "Oliver", gender: "male", origin: "Latin", meaning: "Olive tree" },
  { name: "Charlotte", gender: "female", origin: "French", meaning: "Free man" },
  { name: "James", gender: "male", origin: "Hebrew", meaning: "Supplanter" },
  { name: "Amelia", gender: "female", origin: "Germanic", meaning: "Work" },
  { name: "Elijah", gender: "male", origin: "Hebrew", meaning: "My God is Yahweh" },
  { name: "Sophia", gender: "female", origin: "Greek", meaning: "Wisdom" },
  { name: "Mateo", gender: "male", origin: "Spanish", meaning: "Gift of God" },
  { name: "Mia", gender: "female", origin: "Italian", meaning: "Mine, bitter" },
  { name: "Lucas", gender: "male", origin: "Greek", meaning: "Light-giving" },
  { name: "Isabella", gender: "female", origin: "Italian", meaning: "Pledged to God" },
  { name: "Henry", gender: "male", origin: "Germanic", meaning: "Home ruler" },
  { name: "Evelyn", gender: "female", origin: "English", meaning: "Desired, life" },
  { name: "Alexander", gender: "male", origin: "Greek", meaning: "Defender of men" },
  { name: "Harper", gender: "female", origin: "English", meaning: "Harp player" },
  { name: "Sebastian", gender: "male", origin: "Latin", meaning: "Venerable" },
  { name: "Luna", gender: "female", origin: "Latin", meaning: "Moon" },
  { name: "Jack", gender: "male", origin: "English", meaning: "God is gracious" },
  { name: "Chloe", gender: "female", origin: "Greek", meaning: "Blooming" },
  { name: "Owen", gender: "male", origin: "Welsh", meaning: "Young warrior" },
  { name: "Stella", gender: "female", origin: "Latin", meaning: "Star" },
  { name: "Theodore", gender: "male", origin: "Greek", meaning: "Gift of God" },
  { name: "Aurora", gender: "female", origin: "Latin", meaning: "Dawn" },
  { name: "Gabriel", gender: "male", origin: "Hebrew", meaning: "God is my strength" },
  { name: "Hazel", gender: "female", origin: "English", meaning: "The hazel tree" },
  { name: "Julian", gender: "male", origin: "Latin", meaning: "Youthful" },
  { name: "Violet", gender: "female", origin: "Latin", meaning: "Purple flower" },
  { name: "Ezra", gender: "male", origin: "Hebrew", meaning: "Help" },
  { name: "Iris", gender: "female", origin: "Greek", meaning: "Rainbow" },
  { name: "Asher", gender: "male", origin: "Hebrew", meaning: "Blessed, happy" },
  { name: "Penelope", gender: "female", origin: "Greek", meaning: "Weaver" },
  { name: "Levi", gender: "male", origin: "Hebrew", meaning: "Joined, attached" },
  { name: "Layla", gender: "female", origin: "Arabic", meaning: "Night" },
  { name: "Dylan", gender: "neutral", origin: "Welsh", meaning: "Son of the sea" },
  { name: "Avery", gender: "neutral", origin: "English", meaning: "Elf counsel" },
  { name: "Quinn", gender: "neutral", origin: "Irish", meaning: "Wisdom, chief" },
  { name: "Rowan", gender: "neutral", origin: "Gaelic", meaning: "Little red-haired one" },
  { name: "Sage", gender: "neutral", origin: "Latin", meaning: "Wise" },
  { name: "Finley", gender: "neutral", origin: "Scottish", meaning: "Fair warrior" },
];

const ORIGINS = [...new Set(BABY_NAMES.map((n) => n.origin))];

export default function ToolHome() {
  const [genderFilter, setGenderFilter] = useState("any");
  const [originFilter, setOriginFilter] = useState("any");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const filtered = BABY_NAMES.filter((n) => {
    if (genderFilter !== "any" && n.gender !== genderFilter && !(genderFilter === "neutral" && n.gender === "neutral")) return false;
    if (genderFilter === "neutral" && n.gender !== "neutral") return false;
    if (originFilter !== "any" && n.origin !== originFilter) return false;
    if (searchTerm && !n.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const toggleFavorite = (name) => {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const copyName = (text, index) => {
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
                <Baby className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Baby Name Generator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Lifestyle, Fun</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Discover meaningful baby names with origins, meanings, and popularity trends.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Curated list", "Meanings included", "Free"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground uppercase">Filters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["any", "male", "female", "neutral"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                    genderFilter === g
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-soft border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-xs font-bold text-foreground"
            >
              <option value="any">Any Origin</option>
              {ORIGINS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search names..."
              className="px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-xs text-foreground flex-1 min-w-[160px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n, index) => (
            <div
              key={n.name}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{n.name}</h3>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{n.gender} · {n.origin}</span>
                </div>
                <button
                  onClick={() => toggleFavorite(n.name)}
                  className="p-1.5 rounded-lg hover:bg-surface-soft transition"
                >
                  <Heart
                    size={16}
                    className={favorites.includes(n.name) ? "fill-red-500 text-red-500" : "text-muted-foreground"}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{n.meaning}</p>
              <button
                onClick={() => copyName(n.name, index)}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
              >
                {copiedIndex === index ? (
                  <><Check size={12} /> Copied</>
                ) : (
                  <><Copy size={12} /> Copy</>
                )}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-12">No names match your filters. Try adjusting the criteria.</p>
        )}

        {favorites.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Heart size={14} className="text-primary" />
              Your Favorites ({favorites.length})
            </h2>
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
  );
}
