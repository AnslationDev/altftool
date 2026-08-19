"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Clock, Plus, Trash2, Clipboard, RefreshCw } from "lucide-react";
import { Tabs, SearchInput, ToastHost, Toast, Button, ConfirmModal } from "@altftool/ui";

import HistoryCard from "../components/HistoryCard";
import HistoryStats from "../components/HistoryStats";

import {
  getHistory,
  addEntry,
  deleteEntry,
  toggleFavorite,
  clearAll,
  clearNonFavorites,
  detectContentType,
} from "../utils/historyDb";

const ALL_TYPES = ["All", "Text", "URL", "Code", "Email", "JSON", "Number", "Color", "Favorites"];

export default function ClipboardHistoryHome() {
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const [manualInput, setManualInput] = useState("");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showClearMenu, setShowClearMenu] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const clearMenuRef = useRef(null);
  const clearTriggerRef = useRef(null);
  const toastTimersRef = useRef(new Set());
  const monitorErrorShownRef = useRef(false);

  // Load initial data
  useEffect(() => {
    setHistory(getHistory());
    setIsLoaded(true);
  }, []);

  // Close clear menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (clearMenuRef.current && !clearMenuRef.current.contains(e.target)) {
        setShowClearMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear any pending toast auto-dismiss timers on unmount
  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      toastTimersRef.current.clear();
    };
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const addToast = useCallback((message, tone = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, tone }]);
    const timerId = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current.delete(timerId);
    }, 3000);
    toastTimersRef.current.add(timerId);
  }, []);

  // ── Real-time clipboard monitoring via Clipboard API + visibility / focus ──
  const lastReadRef = useRef("");

  const captureFromClipboard = useCallback(async (source = "monitor") => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || text.trim() === "" || text.trim() === lastReadRef.current) return;
      lastReadRef.current = text.trim();
      const entry = addEntry(text);
      if (entry) {
        refreshHistory();
        if (source === "manual") {
          addToast("Captured from clipboard!", "success");
        }
      }
    } catch (err) {
      if (source === "manual") {
        addToast("Permission denied. Paste content manually below.", "danger");
      } else if (!monitorErrorShownRef.current) {
        // Rate-limited to once per monitoring session so a denied-permission
        // clipboard can't spam a toast on every focus/visibilitychange event.
        monitorErrorShownRef.current = true;
        addToast("Clipboard monitoring can't read your clipboard (permission denied). Use Capture or paste manually.", "danger");
      }
    }
  }, [refreshHistory, addToast]);

  // Monitoring: capture on window focus
  useEffect(() => {
    if (!isMonitoring) return;

    const handleFocus = () => captureFromClipboard("monitor");
    const handleVisibility = () => {
      if (document.visibilityState === "visible") captureFromClipboard("monitor");
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isMonitoring, captureFromClipboard]);

  // ── Manual text input ──
  const handleManualAdd = () => {
    if (!manualInput.trim()) return;
    const entry = addEntry(manualInput);
    if (entry) {
      refreshHistory();
      setManualInput("");
      addToast("Entry added!", "success");
    }
  };

  // ── Copy to clipboard ──
  const handleCopy = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      addToast("Copied to clipboard! 📋", "success");
    } catch {
      addToast("Failed to copy", "danger");
    }
  }, [addToast]);

  // ── Delete / Favorite ──
  const handleDelete = useCallback((id) => {
    deleteEntry(id);
    refreshHistory();
    addToast("Entry deleted", "success");
  }, [refreshHistory, addToast]);

  const handleToggleFavorite = useCallback((id) => {
    const isFav = toggleFavorite(id);
    refreshHistory();
    if (isFav) addToast("Added to favorites ⭐", "success");
  }, [refreshHistory, addToast]);

  // ── Clear ──
  const handleClearAll = () => {
    clearAll();
    refreshHistory();
    setShowClearMenu(false);
    setConfirmClearAll(false);
    addToast("History cleared", "info");
  };

  const handleClearNonFavorites = () => {
    clearNonFavorites();
    refreshHistory();
    setShowClearMenu(false);
    addToast("Non-favorites cleared", "info");
  };

  // ── Filtered list ──
  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (activeTab === "Favorites") {
      result = result.filter((e) => e.isFavorite);
    } else if (activeTab !== "All") {
      const typeKey = activeTab.toLowerCase();
      result = result.filter((e) => e.type === typeKey);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => e.content.toLowerCase().includes(q));
    }

    return result;
  }, [history, activeTab, searchQuery]);

  const tabs = ALL_TYPES.map((t) => ({ key: t, label: t }));

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Header ── */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Clock className="h-4 w-4" />
              Productivity
            </div>
            <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Clipboard History</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Track and manage everything you copy — with auto-detection of URLs, code, emails, colors, and more.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-start gap-2 mt-2 sm:mt-0">
            {/* Monitor toggle */}
            <Button
              variant={isMonitoring ? "primary" : "secondary"}
              onClick={() => {
                const next = !isMonitoring;
                if (next) monitorErrorShownRef.current = false;
                setIsMonitoring(next);
                addToast(next ? "Monitoring ON — switch to any app and copy!" : "Monitoring paused", next ? "success" : "info");
              }}
              className="gap-2"
              title={isMonitoring ? "Pause monitoring" : "Start monitoring clipboard"}
            >
              <RefreshCw size={15} className={isMonitoring ? "animate-spin" : ""} />
              {isMonitoring ? "Monitoring…" : "Start Monitor"}
            </Button>

            {/* Capture once */}
            <Button
              variant="secondary"
              onClick={() => captureFromClipboard("manual")}
              className="gap-2"
              title="Capture current clipboard content"
            >
              <Clipboard size={15} /> Capture
            </Button>

            {/* Clear menu */}
            <div
              className="relative"
              ref={clearMenuRef}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowClearMenu(false);
                  clearTriggerRef.current?.focus();
                }
              }}
            >
              <Button
                ref={clearTriggerRef}
                variant="secondary"
                onClick={() => setShowClearMenu(!showClearMenu)}
                className="gap-2 text-red-500 hover:border-red-300"
                aria-haspopup="menu"
                aria-expanded={showClearMenu}
              >
                <Trash2 size={15} /> Clear
              </Button>
              {showClearMenu && (
                <div role="menu" className="absolute right-0 top-full z-10 mt-1 w-52 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
                  <button
                    role="menuitem"
                    onClick={handleClearNonFavorites}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                  >
                    Clear non-favorites
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => { setShowClearMenu(false); setConfirmClearAll(true); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Clear everything
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <HistoryStats entries={history} />

        {/* ── Manual Input ── */}
        <div className="flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleManualAdd(); }}
            placeholder="Paste or type anything here and press 'Add' — Ctrl+Enter to quick-add…"
            aria-label="Manual clipboard entry"
            rows={2}
            className="flex-1 resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <Button variant="primary" onClick={handleManualAdd} className="shrink-0 gap-2 self-end">
            <Plus size={15} /> Add
          </Button>
        </div>

        {/* ── Filters & Search ── */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto flex-1 overflow-x-auto pb-2 sm:pb-0">
            <Tabs items={tabs} value={activeTab} onChange={setActiveTab} />
          </div>
          <div className="w-full sm:w-72 flex-shrink-0">
            <SearchInput
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
        </div>

        {/* ── History Grid ── */}
        <div className="mt-2">
          <div aria-live="polite" className="sr-only">
            {filteredHistory.length} {filteredHistory.length === 1 ? "entry" : "entries"} found
          </div>
          {filteredHistory.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHistory.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
              <div className="rounded-full bg-[var(--muted)] p-4">
                <Clock size={32} className="text-[var(--muted-foreground)]" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No history yet</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
                {searchQuery
                  ? "Nothing matches your search."
                  : activeTab !== "All"
                  ? `No ${activeTab} entries found.`
                  : 'Click "Start Monitor" to auto-capture clipboard entries, or paste text above.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastHost position="bottom-right">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            message={t.message}
            onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </ToastHost>

      <ConfirmModal
        open={confirmClearAll}
        onCancel={() => setConfirmClearAll(false)}
        onConfirm={handleClearAll}
        title="Clear everything?"
        message="This will permanently delete your entire clipboard history, including favorites. This can't be undone."
        confirmText="Clear everything"
        cancelText="Cancel"
        variant="danger"
      />
    </main>
  );
}
