"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clipboard, Plus } from "lucide-react";
import { Tabs, SearchInput, ToastHost, Toast, Button } from "@altftool/ui";

import SnippetCard from "../components/SnippetCard";
import SnippetForm from "../components/SnippetForm";
import ClipboardStats from "../components/ClipboardStats";

import {
  getSnippets,
  saveSnippets,
  getCategories,
  saveCategories,
  createSnippet,
  updateSnippet,
  deleteSnippet
} from "../utils/clipboardDb";

export default function ClipboardCapsuleHome() {
  const [snippets, setSnippets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load initial data
  useEffect(() => {
    setSnippets(getSnippets());
    setCategories(getCategories());
    setIsLoaded(true);
  }, []);

  const addToast = (message, tone = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSaveSnippet = (data) => {
    if (editingSnippet) {
      updateSnippet(editingSnippet.id, data);
      addToast("Snippet updated successfully", "success");
    } else {
      createSnippet(data);
      addToast("Snippet added successfully", "success");
    }
    
    // Refresh state
    setSnippets(getSnippets());
    
    // Add category if new
    if (data.category && !categories.includes(data.category)) {
      const newCats = [...categories, data.category];
      setCategories(newCats);
      saveCategories(newCats);
    }
  };

  const handleDelete = (id) => {
    deleteSnippet(id);
    setSnippets(getSnippets());
    addToast("Snippet deleted", "success");
  };

  const handleToggleFavorite = (id) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      updateSnippet(id, { isFavorite: !snippet.isFavorite });
      setSnippets(getSnippets());
      if (!snippet.isFavorite) {
        addToast("Added to favorites", "success");
      }
    }
  };

  const handleTogglePin = (id) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      updateSnippet(id, { isPinned: !snippet.isPinned });
      setSnippets(getSnippets());
    }
  };

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      addToast("Copied to clipboard! 📋", "success");
    } catch (e) {
      addToast("Failed to copy", "danger");
    }
  };

  // Derived state for filtering
  const filteredSnippets = useMemo(() => {
    let result = [...snippets];
    
    // Sort logic: pinned first, then date Added descending
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    // Tab filtering
    if (activeTab === "Favorites") {
      result = result.filter(s => s.isFavorite);
    } else if (activeTab !== "All") {
      result = result.filter(s => s.category === activeTab);
    }

    // Search filtering
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) || 
        (s.content && s.content.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [snippets, activeTab, searchQuery]);

  const tabs = [
    { key: "All", label: "All" },
    { key: "Favorites", label: "Favorites ❤️" },
    ...categories.map(c => ({ key: c, label: c }))
  ];

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Clipboard className="h-4 w-4" />
              Productivity
            </div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
              <Clipboard className="h-7 w-7 text-[var(--primary)]" />
            </div>
            <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Clipboard Capsule</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Save, manage, categorize, and retrieve your clipboard history seamlessly.
            </p>
          </div>
          <div className="flex-shrink-0 mt-2 sm:mt-0">
            <Button
              variant="primary"
              onClick={() => { setEditingSnippet(null); setIsFormOpen(true); }}
              className="gap-2"
            >
              <Plus size={16} /> Add Snippet
            </Button>
          </div>
        </section>

        {/* Statistics */}
        <ClipboardStats snippets={snippets} categories={categories} />

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <div className="w-full sm:w-auto flex-1 overflow-x-auto pb-2 sm:pb-0">
            <Tabs
              items={tabs}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
          <div className="w-full sm:w-72 flex-shrink-0">
            <SearchInput
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="mt-6">
          {filteredSnippets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSnippets.map(snippet => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onEdit={(s) => { setEditingSnippet(s); setIsFormOpen(true); }}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onTogglePin={handleTogglePin}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
              <div className="rounded-full bg-[var(--muted)] p-4">
                <Clipboard size={32} className="text-[var(--muted-foreground)]" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No snippets found</h3>
              <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                {searchQuery ? "No snippets match your search query." : activeTab !== "All" ? `You don't have any snippets in ${activeTab}.` : "You haven't added any snippets yet. Click 'Add Snippet' to get started."}
              </p>
              {!searchQuery && activeTab === "All" && (
                <Button variant="primary" className="mt-6 gap-2" onClick={() => { setEditingSnippet(null); setIsFormOpen(true); }}>
                  <Plus size={16} /> Add First Snippet
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <SnippetForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveSnippet}
        categories={categories}
        editingSnippet={editingSnippet}
      />

      <ToastHost position="bottom-right">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            message={t.message}
            onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          />
        ))}
      </ToastHost>
    </main>
  );
}
