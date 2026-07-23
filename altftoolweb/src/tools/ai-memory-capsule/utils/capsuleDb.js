"use client";

import { STORAGE_KEY, CATEGORIES_KEY, DEFAULT_CATEGORIES } from "../constants/index";

export function getCapsules() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCapsules(capsules) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
  } catch {
    // storage full or unavailable
  }
}

export function getCategories() {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    // storage full or unavailable
  }
}

export function createCapsule({ title, content, mood, intensity, category, tags, unlockDate }) {
  const capsule = {
    id: Date.now().toString(),
    title,
    content,
    mood: mood || "neutral",
    intensity: intensity || 3,
    category: category || "Personal",
    tags: tags || [],
    dateCreated: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isFavorite: false,
    isPinned: false,
    isSealed: !!unlockDate,
    unlockDate: unlockDate || null,
    wordCount: content ? content.split(/\s+/).filter(Boolean).length : 0,
  };
  const capsules = getCapsules();
  saveCapsules([capsule, ...capsules]);
  return capsule;
}

export function updateCapsule(id, updates) {
  const capsules = getCapsules();
  const index = capsules.findIndex((c) => c.id === id);
  if (index !== -1) {
    capsules[index] = {
      ...capsules[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
      wordCount: (updates.content || capsules[index].content || "").split(/\s+/).filter(Boolean).length,
    };
    saveCapsules(capsules);
    return capsules[index];
  }
  return null;
}

export function deleteCapsule(id) {
  const capsules = getCapsules();
  saveCapsules(capsules.filter((c) => c.id !== id));
}

export function exportCapsulesData(format = "json") {
  const capsules = getCapsules();
  if (format === "json") {
    const dataStr = JSON.stringify(capsules, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    return URL.createObjectURL(blob);
  }
  if (format === "csv") {
    const header = "id,title,category,mood,intensity,tags,dateCreated,wordCount,isFavorite,isPinned\n";
    const rows = capsules.map((c) => {
      return `"${c.id}","${(c.title || "").replace(/"/g, '""')}","${c.category}","${c.mood}",${c.intensity},"${(c.tags || []).join(";")}","${c.dateCreated}",${c.wordCount},${c.isFavorite},${c.isPinned}`;
    });
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    return URL.createObjectURL(blob);
  }
}
