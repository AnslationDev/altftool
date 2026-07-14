"use client";

import { FolderTree } from "lucide-react";

export default function ToolHeader() {
  return (
    <header className="mb-8 text-center">
      <div className="mb-3 flex items-center justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-semibold text-(--primary) shadow-sm">
          <FolderTree className="h-4 w-4" aria-hidden="true" />
          Developer
        </span>
      </div>
      <h1 className="section-title tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
        Folder Structure Visualizer
      </h1>
      <p className="description mx-auto mt-3 max-w-2xl text-sm text-(--muted-foreground) sm:text-base">
        Turn any folder into an interactive tree. Upload a real directory,
        paste an ASCII tree or JSON, then search, filter, zoom, pan and inspect
        statistics.
      </p>
    </header>
  );
}
