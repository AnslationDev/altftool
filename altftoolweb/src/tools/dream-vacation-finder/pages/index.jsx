"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import PreferenceQuiz from "../components/PreferenceQuiz";
import ResultsGrid from "../components/ResultsGrid";
import DestinationCard from "../components/DestinationCard";
import History from "../components/History";
import Description from "../components/Description";
import { findDestinations, getRandomDestination } from "../utils/matcher";
import DESTINATIONS from "../utils/destinations";

export default function ToolHome() {
  const [results, setResults] = useState(null);
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("finder");
  const [surpriseDest, setSurpriseDest] = useState(null);
  const [surprisedNames, setSurprisedNames] = useState([]);
  const [viewedDestination, setViewedDestination] = useState(null);

  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem("dreamVacation_saved");
      if (storedSaved) {
        const parsed = JSON.parse(storedSaved);
        // Older versions stored just destination names — upgrade them to
        // full destination records so Saved entries can be viewed and
        // removed correctly. Names that no longer match any destination
        // are dropped rather than shown as broken entries.
        const migrated = parsed
          .map((entry) =>
            typeof entry === "string" ? DESTINATIONS.find((d) => d.name === entry) : entry
          )
          .filter(Boolean);
        setSaved(migrated);
      }
    } catch {
      /* corrupted or legacy data — ignore and start fresh */
    }
    try {
      const storedHistory = localStorage.getItem("dreamVacation_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch {
      /* corrupted or legacy data — ignore and start fresh */
    }
    try {
      const storedSurprised = localStorage.getItem("dreamVacation_surprised");
      if (storedSurprised) setSurprisedNames(JSON.parse(storedSurprised));
    } catch {
      /* corrupted or legacy data — ignore and start fresh */
    }
  }, []);

  const persist = useCallback((key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const handleSubmit = useCallback((answers) => {
    setIsLoading(true);
    setTimeout(() => {
      const scored = findDestinations(answers);
      setResults(scored);
      setSurpriseDest(null);
      setViewedDestination(null);

      const entry = {
        id: Date.now(),
        answers,
        topResult: scored[0]?.name,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, 30);
        persist("dreamVacation_history", updated);
        return updated;
      });
      setIsLoading(false);
    }, 600);
  }, [persist]);

  const shuffleResults = useCallback(() => {
    setResults((prev) => {
      if (!prev || prev.length <= 2) return prev;
      const [top, ...rest] = prev;
      const poolSize = Math.min(20, rest.length);
      const pool = rest.slice(0, poolSize);
      // Fisher-Yates shuffle of the strongest remaining matches, so
      // "Shuffle Results" surfaces a genuinely different set of secondary
      // destinations each time instead of recomputing the same order.
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return [top, ...pool, ...rest.slice(poolSize)];
    });
  }, []);

  const handleSurprise = useCallback(() => {
    const used = [...history.map((h) => h.topResult).filter(Boolean), ...surprisedNames];
    const dest = getRandomDestination(used);
    setSurpriseDest(dest);
    setResults(null);
    setViewedDestination(null);
    setSurprisedNames((prev) => {
      if (prev.includes(dest.name)) return prev;
      const updated = [...prev, dest.name];
      persist("dreamVacation_surprised", updated);
      return updated;
    });
  }, [history, surprisedNames, persist]);

  const handleSave = useCallback(
    (destination) => {
      setSaved((prev) => {
        const exists = prev.some((d) => d.name === destination.name);
        const updated = exists
          ? prev.filter((d) => d.name !== destination.name)
          : [destination, ...prev].slice(0, 20);
        persist("dreamVacation_saved", updated);
        return updated;
      });
    },
    [persist]
  );

  const isSaved = useCallback((name) => saved.some((d) => d.name === name), [saved]);

  const handleRemove = useCallback(
    (idOrName) => {
      setHistory((prev) => {
        const updated = prev.filter((h) => h.id !== idOrName);
        persist("dreamVacation_history", updated);
        return updated;
      });
      setSaved((prev) => {
        const updated = prev.filter((d) => d.name !== idOrName);
        persist("dreamVacation_saved", updated);
        return updated;
      });
    },
    [persist]
  );

  const handleClear = useCallback(() => {
    if (
      !window.confirm(
        "Clear all saved destinations and search history? This cannot be undone."
      )
    ) {
      return;
    }
    setHistory([]);
    setSaved([]);
    persist("dreamVacation_history", []);
    persist("dreamVacation_saved", []);
  }, [persist]);

  const handleUse = useCallback(
    (entry) => {
      setActiveTab("finder");
      if (entry.answers) {
        setViewedDestination(null);
        handleSubmit(entry.answers);
        return;
      }
      // Saved entries carry their own destination data — show it directly
      // instead of trying to replay a quiz submission that may not exist
      // (a saved destination might never have been anyone's top result).
      setResults(null);
      setSurpriseDest(null);
      setViewedDestination(entry);
    },
    [handleSubmit]
  );

  const tabs = [
    { key: "finder", label: "Finder", icon: "search" },
    { key: "saved", label: "Saved", icon: "heart", count: saved.length },
  ];

  const getIcon = (name) => {
    if (name === "search") {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Header />

        <div className="flex gap-1 bg-(--page) rounded-xl p-1 border border-(--border) max-w-xs mx-auto">
          {tabs.map(({ key, label, icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-lg transition ${
                activeTab === key
                  ? "bg-(--surface) text-(--foreground) shadow-sm border border-(--border)"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              {getIcon(icon)}
              {label}
              {count > 0 && (
                <span className="text-xs bg-(--primary)/10 text-(--primary) px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "finder" && (
          <div className="space-y-6">
            {!results && !surpriseDest && !viewedDestination ? (
              <PreferenceQuiz
                onSubmit={handleSubmit}
                onSurprise={handleSurprise}
                isLoading={isLoading}
              />
            ) : (
              <>
                {surpriseDest && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] text-sm font-medium mb-2">
                        🎲 Surprise Destination
                      </div>
                      <p className="text-sm text-(--muted-foreground)">
                        Let fate decide your next adventure!
                      </p>
                    </div>
                    <div className="max-w-md mx-auto">
                      <DestinationCard
                        destination={{ ...surpriseDest, score: 0.5 }}
                        rank={0}
                        onSave={handleSave}
                        isSaved={isSaved(surpriseDest.name)}
                      />
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => { setResults(null); setSurpriseDest(null); }}
                        className="px-5 py-2.5 rounded-xl border border-(--border) text-sm font-medium hover:bg-(--page) transition"
                      >
                        Try Preferences
                      </button>
                      <button
                        onClick={handleSurprise}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--primary) text-white font-semibold text-sm hover:opacity-90 transition shadow-md"
                      >
                        Another Surprise
                      </button>
                    </div>
                  </div>
                )}
                {viewedDestination && (
                  <div className="space-y-6">
                    <div className="max-w-md mx-auto">
                      <DestinationCard
                        destination={{ ...viewedDestination, score: viewedDestination.score ?? 0.5 }}
                        rank={0}
                        onSave={handleSave}
                        isSaved={isSaved(viewedDestination.name)}
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setViewedDestination(null)}
                        className="px-5 py-2.5 rounded-xl border border-(--border) text-sm font-medium hover:bg-(--page) transition"
                      >
                        Back to Finder
                      </button>
                    </div>
                  </div>
                )}
                {results && (
                  <ResultsGrid
                    results={results}
                    saved={saved}
                    onSave={handleSave}
                    onReset={() => { setResults(null); setSurpriseDest(null); setViewedDestination(null); }}
                    onRegenerate={shuffleResults}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <History
            history={[
              ...saved.map((d) => ({ ...d, saved: true, id: d.name })),
              ...history.map((h) => ({
                ...h,
                name: h.topResult || "Search",
              })),
            ]}
            onClear={handleClear}
            onUse={handleUse}
            onRemove={handleRemove}
          />
        )}

        <Description />
      </div>
    </main>
  );
}
