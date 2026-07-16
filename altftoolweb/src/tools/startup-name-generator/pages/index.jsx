"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Bookmark,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
  Star,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import BrandingPanel from "../components/BrandingPanel";

// Suffixes and Prefixes for Naming Engine
const PREFIXES = {
  Technology: ["Nexa", "Zentro", "Code", "Cloud", "Pixel", "Flow", "Data", "Meta", "Omni", "Neo", "Syn", "Aero", "Helix", "Quant"],
  Finance: ["Fin", "Pay", "Fund", "Invest", "Coin", "Ledger", "Mint", "Cap", "Yield", "Vault"],
  Healthcare: ["Medi", "Care", "Health", "Cure", "Vital", "Pulse", "Bio", "Sana"],
  Food: ["Taste", "Cook", "Yum", "Feast", "Bite", "Crave", "Nutri"],
  default: ["Nova", "Altra", "Omni", "Helix", "Stellar", "Core", "Vibe", "Apex", "Edge", "Vortex"],
};

const SUFFIXES = {
  Technology: ["rix", "bit", "nova", "io", "ix", "ly", "lab", "grid", "hub", "wave"],
  Finance: ["ora", "nest", "iq", "vest", "sure", "pay", "ledger"],
  Healthcare: ["flow", "nest", "ora", "life", "pulse", "care"],
  Food: ["ora", "ify", "nest", "y", "bite", "craze"],
  default: ["ify", "ly", "ora", "io", "ix", "ex", "nest", "hub", "lab", "wave", "grid", "lytic"],
};

const INDUSTRY_KEYWORDS = {
  Technology: ["tech", "digital", "system", "code", "dev", "cloud", "pixel", "data", "cyber", "ai"],
  ArtificialIntelligence: ["ai", "neural", "intel", "mind", "cogni", "smart", "deep", "synapse", "bot"],
  Finance: ["pay", "wealth", "trust", "capital", "coin", "gold", "yield", "ledger", "mint"],
  Healthcare: ["care", "cure", "well", "medi", "health", "life", "vital", "clinic", "pulse"],
  Education: ["learn", "ed", "scholar", "mind", "academy", "skill", "wise", "brain", "tutor"],
  Gaming: ["play", "game", "arc", "pixel", "quest", "level", "spawn", "rift", "vibe"],
  Food: ["bite", "taste", "crave", "chef", "yummy", "sweet", "spice", "fresh", "grill"],
};

const BRAND_PERSONALITIES = {
  Modern: ["Clean", "Sleek", "Adaptable"],
  Minimal: ["Simple", "Essential", "Direct"],
  Luxury: ["Premium", "Elite", "Sophisticated"],
  Premium: ["Exclusive", "High-End", "Quality"],
  Futuristic: ["Visionary", "Next-Gen", "Bold"],
  Friendly: ["Warm", "Approachable", "Kind"],
  Corporate: ["Professional", "Established", "Solid"],
};

const EXTRA_TOOL_LABELS = [
  "Startup Name", "Business Name", "Company Name", "Brand Name", "Product Name",
  "Website Name", "Domain Suggestions", "App Name", "Agency Name", "YouTube Channel Name",
  "Startup Slogan", "Brand Tagline", "Mission Statement", "Elevator Pitch"
];

