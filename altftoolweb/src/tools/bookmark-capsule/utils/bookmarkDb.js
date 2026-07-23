"use client";

export const BOOKMARKS_KEY = "altftool_bookmark_capsule_data";
export const CATEGORIES_KEY = "altftool_bookmark_capsule_categories";

export const DEFAULT_CATEGORIES = [
  "Development",
  "Design",
  "Education",
  "Business",
  "Marketing",
  "Personal",
  "News",
];

export function getBookmarks() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load bookmarks", e);
    return [];
  }
}

export function saveBookmarks(bookmarks) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error("Failed to save bookmarks", e);
  }
}

export function getCategories() {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error("Failed to load categories", e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error("Failed to save categories", e);
  }
}

export function createBookmark({ url, title, description = "", category = "Personal", tags = [], notes = "" }) {
  const newBookmark = {
    id: Date.now().toString(),
    url,
    title: title || url,
    description,
    category,
    tags,
    notes,
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    visitCount: 0,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
  };
  const bookmarks = getBookmarks();
  saveBookmarks([newBookmark, ...bookmarks]);
  return newBookmark;
}

export function updateBookmark(id, updates) {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex((b) => b.id === id);
  if (index !== -1) {
    bookmarks[index] = { ...bookmarks[index], ...updates, lastUpdated: new Date().toISOString() };
    saveBookmarks(bookmarks);
    return bookmarks[index];
  }
  return null;
}

export function deleteBookmark(id) {
  const bookmarks = getBookmarks();
  const updated = bookmarks.filter((b) => b.id !== id);
  saveBookmarks(updated);
}

export function incrementVisit(id) {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex((b) => b.id === id);
  if (index !== -1) {
    bookmarks[index].visitCount = (bookmarks[index].visitCount || 0) + 1;
    saveBookmarks(bookmarks);
  }
}

export function exportBookmarksData(format = "json") {
  const bookmarks = getBookmarks();
  if (format === "json") {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    return URL.createObjectURL(blob);
  } else if (format === "csv") {
    const header = "id,url,title,description,category,tags,notes,dateAdded,isFavorite,isPinned,isArchived\n";
    const rows = bookmarks.map(b => {
      return `"${b.id}","${b.url}","${(b.title || "").replace(/"/g, '""')}","${(b.description || "").replace(/"/g, '""')}","${b.category}","${b.tags.join(";")}","${(b.notes || "").replace(/"/g, '""')}","${b.dateAdded}","${b.isFavorite}","${b.isPinned}","${b.isArchived}"`;
    });
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    return URL.createObjectURL(blob);
  }
}

export function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (e) {
    return "";
  }
}
