"use client";

import React from "react";
import { Brain, Plus, Download, Upload, Search, Clock, X } from "lucide-react";
import { useMemoryCapsule } from "../hooks/useMemoryCapsule";
import { exportCapsulesData } from "../utils/capsuleDb";
import { TIME_PERIODS } from "../constants/index";
import CapsuleCard from "../components/CapsuleCard";
import CapsuleForm from "../components/CapsuleForm";
import CapsuleDetail from "../components/CapsuleDetail";
import StatisticsPanel from "../components/StatisticsPanel";
import MoodAnalysis from "../components/MoodAnalysis";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";

export default function AIMemoryCapsule() {
  const {
    capsules,
    categories,
    isLoaded,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isFormOpen,
    setIsFormOpen,
    editingCapsule,
    setEditingCapsule,
    selectedCapsule,
    setSelectedCapsule,
    toasts,
    addToast,
    timePeriod,
    setTimePeriod,
    filteredCapsules,
    insights,
    tabs,
    handleSaveCapsule,
    handleDelete,
    handleToggleFavorite,
    handleTogglePin,
  } = useMemoryCapsule();

  const handleExport = (format) => {
    const url = exportCapsulesData(format);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memory-capsules-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    addToast(`Exported as ${format.toUpperCase()}`, "success");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          addToast(`Found ${imported.length} capsules to import`, "info");
        }
      } catch {
        addToast("Invalid JSON file", "danger");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Brain className="h-4 w-4" /> AI Memory
            </div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
              <Brain className="h-7 w-7 text-[var(--primary)]" />
            </div>
            <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">AI Memory Capsule</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Capture your memories, get AI-powered mood analysis, discover emotional patterns, and preserve moments in sealed time capsules.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-2 mt-2 sm:mt-0">
            <button onClick={() => handleExport("json")} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
              <Download size={16} /> Export
            </button>
            <div className="relative overflow-hidden inline-block">
              <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                <Upload size={16} /> Import
              </button>
              <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 cursor-pointer opacity-0" />
            </div>
            <button onClick={() => { setEditingCapsule(null); setIsFormOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-colors">
              <Plus size={16} /> New Memory
            </button>
          </div>
        </section>

        {capsules.length > 0 && <StatisticsPanel insights={insights} />}
        {capsules.length > 2 && <MoodAnalysis capsules={capsules} />}

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto flex-1 overflow-x-auto pb-2 sm:pb-0">
              <div className="flex gap-1">
                {tabs.map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full sm:w-72 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search memories..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {TIME_PERIODS.map((tp) => (
              <button key={tp.id} onClick={() => setTimePeriod(tp.id)}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-colors ${timePeriod === tp.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
                <Clock size={10} /> {tp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {filteredCapsules.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCapsules.map((capsule) => (
                <CapsuleCard key={capsule.id} capsule={capsule}
                  onEdit={(c) => { setEditingCapsule(c); setIsFormOpen(true); }}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onTogglePin={handleTogglePin}
                  onSelect={setSelectedCapsule}
                  onAnalyze={setSelectedCapsule} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
              <div className="rounded-full bg-[var(--muted)] p-4">
                <Brain size={32} className="text-[var(--muted-foreground)]" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">
                {searchQuery ? "No memories match your search" : "No memories yet"}
              </h3>
              <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                {searchQuery ? "Try a different search term or clear the filter." : "Start capturing your memories. Each one gets AI-powered mood analysis and insights."}
              </p>
              {!searchQuery && (
                <button onClick={() => { setEditingCapsule(null); setIsFormOpen(true); }}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-colors">
                  <Plus size={16} /> Create First Memory
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] pt-8">
          <HowItWorks />
          <div className="border-t border-[var(--border)] pt-8">
            <Features />
          </div>
        </div>
      </div>

      <CapsuleForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveCapsule} categories={categories} editingCapsule={editingCapsule} />
      <CapsuleDetail capsule={selectedCapsule} onClose={() => setSelectedCapsule(null)} />

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${
              t.tone === "success" ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
              : t.tone === "danger" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
            }`}>
            {t.message}
          </div>
        ))}
      </div>
    </main>
  );
}
