"use client";

import { AlertCircle, ArrowLeft, Check, Clock, Eye, History, Keyboard, Loader2, Save } from "lucide-react";

function SaveState({ status, savedLabel }) {
  if (status === "saving") {
    return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>;
  }
  if (status === "error") {
    return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger"><AlertCircle className="h-3.5 w-3.5" /> Save failed</span>;
  }
  if (status === "dirty") {
    return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning"><Clock className="h-3.5 w-3.5" /> Unsaved changes</span>;
  }
  if (status === "saved" || savedLabel) {
    return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success"><Check className="h-3.5 w-3.5" /> {savedLabel || "Saved"}</span>;
  }
  return null;
}

/**
 * Sticky editor action bar. Keeps Back, save state, History, Shortcuts,
 * Preview, Save and the contextual primary action always reachable.
 */
export default function EditorActionBar({
  title = "Editor",
  onBack,
  status,
  savedLabel,
  onSave,
  onPreview,
  onHistory,
  onShortcuts,
  primaryLabel,
  onPrimary,
  busy = false,
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-soft" aria-label="Back to blogs">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-foreground sm:text-base">{title}</h1>

        <div className="hidden md:block"><SaveState status={status} savedLabel={savedLabel} /></div>

        <div className="flex items-center gap-1.5">
          {onShortcuts && (
            <button onClick={onShortcuts} className="hidden rounded-lg border border-border bg-surface p-2 text-muted hover:bg-surface-soft sm:inline-flex" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (⌘/)">
              <Keyboard className="h-4 w-4" />
            </button>
          )}
          {onHistory && (
            <button onClick={onHistory} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-soft" aria-label="Version history">
              <History className="h-4 w-4" />
              <span className="hidden lg:inline">History</span>
            </button>
          )}
          {onPreview && (
            <button onClick={onPreview} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-soft" aria-label="Preview">
              <Eye className="h-4 w-4" />
              <span className="hidden lg:inline">Preview</span>
            </button>
          )}
          {onSave && (
            <button onClick={onSave} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-soft disabled:opacity-50" aria-label="Save draft">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
          {onPrimary && (
            <button onClick={onPrimary} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {primaryLabel || "Publish"}
            </button>
          )}
        </div>

        <div className="w-full md:hidden"><SaveState status={status} savedLabel={savedLabel} /></div>
      </div>
    </div>
  );
}
