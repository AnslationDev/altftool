"use client";

import { Layers } from "lucide-react";

export default function SidebarThumbnails({
  pages = [],
  activePageIndex,
  onSelectPage,
  sourceType,
}) {
  return (
    <aside className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-xs font-extrabold text-[var(--foreground)]">Page Thumbnails</h2>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {pages.length} {sourceType === "pdf" ? `page${pages.length === 1 ? "" : "s"}` : "image"}
          </p>
        </div>
        <Layers className="size-4 text-[var(--primary)]" aria-hidden="true" />
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 xl:max-h-[75vh] xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden">
        {pages.map((page, index) => {
          const isSelected = index === activePageIndex;
          const count = page.rectangles.length;

          return (
            <button
              key={page.pageNumber}
              type="button"
              onClick={() => onSelectPage(index)}
              aria-current={isSelected ? "page" : undefined}
              className={`group relative flex shrink-0 flex-col rounded-2xl border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--primary-soft)] shadow-2xs"
                  : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]"
              }`}
            >
              <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--canvas)] xl:w-full">
                <img
                  src={page.previewUrl}
                  alt={`Thumbnail page ${page.pageNumber}`}
                  className="h-full w-full object-contain"
                />
                {count > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex size-5.5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-extrabold text-[var(--primary-foreground)] shadow-xs">
                    {count}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                <span>Page {page.pageNumber}</span>
                <span className="text-[10px] text-[var(--muted-foreground)] font-semibold">
                  {count} mask{count === 1 ? "" : "s"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
