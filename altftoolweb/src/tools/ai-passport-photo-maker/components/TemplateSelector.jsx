"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Star } from "lucide-react";
import { PASSPORT_TEMPLATES, PASSPORT_COUNTRIES } from "../constants/templates";

const categories = [
  { id: "all", label: "All" },
  { id: "passport", label: "Passport" },
  { id: "visa", label: "Visa" },
  { id: "custom", label: "Custom" },
];

const countryFlagMap = {
  IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺",
  EU: "🇪🇺", AE: "🇦🇪", SG: "🇸🇬", JP: "🇯🇵", "--": "🌐",
};

export default function TemplateSelector({
  templates = PASSPORT_TEMPLATES,
  selected,
  onSelect = () => {},
  favorites = [],
  onToggleFavorite = () => {},
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("");

  const filtered = useMemo(() => {
    let list = templates;
    if (category !== "all") {
      list = list.filter((t) => t.type === category);
    }
    if (country) {
      list = list.filter((t) => t.country === country);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.country.toLowerCase().includes(q));
    }
    return list;
  }, [templates, search, category, country]);

  return (
    <div className="flex flex-col gap-3">
      <div className="sticky top-0 z-10 bg-(--page) pb-2 flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-(--border) bg-(--card) text-sm text-(--foreground)
              placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/40 focus:border-(--primary)"
            aria-label="Search templates"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 min-h-11 rounded-lg text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) active:scale-[0.98] motion-reduce:active:scale-100
                ${category === cat.id
                  ? "bg-(--primary) text-(--primary-foreground) shadow-sm"
                  : "bg-(--card) text-(--muted-foreground) border border-(--border) hover:border-(--primary) hover:text-(--primary)"}`}
              aria-pressed={category === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-(--border) bg-(--card) text-sm text-(--foreground)
              appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--primary)/40 focus:border-(--primary)"
            aria-label="Filter by country"
          >
            <option value="">All Countries</option>
            {PASSPORT_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3 py-12 text-(--muted-foreground)"
          >
            <Search size={36} />
            <p className="text-sm font-medium">No templates found</p>
            <p className="text-xs">Try a different search or filter</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {filtered.map((template) => {
              const isSelected = selected === template.id;
              const isFav = favorites.includes(template.id);
              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="group relative"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(template.id)}
                    className={`flex h-full w-full flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-(--primary)/40 cursor-pointer
                      ${isSelected
                        ? "border-(--primary) bg-(--primary-soft)/10 shadow-sm"
                        : "border-(--border) bg-(--card) hover:border-(--border-strong) hover:shadow-sm"}`}
                    aria-pressed={isSelected}
                    aria-label={template.name}
                  >
                    <span className="text-2xl" role="img" aria-label={template.country}>
                      {countryFlagMap[template.country] || "🌐"}
                    </span>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-semibold text-(--foreground) text-center leading-tight">{template.name}</span>
                      <span className="text-[10px] text-(--muted-foreground)">{template.label}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                      ${template.type === "passport" ? "bg-(--primary-soft)/20 text-(--primary)" : ""}
                      ${template.type === "visa" ? "bg-amber-500/10 text-amber-600" : ""}
                      ${template.type === "custom" ? "bg-blue-500/10 text-blue-600" : ""}`}
                    >
                      {template.type}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(template)}
                    className={`absolute top-2 right-2 p-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary) focus-visible:opacity-100
                      ${isFav ? "text-amber-500" : "text-(--muted-foreground) opacity-0 group-hover:opacity-100 hover:opacity-100"}`}
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star size={14} fill={isFav ? "currentColor" : "none"} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
