"use client";

import { useCallback, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { ZoomIn, ZoomOut, Maximize, ChevronsDownUp, ChevronsUpDown, FolderTree, Loader2, AlertTriangle, Inbox } from "lucide-react";

import ToolHeader from "../components/ToolHeader";
import InputPanel from "../components/InputPanel";
import SearchBar from "../components/SearchBar";
import TreeView from "../components/TreeView";
import StatsPanel from "../components/StatsPanel";
import Breadcrumb from "../components/Breadcrumb";

import { useTreeData } from "../hooks/useTreeData";
import { useTreeExpansion } from "../hooks/useTreeExpansion";
import { usePanZoom } from "../hooks/usePanZoom";
import { useTreeFilter } from "../hooks/useTreeFilter";
import { useDebounce } from "../hooks/useDebounce";
import { collectExtensions, findNode } from "../utils/tree";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "files", label: "Files" },
  { value: "folders", label: "Folders" },
];

export default function ToolHome() {
  const { root, stats, loading, error, setError, loadFromFiles, loadFromText, loadSample, clear } =
    useTreeData();
  const expansion = useTreeExpansion(root);
  const panZoom = usePanZoom();

  const [rawQuery, setRawQuery] = useState("");
  const query = useDebounce(rawQuery, 200);
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeExtensions, setActiveExtensions] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);

  const extensions = useMemo(() => (root ? collectExtensions(root) : []), [root]);

  const filter = useTreeFilter(root, { query, typeFilter, activeExtensions });

  const effectiveExpanded = useMemo(() => {
    if (!filter.filtersActive) return expansion.expanded;
    return new Set([...expansion.expanded, ...filter.forcedExpand]);
  }, [filter.filtersActive, filter.forcedExpand, expansion.expanded]);

  const selectedNode = useMemo(
    () => (root && selectedId ? findNode(root, selectedId) : null),
    [root, selectedId]
  );

  const handleSelect = useCallback((node) => {
    setSelectedId(node.id);
    setFocusedId(node.id);
  }, []);

  const toggleExtension = useCallback((ext) => {
    setActiveExtensions((prev) => {
      const next = new Set(prev);
      if (next.has(ext)) next.delete(ext);
      else next.add(ext);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setRawQuery("");
    setTypeFilter("all");
    setActiveExtensions(new Set());
  }, []);

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <Toaster richColors position="top-center" />

      <div className="mx-auto max-w-6xl">
        <ToolHeader />

        {!root && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm">
                <InputPanel
                  onUpload={loadFromFiles}
                  onLoadText={loadFromText}
                  onLoadSample={loadSample}
                  loading={loading}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
              <EmptyState onLoadSample={loadSample} loading={loading} />
            </div>
          </div>
        )}

        {root && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm">
                <InputPanel
                  onUpload={loadFromFiles}
                  onLoadText={loadFromText}
                  onLoadSample={loadSample}
                  loading={loading}
                />
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setSelectedId(null);
                    setFocusedId(null);
                    resetFilters();
                  }}
                  className="btn-secondary mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  Clear &amp; start over
                </button>
              </div>

              {stats && <StatsPanel stats={stats} />}

              {extensions.length > 0 && (
                <div className="rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                    Filter by extension
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {extensions.map((ext) => {
                      const active = activeExtensions.has(ext);
                      return (
                        <button
                          key={ext}
                          type="button"
                          onClick={() => toggleExtension(ext)}
                          aria-pressed={active}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            active
                              ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                              : "border-(--border) bg-(--background) text-(--muted-foreground) hover:bg-(--muted)"
                          }`}
                        >
                          .{ext}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 lg:col-span-2">
              <div className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--card) p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <SearchBar
                    value={rawQuery}
                    onChange={setRawQuery}
                    matchCount={filter.matchCount}
                    filtersActive={filter.filtersActive}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <div
                    role="group"
                    aria-label="Type filter"
                    className="flex overflow-hidden rounded-lg border border-(--border)"
                  >
                    {TYPE_FILTERS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTypeFilter(opt.value)}
                        aria-pressed={typeFilter === opt.value}
                        className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          typeFilter === opt.value
                            ? "bg-(--primary) text-(--primary-foreground)"
                            : "bg-(--background) text-(--muted-foreground) hover:bg-(--muted)"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {(filter.filtersActive || activeExtensions.size > 0) && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--muted-foreground) hover:bg-(--muted)"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <ToolbarButton label="Expand all" onClick={expansion.expandAll} icon={ChevronsDownUp} />
                <ToolbarButton label="Collapse all" onClick={expansion.collapseAll} icon={ChevronsUpDown} />
                <span className="mx-1 hidden h-5 w-px bg-(--border) sm:inline-block" />
                <ToolbarButton label="Zoom in" onClick={panZoom.zoomIn} icon={ZoomIn} />
                <ToolbarButton label="Zoom out" onClick={panZoom.zoomOut} icon={ZoomOut} />
                <ToolbarButton label="Reset view" onClick={panZoom.reset} icon={Maximize} />
              </div>

              <div className="rounded-xl border border-(--border) bg-(--card) p-3 shadow-sm">
                <Breadcrumb selectedNode={selectedNode} onSelect={handleSelect} setFocusedId={setFocusedId} />
              </div>

              {loading && (
                <div className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--card) p-4 text-sm text-(--muted-foreground) shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Parsing structure…
                </div>
              )}

              {!loading && (
                <TreeView
                  root={root}
                  expanded={effectiveExpanded}
                  toggle={expansion.toggle}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  focusedId={focusedId}
                  setFocusedId={setFocusedId}
                  matched={filter.matchedIds}
                  query={query}
                  visibleIds={filter.visibleIds}
                  panZoom={panZoom}
                />
              )}

              <p className="text-xs text-(--muted-foreground)">
                Tip: use arrow keys to navigate, Right/Left to expand or collapse, and drag the canvas to pan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ label, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-medium text-(--foreground) shadow-sm transition-colors hover:bg-(--muted)"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function EmptyState({ onLoadSample, loading }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-(--border) bg-(--card) p-10 text-center shadow-sm">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary)/10 text-(--primary)">
        <FolderTree className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-(--foreground)">No folder loaded yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-(--muted-foreground)">
        Upload a real folder from your computer, or paste an ASCII tree, an indented
        list, or JSON on the left. Not sure where to start? Try the sample project.
      </p>
      <button
        type="button"
        onClick={onLoadSample}
        disabled={loading}
        className="btn-primary mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        <Inbox className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
        Load sample project
      </button>
    </div>
  );
}
