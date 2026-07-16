"use client";

export default function EditingTools({ onUndo, onRedo, onReset, canUndo, canRedo, hasImage }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-sm text-(--foreground) hover:bg-(--muted) transition disabled:opacity-30 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-sm text-(--foreground) hover:bg-(--muted) transition disabled:opacity-30 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
        Redo
      </button>
      <button
        onClick={onReset}
        disabled={!hasImage}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-sm text-(--foreground) hover:bg-(--muted) transition disabled:opacity-30 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
    </div>
  );
}
