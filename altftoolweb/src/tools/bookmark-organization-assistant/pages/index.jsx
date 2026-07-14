"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import {
  Bookmark as BookmarkIcon,
  Star,
  Folder as FolderIcon,
  Hash,
  Menu,
  Plus,
  SearchX,
  Inbox,
  FolderOpen,
} from "lucide-react";

import { useBookmarks } from "../hooks/useBookmarks";
import { useDebounce } from "../hooks/useDebounce";
import { ToastProvider, useToast } from "../components/Toast";
import { Sidebar } from "../components/Sidebar";
import { Toolbar } from "../components/Toolbar";
import { BulkBar } from "../components/BulkBar";
import { BookmarkGrid } from "../components/BookmarkGrid";
import { BookmarkForm } from "../components/BookmarkForm";
import { FolderDialog } from "../components/FolderDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { SkeletonGrid } from "../components/Skeleton";
import {
  exportToJson,
  parseJsonImport,
  parseNetscapeHtml,
} from "../utils/importExport";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-(--muted) ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-(--foreground)">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
          {label}
        </p>
      </div>
    </div>
  );
}

function ToolHome() {
  const {
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
  } = useBookmarks();

  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [sort, setSort] = useState("date");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectionActive, setSelectionActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);

  const [folderDialog, setFolderDialog] = useState({
    open: false,
    mode: "create",
    initial: null,
  });
  const [confirm, setConfirm] = useState({ open: false, target: null });
  const [importChoice, setImportChoice] = useState({ open: false, data: null });

  const fileInputRef = useRef(null);

  const stats = useMemo(
    () => ({
      total: bookmarks.length,
      favorites: bookmarks.filter((bookmark) => bookmark.favorite).length,
      folders: folders.length,
      tags: new Set(bookmarks.flatMap((bookmark) => bookmark.tags)).size,
    }),
    [bookmarks, folders],
  );

  const visibleBookmarks = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let list = bookmarks;

    if (activeFilter === "favorites") {
      list = list.filter((bookmark) => bookmark.favorite);
    } else if (activeFilter !== "all") {
      list = list.filter((bookmark) => bookmark.folderId === activeFilter);
    }

    if (selectedTag) {
      list = list.filter((bookmark) => bookmark.tags.includes(selectedTag));
    }

    if (q) {
      list = list.filter((bookmark) => {
        const haystack = [
          bookmark.title,
          bookmark.url,
          bookmark.description,
          bookmark.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    const sorted = [...list];
    if (sort === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "uses") {
      sorted.sort((a, b) => b.useCount - a.useCount);
    } else {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  }, [bookmarks, activeFilter, selectedTag, debouncedQuery, sort]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setActiveFilter("all");
    setSelectedTag(null);
  }, []);

  const handleSelectFilter = useCallback((filter) => {
    setActiveFilter(filter);
    setSelectedTag(null);
    setMobileOpen(false);
  }, []);

  const handleSelectTag = useCallback((tag) => {
    setSelectedTag(tag);
  }, []);

  const handleToggleSelectMode = useCallback(() => {
    setSelectionActive((prev) => {
      const next = !prev;
      if (!next) setSelectedIds(new Set());
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(visibleBookmarks.map((bookmark) => bookmark.id)));
  }, [visibleBookmarks]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const openAddForm = useCallback(() => {
    setFormInitial(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((bookmark) => {
    setFormInitial(bookmark);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (draft) => {
      if (formInitial) {
        updateBookmark(formInitial.id, draft);
        toast("Bookmark updated.");
      } else {
        addBookmark(draft);
        toast("Bookmark added.");
      }
      setFormOpen(false);
      setFormInitial(null);
    },
    [formInitial, updateBookmark, addBookmark, toast],
  );

  const requestDelete = useCallback((bookmark) => {
    setConfirm({ open: true, target: bookmark });
  }, []);

  const confirmDelete = useCallback(() => {
    const target = confirm.target;
    if (!target) return;
    deleteBookmark(target.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });
    setConfirm({ open: false, target: null });
    toast(`Deleted "${target.title}".`, {
      type: "info",
      action: { label: "Undo", onClick: () => addBookmark(target) },
    });
  }, [confirm.target, deleteBookmark, toast, addBookmark]);

  const handleOpenBookmark = useCallback(
    (bookmark) => {
      incrementUse(bookmark.id);
      if (typeof window !== "undefined") {
        window.open(bookmark.url, "_blank", "noopener,noreferrer");
      }
    },
    [incrementUse],
  );

  const handleAddFolder = useCallback(() => {
    setFolderDialog({ open: true, mode: "create", initial: null });
  }, []);

  const handleRenameFolder = useCallback((folder) => {
    setFolderDialog({ open: true, mode: "rename", initial: folder });
  }, []);

  const handleDeleteFolder = useCallback(
    (folder) => {
      setConfirm({
        open: true,
        target: { id: folder.id, title: folder.name, isFolder: true },
      });
    },
    [],
  );

  const confirmFolderDelete = useCallback(() => {
    const target = confirm.target;
    if (target?.isFolder) {
      deleteFolder(target.id);
      if (activeFilter === target.id) setActiveFilter("all");
      toast(`Folder "${target.title}" deleted.`);
    }
    setConfirm({ open: false, target: null });
  }, [confirm.target, deleteFolder, activeFilter, toast]);

  const handleFolderSubmit = useCallback(
    (name) => {
      if (folderDialog.mode === "rename" && folderDialog.initial) {
        renameFolder(folderDialog.initial.id, name);
        toast("Folder renamed.");
      } else {
        const created = addFolder(name);
        toast(`Folder "${created.name}" created.`);
      }
      setFolderDialog({ open: false, mode: "create", initial: null });
    },
    [folderDialog, renameFolder, addFolder, toast],
  );

  const handleExport = useCallback(() => {
    exportToJson({ bookmarks, folders });
    toast("Exported bookmarks to JSON.");
  }, [bookmarks, folders, toast]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const name = file.name.toLowerCase();
      try {
        if (name.endsWith(".html") || name.endsWith(".htm")) {
          const text = await file.text();
          const imported = parseNetscapeHtml(text, nanoid);
          if (!imported.length) {
            toast("No bookmarks found in that HTML file.", { type: "error" });
            return;
          }
          setImportChoice({ open: true, data: { bookmarks: imported, folders: [] } });
        } else {
          const parsed = await parseJsonImport(file);
          setImportChoice({ open: true, data: parsed });
        }
      } catch (err) {
        toast(err?.message || "Could not read that file.", { type: "error" });
      }
    },
    [toast],
  );

  const applyImport = useCallback(
    (mode) => {
      const data = importChoice.data;
      if (!data) return;
      importData(data, mode);
      const count = data.bookmarks.length;
      setImportChoice({ open: false, data: null });
      toast(
        mode === "replace"
          ? `Replaced library with ${count} bookmarks.`
          : `Merged ${count} bookmarks into your library.`,
      );
    },
    [importChoice.data, importData, toast],
  );

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    deleteBookmarks(ids);
    toast(`Deleted ${ids.length} bookmarks.`, { type: "info" });
    setSelectedIds(new Set());
  }, [selectedIds, deleteBookmarks, toast]);

  const handleBulkFavorite = useCallback(
    (favorite) => {
      const ids = Array.from(selectedIds);
      if (!ids.length) return;
      setFavoriteFor(ids, favorite);
      toast(
        favorite
          ? `Favorited ${ids.length} bookmarks.`
          : `Unfavorited ${ids.length} bookmarks.`,
      );
    },
    [selectedIds, setFavoriteFor, toast],
  );

  const handleBulkMove = useCallback(
    (folderId) => {
      const ids = Array.from(selectedIds);
      if (!ids.length || !folderId) return;
      moveToFolder(ids, folderId);
      const folder = folders.find((item) => item.id === folderId);
      toast(`Moved ${ids.length} to "${folder?.name || "folder"}".`);
      setSelectedIds(new Set());
    },
    [selectedIds, moveToFolder, folders, toast],
  );

  const handleBulkTag = useCallback(
    (tag) => {
      const ids = Array.from(selectedIds);
      if (!ids.length) return;
      addTagsTo(ids, [tag]);
      toast(`Tagged ${ids.length} bookmarks with #${tag}.`);
    },
    [selectedIds, addTagsTo, toast],
  );

  const handleDragEnd = useCallback(
    (result) => {
      const { destination, draggableId, source } = result;
      if (!destination) return;

      const destId = destination.droppableId;

      if (destId.startsWith("folder-drop-")) {
        const folderId = destId.replace("folder-drop-", "");
        moveToFolder([draggableId], folderId);
        const folder = folders.find((item) => item.id === folderId);
        toast(`Moved to "${folder?.name || "folder"}".`);
        return;
      }

      if (destId === "bookmark-list" && source.droppableId === "bookmark-list") {
        if (source.index === destination.index) return;
        const ids = visibleBookmarks.map((bookmark) => bookmark.id);
        const [moved] = ids.splice(source.index, 1);
        ids.splice(destination.index, 0, moved);
        reorderBookmarks(ids);
      }
    },
    [visibleBookmarks, moveToFolder, folders, reorderBookmarks, toast],
  );

  const headingAccent = "section-title tool-heading-accent";

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-(--primary)/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-(--primary)">
                <BookmarkIcon className="h-3.5 w-3.5" />
                Productivity
              </span>
              <h1 className={`mt-3 text-3xl font-semibold leading-tight sm:text-4xl ${headingAccent}`}>
                Bookmark Organization Assistant
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-(--muted-foreground)">
                Organize bookmarks with folders, tags, favorites, drag-and-drop, search,
                filters, bulk actions, and import/export — all stored locally in your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--muted) lg:hidden"
              aria-label="Open filters"
            >
              <Menu className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={BookmarkIcon} label="Bookmarks" value={stats.total} accent="text-(--primary)" />
            <StatCard icon={Star} label="Favorites" value={stats.favorites} accent="text-amber-400" />
            <StatCard icon={FolderIcon} label="Folders" value={stats.folders} accent="text-(--secondary-foreground)" />
            <StatCard icon={Hash} label="Tags" value={stats.tags} accent="text-(--primary)" />
          </div>
        </header>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6">
            <Sidebar
              folders={folders}
              bookmarks={bookmarks}
              activeFilter={activeFilter}
              selectedTag={selectedTag}
              onSelectFilter={handleSelectFilter}
              onSelectTag={handleSelectTag}
              onAddFolder={handleAddFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              mobileOpen={mobileOpen}
              onCloseMobile={() => setMobileOpen(false)}
            />

            <main className="min-w-0 flex-1 space-y-4">
              <Toolbar
                query={query}
                onQueryChange={setQuery}
                sort={sort}
                onSortChange={setSort}
                onAdd={openAddForm}
                onImport={handleImportClick}
                onExport={handleExport}
                selectionActive={selectionActive}
                onToggleSelectMode={handleToggleSelectMode}
                selectedCount={selectedIds.size}
                totalVisible={visibleBookmarks.length}
              />

              {selectionActive ? (
                <BulkBar
                  selectedCount={selectedIds.size}
                  totalVisible={visibleBookmarks.length}
                  folders={folders}
                  onBulkFavorite={handleBulkFavorite}
                  onBulkUnfavorite={(fav) => handleBulkFavorite(fav)}
                  onBulkMove={handleBulkMove}
                  onBulkTag={handleBulkTag}
                  onBulkDelete={handleBulkDelete}
                  onClear={handleClearSelection}
                  onSelectAll={handleSelectAll}
                />
              ) : null}

              {!loaded ? (
                <SkeletonGrid />
              ) : bookmarks.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No bookmarks yet"
                  description="Start building your organized library. Add your first bookmark and group it into folders with tags."
                  action={
                    <button
                      type="button"
                      onClick={openAddForm}
                      className="flex items-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                      Add your first bookmark
                    </button>
                  }
                />
              ) : visibleBookmarks.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No matching bookmarks"
                  description="No bookmarks match your current search, folder, or tag filter. Try clearing filters or adding a new one."
                  action={
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--muted)"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Clear filters
                    </button>
                  }
                />
              ) : (
                <motion.div layout>
                  <BookmarkGrid
                    bookmarks={visibleBookmarks}
                    selectedIds={selectedIds}
                    onToggleSelect={handleToggleSelect}
                    onToggleFavorite={toggleFavorite}
                    onEdit={openEditForm}
                    onDelete={requestDelete}
                    onOpen={handleOpenBookmark}
                    selectionMode={selectionActive}
                  />
                </motion.div>
              )}
            </main>
          </div>
        </DragDropContext>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.html,application/json,text/html"
        className="hidden"
        onChange={handleFile}
        aria-hidden="true"
      />

      <BookmarkForm
        open={formOpen}
        initial={formInitial}
        folders={folders}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setFormOpen(false);
          setFormInitial(null);
        }}
      />

      <FolderDialog
        open={folderDialog.open}
        mode={folderDialog.mode}
        initial={folderDialog.initial}
        onSubmit={handleFolderSubmit}
        onCancel={() => setFolderDialog({ open: false, mode: "create", initial: null })}
      />

      <ConfirmDialog
        open={confirm.open}
        title={confirm.target?.isFolder ? "Delete folder?" : "Delete bookmark?"}
        message={
          confirm.target?.isFolder
            ? `Folder "${confirm.target.title}" and its bookmarks will be moved to General. This cannot be undone.`
            : `Delete "${confirm.target?.title}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={confirm.target?.isFolder ? confirmFolderDelete : confirmDelete}
        onCancel={() => setConfirm({ open: false, target: null })}
      />

      <ImportChoiceDialog
        open={importChoice.open}
        count={importChoice.data?.bookmarks.length || 0}
        onMerge={() => applyImport("merge")}
        onReplace={() => applyImport("replace")}
        onCancel={() => setImportChoice({ open: false, data: null })}
      />
    </div>
  );
}

function ImportChoiceDialog({ open, count, onMerge, onReplace, onCancel }) {
  return (
      <AnimatePresence>{open ? (
      <motion.div
        className="fixed inset-0 z-[96] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
          aria-hidden="true"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Import bookmarks"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm rounded-2xl border border-(--border) bg-(--card) p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-(--foreground)">
            Import {count} bookmark{count === 1 ? "" : "s"}?
          </h3>
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Merge them into your current library, or replace everything with the imported set.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--foreground) hover:bg-(--muted)"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onReplace}
              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Replace all
            </button>
            <button
              type="button"
              onClick={onMerge}
              className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) hover:opacity-90"
            >
              Merge
            </button>
          </div>
        </motion.div>
      </motion.div>
      ) : null}</AnimatePresence>
  );
}

export default function ToolEntryHome() {
  return (
    <ToastProvider>
      <ToolHome />
    </ToastProvider>
  );
}
