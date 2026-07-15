"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Bookmark, Plus, Download, Upload } from "lucide-react";
import { Tabs, SearchInput, ToastHost, Toast, Button } from "@altftool/ui";

import BookmarkCard from "../components/BookmarkCard";
import BookmarkForm from "../components/BookmarkForm";
import StatisticsPanel from "../components/StatisticsPanel";

import {
  getBookmarks,
  saveBookmarks,
  getCategories,
  saveCategories,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  exportBookmarksData
} from "../utils/bookmarkDb";

export default function BookmarkCapsuleHome() {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load initial data
  useEffect(() => {
    setBookmarks(getBookmarks());
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

  const handleSaveBookmark = (data) => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, data);
      addToast("Bookmark updated successfully", "success");
    } else {
      createBookmark(data);
      addToast("Bookmark added successfully", "success");
    }
    
    // Refresh state
    setBookmarks(getBookmarks());
    
    // Add category if new
    if (data.category && !categories.includes(data.category)) {
      const newCats = [...categories, data.category];
      setCategories(newCats);
      saveCategories(newCats);
    }
  };

  const handleDelete = (id) => {
    deleteBookmark(id);
    setBookmarks(getBookmarks());
    addToast("Bookmark deleted", "success");
  };

  const handleToggleFavorite = (id) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      updateBookmark(id, { isFavorite: !bookmark.isFavorite });
      setBookmarks(getBookmarks());
      if (!bookmark.isFavorite) {
        addToast("Added to favorites", "success");
      }
    }
  };

  const handleToggleArchive = (id) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      updateBookmark(id, { isArchived: !bookmark.isArchived });
      setBookmarks(getBookmarks());
      if (!bookmark.isArchived) addToast("Bookmark archived", "info");
      else addToast("Bookmark restored", "success");
    }
  };

  const handleTogglePin = (id) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      updateBookmark(id, { isPinned: !bookmark.isPinned });
      setBookmarks(getBookmarks());
    }
  };

  const handleExport = () => {
    const url = exportBookmarksData("json");
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookmarks-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    addToast("Bookmarks exported successfully", "success");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          // simple merge
          const existingIds = new Set(bookmarks.map(b => b.id));
          const toAdd = imported.filter(b => b.id && b.url && !existingIds.has(b.id));
          const newBookmarks = [...toAdd, ...bookmarks];
          saveBookmarks(newBookmarks);
          setBookmarks(newBookmarks);
          
          // extract unique categories
          const cats = new Set(categories);
          toAdd.forEach(b => { if (b.category) cats.add(b.category); });
          const newCats = Array.from(cats);
          saveCategories(newCats);
          setCategories(newCats);

          addToast(`Imported ${toAdd.length} new bookmarks`, "success");
        }
      } catch (err) {
        addToast("Invalid JSON file", "danger");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  // Derived state for filtering
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];
    
    // Sort logic: pinned first, then date Added descending
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    // Tab filtering
    if (activeTab === "Favorites") {
      result = result.filter(b => b.isFavorite);
    } else if (activeTab === "Archived") {
      result = result.filter(b => b.isArchived);
    } else if (activeTab !== "All") {
      result = result.filter(b => b.category === activeTab && !b.isArchived);
    } else {
      result = result.filter(b => !b.isArchived);
    }

    // Search filtering
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) || 
        (b.url && b.url.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [bookmarks, activeTab, searchQuery]);

  const tabs = [
    { key: "All", label: "All" },
    { key: "Favorites", label: "Favorites ❤️" },
    ...categories.map(c => ({ key: c, label: c })),
    { key: "Archived", label: "Archived 📦" }
  ];

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Bookmark className="h-4 w-4" />
              Productivity
            </div>
            <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Bookmark Capsule</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Securely organize, search, categorize, preview, and manage all your website bookmarks in one place.
            </p>
          </div>
          <div className="flex-shrink-0 mt-2 sm:mt-0 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleExport}
              className="gap-2"
              title="Export Bookmarks (JSON)"
            >
              <Download size={16} /> Export
            </Button>
            <div className="relative overflow-hidden inline-block">
              <Button variant="secondary" className="gap-2">
                <Upload size={16} /> Import
              </Button>
              <input 
                type="file" 
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => { setEditingBookmark(null); setIsFormOpen(true); }}
              className="gap-2"
            >
              <Plus size={16} /> Add Bookmark
            </Button>
          </div>
        </section>

        {/* Statistics */}
        <StatisticsPanel bookmarks={bookmarks} categories={categories} />

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
              placeholder="Search by URL, title, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="mt-6">
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBookmarks.map(bookmark => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={(b) => { setEditingBookmark(b); setIsFormOpen(true); }}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleArchive={handleToggleArchive}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
              <div className="rounded-full bg-[var(--muted)] p-4">
                <Bookmark size={32} className="text-[var(--muted-foreground)]" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No bookmarks found</h3>
              <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                {searchQuery ? "No bookmarks match your search query." : activeTab !== "All" ? `You don't have any bookmarks in ${activeTab}.` : "You haven't added any bookmarks yet. Click 'Add Bookmark' to get started."}
              </p>
              {!searchQuery && activeTab === "All" && (
                <Button variant="primary" className="mt-6 gap-2" onClick={() => { setEditingBookmark(null); setIsFormOpen(true); }}>
                  <Plus size={16} /> Add First Bookmark
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <BookmarkForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveBookmark}
        categories={categories}
        editingBookmark={editingBookmark}
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
