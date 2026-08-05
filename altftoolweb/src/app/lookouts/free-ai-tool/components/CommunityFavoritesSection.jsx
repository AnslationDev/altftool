"use client";

import { useMemo, useState } from "react";
import { Globe, Star } from "lucide-react";
import ToolLogo from "./ToolLogo";
import RatingStars from "./RatingStars";
import ScrollReveal from "./ScrollReveal";
import { ALL_TOOLS_BY_ID, DESIGN_CATEGORIES, formatVisits } from "../data/designTools";
import { useOpenTool } from "../hooks/useOpenTool";

const ALL_TOOLS = [...ALL_TOOLS_BY_ID.values()];

const CATEGORY_OPTIONS = [{ id: "all", label: "All Categories" }, ...DESIGN_CATEGORIES.map((c) => ({ id: c.label, label: c.label }))];

const MODES = [
  { id: "rated", label: "Highest Rated", icon: Star },
  { id: "visited", label: "Most Visited", icon: Globe },
];

// Gold / silver / bronze treatment for the top 3 rows — everything past that
// stays a plain numbered row so the medal treatment reads as special.
const RANK_MEDALS = [
  { bg: "bg-gradient-to-br from-amber-300 to-yellow-500", shadow: "shadow-amber-400/40", wash: "bg-amber-50/60" },
  { bg: "bg-gradient-to-br from-slate-300 to-slate-400", shadow: "shadow-slate-400/30", wash: "bg-slate-50/60" },
  { bg: "bg-gradient-to-br from-orange-300 to-amber-600", shadow: "shadow-orange-400/40", wash: "bg-orange-50/50" },
];

const RING_COLORS = ["ring-violet-200", "ring-rose-200", "ring-amber-200", "ring-emerald-200", "ring-blue-200", "ring-fuchsia-200"];

const CATEGORY_TAG_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
];

// Deterministic per-category color so a tool's tag stays the same color
// whether you're viewing "Highest Rated" or "Most Visited".
function hashIndex(str, mod) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash % mod;
}

export default function CommunityFavoritesSection() {
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("rated");
  const handleToolClick = useOpenTool();

  const ranked = useMemo(() => {
    const pool = category === "all" ? ALL_TOOLS : ALL_TOOLS.filter((t) => t.category === category);
    const withMetric = pool.map((t) => ({
      tool: t,
      metric: mode === "rated" ? t.rating : t.weeklyVisits,
    }));
    return withMetric.sort((a, b) => b.metric - a.metric).slice(0, 10);
  }, [category, mode]);

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20 bg-[#F3F4FD]">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
          ✦ Loved by the community
        </span>
        <h2 className="mt-4 text-[32px] sm:text-[36px] font-bold tracking-tight text-[#0A0523]">Community Favorites</h2>
        <p className="mt-2 text-base text-[#0A0523]/60">What real users rate and visit the most.</p>

        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/70 p-2 shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_20px_40px_rgba(10,5,35,0.03)]">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-full border-0 bg-white px-4 text-sm font-semibold text-[#0A0523]/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-full bg-slate-100/80 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition-colors ${
                  mode === m.id
                    ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-sm"
                    : "text-[#0A0523]/60 hover:text-[#0A0523]"
                }`}
              >
                <m.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-[28px] bg-white/85 shadow-[inset_1.5px_1.5px_1.5px_rgba(255,255,255,0.66),0_25px_60px_rgba(10,5,35,0.06)]">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
        {ranked.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#0A0523]/50">No tools in this category yet.</p>
        ) : (
          ranked.map(({ tool, metric }, idx) => {
            const medal = RANK_MEDALS[idx];
            const ring = RING_COLORS[hashIndex(tool.name, RING_COLORS.length)];
            const tagColor = CATEGORY_TAG_COLORS[hashIndex(tool.category, CATEGORY_TAG_COLORS.length)];
            return (
              <ScrollReveal key={tool.name} delay={idx * 40}>
                <button
                  onClick={() => handleToolClick(tool)}
                  className={`group relative flex w-full items-center gap-4 border-b border-black/5 px-5 py-4 text-left transition-all last:border-b-0 hover:z-10 hover:scale-[1.01] hover:bg-white hover:shadow-lg ${medal ? medal.wash : ""}`}
                >
                  {medal ? (
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-md ${medal.bg} ${medal.shadow}`}
                    >
                      {idx + 1}
                    </span>
                  ) : (
                    <span className="w-8 shrink-0 text-center text-sm font-bold text-[#0A0523]/30">{idx + 1}</span>
                  )}
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-2 ${ring}`}>
                    <ToolLogo name={tool.name} domain={tool.domain} size={24} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-[#0A0523]">{tool.name}</span>
                    <span className={`mt-1 inline-block truncate rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tagColor}`}>
                      {tool.category}
                    </span>
                  </span>
                  <span className="shrink-0">
                    {mode === "rated" ? (
                      <RatingStars rating={tool.rating} size={14} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0A0523]">
                        <Globe className="h-4 w-4 text-[#0A0523]/40" aria-hidden="true" />
                        {formatVisits(metric)}/wk
                      </span>
                    )}
                  </span>
                </button>
              </ScrollReveal>
            );
          })
        )}
      </div>

      <p className="relative mx-auto mt-4 max-w-3xl text-center text-xs text-[#0A0523]/35">
        Ratings and worldwide weekly-visit estimates are editorial figures, not live third-party analytics.
      </p>
    </section>
  );
}
