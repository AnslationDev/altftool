"use client";

export const CLIPBOARD_KEY = "altftool_clipboard_capsule_data";
export const CLIPBOARD_CATEGORIES_KEY = "altftool_clipboard_capsule_categories";

export const DEFAULT_CATEGORIES = [
  "Text",
  "Code",
  "Links",
  "Emails",
  "Other",
];

export function getSnippets() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CLIPBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load snippets", e);
    return [];
  }
}

export function saveSnippets(snippets) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(snippets));
  } catch (e) {
    console.error("Failed to save snippets", e);
  }
}

export function getCategories() {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const stored = localStorage.getItem(CLIPBOARD_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error("Failed to load categories", e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLIPBOARD_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error("Failed to save categories", e);
  }
}

export function createSnippet({ title, content, category = "Text" }) {
  const newSnippet = {
    id: Date.now().toString(),
    title: title || (content.length > 20 ? content.slice(0, 20) + "..." : content),
    content,
    category,
    dateAdded: new Date().toISOString(),
    isFavorite: false,
    isPinned: false,
  };
  const snippets = getSnippets();
  saveSnippets([newSnippet, ...snippets]);
  return newSnippet;
}

export function updateSnippet(id, updates) {
  const snippets = getSnippets();
  const index = snippets.findIndex((s) => s.id === id);
  if (index !== -1) {
    snippets[index] = { ...snippets[index], ...updates };
    saveSnippets(snippets);
    return snippets[index];
  }
  return null;
}

export function deleteSnippet(id) {
  const snippets = getSnippets();
  const updated = snippets.filter((s) => s.id !== id);
  saveSnippets(updated);
}
