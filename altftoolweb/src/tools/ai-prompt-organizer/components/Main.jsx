"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Plus,
  Search,
  Copy,
  Trash2,
  Download,
  Upload,
  Check,
  Tag,
  FolderOpen,
  Info,
} from "lucide-react";

const SAMPLE_PROMPTS = [
  {
    id: "1",
    title: "React Refactoring Assistant",
    category: "Code",
    tags: ["react", "clean-code", "refactor"],
    content: "Refactor the following React component to follow clean code guidelines, eliminate redundant state variables, use standard TypeScript types, and apply modern Tailwind CSS custom styling tags: \n\n[PASTE COMPONENT HERE]",
  },
  {
    id: "2",
    title: "SEO Blog Outline Generator",
    category: "SEO",
    tags: ["seo", "content-marketing", "outline"],
    content: "Create a detailed outline for an SEO-optimized blog post targeting the keyword '[KEYWORD]'. The outline should include H1, H2, and H3 structures, direct competitor analysis parameters, search intent mappings, and suggested meta description tags.",
  },
  {
    id: "3",
    title: "Creative Story Writer",
    category: "Creative",
    tags: ["writing", "story", "creative"],
    content: "Write a high-fantasy short story set in a world where magic is powered by gravity metrics. Focus on character development, vivid imagery, and a suspenseful plot twist around a floating city.",
  },
];

export default function MainComponent() {
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newTags, setNewTags] = useState("");
  const [newContent, setNewContent] = useState("");

  const [copiedId, setCopiedId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("ai_prompts");
    if (saved) {
      try {
        setPrompts(JSON.parse(saved));
      } catch (err) {
        setPrompts(SAMPLE_PROMPTS);
      }
    } else {
      setPrompts(SAMPLE_PROMPTS);
      localStorage.setItem("ai_prompts", JSON.stringify(SAMPLE_PROMPTS));
    }
  }, []);

  const saveToLocalStorage = (list) => {
    localStorage.setItem("ai_prompts", JSON.stringify(list));
  };

  const handleAddPrompt = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newTitle.trim() || !newContent.trim()) {
      setError("Please fill out both the Title and Prompt content fields.");
      return;
    }

    const tagsArr = newTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== "");

    const newPromptItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: newTitle,
      category: newCategory,
      tags: tagsArr,
      content: newContent,
    };

    const updated = [newPromptItem, ...prompts];
    setPrompts(updated);
    saveToLocalStorage(updated);

    // Reset Form
    setNewTitle("");
    setNewCategory("General");
    setNewTags("");
    setNewContent("");
    setSuccess("Prompt saved successfully!");
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleDelete = (id) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    saveToLocalStorage(updated);
  };

  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(prompts, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-prompts-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    setError("");
    setSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error("Backup file must contain an array of prompt items.");
        }
        const merged = [...parsed, ...prompts].filter(
          (value, index, self) => self.findIndex((t) => t.id === value.id) === index
        );
        setPrompts(merged);
        saveToLocalStorage(merged);
        setSuccess(`Successfully imported ${parsed.length} prompt templates!`);
      } catch (err) {
        setError(`Failed to import prompts: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const categories = ["All", "General", "Code", "SEO", "Creative", "Writing"];

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Sliders className="h-8 w-8 text-teal-500 shrink-0" /> AI Prompt Organizer
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Save, tag, search, and manage your personalized AI system instructions locally.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout: Left form, Right search & list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Add Prompt Card (5/12 cols) */}
        <div className="lg:col-span-5 bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-1.5">
            <Plus className="h-4.5 w-4.5 text-teal-500" /> Save New Prompt Template
          </h3>

          <form onSubmit={handleAddPrompt} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Prompt Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Creative Writer, Refactor Assistant..."
                className="w-full px-3 py-2 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2 outline-none focus:border-teal-500 cursor-pointer"
                >
                  {categories.filter(c => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. seo, write, react"
                  className="w-full px-3 py-2 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Prompt Content
              </label>
              <textarea
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write or paste your full prompt layout instructions..."
                className="w-full h-40 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-3 outline-none focus:border-teal-500 resize-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer active:scale-98"
            >
              <Plus className="h-4 w-4" /> Save to Vault
            </button>
          </form>
        </div>

        {/* Right Column: Search, Category filters and listing (7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Action Header block */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-2.5 items-center justify-between border-b border-(--border) pb-3">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
                <FolderOpen className="h-4.5 w-4.5 text-teal-500" /> Browse & Export
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer"
                >
                  <Download className="h-3 w-3" /> Export Backup
                </button>
                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer">
                  <Upload className="h-3 w-3" /> Import Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Filter tags bar */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                    activeCategory === c
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-(--page) text-(--foreground) border-(--border)"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Search Input bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by title, content or tags..."
                className="w-full pl-9 pr-4 py-2.5 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* List of prompts */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                className="bg-(--surface) border border-(--border) rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-(--foreground)">{item.title}</h4>
                      <span className="inline-block px-2 py-0.5 border border-(--border) rounded text-[9px] font-bold text-slate-500 bg-(--page) mt-1">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item)}
                        className="p-1.5 border border-(--border) hover:border-teal-500 rounded bg-(--page) text-teal-600 transition-colors cursor-pointer"
                        title="Copy Prompt"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 border border-(--border) hover:border-red-500 rounded bg-(--page) text-red-500 transition-colors cursor-pointer"
                        title="Delete Prompt"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-(--page) p-3 rounded-lg border border-(--border) font-mono leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                </div>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-(--border)">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-teal-500/5 text-teal-600 dark:text-teal-400 rounded text-[9px] font-semibold border border-teal-500/10"
                      >
                        <Tag className="h-2 w-2" /> {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredPrompts.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-12">No prompt templates saved match your filters.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
