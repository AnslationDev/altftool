"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import PreferenceQuiz from "../components/PreferenceQuiz";
import ResultsGrid from "../components/ResultsGrid";
import DestinationCard from "../components/DestinationCard";
import History from "../components/History";
import Description from "../components/Description";
import { findDestinations, getRandomDestination } from "../utils/matcher";

export default function ToolHome() {
  const [results, setResults] = useState(null);
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("finder");
  const [surpriseDest, setSurpriseDest] = useState(null);

  useEffect(() => {
    const storedSaved = localStorage.getItem("dreamVacation_saved");
    const storedHistory = localStorage.getItem("dreamVacation_history");
    if (storedSaved) setSaved(JSON.parse(storedSaved));
    if (storedHistory) setHistory(JSON.parse(storedHistory));
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

      const entry = {
        id: Date.now(),
        answers,
        topResult: scored[0]?.name,
        timestamp: new Date().toISOString(),
        saved: false,
      };
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, 30);
        persist("dreamVacation_history", updated);
        return updated;
      });
      setIsLoading(false);
    }, 600);
  }, [persist]);

  const handleSurprise = useCallback(() => {
    const used = history.map((h) => h.topResult).filter(Boolean);
    const dest = getRandomDestination(used);
    setSurpriseDest(dest);
    setResults(null);
  }, [history]);

  const handleSave = useCallback(
    (destination) => {
      setSaved((prev) => {
        const exists = prev.includes(destination.name);
        const updated = exists
          ? prev.filter((n) => n !== destination.name)
          : [destination.name, ...prev].slice(0, 20);
        persist("dreamVacation_saved", updated);
        return updated;
      });

      setHistory((prev) => {
        const updated = prev.map((h) =>
          h.topResult === destination.name ? { ...h, saved: !h.saved } : h
        );
        persist("dreamVacation_history", updated);
        return updated;
      });
    },
    [persist]
  );

  const handleRemove = useCallback(
    (idOrName) => {
      setHistory((prev) => {
        const updated = prev.filter(
          (h) => h.id !== idOrName && h.name !== idOrName
        );
        persist("dreamVacation_history", updated);
        return updated;
      });
      setSaved((prev) => {
        const updated = prev.filter((n) => n !== idOrName);
        persist("dreamVacation_saved", updated);
        return updated;
      });
    },
    [persist]
  );

  const handleClear = useCallback(() => {
    setHistory([]);
    setSaved([]);
    persist("dreamVacation_history", []);
    persist("dreamVacation_saved", []);
  }, [persist]);

  const handleUse = useCallback((entry) => {
    if (entry.answers) {
      handleSubmit(entry.answers);
    }
    setActiveTab("finder");
  }, [handleSubmit]);

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
            {!results && !surpriseDest ? (
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
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium mb-2">
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
                        isSaved={saved.includes(surpriseDest.name)}
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
                {results && (
                  <ResultsGrid
                    results={results}
                    saved={saved}
                    onSave={handleSave}
                    onReset={() => { setResults(null); setSurpriseDest(null); }}
                    onRegenerate={() => handleSubmit(
                      history[0]?.answers || {}
                    )}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <History
            history={[
              ...saved.map((name) => ({ name, saved: true, id: name })),
              ...history.filter((h) => !h.saved).map((h) => ({
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
