"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Globe,
  Search,
  Copy,
  Star,
  Volume2,
  Sparkles,
  Shuffle,
} from "lucide-react";
import { GREETINGS } from "../data/greetings";

// Maps the `language` field in data/greetings.js to a BCP-47 tag so the
// read-aloud button uses a voice that can actually pronounce the script,
// instead of always forcing en-US. Languages not listed here (mostly Latin
// script) fall back to en-US.
const LANGUAGE_VOICE_TAGS = {
  Japanese: "ja-JP",
  Mandarin: "zh-CN",
  Hindi: "hi-IN",
  Korean: "ko-KR",
  Russian: "ru-RU",
  Greek: "el-GR",
  Arabic: "ar-SA",
  Thai: "th-TH",
  Hebrew: "he-IL",
  Persian: "fa-IR",
};

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(GREETINGS[0]);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("greeting_favorites") || "[]");
      if (Array.isArray(saved)) setFavorites(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Stop any in-progress speech synthesis when the tool unmounts, so
  // navigating away mid-pronunciation doesn't leave the browser talking on
  // an unrelated page.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const persist = useCallback((next) => {
    setFavorites(next);
    try {
      localStorage.setItem("greeting_favorites", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GREETINGS;
    return GREETINGS.filter(
      (g) =>
        g.country.toLowerCase().includes(q) ||
        g.language.toLowerCase().includes(q) ||
        g.greeting.toLowerCase().includes(q) ||
        g.pronunciation.toLowerCase().includes(q)
    );
  }, [query]);

  const copyGreeting = useCallback(async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(`${selected.greeting} (${selected.language})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [selected]);

  const speak = useCallback((text, language) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANGUAGE_VOICE_TAGS[language] || "en-US";
    window.speechSynthesis.speak(u);
  }, []);

  const toggleFav = useCallback(
    (country) => {
      if (favorites.includes(country)) {
        persist(favorites.filter((c) => c !== country));
      } else {
        persist([...favorites, country]);
      }
    },
    [favorites, persist]
  );

  const randomCountry = useCallback(() => {
    const pick = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setSelected(pick);
  }, []);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-(--border) bg-(--card) p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--muted) text-(--primary)">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--foreground) leading-none">
                Country Greeting Finder
              </h1>
              <p className="text-xs text-(--muted-foreground) mt-1.5 max-w-xl leading-relaxed">
                Find how to say hello in the native language of any country, with pronunciation
                guides, formal and informal variants, common replies, and cultural notes.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-(--muted-foreground)">
            {["Runs locally", "Favorites", `${GREETINGS.length} countries`].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--background) px-2 py-1"
              >
                <Sparkles className="h-3 w-3 text-(--primary)" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Search + list */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or language…"
                aria-label="Search country or language"
                className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-9 pr-3 text-sm text-(--foreground) outline-none focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,0.25)] transition"
              />
            </div>
            <div className="mt-3 max-h-[420px] space-y-1 overflow-y-auto pr-1">
              {results.length === 0 ? (
                <p className="py-6 text-center text-xs italic text-(--muted-foreground)">
                  No countries match &ldquo;{query}&rdquo;.
                </p>
              ) : (
                results.map((g) => (
                  <button
                    key={g.country}
                    onClick={() => setSelected(g)}
                    aria-current={selected?.country === g.country ? "true" : undefined}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                      selected?.country === g.country
                        ? "border-(--primary) bg-(--muted)"
                        : "border-transparent hover:bg-(--muted)"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-(--background) px-1.5 py-0.5 text-[10px] font-bold text-(--muted-foreground)">
                        {g.flag}
                      </span>
                      <span className="text-sm font-semibold text-(--foreground)">{g.country}</span>
                    </div>
                    <span className="font-mono text-xs text-(--primary)">{g.greeting}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail */}
          <div
            className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm"
            aria-live="polite"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-(--muted) px-2 py-1 text-[11px] font-bold text-(--muted-foreground)">
                      {selected.flag}
                    </span>
                    <h2 className="text-lg font-bold text-(--foreground)">{selected.country}</h2>
                  </div>
                  <p className="mt-1 text-xs text-(--muted-foreground)">{selected.language}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={randomCountry}
                    className="rounded-lg border border-(--border) bg-(--background) p-2 text-(--muted-foreground) hover:text-(--primary) transition"
                    aria-label="Random country"
                  >
                    <Shuffle size={16} />
                  </button>
                  <button
                    onClick={() => toggleFav(selected.country)}
                    className={`rounded-lg border p-2 transition ${
                      favorites.includes(selected.country)
                        ? "border-amber-600 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-900/20 dark:text-amber-400"
                        : "border-(--border) bg-(--background) text-(--muted-foreground) hover:text-(--primary)"
                    }`}
                    aria-pressed={favorites.includes(selected.country)}
                    aria-label={
                      favorites.includes(selected.country) ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <Star size={16} fill={favorites.includes(selected.country) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--background) p-4">
                <p className="text-3xl font-bold text-(--foreground)">{selected.greeting}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-sm text-(--primary)">/{selected.pronunciation}/</span>
                  <button
                    onClick={() => speak(selected.greeting, selected.language)}
                    className="p-1.5 text-(--muted-foreground) hover:text-(--primary) rounded-lg transition"
                    aria-label="Pronounce greeting"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Formal</p>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">{selected.formal}</p>
                </div>
                <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Informal</p>
                  <p className="mt-1 text-sm font-semibold text-(--foreground)">{selected.informal}</p>
                </div>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Common response</p>
                <p className="mt-1 text-sm font-semibold text-(--foreground)">{selected.response}</p>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--muted) p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Cultural note</p>
                <p className="mt-1 text-xs leading-relaxed text-(--foreground)">{selected.note}</p>
              </div>

              <button
                onClick={copyGreeting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-xs font-bold text-(--primary-foreground) transition hover:opacity-90"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy greeting"}
              </button>
            </div>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold text-(--foreground) uppercase tracking-wider">
              <Star size={16} className="text-amber-500" />
              Favorites ({favorites.length})
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {favorites.map((country) => {
                const g = GREETINGS.find((x) => x.country === country);
                if (!g) return null;
                return (
                  <button
                    key={country}
                    onClick={() => setSelected(g)}
                    className="rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-semibold text-(--foreground) hover:border-(--primary) transition"
                  >
                    {country} · <span className="font-mono text-(--primary)">{g.greeting}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
