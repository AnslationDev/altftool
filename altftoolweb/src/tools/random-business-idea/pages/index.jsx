"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import IdeaGenerator from "../components/IdeaGenerator";
import IdeaCard from "../components/IdeaCard";
import History from "../components/History";
import Description from "../components/Description";
import { generateIdeas, FILTER_OPTIONS } from "../utils/ideas";

export default function ToolHome() {
  const [ideas, setIdeas] = useState([]);
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(1);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("generator");

  useEffect(() => {
    try {
      const s = localStorage.getItem("bizIdeas_saved");
      const h = localStorage.getItem("bizIdeas_history");
      if (s) setSaved(JSON.parse(s));
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  const persist = useCallback((key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  }, []);

  const handleGenerate = useCallback((f) => {
    setIsLoading(true);
    setTimeout(() => {
      const results = generateIdeas(count, f);
      setIdeas(results);
      setFilters(f || {});

      const entries = results.map((idea) => ({
        ...idea,
        saved: false,
      }));
      setHistory((prev) => {
        const updated = [...entries, ...prev].slice(0, 50);
        persist("bizIdeas_history", updated);
        return updated;
      });
      setIsLoading(false);
    }, 500);
  }, [count, persist]);

  const handleSave = useCallback(
    (idea) => {
      setSaved((prev) => {
        const exists = prev.some((s) => s.id === idea.id);
        const updated = exists
          ? prev.filter((s) => s.id !== idea.id)
          : [idea, ...prev].slice(0, 20);
        persist("bizIdeas_saved", updated);
        return updated;
      });
      setHistory((prev) => {
        const updated = prev.map((h) =>
          h.id === idea.id ? { ...h, saved: !h.saved } : h
        );
        persist("bizIdeas_history", updated);
        return updated;
      });
    },
    [persist]
  );

  const handleRemove = useCallback(
    (id) => {
      setHistory((prev) => {
        const updated = prev.filter((h) => h.id !== id);
        persist("bizIdeas_history", updated);
        return updated;
      });
      setSaved((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        persist("bizIdeas_saved", updated);
        return updated;
      });
    },
    [persist]
  );

  const handleClear = useCallback(() => {
    setHistory([]);
    setSaved([]);
    persist("bizIdeas_history", []);
    persist("bizIdeas_saved", []);
  }, [persist]);

  const handleUse = useCallback((entry) => {
    setIdeas([entry]);
    setActiveTab("generator");
  }, []);

  const allIdeas = [...saved, ...history.filter((h) => !h.saved)];

  const tabs = [
    { key: "generator", label: "Generator", icon: "zap" },
    { key: "saved", label: "Saved", icon: "heart", count: saved.length },
  ];

  const getIcon = (name) => {
    if (name === "zap") {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
          {tabs.map(({ key, label, icon, count: c }) => (
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
              {c > 0 && (
                <span className="text-xs bg-(--primary)/10 text-(--primary) px-1.5 py-0.5 rounded-full">
                  {c}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "generator" && (
          <div className="space-y-6">
            <IdeaGenerator
              onGenerate={handleGenerate}
              isLoading={isLoading}
              count={count}
              setCount={setCount}
              filters={filters}
              setFilters={setFilters}
            />

            {isLoading && (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-3 border-(--primary) border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-(--muted-foreground) animate-pulse">Generating business ideas...</p>
              </div>
            )}

            {ideas.length > 0 && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-(--muted-foreground)">
                    Generated {ideas.length} idea{ideas.length > 1 ? "s" : ""}
                  </p>
                  <button
                    onClick={() => handleGenerate(filters)}
                    className="text-sm font-medium text-(--primary) hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
                <div className={`grid gap-4 ${ideas.length === 1 ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-1 md:grid-cols-2"}`}>
                  {ideas.map((idea, i) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      rank={ideas.length > 1 ? i : undefined}
                      onSave={handleSave}
                      isSaved={saved.some((s) => s.id === idea.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <History
            ideas={allIdeas}
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