export default function StartupNameGeneratorApp() {
  // Input form state
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeyword, setSecondaryKeyword] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [style, setStyle] = useState("Modern");
  const [length, setLength] = useState("Medium");
  const [format, setFormat] = useState("Random");
  const [extraTool, setExtraTool] = useState("Startup Name");

  // Output names list
  const [generatedNames, setGeneratedNames] = useState([]);
  const [selectedNameIdx, setSelectedNameIdx] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLength, setFilterLength] = useState("All");
  const [sortBy, setSortBy] = useState("Score"); // Score, Alphabetical, Newest

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load favorites from local storage
  useEffect(() => {
    const saved = localStorage.getItem("startup_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveFavoritesToLocalStorage = (updated) => {
    setFavorites(updated);
    localStorage.setItem("startup_favorites", JSON.stringify(updated));
  };

  const handleToggleFavorite = (item) => {
    const isFav = favorites.some((f) => f.name === item.name);
    let updated;
    if (isFav) {
      updated = favorites.filter((f) => f.name !== item.name);
    } else {
      updated = [...favorites, item];
    }
    saveFavoritesToLocalStorage(updated);
  };

  // Naming Engine logic
  const handleGenerate = () => {
    const list = [];
    const seedWord = primaryKeyword.trim() || "Nova";
    const secondSeed = secondaryKeyword.trim() || "";

    const prefixes = PREFIXES[industry] || PREFIXES.default;
    const suffixes = SUFFIXES[industry] || SUFFIXES.default;
    const industryWords = INDUSTRY_KEYWORDS[industry] || ["brand", "core", "apex"];

    // Dynamic tagline suggestions based on industry
    const taglineTemplates = [
      "Innovating Tomorrow.",
      "The Future of " + industry + ".",
      "Simplicity Redefined.",
      "Empowering Growth.",
      "Your Vision, Realized.",
      "Next Generation Platforms."
    ];

    const colorsPreset = [
      { primary: "#4f46e5", secondary: "#06b6d4", accent: "#22c55e" },
      { primary: "#0f766e", secondary: "#22d3ee", accent: "#f59e0b" },
      { primary: "#be185d", secondary: "#f472b6", accent: "#10b981" },
      { primary: "#1e1b4b", secondary: "#818cf8", accent: "#f43f5e" },
      { primary: "#4338ca", secondary: "#22c55e", accent: "#eab308" }
    ];

    const personalities = BRAND_PERSONALITIES[style] || ["Innovative", "Modern", "Dynamic"];

    let attempts = 0;
    while (list.length < 50 && attempts < 500) {
      attempts++;
      let finalName = "";
      const randPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const randIndustry = industryWords[Math.floor(Math.random() * industryWords.length)];

      // Choose naming patterns based on format choice
      const currentFormat = format === "Random" 
        ? ["One Word", "Two Words", "Compound Word", "Prefix + Word", "Word + Suffix"][Math.floor(Math.random() * 5)]
        : format;

      if (currentFormat === "One Word" || currentFormat === "Invented Word") {
        const syllable = seedWord.slice(0, Math.ceil(seedWord.length / 2));
        finalName = syllable + randSuffix;
      } else if (currentFormat === "Two Words") {
        finalName = seedWord + " " + (secondSeed || randPrefix);
      } else if (currentFormat === "Compound Word") {
        finalName = seedWord + (secondSeed || randSuffix);
      } else if (currentFormat === "Prefix + Word") {
        finalName = randPrefix + seedWord;
      } else if (currentFormat === "Word + Suffix") {
        finalName = seedWord + randSuffix;
      } else {
        // Fallback compound
        finalName = randPrefix + randSuffix;
      }

      // Format capitalizations correctly
      finalName = finalName.replace(/\s+/g, " ").trim();
      finalName = finalName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

      // Avoid duplication
      if (list.some((item) => item.name === finalName)) {
        continue;
      }

      // Scoring profiles
      const overall = Math.round(80 + Math.random() * 20);
      const popularity = Math.round(75 + Math.random() * 25);
      const pronunciation = Math.round(80 + Math.random() * 20);
      const memorability = Math.round(75 + Math.random() * 25);
      const availability = Math.round(60 + Math.random() * 40);

      list.push({
        id: Date.now() + list.length,
        name: finalName,
        industry,
        style,
        length: finalName.length < 8 ? "Short" : finalName.length < 13 ? "Medium" : "Long",
        scores: { overall, popularity, pronunciation, memorability, availability },
        tagline: taglineTemplates[Math.floor(Math.random() * taglineTemplates.length)],
        colors: colorsPreset[Math.floor(Math.random() * colorsPreset.length)],
        fontRecommendation: ["Space Grotesk", "Sora", "Poppins", "Inter"][Math.floor(Math.random() * 4)],
        personality: [...personalities, "Future Ready"],
        logoStyle: ["minimal", "geometric", "gradient"][Math.floor(Math.random() * 3)],
        keywords: [seedWord, secondSeed || industry].filter(Boolean),
        created: Date.now()
      });
    }

    setGeneratedNames(list);
    setSelectedNameIdx(0);
    setShowFavoritesOnly(false);
  };

  // Generate initial names list on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  // Filtered & Sorted names computations
  const visibleNames = useMemo(() => {
    const list = showFavoritesOnly ? favorites : generatedNames;
    
    let filtered = list.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterLength !== "All") {
      filtered = filtered.filter((item) => item.length === filterLength);
    }

    if (sortBy === "Alphabetical") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Score") {
      filtered.sort((a, b) => b.scores.overall - a.scores.overall);
    } else if (sortBy === "Newest") {
      filtered.sort((a, b) => b.created - a.created);
    }

    return filtered;
  }, [showFavoritesOnly, generatedNames, favorites, searchTerm, filterLength, sortBy]);

  const activeName = visibleNames[selectedNameIdx] || visibleNames[0] || null;

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Core Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Branding Suite
            </span>
            <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Startup Name Generator
            </h1>
          </div>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              showFavoritesOnly
                ? "bg-yellow-500/10 border-yellow-500/35 text-yellow-500"
                : "border-border hover:bg-secondary text-foreground"
            }`}
          >
            <Bookmark className="w-4 h-4" /> 
            {showFavoritesOnly ? `Show All (${generatedNames.length})` : `Show Favorites (${favorites.length})`}
          </button>
        </div>

        {/* Extra Branding Context selector tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/60 scrollbar-none">
          {EXTRA_TOOL_LABELS.map((tool) => (
            <button
              key={tool}
              onClick={() => {
                setExtraTool(tool);
                handleGenerate();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                extraTool === tool
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-secondary"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>

        {/* Main interactive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Config controls */}
          <div className="lg:col-span-4 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider text-muted-foreground">
              Branding Parameters
            </h3>

            {/* Keyword inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Primary Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Code, Nexus, Yum"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-card text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Secondary Keyword (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Lab, Flow, Nest"
                  value={secondaryKeyword}
                  onChange={(e) => setSecondaryKeyword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded bg-card text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Selection parameters */}
            <div className="space-y-4 border-t border-border pt-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Target Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border rounded bg-card text-foreground focus:outline-none"
                >
                  {["Technology", "Artificial Intelligence", "Finance", "Healthcare", "Education", "Gaming", "Food"].map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Style Tone</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-border rounded bg-card text-foreground focus:outline-none"
                  >
                    {["Modern", "Minimal", "Luxury", "Premium", "Classic", "Futuristic", "Friendly", "Corporate"].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Name Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-border rounded bg-card text-foreground focus:outline-none"
                  >
                    {["Random", "One Word", "Two Words", "Compound Word", "Prefix + Word", "Word + Suffix", "Invented Word"].map((fmt) => (
                      <option key={fmt} value={fmt}>{fmt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Run Naming Engine (50 Names)
            </button>
          </div>

          {/* Right panel: Names list & detailed inspect view */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Detailed inspect panel for active name selection */}
            {activeName ? (
              <BrandingPanel
                nameData={activeName}
                onToggleFavorite={() => handleToggleFavorite(activeName)}
                isFavorite={favorites.some((f) => f.name === activeName.name)}
                onGenerateSimilar={(similarSeed) => {
                  setPrimaryKeyword(similarSeed);
                  handleGenerate();
                }}
              />
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                No matching names found. Try adjusting keywords or clearing search filters.
              </div>
            )}

            {/* Generated list with filtering */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              
              {/* Filter controls header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm text-foreground">Generated Brand Catalog</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search names..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-card text-foreground focus:outline-none w-40"
                    />
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  </div>

                  {/* Sort selector */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-border rounded bg-card text-foreground focus:outline-none"
                  >
                    <option value="Score">Best Score</option>
                    <option value="Alphabetical">Alphabetical</option>
                    <option value="Newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Grid of brand names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {visibleNames.map((item, idx) => {
                  const isSelected = activeName?.name === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelectedNameIdx(idx)}
                      className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/80 hover:border-primary/50 hover:bg-secondary/40"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm text-foreground block">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block uppercase tracking-wider">{item.style} &bull; {item.length}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {item.scores.overall}
                        </span>
                        {favorites.some((f) => f.name === item.name) && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
