"use client";
import { useState, useMemo } from "react";
import { Clipboard, Search, Star, RotateCcw, Clock } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CATEGORIES = {
  arrows: {
    label: "Arrows",
    symbols: [
      "\u2190", "\u2191", "\u2192", "\u2193", "\u2194", "\u2195",
      "\u2196", "\u2197", "\u2198", "\u2199", "\u21a9", "\u21aa",
      "\u21b0", "\u21b1", "\u21b2", "\u21b3", "\u21c4", "\u21c5",
      "\u21c6", "\u21c7", "\u21c8", "\u21c9", "\u21ca", "\u21cb",
      "\u21cc", "\u21cd", "\u21ce", "\u21cf", "\u21d0", "\u21d1",
      "\u21d2", "\u21d3", "\u21d4", "\u21d5", "\u2b05", "\u2b06",
      "\u2b07", "\u2b08", "\u2b09", "\u2b0a", "\u2b0b", "\u2b0c",
      "\u2b0d", "\u2b0e", "\u2b0f", "\u2b10", "\u2b11", "\u27a1",
      "\u27f0", "\u27f1", "\u27f2", "\u27f3",
    ],
  },
  stars: {
    label: "Stars",
    symbols: [
      "\u2605", "\u2606", "\u2726", "\u2727", "\u2728", "\u2729",
      "\u272a", "\u272b", "\u272c", "\u272d", "\u272e", "\u272f",
      "\u2730", "\u2731", "\u2732", "\u2733", "\u2734", "\u2735",
      "\u2736", "\u2737", "\u2738", "\u2739", "\u273a", "\u273b",
      "\u273c", "\u273d", "\u273e", "\u273f", "\u2740", "\u2b50",
      "\u2b51", "\u2b52", "\u2b53", "\u2b54",
    ],
  },
  hearts: {
    label: "Hearts",
    symbols: [
      "\u2661", "\u2665", "\u2764", "\u2765", "\u2766", "\u2767",
      "\u2768", "\u2769", "\u276a", "\u276b", "\u276c", "\u276d",
      "\u276e", "\u276f", "\u2770", "\u2771", "\u2772", "\u2773",
      "\u2774", "\u2775", "\u2660", "\u2663", "\u2666", "\u2662",
      "\u2667", "\u2664", "\u2661",
    ],
  },
  math: {
    label: "Mathematical",
    symbols: [
      "\u00b1", "\u00d7", "\u00f7", "\u221a", "\u221b", "\u221c",
      "\u221e", "\u2220", "\u2221", "\u2222", "\u2225", "\u2227",
      "\u2228", "\u2229", "\u222a", "\u222b", "\u222c", "\u222e",
      "\u2234", "\u2235", "\u2236", "\u2237", "\u223c", "\u2243",
      "\u2245", "\u2248", "\u2260", "\u2261", "\u2264", "\u2265",
      "\u2282", "\u2283", "\u2284", "\u2286", "\u2287", "\u2295",
      "\u2296", "\u2297", "\u2298", "\u2299", "\u22c5", "\u22c6",
      "\u2211", "\u220f", "\u2202", "\u2207", "\u2208", "\u2209",
      "\u2223", "\u226a", "\u226b", "\u222e",
    ],
  },
  currency: {
    label: "Currency",
    symbols: [
      "\u0024", "\u00a2", "\u00a3", "\u00a4", "\u00a5", "\u058f",
      "\u060b", "\u07fe", "\u07ff", "\u09f2", "\u09f3", "\u0af1",
      "\u0bf9", "\u0e3f", "\u17db", "\u20a0", "\u20a1", "\u20a2",
      "\u20a3", "\u20a4", "\u20a5", "\u20a6", "\u20a7", "\u20a8",
      "\u20a9", "\u20aa", "\u20ab", "\u20ac", "\u20ad", "\u20ae",
      "\u20af", "\u20b0", "\u20b1", "\u20b2", "\u20b3", "\u20b4",
      "\u20b5", "\u20b6", "\u20b7", "\u20b8", "\u20b9", "\u20ba",
      "\u20bb", "\u20bc", "\u20bd", "\u20be", "\u20bf", "\u20c0",
      "\u20c1", "\u20c2", "\u20c3", "\u20c4", "\u20c5",
      "\u00a2", "\u00a3", "\u00a5", "\u20ac",
    ],
  },
  music: {
    label: "Music",
    symbols: [
      "\u2669", "\u266a", "\u266b", "\u266c", "\u266d", "\u266e",
      "\u266f", "\u264f", "\u1d11e", "\u1d11f", "\u1d120", "\u1d121",
      "\u1d122", "\u1d123", "\u1d124", "\u1d125", "\u1d126", "\u1d129",
      "\u1d12a", "\u1d12b", "\u1d12c", "\u1d12d", "\u1d12e", "\u1d12f",
      "\u1d130", "\u1d131", "\u1d132", "\u1d133", "\u1d134", "\u1d135",
      "\u266a", "\u266b",
    ],
  },
  box: {
    label: "Box Drawing",
    symbols: [
      "\u2500", "\u2501", "\u2502", "\u2503", "\u2504", "\u2505",
      "\u2506", "\u2507", "\u2508", "\u2509", "\u250a", "\u250b",
      "\u250c", "\u250d", "\u250e", "\u250f", "\u2510", "\u2511",
      "\u2512", "\u2513", "\u2514", "\u2515", "\u2516", "\u2517",
      "\u2518", "\u2519", "\u251a", "\u251b", "\u251c", "\u251d",
      "\u251e", "\u251f", "\u2520", "\u2521", "\u2522", "\u2523",
      "\u2524", "\u2525", "\u2526", "\u2527", "\u2528", "\u2529",
      "\u252a", "\u252b", "\u252c", "\u252d", "\u252e", "\u252f",
      "\u2530", "\u2531", "\u2532", "\u2533", "\u2534", "\u2535",
      "\u2536", "\u2537", "\u2538", "\u2539", "\u253a", "\u253b",
      "\u253c", "\u253d", "\u253e", "\u253f", "\u2540", "\u2541",
      "\u2542", "\u2543", "\u2544", "\u2545", "\u2546", "\u2547",
      "\u2548", "\u2549", "\u254a", "\u254b",
    ],
  },
  greek: {
    label: "Greek",
    symbols: [
      "\u0391", "\u0392", "\u0393", "\u0394", "\u0395", "\u0396",
      "\u0397", "\u0398", "\u0399", "\u039a", "\u039b", "\u039c",
      "\u039d", "\u039e", "\u039f", "\u03a0", "\u03a1", "\u03a3",
      "\u03a4", "\u03a5", "\u03a6", "\u03a7", "\u03a8", "\u03a9",
      "\u03b1", "\u03b2", "\u03b3", "\u03b4", "\u03b5", "\u03b6",
      "\u03b7", "\u03b8", "\u03b9", "\u03ba", "\u03bb", "\u03bc",
      "\u03bd", "\u03be", "\u03bf", "\u03c0", "\u03c1", "\u03c2",
      "\u03c3", "\u03c4", "\u03c5", "\u03c6", "\u03c7", "\u03c8",
      "\u03c9",
    ],
  },
  misc: {
    label: "Miscellaneous",
    symbols: [
      "\u00a9", "\u00ae", "\u2122", "\u2020", "\u2021", "\u2022",
      "\u2023", "\u2024", "\u2025", "\u2026", "\u2030", "\u2031",
      "\u2032", "\u2033", "\u2034", "\u2039", "\u203a", "\u203c",
      "\u2042", "\u2044", "\u2045", "\u2046", "\u2047", "\u2048",
      "\u2049", "\u204a", "\u204b", "\u204c", "\u204d", "\u204e",
      "\u204f", "\u2050", "\u2051", "\u2052", "\u2053", "\u2054",
      "\u2055", "\u2056", "\u2057", "\u2611", "\u2612", "\u2614",
      "\u2615", "\u2618", "\u261a", "\u261b", "\u261c", "\u261d",
      "\u261e", "\u261f", "\u2620", "\u2622", "\u2623", "\u2626",
      "\u262a", "\u262e", "\u262f", "\u2638", "\u2639", "\u263a",
      "\u2640", "\u2642", "\u2648", "\u2649", "\u264a", "\u264b",
      "\u264c", "\u264d", "\u264e", "\u264f", "\u2650", "\u2651",
      "\u2652", "\u2653", "\u2660", "\u2663", "\u2665", "\u2666",
      "\u2668", "\u267b", "\u267e", "\u267f", "\u2692", "\u2693",
      "\u2694", "\u2695", "\u2696", "\u2697", "\u2698", "\u2699",
      "\u269a", "\u269b", "\u269c", "\u26a0", "\u26a1", "\u26aa",
      "\u26ab", "\u26b0", "\u26b1", "\u26bd", "\u26be", "\u26c4",
      "\u26c5", "\u26c8", "\u26cf", "\u26d1", "\u26d3", "\u26d4",
      "\u26e9", "\u26ea", "\u26f0", "\u26f1", "\u26f2", "\u26f3",
      "\u26f4", "\u26f5", "\u26f7", "\u26f8", "\u26f9", "\u26fa",
      "\u26fd", "\u26ff", "\u2702", "\u2705", "\u2708", "\u2709",
      "\u270a", "\u270b", "\u270c", "\u270d", "\u270e", "\u270f",
      "\u2712", "\u2714", "\u2716", "\u271d", "\u2721", "\u2728",
      "\u2733", "\u2734", "\u2744", "\u2747", "\u274c", "\u274e",
      "\u2753", "\u2754", "\u2755", "\u2757", "\u2763", "\u2764",
      "\u2795", "\u2796", "\u2797", "\u27a1", "\u27b0", "\u27bf",
      "\u2934", "\u2935", "\u2b05", "\u2b06", "\u2b07", "\u2b1b",
      "\u2b1c", "\u2b50", "\u2b55", "\u3030", "\u303d", "\u3297",
      "\u3299",
    ],
  },
};

