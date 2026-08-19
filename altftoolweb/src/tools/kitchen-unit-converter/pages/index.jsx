"use client";

import React, { useState, useEffect } from "react";
import {
  Utensils,
  Scale,
  Droplets,
  Thermometer,
  History,
  Info,
  ArrowRightLeft,
  Trash2
} from "lucide-react";
import ConverterForm from "../components/ConverterForm";
import UnitGuide from "../components/UnitGuide";

const KitchenUnitConverter = () => {
  const [history, setHistory] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem("kitchen_converter_history") : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("kitchen_converter_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  const addToHistory = (entry) => {
    setHistory(prev => [
      { id: Date.now().toString(), ...entry, date: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ]);
  };

  const clearHistory = () => {
    if (typeof window !== 'undefined' && !window.confirm("Clear all saved conversions? This can't be undone.")) return;
    setHistory([]);
  };
  const removeHistoryItem = (id) => setHistory(prev => prev.filter(item => item.id !== id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Standard Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors duration-300">
                <Utensils className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Kitchen Unit Converter</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Food & Kitchen</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Master your recipes with precision. Convert weights, volumes, and temperatures between metric and imperial units instantly.
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0 self-start md:self-auto">
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                <Scale className="h-3 w-3 text-primary" /> Weight
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                <Droplets className="h-3 w-3 text-primary" /> Volume
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                <Thermometer className="h-3 w-3 text-primary" /> Temperature
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div>
            <ConverterForm onConvert={addToHistory} />
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Conversions
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-danger uppercase tracking-wider font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-muted/30 mb-2">
                      <Scale className="h-10 w-10" />
                    </div>
                    <p className="text-sm text-muted italic">You haven't cooked yet</p>
                    <p className="text-xs text-muted/70 mt-1">Save a conversion to see it here</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id}
                      className="group relative rounded-lg border border-border bg-background/50 p-3 transition-all hover:bg-surface-soft">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted">{item.date}</span>
                          <div className="mt-1 flex items-center gap-2 text-sm font-bold">
                            <span className="text-foreground">{item.fromValue} {item.fromUnit}</span>
                            <ArrowRightLeft className="h-3 w-3 text-primary" />
                            <span className="text-primary">{item.toValue} {item.toUnit}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeHistoryItem(item.id)}
                          aria-label={`Remove ${item.fromValue} ${item.fromUnit} to ${item.toValue} ${item.toUnit} from history`}
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 group-focus-within:opacity-100 p-1.5 text-muted hover:text-danger transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <UnitGuide />
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-5">
          <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest flex items-center gap-2">
            <Info className="h-3.5 w-3.5" />
            Pro Tip
          </h4>
          <p className="text-sm text-muted leading-relaxed italic">
            "Most professional bakers weigh their ingredients (grams) rather than measuring by volume (cups) for the most consistent results."
          </p>
        </div>
      </main>
    </div>
  );
};

export default KitchenUnitConverter;
