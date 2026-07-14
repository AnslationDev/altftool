"use client";

import { Droppable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderPlus,
  Star,
  Layers,
  Hash,
  Pencil,
  Trash2,
  X,
  Bookmark as BookmarkIcon,
} from "lucide-react";

function FolderRow({ folder, count, active, onSelect, onRename, onDelete }) {
  return (
    <Droppable droppableId={`folder-drop-${folder.id}`} isDropDisabled={false}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
            active
              ? "border-(--primary) bg-(--primary)/10"
              : "border-transparent hover:bg-(--muted)"
          } ${snapshot.isDraggingOver ? "ring-2 ring-(--primary)" : ""}`}
        >
          <button
            type="button"
            onClick={() => onSelect(folder.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <Folder className="h-4 w-4 shrink-0 text-(--primary)" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-(--foreground)">
              {folder.name}
            </span>
            <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] font-semibold text-(--muted-foreground)">
              {count}
            </span>
          </button>
          {folder.id !== "default" ? (
            <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onRename(folder)}
                aria-label="Rename folder"
                className="rounded-md p-1 text-(--muted-foreground) hover:bg-(--background) hover:text-(--foreground)"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(folder)}
                aria-label="Delete folder"
                className="rounded-md p-1 text-(--muted-foreground) hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

function NavItem({ icon: Icon, label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
        active
          ? "border-(--primary) bg-(--primary)/10"
          : "border-transparent hover:bg-(--muted)"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 text-(--primary)" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-(--foreground)">
        {label}
      </span>
      <span className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] font-semibold text-(--muted-foreground)">
        {count}
      </span>
    </button>
  );
}

export function Sidebar({
  folders,
  bookmarks,
  activeFilter,
  selectedTag,
  onSelectFilter,
  onSelectTag,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  mobileOpen,
  onCloseMobile,
}) {
  const total = bookmarks.length;
  const favoritesCount = bookmarks.filter((bookmark) => bookmark.favorite).length;
  const allTags = Array.from(
    new Set(bookmarks.flatMap((bookmark) => bookmark.tags)),
  ).sort();

  const countsByFolder = folders.reduce((acc, folder) => {
    acc[folder.id] = bookmarks.filter(
      (bookmark) => bookmark.folderId === folder.id,
    ).length;
    return acc;
  }, {});

  const content = (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.14em] text-(--muted-foreground)">
            Library
          </h2>
          <button
            type="button"
            onClick={onAddFolder}
            aria-label="Add folder"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-(--border) text-(--primary) hover:bg-(--muted)"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1">
          <NavItem
            icon={BookmarkIcon}
            label="All bookmarks"
            count={total}
            active={activeFilter === "all" && !selectedTag}
            onClick={() => onSelectFilter("all")}
          />
          <NavItem
            icon={Star}
            label="Favorites"
            count={favoritesCount}
            active={activeFilter === "favorites"}
            onClick={() => onSelectFilter("favorites")}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-(--muted-foreground)">
          Folders
        </h2>
        <div className="space-y-1">
          {folders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              count={countsByFolder[folder.id] || 0}
              active={activeFilter === folder.id && !selectedTag}
              onSelect={onSelectFilter}
              onRename={onRenameFolder}
              onDelete={onDeleteFolder}
            />
          ))}
        </div>
        <p className="mt-2 px-1 text-[11px] leading-4 text-(--muted-foreground)">
          Drag a bookmark onto a folder to move it.
        </p>
      </div>

      {allTags.length ? (
        <div>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-(--muted-foreground)">
            <Hash className="h-3.5 w-3.5" />
            Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  selectedTag === tag
                    ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                    : "border-(--border) text-(--muted-foreground) hover:bg-(--muted)"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-auto rounded-xl border border-(--border) bg-(--muted) p-3 text-[11px] leading-4 text-(--muted-foreground)">
        <Layers className="mb-1 h-4 w-4 text-(--primary)" />
        Tip: select folders &amp; tags from the left, then use the toolbar to search, sort, and bulk-edit.
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-2xl border border-(--border) bg-(--card) shadow-sm">
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onCloseMobile}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-(--border) bg-(--card) shadow-xl"
              role="dialog"
              aria-label="Filters and folders"
            >
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--muted)"
              >
                <X className="h-5 w-5" />
              </button>
              {content}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
