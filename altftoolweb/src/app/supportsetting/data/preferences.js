"use client";

import { useCallback, useEffect, useState } from "react";

// Central localStorage-backed store for everything about how the Support
// Settings PAGE itself behaves. Deliberately separate from platformDetect.js
// (which is about which OS's settings to show) — this file is about page
// preferences and usage history, and is the same regardless of platform.

const RECENTLY_USED_KEY = "altftool.supportsetting.recentlyUsed";
const PAGE_PREFS_KEY = "altftool.supportsetting.pagePrefs";
const BOOKMARKS_KEY = "altftool.supportsetting.bookmarks";
const MAX_RECENTLY_USED = 6;

export const DEFAULT_PAGE_PREFS = {
  showStepImages: true,
  rememberLastVisited: true,
  textSize: "medium", // "small" | "medium" | "large"
  readingWidth: "comfortable", // "narrow" | "comfortable" | "wide"
  lineSpacing: "standard", // "compact" | "standard" | "relaxed"
  focusMode: false,
  highContrast: false,
  reduceMotion: false,
  sponsoredCollapsed: false,
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return safeParse(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures (private browsing, storage disabled, quota).
  }
}

/** Tracks the last few setting ids a visitor opened, most-recent first. */
export function useRecentlyUsed() {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    setIds(readJSON(RECENTLY_USED_KEY, []));
  }, []);

  const markVisited = useCallback((id) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((existing) => existing !== id)].slice(
        0,
        MAX_RECENTLY_USED,
      );
      writeJSON(RECENTLY_USED_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setIds([]);
    writeJSON(RECENTLY_USED_KEY, []);
  }, []);

  return { recentlyUsedIds: ids, markVisited, clearHistory };
}

/** Lets a visitor star settings/AI tools/device guides worth coming back
 * to — powers both the "Bookmarks" row in Customize This Page and the
 * "Favorite Settings" section on the home dashboard. Purely local, same
 * as everything else in this file. */
export function useBookmarks() {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readJSON(BOOKMARKS_KEY, []));
    setReady(true);
  }, []);

  const isBookmarked = useCallback((id) => ids.includes(id), [ids]);

  const toggleBookmark = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((existing) => existing !== id) : [id, ...prev];
      writeJSON(BOOKMARKS_KEY, next);
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setIds([]);
    writeJSON(BOOKMARKS_KEY, []);
  }, []);

  return { bookmarkedIds: ids, isBookmarked, toggleBookmark, clearBookmarks, ready };
}

/** Small set of GENUINE in-page preferences — these affect how the
 * Support Settings page renders itself, not any real OS setting. */
export function usePagePreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PAGE_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs({ ...DEFAULT_PAGE_PREFS, ...readJSON(PAGE_PREFS_KEY, {}) });
    setReady(true);
  }, []);

  const updatePref = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      writeJSON(PAGE_PREFS_KEY, next);
      return next;
    });
  }, []);

  const togglePref = useCallback(
    (key) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        writeJSON(PAGE_PREFS_KEY, next);
        return next;
      });
    },
    [],
  );

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PAGE_PREFS);
    writeJSON(PAGE_PREFS_KEY, DEFAULT_PAGE_PREFS);
  }, []);

  return { prefs, updatePref, togglePref, resetPrefs, ready };
}