export default function ToolHome() {
  const [activeCategory, setActiveCategory] = useState("arrows");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [copied, setCopied] = useState("");

  const currentCategory = CATEGORIES[activeCategory];

  const filteredSymbols = useMemo(() => {
    if (!searchTerm) return currentCategory?.symbols || [];
    const lower = searchTerm.toLowerCase();
    return Object.values(CATEGORIES)
      .flatMap((cat) => cat.symbols)
      .filter((sym) => {
        const name = sym;
        try {
          const desc = `U+${sym.codePointAt(0).toString(16).toUpperCase()}`;
          return desc.includes(lower) || name.includes(lower);
        } catch {
          return false;
        }
      });
  }, [searchTerm, currentCategory]);

  const displaySymbols = searchTerm ? filteredSymbols : currentCategory?.symbols || [];

  const handleCopy = async (sym) => {
    const ok = await safeCopyText(sym);
    if (ok) {
      setCopied(sym);
      setRecent((prev) => {
        const filtered = prev.filter((s) => s !== sym);
        return [sym, ...filtered].slice(0, 20);
      });
      setTimeout(() => setCopied(""), 1500);
    }
  };

  const toggleFavorite = (sym) => {
    setFavorites((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <h1 className="text-3xl font-bold text-(--foreground)">Unicode Symbol Generator</h1>
          <p className="mt-1 text-(--muted-foreground)">
            Browse and copy from a large library of categorized Unicode symbols
          </p>
        </div>

        <div className="relative">
          <Search size="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbols by name or code..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-(--border) bg-(--card) text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--primary) text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).map(([id, cat]) => (
            <button
              key={id}
              onClick={() => { setActiveCategory(id); setSearchTerm(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                activeCategory === id && !searchTerm
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
              }`}
            >
              {cat.label} ({cat.symbols.length})
            </button>
          ))}
        </div>

        {recent.length > 0 && !searchTerm && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock size="14" className="text-(--muted-foreground)" />
              <h2 className="text-sm font-semibold text-(--foreground)">Recently Copied</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((sym, i) => (
                <button
                  key={`recent-${i}`}
                  onClick={() => handleCopy(sym)}
                  className={`w-10 h-10 rounded-xl bg-(--muted) border border-(--border) text-lg flex items-center justify-center hover:border-(--primary) transition ${
                    copied === sym ? "border-(--primary) bg-(--primary)/10" : ""
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {favorites.length > 0 && !searchTerm && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Star size="14" className="text-amber-400" />
              <h2 className="text-sm font-semibold text-(--foreground)">Favorites</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {favorites.map((sym, i) => (
                <button
                  key={`fav-${i}`}
                  onClick={() => handleCopy(sym)}
                  className={`w-10 h-10 rounded-xl bg-(--muted) border border-(--border) text-lg flex items-center justify-center hover:border-(--primary) transition ${
                    copied === sym ? "border-(--primary) bg-(--primary)/10" : ""
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-(--foreground)">
              {searchTerm ? `Search Results (${displaySymbols.length})` : `${currentCategory?.label} (${displaySymbols.length})`}
            </h2>
            <span className="text-xs text-(--muted-foreground">
              {searchTerm ? "across all categories" : currentCategory?.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {displaySymbols.map((sym, i) => {
              let codePoint;
              try { codePoint = sym.codePointAt(0); } catch { codePoint = null; }
              return (
                <div key={`sym-${i}`} className="group relative">
                  <button
                    onClick={() => handleCopy(sym)}
                    className={`w-10 h-10 rounded-xl bg-(--muted) border border-(--border) text-lg flex items-center justify-center hover:border-(--primary) hover:bg-(--primary)/5 transition ${
                      copied === sym ? "border-(--primary) bg-(--primary)/10" : ""
                    }`}
                  >
                    {sym}
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="bg-(--foreground) text-(--background) text-[10px] px-2 py-0.5 rounded whitespace-nowrap font-mono">
                      U+{codePoint?.toString(16).toUpperCase().padStart(4, "0")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {displaySymbols.length === 0 && (
            <p className="text-sm text-(--muted-foreground) text-center py-8">No symbols found</p>
          )}
        </div>
      </div>
    </main>
  );
}
