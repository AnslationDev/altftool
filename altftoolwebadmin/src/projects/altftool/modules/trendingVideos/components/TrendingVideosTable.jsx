"use client";

import { Fragment, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, ExternalLink,
  Columns3, Maximize2, Minimize2, X, Check, Search,
  LayoutGrid, SlidersHorizontal,
  Tag, Globe2, Eye, EyeOff,
  BookOpen, Pause, Play,
  Edit
} from "lucide-react";

/* ── Portal Tooltip ── */
function Tooltip({ label, children, direction = "top" }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(direction === "bottom"
      ? { top: r.bottom + 8, left: r.left + r.width / 2 }
      : { top: r.top - 8, left: r.left + r.width / 2 });
  }, [direction]);
  const hide = useCallback(() => setPos(null), []);

  const tip = pos && typeof document !== "undefined"
    ? createPortal(
        <div
          className="pointer-events-none fixed z-[9999] px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap bg-[var(--foreground)] text-[var(--background)] shadow-xl"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
          {direction === "bottom"
            ? <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[var(--foreground)]" />
            : <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[var(--foreground)]" />}
        </div>, document.body)
    : null;

  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>{children}</div>
      {tip}
    </>
  );
}

/* ── Sort Icon ── */
function SortIcon({ sorted }) {
  if (sorted === "asc") return <ChevronUp className="w-3.5 h-3.5 text-[var(--primary)]" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-[var(--primary)]" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--muted-soft)] group-hover/hd:text-[var(--muted)] transition-colors" />;
}

/* ── Resize Handle ── */
function ResizeHandle({ header }) {
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-0 h-full w-4 flex items-center justify-center cursor-col-resize select-none touch-none group/rz z-10 ${header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"}`}>
      <div className={`w-0.5 h-5 rounded-full transition-colors ${header.column.getIsResizing() ? "bg-[var(--primary)]" : "bg-[var(--border-strong)] group-hover/rz:bg-[var(--primary)]"}`} />
    </div>
  );
}

/* ── Column Panel ── */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-11 z-50 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--muted)]" />
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Columns</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[var(--surface-soft)] rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-[var(--muted)]" />
        </button>
      </div>
      <div className="space-y-0.5">
        {table.getAllLeafColumns().map((col) => {
          if (["select", "actions"].includes(col.id)) return null;
          const visible = col.getIsVisible();
          return (
            <label key={col.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--surface-soft)] cursor-pointer group transition-colors">
              <div className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all ${visible ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border-strong)] group-hover:border-[var(--muted)]"}`}>
                {visible && <Check className="w-2.5 h-2.5 text-[var(--primary-foreground)]" />}
              </div>
              <input type="checkbox" className="sr-only" checked={visible} onChange={col.getToggleVisibilityHandler()} />
              <span className={`text-sm transition-colors ${visible ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)]"}`}>{col.columnDef.header}</span>
              {visible
                ? <Eye className="w-3 h-3 text-[var(--muted-soft)] ml-auto" />
                : <EyeOff className="w-3 h-3 text-[var(--muted-soft)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Video Banner Cell ──
   Priority: thumbnail → image → initials fallback
── */
function VideoBannerCell({ video }) {
  // prefer thumbnail, fall back to image
  const src = video.thumbnail || video.image || null;
  const [imgError, setImgError] = useState(false);
  const hasImage = src && !imgError;

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Thumbnail preview — 16:9 */}
      <div className="relative shrink-0 w-16 h-9 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)]">
        {hasImage ? (
          <img
            src={src}
            alt={video.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--accent-soft)]">
            <span className="text-[var(--accent)] font-bold text-sm">{video.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
        {/* Small badge if it came from thumbnail vs image */}
        {video.thumbnail && !imgError && (
          <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold bg-[var(--overlay)] text-[var(--background)] px-1 rounded leading-tight">
            THUMB
          </span>
        )}
      </div>

      <div className="min-w-0">
        <span className="font-semibold text-[var(--foreground)] text-sm truncate block leading-tight">{video.name}</span>
        {video.subCategory && (
          <span className="text-[11px] text-[var(--accent)] font-medium mt-0.5 block truncate capitalize">{video.subCategory}</span>
        )}
      </div>
    </div>
  );
}

/* ── New Badge ── */
function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success-text)] uppercase tracking-wide">
      New
    </span>
  );
}

