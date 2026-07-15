"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import NumberGenerator from "../components/NumberGenerator";
import NumberHistory from "../components/NumberHistory";
import SavedNumbers from "../components/SavedNumbers";
import Description from "../components/Description";

export default function ToolHome() {
  const [generatedNumbers, setGeneratedNumbers] = useState(null);
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [activeTab, setActiveTab] = useState("generator");

  useEffect(() => {
    const savedData = localStorage.getItem("luckyNumbers_saved");
    const historyData = localStorage.getItem("luckyNumbers_history");
    if (savedData) setSaved(JSON.parse(savedData));
    if (historyData) setHistory(JSON.parse(historyData).slice(0, 50));
  }, []);

  const saveToStorage = useCallback((key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const handleGenerate = useCallback((numbers, mode, label) => {
    const entry = {
      id: Date.now(),
      numbers,
      mode,
      label,
      timestamp: new Date().toISOString(),
    };

    setGeneratedNumbers(numbers);
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 50);
      saveToStorage("luckyNumbers_history", updated);
      return updated;
    });
  }, [saveToStorage]);

  const handleSave = useCallback((numbers, mode) => {
    const entry = {
      id: Date.now(),
      numbers,
      mode,
      timestamp: new Date().toISOString(),
    };
    setSaved((prev) => {
      const exists = prev.some(
        (s) => JSON.stringify(s.numbers) === JSON.stringify(numbers)
      );
      if (exists) return prev;
      const updated = [entry, ...prev].slice(0, 20);
      saveToStorage("luckyNumbers_saved", updated);
      return updated;
    });
  }, [saveToStorage]);

  const handleRemoveSaved = useCallback((id) => {
    setSaved((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveToStorage("luckyNumbers_saved", updated);
      return updated;
    });
  }, [saveToStorage]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    saveToStorage("luckyNumbers_history", []);
  }, [saveToStorage]);

  const tabs = [
    { key: "generator", label: "Generator", icon: "dice-6" },
    { key: "history", label: "History", icon: "clock", count: history.length },
    { key: "saved", label: "Saved", icon: "heart", count: saved.length },
  ];

  const getIcon = (name) => {
    const icons = {
      "dice-6": (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      clock: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      heart: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    };
    return icons[name] || null;
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Header />

        <div className="flex gap-1 bg-(--page) rounded-xl p-1 border border-(--border) max-w-md mx-auto">
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

        {activeTab === "generator" && (
          <NumberGenerator
            onGenerate={handleGenerate}
            generatedNumbers={generatedNumbers}
            onSave={handleSave}
          />
        )}

        {activeTab === "history" && (
          <NumberHistory
            history={history}
            onClear={handleClearHistory}
            onUse={(entry) => {
              setGeneratedNumbers(entry.numbers);
              setActiveTab("generator");
            }}
          />
        )}

        {activeTab === "saved" && (
          <SavedNumbers
            saved={saved}
            onRemove={handleRemoveSaved}
            onUse={(entry) => {
              setGeneratedNumbers(entry.numbers);
              setActiveTab("generator");
            }}
          />
        )}

        <Description />
      </div>
    </main>
  );
}
