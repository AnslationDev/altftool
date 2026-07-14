"use client";

import { useState } from "react";
import { Star, Trash2, FolderInput, Tag, X } from "lucide-react";

export function BulkBar({
  selectedCount,
  totalVisible,
  folders,
  onBulkFavorite,
  onBulkUnfavorite,
  onBulkMove,
  onBulkTag,
  onBulkDelete,
  onClear,
  onSelectAll,
}) {
  const [tagValue, setTagValue] = useState("");
  const [moveValue, setMoveValue] = useState("");

  const handleTag = () => {
    const value = tagValue.trim();
    if (!value) return;
    onBulkTag(value);
    setTagValue("");
  };

  const handleMove = (event) => {
    const value = event.target.value;
    setMoveValue(value);
    if (value) onBulkMove(value);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--primary)/40 bg-(--card) p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary)/10 px-3 py-1 text-sm font-semibold text-(--primary)">
          {selectedCount} selected
        </span>
        {selectedCount < totalVisible ? (
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs font-semibold text-(--primary) hover:underline"
          >
            Select all {totalVisible}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--muted)"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onBulkFavorite(true)}
          className="flex items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-semibold text-(--foreground) hover:bg-(--muted)"
        >
          <Star className="h-3.5 w-3.5 text-amber-400" />
          Favorite
        </button>
        <button
          type="button"
          onClick={() => onBulkFavorite(false)}
          className="flex items-center gap-1.5 rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-semibold text-(--foreground) hover:bg-(--muted)"
        >
          <Star className="h-3.5 w-3.5" />
          Unfavorite
        </button>

        <div className="flex items-center gap-1.5 rounded-lg border border-(--border) px-2 py-1">
          <FolderInput className="h-3.5 w-3.5 text-(--muted-foreground)" />
          <select
            value={moveValue}
            onChange={handleMove}
            aria-label="Move selected to folder"
            className="bg-transparent text-xs font-semibold text-(--foreground) outline-none"
          >
            <option value="">Move to…</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-(--border) px-2 py-1">
          <Tag className="h-3.5 w-3.5 text-(--muted-foreground)" />
          <input
            value={tagValue}
            onChange={(event) => setTagValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleTag();
            }}
            placeholder="Add tag"
            aria-label="Add tag to selected"
            className="w-24 bg-transparent text-xs text-(--foreground) outline-none placeholder:text-(--muted-foreground)"
          />
          <button
            type="button"
            onClick={handleTag}
            className="text-xs font-semibold text-(--primary)"
          >
            Add
          </button>
        </div>

        <button
          type="button"
          onClick={onBulkDelete}
          className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
