"use client";

import { memo } from "react";
import { Star, Pencil, Trash2, ExternalLink, GripVertical, Check } from "lucide-react";
import { getFaviconUrl, getDomain } from "../utils/validation";

// Single bookmark tile. Presentational; behaviour is supplied by props.
function BookmarkCardBase({
  bookmark,
  selected,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  onOpen,
  dragHandleProps,
  isDragging,
  selectionMode,
}) {
  const favicon = getFaviconUrl(bookmark.url);
  const domain = getDomain(bookmark.url);

  return (
    <div
      className={`group relative flex h-full flex-col gap-3 rounded-xl border bg-(--card) p-4 shadow-sm transition ${
        selected
          ? "border-(--primary) ring-2 ring-(--primary)"
          : "border-(--border) hover:border-(--primary)/40"
      } ${isDragging ? "opacity-80 shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label="Drag to reorder or move"
          className="mt-0.5 cursor-grab text-(--muted-foreground) hover:text-(--foreground) active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {selectionMode ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(bookmark.id)}
            aria-label={`Select ${bookmark.title}`}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-(--primary)"
          />
        ) : null}

        {favicon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={favicon}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-md border border-(--border) bg-white"
            loading="lazy"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-(--border) bg-(--muted) text-xs font-bold text-(--muted-foreground)">
            {(bookmark.title || "?").charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onOpen(bookmark)}
            className="block w-full truncate text-left text-sm font-semibold text-(--foreground) hover:text-(--primary)"
            title={bookmark.title}
          >
            {bookmark.title}
          </button>
          <p className="truncate text-xs text-(--muted-foreground)" title={domain}>
            {domain}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(bookmark.id)}
          aria-label={bookmark.favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={bookmark.favorite}
          className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--muted)"
        >
          <Star
            className={`h-4 w-4 ${
              bookmark.favorite ? "fill-amber-400 text-amber-400" : ""
            }`}
          />
        </button>
      </div>

      {bookmark.description ? (
        <p className="line-clamp-2 text-xs leading-5 text-(--muted-foreground)">
          {bookmark.description}
        </p>
      ) : null}

      {bookmark.tags.length ? (
        <div className="flex flex-wrap gap-1.5">
          {bookmark.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-(--muted) px-2 py-0.5 text-[11px] font-medium text-(--muted-foreground)"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="inline-flex items-center gap-1 text-[11px] text-(--muted-foreground)">
          <ExternalLink className="h-3 w-3" />
          {bookmark.useCount} opens
        </span>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(bookmark)}
            aria-label="Edit bookmark"
            className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(bookmark)}
            aria-label="Delete bookmark"
            className="rounded-lg p-1.5 text-(--muted-foreground) hover:bg-rose-500/10 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selected ? (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--primary) text-white">
          <Check className="h-3 w-3" />
        </span>
      ) : null}
    </div>
  );
}

export const BookmarkCard = memo(BookmarkCardBase);
