"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link, Plus, ExternalLink } from "lucide-react";
import { Tabs, SearchInput, ToastHost, Toast, Button } from "@altftool/ui";

import LinkCard from "../components/LinkCard";
import LinkForm from "../components/LinkForm";
import LinkStats from "../components/LinkStats";

import {
  getLinks,
  saveLinks,
  getGroups,
  saveGroups,
  createLink,
  updateLink,
  deleteLink
} from "../utils/linkDb";

export default function LinkOrganizerHome() {
  const [links, setLinks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load initial data
  useEffect(() => {
    setLinks(getLinks());
    setGroups(getGroups());
    setIsLoaded(true);
  }, []);

  const addToast = (message, tone = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSaveLink = (data) => {
    if (editingLink) {
      updateLink(editingLink.id, data);
      addToast("Link updated successfully", "success");
    } else {
      createLink(data);
      addToast("Link added successfully", "success");
    }
    
    // Refresh state
    setLinks(getLinks());
    
    // Add group if new
    if (data.group && !groups.includes(data.group)) {
      const newGroups = [...groups, data.group];
      setGroups(newGroups);
      saveGroups(newGroups);
    }
  };

  const handleDelete = (id) => {
    deleteLink(id);
    setLinks(getLinks());
    addToast("Link deleted", "success");
  };

  const handleToggleFavorite = (id) => {
    const link = links.find(l => l.id === id);
    if (link) {
      updateLink(id, { isFavorite: !link.isFavorite });
      setLinks(getLinks());
      if (!link.isFavorite) {
        addToast("Added to favorites", "success");
      }
    }
  };

  const handleBulkOpen = () => {
    if (activeTab === "All" || activeTab === "Favorites") {
      addToast("Please select a specific group to open all links", "danger");
      return;
    }
    const groupLinks = links.filter(l => l.group === activeTab);
    if (groupLinks.length === 0) {
      addToast("No links to open", "info");
      return;
    }
    
    // Open links
    groupLinks.forEach(link => {
      window.open(link.url, "_blank");
    });
    addToast(`Opening ${groupLinks.length} links...`, "success");
  };

  // Derived state for filtering
  const filteredLinks = useMemo(() => {
    let result = [...links];
    
    // Sort logic: date Added descending
    result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

    // Tab filtering
    if (activeTab === "Favorites") {
      result = result.filter(l => l.isFavorite);
    } else if (activeTab !== "All") {
      result = result.filter(l => l.group === activeTab);
    }

    // Search filtering
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        (l.title && l.title.toLowerCase().includes(q)) || 
        (l.url && l.url.toLowerCase().includes(q)) ||
        (l.group && l.group.toLowerCase().includes(q))
      );
    }

    return result;
  }, [links, activeTab, searchQuery]);

  const tabs = [
    { key: "All", label: "All" },
    { key: "Favorites", label: "Favorites ❤️" },
    ...groups.map(g => ({ key: g, label: g }))
  ];

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Link className="h-4 w-4" />
              Productivity
            </div>
            <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Link Organizer</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Group, save, and bulk-open your daily links and resources securely in your browser.
            </p>
          </div>
          <div className="flex-shrink-0 mt-2 sm:mt-0 flex gap-2">
            {activeTab !== "All" && activeTab !== "Favorites" && (
              <Button
                variant="secondary"
                onClick={handleBulkOpen}
                className="gap-2"
                title="Open all links in this group"
              >
                <ExternalLink size={16} /> Open All
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => { setEditingLink(null); setIsFormOpen(true); }}
              className="gap-2"
            >
              <Plus size={16} /> Add Link
            </Button>
          </div>
        </section>

        {/* Statistics */}
        <LinkStats links={links} groups={groups} />

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
              placeholder="Search by URL, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
        </div>

        {/* Links Grid */}
        <div className="mt-6">
          {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLinks.map(link => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={(l) => { setEditingLink(l); setIsFormOpen(true); }}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
              <div className="rounded-full bg-[var(--muted)] p-4">
                <Link size={32} className="text-[var(--muted-foreground)]" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No links found</h3>
              <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                {searchQuery ? "No links match your search query." : activeTab !== "All" ? `You don't have any links in ${activeTab}.` : "You haven't added any links yet. Click 'Add Link' to get started."}
              </p>
              {!searchQuery && activeTab === "All" && (
                <Button variant="primary" className="mt-6 gap-2" onClick={() => { setEditingLink(null); setIsFormOpen(true); }}>
                  <Plus size={16} /> Add First Link
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <LinkForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveLink}
        groups={groups}
        editingLink={editingLink}
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
