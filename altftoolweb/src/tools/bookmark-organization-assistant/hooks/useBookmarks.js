"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import { loadState, saveState } from "../utils/storage";
import { normalizeUrl } from "../utils/validation";

const DEFAULT_FOLDER = { id: "default", name: "General" };

function seedFolders() {
  return [DEFAULT_FOLDER];
}

// Central data store for the Bookmark Organization Assistant.
// All persistence goes through localStorage, guarded for SSR.
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (state) {
      setBookmarks(state.bookmarks);
      setFolders(state.folders.length ? state.folders : seedFolders());
    } else {
      setFolders(seedFolders());
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveState({ bookmarks, folders });
  }, [bookmarks, folders, loaded]);

  const addBookmark = useCallback((draft) => {
    const now = Date.now();
    const record = {
      id: nanoid(),
      title: draft.title?.trim() || draft.url,
      url: normalizeUrl(draft.url),
      description: draft.description?.trim() || "",
      folderId: draft.folderId || "default",
      tags: Array.isArray(draft.tags) ? draft.tags : [],
      favorite: Boolean(draft.favorite),
      useCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setBookmarks((prev) => [record, ...prev]);
    return record;
  }, []);

  const updateBookmark = useCallback((id, draft) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? {
              ...bookmark,
              ...draft,
              url: draft.url ? normalizeUrl(draft.url) : bookmark.url,
              updatedAt: Date.now(),
            }
          : bookmark,
      ),
    );
  }, []);

  const deleteBookmark = useCallback((id) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  }, []);

  const deleteBookmarks = useCallback((ids) => {
    const set = new Set(ids);
    setBookmarks((prev) => prev.filter((bookmark) => !set.has(bookmark.id)));
  }, []);

  const toggleFavorite = useCallback((id) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, favorite: !bookmark.favorite, updatedAt: Date.now() }
          : bookmark,
      ),
    );
  }, []);

  const setFavoriteFor = useCallback((ids, favorite) => {
    const set = new Set(ids);
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        set.has(bookmark.id)
          ? { ...bookmark, favorite, updatedAt: Date.now() }
          : bookmark,
      ),
    );
  }, []);

  const incrementUse = useCallback((id) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, useCount: bookmark.useCount + 1 }
          : bookmark,
      ),
    );
  }, []);

  const moveToFolder = useCallback((ids, folderId) => {
    const set = new Set(ids);
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        set.has(bookmark.id)
          ? { ...bookmark, folderId, updatedAt: Date.now() }
          : bookmark,
      ),
    );
  }, []);

  const addTagsTo = useCallback((ids, tags) => {
    const set = new Set(ids);
    const normalized = tags.map((tag) => tag.trim()).filter(Boolean);
    if (!normalized.length) return;
    setBookmarks((prev) =>
      prev.map((bookmark) => {
        if (!set.has(bookmark.id)) return bookmark;
        const merged = Array.from(new Set([...bookmark.tags, ...normalized]));
        return { ...bookmark, tags: merged, updatedAt: Date.now() };
      }),
    );
  }, []);

  const addFolder = useCallback((name) => {
    const folder = { id: nanoid(), name: name.trim() || "Untitled" };
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  const renameFolder = useCallback((id, name) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, name: name.trim() || folder.name } : folder,
      ),
    );
  }, []);

  const deleteFolder = useCallback((id) => {
    if (id === "default") return;
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.folderId === id
          ? { ...bookmark, folderId: "default", updatedAt: Date.now() }
          : bookmark,
      ),
    );
  }, []);

  // Reorder a contiguous list of bookmark ids (drag & drop within a view).
  const reorderBookmarks = useCallback((orderedIds) => {
    setBookmarks((prev) => {
      const byId = new Map(prev.map((bookmark) => [bookmark.id, bookmark]));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter(Boolean);
      const rest = prev.filter((bookmark) => !orderedIds.includes(bookmark.id));
      return [...reordered, ...rest];
    });
  }, []);

  const importData = useCallback((incoming, mode = "merge") => {
    const incomingFolders = Array.isArray(incoming.folders)
      ? incoming.folders
      : [];
    const incomingBookmarks = Array.isArray(incoming.bookmarks)
      ? incoming.bookmarks
      : [];

    if (mode === "replace") {
      const folderIds = new Set(incomingFolders.map((folder) => folder.id));
      if (!folderIds.has("default")) {
        incomingFolders.unshift(DEFAULT_FOLDER);
      }
      const sanitized = incomingBookmarks.map((bookmark) => ({
        ...bookmark,
        folderId: folderIds.has(bookmark.folderId)
          ? bookmark.folderId
          : "default",
      }));
      setFolders(incomingFolders);
      setBookmarks(sanitized);
      return;
    }

    setFolders((prev) => {
      const existing = new Map(prev.map((folder) => [folder.id, folder]));
      for (const folder of incomingFolders) {
        if (!existing.has(folder.id)) existing.set(folder.id, folder);
      }
      return Array.from(existing.values());
    });
    setBookmarks((prev) => {
      const existing = new Map(prev.map((bookmark) => [bookmark.id, bookmark]));
      for (const bookmark of incomingBookmarks) {
        existing.set(bookmark.id, bookmark);
      }
      return Array.from(existing.values());
    });
  }, []);

  return {
    bookmarks,
    folders,
    loaded,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    deleteBookmarks,
    toggleFavorite,
    setFavoriteFor,
    incrementUse,
    moveToFolder,
    addTagsTo,
    addFolder,
    renameFolder,
    deleteFolder,
    reorderBookmarks,
    importData,
  };
}