/* ════════════════════════════════════════
   Main VideoTable
════════════════════════════════════════ */
export default function TrendingVideosTable({
  videos = [],
  selected = [],
  toggleSelect,
  toggleSelectAll,
  onEdit,
  onDelete,
  onTogglePlay
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRowId, setHoveredRowId] = useState(null);

  const columnPanelRef = useRef(null);
  const searchRef = useRef(null);

  const allSelected = videos.length > 0 && selected.length === videos.length;
  const someSelected = selected.length > 0 && selected.length < videos.length;

  /* ── Sorted + filtered data ── */
  const filteredVideos = useMemo(() => {
    const sorted = [...videos].sort((a, b) => {
      if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
      const aId = typeof a.id === "number" ? a.id : parseInt(a.id, 10) || 0;
      const bId = typeof b.id === "number" ? b.id : parseInt(b.id, 10) || 0;
      return bId - aId;
    });
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.subCategory?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );
  }, [videos, searchQuery]);

  /* ── New-badge tracking ── */
  const initialIdsRef = useRef(null);
  const [newIds, setNewIds] = useState(new Set());
  useEffect(() => {
    if (initialIdsRef.current === null) {
      initialIdsRef.current = new Set(videos.map((a) => a.id));
      return;
    }
    const fresh = videos.filter((a) => !initialIdsRef.current.has(a.id)).map((a) => a.id);
    if (fresh.length > 0) {
      setNewIds((prev) => new Set([...prev, ...fresh]));
      initialIdsRef.current = new Set(videos.map((a) => a.id));
      const t = setTimeout(() => {
        setNewIds((prev) => { const next = new Set(prev); fresh.forEach((id) => next.delete(id)); return next; });
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [videos]);

  /* ── Outside click: column panel ── */
  useEffect(() => {
    const h = (e) => { if (columnPanelRef.current && !columnPanelRef.current.contains(e.target)) setShowColumnPanel(false); };
    if (showColumnPanel) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showColumnPanel]);

  /* ── Escape: exit fullscreen ── */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setIsFullscreen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  /* ── Fullscreen: lock scroll ── */
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  /* ── Cmd/Ctrl+F: focus search ── */
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "f") { e.preventDefault(); searchRef.current?.focus(); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  /* ── Columns ── */
  const columns = useMemo(() => [
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected; }}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selected.includes(row.original.id)}
          onChange={() => toggleSelect(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
        />
      ),
      size: 48,
      enableSorting: false,
    },

    {
      accessorKey: "title",
      header: "Video",
      size: 280,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <VideoBannerCell video={row.original} />
          {newIds.has(row.original.id) && <NewBadge />}
        </div>
      ),
    },

    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => (
        <span className="text-xs bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-1 rounded-full capitalize">
          {getValue() || "—"}
        </span>
      ),
    },

    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => (
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          getValue() === "shorts"
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "bg-[var(--info-soft)] text-[var(--info)]"
        }`}>
          {getValue()}
        </span>
      ),
    },

    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ getValue }) => (
        <span className="text-xs text-[var(--muted)] font-medium">
          {getValue() || "—"}
        </span>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="flex gap-1 items-center">
            <Tooltip label="Edit">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(video); }}
                className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] transition"
                title="Edit"
              >
                <Pencil className="w-4 h-4 text-[var(--primary)]" />
              </button>
            </Tooltip>
            <Tooltip label="Delete">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(video.firestoreId ?? video.id); }}
                className="p-1.5 rounded-lg hover:bg-[var(--danger-soft)] transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-[var(--danger)]" />
              </button>
            </Tooltip>
            <Tooltip label={video.isPlaying?"Pause":"Play"}>
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePlay(video.id); }}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] transition"
                title={video.isPlaying ? "Pause" : "Play"}
              >
                {video.isPlaying
                  ? <Pause className="w-4 h-4 text-[var(--primary)]" />
                  : <Play  className="w-4 h-4 text-[var(--success)]" />}
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ], [videos, selected, allSelected, someSelected, newIds]); // eslint-disable-line

  const table = useReactTable({
    data: filteredVideos,
    columns,
    state: { sorting, columnVisibility, columnSizing },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    getRowId: (row) => row.id,
  });

  const totalCount = videos.length;
  const filteredCount = filteredVideos.length;

  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-[var(--surface)] flex flex-col"
    : "bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm flex flex-col overflow-hidden";

  return (
    <div className={wrapperClass}>

      {/* ── Top Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos... (⌘F)"
            className="w-full pl-9 pr-8 py-2 text-sm bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)] transition-all placeholder:text-[var(--muted)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-[var(--muted)] shrink-0">
          {searchQuery && filteredCount !== totalCount
            ? <><span className="font-semibold text-[var(--foreground)]">{filteredCount}</span> of {totalCount}</>
            : <><span className="font-semibold text-[var(--foreground)]">{totalCount}</span> video{totalCount !== 1 ? "s" : ""}</>}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          <div className="relative" ref={columnPanelRef}>
            <Tooltip label="Manage columns" direction="bottom">
              <button
                onClick={() => setShowColumnPanel((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${showColumnPanel ? "bg-[var(--primary-soft)] border-[var(--primary)]/30 text-[var(--primary)]" : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:border-[var(--border-strong)]"}`}>
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>
            </Tooltip>
            {showColumnPanel && <ColumnPanel table={table} onClose={() => setShowColumnPanel(false)} />}
          </div>

          <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} direction="bottom">
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:border-[var(--border-strong)] transition-all">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Bulk Action Bar ── */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--danger-soft)] border-b border-[var(--danger)]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[var(--danger)] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[var(--danger-foreground)]">{selected.length}</span>
            </div>
            <span className="text-sm font-semibold text-[var(--danger-text)]">
              {selected.length} video{selected.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSelectAll()}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] font-medium px-2 py-1.5 rounded-lg hover:bg-[var(--surface)]/60 transition-colors">
              Clear selection
            </button>
            <button
              onClick={() => onDelete(selected)}
              className="flex items-center gap-1.5 bg-[var(--danger)] hover:opacity-90 active:opacity-80 text-[var(--danger-foreground)] text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm">
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selected.length > 1 ? `${selected.length} items` : "item"}
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className={`overflow-auto flex-1 ${isFullscreen ? "min-h-0" : ""}`}>
        <table className="text-sm" style={{ width: table.getTotalSize(), minWidth: "100%" }}>
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[var(--surface-soft)]/95 backdrop-blur-sm border-b border-[var(--border)]">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize(), position: "relative" }}
                    className="px-5 py-4 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest select-none group/hd">
                    <div
                      className={`flex items-center gap-1.5 ${header.column.getCanSort() ? "cursor-pointer hover:text-[var(--foreground)] transition-colors" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon sorted={header.column.getIsSorted()} />}
                    </div>
                    {header.column.getCanResize() && <ResizeHandle header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center">
                      <Search className="w-6 h-6 text-[var(--muted-soft)]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">No videos found</p>
                      {searchQuery && (
                        <p className="text-xs text-[var(--muted)]">
                          No results for "<span className="font-medium">{searchQuery}</span>"
                          {" · "}
                          <button onClick={() => setSearchQuery("")} className="text-[var(--primary)] hover:underline">clear search</button>
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const video = row.original;
                const isSelected = selected.includes(video.id);
                const isExpanded = expandedId === video.id;
                const isNew = newIds.has(video.id);

                return (
                  <Fragment key={`${row.id}-${row.index}`}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : video.id)}
                      onMouseEnter={() => setHoveredRowId(video.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      className={`cursor-pointer transition-all duration-150 relative
                        ${isNew ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}
                        ${isSelected
                          ? "bg-[var(--primary-soft)]/80 hover:bg-[var(--primary-soft)]"
                          : isExpanded
                            ? "bg-[var(--accent-soft)]/40"
                            : "hover:bg-[var(--surface-soft)]/80"
                        }`}>
                      {isNew && (
                        <td
                          className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--success)] rounded-r"
                          style={{ display: "block", position: "absolute" }}
                        />
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="px-5 py-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>

                    {/* ── Expanded Detail Row ── */}
                    {isExpanded && (
                      <tr className="bg-[var(--accent-soft)]/40 border-b border-[var(--accent)]/20">
                        <td colSpan={columns.length} className="px-6 py-6">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">

                            {/* Preview — shows thumbnail if available, otherwise image */}
                            <div className="sm:col-span-4 space-y-2">
                              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-1.5">
                                <LayoutGrid className="w-3 h-3" />
                                {video.thumbnail ? "Thumbnail" : "Preview"}
                              </p>
                              {(video.thumbnail || video.image) ? (
                                <div className="rounded-2xl overflow-hidden border border-[var(--accent)]/20 bg-[var(--surface)] shadow-sm aspect-video">
                                  <img
                                    src={video.thumbnail || video.image}
                                    alt={video.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] aspect-video flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                                  <BookOpen className="w-6 h-6 text-[var(--muted-soft)]" />
                                  <span className="text-xs font-medium">No preview</span>
                                </div>
                              )}

                              {/* Meta chips */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {video.category && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-full capitalize">
                                    <Tag className="w-3 h-3" />{video.category}
                                  </span>
                                )}
                                {video.subCategory && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-full capitalize">
                                    {video.subCategory}
                                  </span>
                                )}
                                {video.thumbnail && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--success-text)] bg-[var(--success-soft)] border border-[var(--success)]/30 px-2 py-0.5 rounded-full">
                                    Has Thumbnail
                                  </span>
                                )}
                                {video.videoUrl && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--info)] bg-[var(--info-soft)] border border-[var(--info)]/30 px-2 py-0.5 rounded-full">
                                    <Globe2 className="w-3 h-3" />Has Video
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="sm:col-span-8 space-y-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-bold text-[var(--foreground)] text-base leading-tight">{video.name}</h3>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(video); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-90 border border-[var(--primary)]/30 rounded-xl transition-colors">
                                    <Pencil className="w-3 h-3" />Edit
                                  </button>
                                  {video.videoUrl && (
                                    <a
                                      href={video.videoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl transition-colors">
                                      <ExternalLink className="w-3 h-3" />Visit
                                    </a>
                                  )}
                                </div>
                              </div>

                              {video.description && (
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Description</p>
                                  <p className="text-sm text-[var(--foreground)] leading-relaxed">{video.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-[var(--surface-soft)]/80 border-t border-[var(--border)] shrink-0">
        <p className="text-xs text-[var(--muted)]">
          Showing{" "}
          <span className="font-semibold text-[var(--foreground)]">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold text-[var(--foreground)]">{totalCount}</span>{" "}
          video{totalCount !== 1 ? "s" : ""}
        </p>
        {searchQuery && filteredCount !== totalCount && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-[var(--primary)] hover:underline transition-colors">
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
