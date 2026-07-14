"use client";

import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Search, Heart, History } from "lucide-react";
import useHydrated from "@/hooks/useHydrated";

import GeneratorPanel from "../components/GeneratorPanel";
import SearchPanel from "../components/SearchPanel";
import FavoritesPanel from "../components/FavoritesPanel";
import HistoryPanel from "../components/HistoryPanel";

import { CHARACTERS } from "../utils/characters";
import { loadJSON, saveJSON, makeKey } from "../utils/storage";
import { charKey, pickRandom, pickMultiple } from "../utils/search";

const TABS = [
  { id: "generator", label: "Generator", icon: Wand2 },
  { id: "search", label: "Search", icon: Search },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "history", label: "History", icon: History },
];

const HISTORY_LIMIT = 60;

export default function ToolHome() {
  const hydrated = useHydrated();
  const [tab, setTab] = useState("generator");
  const [generated, setGenerated] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const cardRefs = useRef({});

  // Load persisted data after hydration (nested fn, safe set-state-in-effect).
  useEffect(() => {
    if (!hydrated) return;
    const load = () => {
      try {
        const f = loadJSON(makeKey("favorites"), []);
        const h = loadJSON(makeKey("history"), []);
        if (Array.isArray(f)) setFavorites(f);
        if (Array.isArray(h)) setHistory(h);
      } catch {
        // ignore
      }
    };
    load();
  }, [hydrated]);

  // Persist favorites.
  useEffect(() => {
    if (!hydrated) return;
    const save = () => saveJSON(makeKey("favorites"), favorites);
    save();
  }, [hydrated, favorites]);

  // Persist history.
  useEffect(() => {
    if (!hydrated) return;
    const save = () => saveJSON(makeKey("history"), history);
    save();
  }, [hydrated, history]);

  const addToHistory = (item) => {
    setHistory((prev) => {
      const rest = prev.filter((h) => charKey(h) !== charKey(item));
      return [item, ...rest].slice(0, HISTORY_LIMIT);
    });
  };

  const handleSelect = (payload) => {
    if (Array.isArray(payload)) {
      setGenerated(payload);
      setTab("generator");
      return;
    }
    setGenerated([payload]);
    addToHistory(payload);
    setTab("generator");
  };

  const handleGenerateRandom = () => {
    const pick = pickRandom(CHARACTERS);
    if (!pick) return;
    setGenerated([pick]);
    addToHistory(pick);
    toast.success(`Generated “${pick.char}”`);
  };

  const handleToggleFavorite = (item) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => charKey(f) === charKey(item));
      if (exists) {
        toast.success("Removed from favorites");
        return prev.filter((f) => charKey(f) !== charKey(item));
      }
      toast.success("Added to favorites");
      return [item, ...prev];
    });
  };

  const handleRemoveFavorite = (item) => {
    setFavorites((prev) => prev.filter((f) => charKey(f) !== charKey(item)));
  };

  const handleClearFavorites = () => setFavorites([]);
  const handleClearHistory = () => setHistory([]);

  const tabBtn = (active) =>
    `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
      active
        ? "bg-(--primary) text-(--primary-foreground)"
        : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:text-(--foreground)"
    }`;

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <div className="mb-8 pt-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
          <Sparkles size={14} />
          Chinese Character Studio
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Chinese Character Generator
        </h1>
        <p className="description mx-auto mt-3 max-w-2xl text-(--muted-foreground)">
          Generate authentic Chinese characters by category with meanings,
          pinyin, stroke counts, and Unicode. Copy, favorite, and download as
          PNG or SVG.
        </p>
      </div>

      {/* Tabs */}
      <div className="mx-auto mb-8 flex max-w-3xl flex-wrap justify-center gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={tabBtn(tab === t.id)}
              aria-pressed={tab === t.id}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "generator" && (
            <GeneratorPanel
              items={generated}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelect={handleSelect}
              cardRefs={cardRefs}
            />
          )}
          {tab === "search" && (
            <SearchPanel
              source={CHARACTERS}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelect={handleSelect}
              cardRefs={cardRefs}
            />
          )}
          {tab === "favorites" && (
            <FavoritesPanel
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onClear={handleClearFavorites}
              onSelect={handleSelect}
              cardRefs={cardRefs}
            />
          )}
          {tab === "history" && (
            <HistoryPanel
              history={history}
              onClear={handleClearHistory}
              onSelect={handleSelect}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
