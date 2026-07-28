"use client";

import { Fragment, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight,
  Pencil, Trash2, ExternalLink, Star, Chrome,
  Columns3, Maximize2, Minimize2, X, Check, Search,
  ArrowUpDown, LayoutGrid, List, Filter, SlidersHorizontal,
  Clock, Tag, Globe2, BadgeCheck, Eye, EyeOff,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

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
  return <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--muted)]/50 group-hover/hd:text-[var(--muted)] transition-colors" />;
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
                ? <Eye className="w-3 h-3 text-[var(--muted)]/50 ml-auto" />
                : <EyeOff className="w-3 h-3 text-[var(--muted)]/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Star rating ── */
function StarRating({ value }) {
  if (!value) return <span className="text-[var(--muted)] text-xs">—</span>;
  const stars = Math.round(value);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < stars ? "text-[var(--warning)] fill-[var(--warning)]" : "text-[var(--border)] fill-[var(--border)]"}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-[var(--foreground)] tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

function ExtensionIcon({ icon, className = "" }) {
  const Icon = LucideIcons[icon] || LucideIcons.Puzzle;

  return <Icon className={className} aria-hidden="true" />;
}

/* ── Banner Image ── */
function BannerCell({ ext }) {
  const [imgError, setImgError] = useState(false);
  const hasBanner = ext.image && !imgError;
  const hasIcon = ext.icon;

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Banner thumbnail */}
      <div className="relative shrink-0 w-16 h-9 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)]">
        {hasBanner ? (
          <img
            src={ext.image}
            alt={ext.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : hasIcon ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--surface-soft)]">
            <ExtensionIcon icon={ext.icon} className="h-5 w-5 text-[var(--accent)]" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--accent-soft)]">
            <span className="text-[var(--accent)] font-bold text-sm">{ext.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
        {/* Overlay icon badge on bottom-right corner */}
        {hasBanner && hasIcon && (
          <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded border border-[var(--surface)] bg-[var(--surface)] shadow-sm flex items-center justify-center">
            <ExtensionIcon icon={ext.icon} className="h-3.5 w-3.5 text-[var(--accent)]" />
          </div>
        )}
      </div>

      {/* Name + category pill */}
      <div className="min-w-0">
        <span className="font-semibold text-[var(--foreground)] text-sm truncate block leading-tight">{ext.name}</span>
        {ext.category && (
          <span className="text-[11px] text-[var(--accent)] font-medium mt-0.5 block truncate capitalize">{ext.category}</span>
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

/* ── Status Badge ── */
function StatusBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success-text)] bg-[var(--success-soft)] border border-[var(--success)]/30 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />Active
      </span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] bg-[var(--surface-soft)] border border-[var(--border)] px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />Inactive
      </span>;
}

/* ══════════════════════════════════════════
   Main ExtensionsTable
══════════════════════════════════════════ */
export default function ExtensionsTable({
  extensions,
  selected,
  toggleSelect,
  toggleSelectAll,
  onEdit,
  onDelete,
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

  const allSelected = extensions.length > 0 && selected.length === extensions.length;
  const someSelected = selected.length > 0 && selected.length < extensions.length;

  // Sort so newest (highest id or by createdAt) are at top, then apply search filter
  const filteredExtensions = useMemo(() => {
    // Sort newest first: assumes higher id = newer, or use ext.createdAt if available
    const sorted = [...extensions].sort((a, b) => {
      if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
      // Fallback: treat numeric ids or string ids
      const aId = typeof a.id === "number" ? a.id : parseInt(a.id, 10) || 0;
      const bId = typeof b.id === "number" ? b.id : parseInt(b.id, 10) || 0;
      return bId - aId;
    });

    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (ext) =>
        ext.name?.toLowerCase().includes(q) ||
        ext.category?.toLowerCase().includes(q) ||
        ext.description?.toLowerCase().includes(q)
    );
  }, [extensions, searchQuery]);

  // Track "new" ids: ids added after initial render
  const initialIdsRef = useRef(null);
  const [newIds, setNewIds] = useState(new Set());
  useEffect(() => {
    if (initialIdsRef.current === null) {
      initialIdsRef.current = new Set(extensions.map((e) => e.id));
      return;
    }
    const fresh = extensions
      .filter((e) => !initialIdsRef.current.has(e.id))
      .map((e) => e.id);
    if (fresh.length > 0) {
      setNewIds((prev) => new Set([...prev, ...fresh]));
      initialIdsRef.current = new Set(extensions.map((e) => e.id));
      // Auto-clear "new" badge after 10s
      const t = setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          fresh.forEach((id) => next.delete(id));
          return next;
        });
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [extensions]);

  // Close column panel on outside click
  useEffect(() => {
    const h = (e) => {
      if (columnPanelRef.current && !columnPanelRef.current.contains(e.target))
        setShowColumnPanel(false);
    };
    if (showColumnPanel) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showColumnPanel]);

  // Fullscreen: escape key
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setIsFullscreen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // Fullscreen: lock body scroll
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  // Ctrl/Cmd + F to focus search
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

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
      size: 48, minSize: 48, maxSize: 48,
      enableSorting: false, enableResizing: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Extension",
      size: 280, minSize: 180,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BannerCell ext={row.original} />
          {newIds.has(row.original.id) && <NewBadge />}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 150, minSize: 100,
      cell: ({ getValue }) => {
        const val = getValue();
        if (!val) return <span className="text-[var(--muted)] text-xs">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[var(--accent)] shrink-0" />
            <span className="text-xs bg-[var(--accent-soft)] text-[var(--accent)] px-2.5 py-1 rounded-full font-semibold capitalize border border-[var(--accent)]/20">
              {val}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      size: 160, minSize: 110,
      cell: ({ getValue }) => <StarRating value={getValue()} />,
    },
    {
      id: "status",
      accessorKey: "active",
      header: "Status",
      size: 120, minSize: 100,
      cell: ({ getValue }) => <StatusBadge active={getValue() !== false} />,
    },
    {
      id: "chrome",
      header: "Chrome Store",
      size: 130, minSize: 110,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.hasChromeStore ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--info)] bg-[var(--info-soft)] border border-[var(--info)]/30 px-2.5 py-1 rounded-full">
            <Chrome className="w-3 h-3" />Listed
          </span>
        ) : (
          <span className="text-xs text-[var(--muted)]">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 120, minSize: 120, maxSize: 120,
      enableSorting: false, enableResizing: false,
      cell: ({ row }) => {
        const ext = row.original;
        const isExpanded = expandedId === ext.id;
        return (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Tooltip label="Edit">
              <button
                onClick={() => onEdit(ext)}
                className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-all hover:scale-110 active:scale-95">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            {ext.chromeUrl && ext.chromeUrl !== "#" && (
              <Tooltip label="Chrome Store">
                <a
                  href={ext.chromeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition-all hover:scale-110 active:scale-95 inline-flex">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Tooltip>
            )}
            <Tooltip label="Delete">
              <button
                onClick={() => onDelete(ext.id)}
                className="p-1.5 rounded-lg text-[var(--danger)]/70 hover:bg-[var(--danger-soft)] hover:text-[var(--danger-text)] transition-all hover:scale-110 active:scale-95">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip label={isExpanded ? "Collapse" : "Expand"}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : ext.id)}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition-all hover:scale-110 active:scale-95">
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ], [extensions, selected, allSelected, someSelected, expandedId, newIds]); // eslint-disable-line

  const table = useReactTable({
    data: filteredExtensions,
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

  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-[var(--surface)] flex flex-col"
    : "bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm flex flex-col overflow-hidden";

  const totalCount = extensions.length;
  const filteredCount = filteredExtensions.length;

  return (
    <div className={wrapperClass}>

      {/* ── Top Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions… (⌘F)"
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

        {/* Count */}
        <span className="text-xs text-[var(--muted)] shrink-0">
          {searchQuery && filteredCount !== totalCount
            ? <><span className="font-semibold text-[var(--foreground)]">{filteredCount}</span> of {totalCount}</>
            : <><span className="font-semibold text-[var(--foreground)]">{totalCount}</span> extension{totalCount !== 1 ? "s" : ""}</>}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Column toggler */}
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

          {/* Fullscreen */}
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
              {selected.length} extension{selected.length !== 1 ? "s" : ""} selected
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
                    className="px-4 py-3.5 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest select-none group/hd">
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
                      <Search className="w-6 h-6 text-[var(--muted)]/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">No extensions found</p>
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
              table.getRowModel().rows.map((row, idx) => {
                const ext = row.original;
                const isSelected = selected.includes(ext.id);
                const isExpanded = expandedId === ext.id;
                const isNew = newIds.has(ext.id);
                const isHovered = hoveredRowId === ext.id;

                return (
                  <Fragment key={row.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : ext.id)}
                      onMouseEnter={() => setHoveredRowId(ext.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      className={`cursor-pointer transition-all duration-150 relative
                        ${isNew ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}
                        ${isSelected
                          ? "bg-[var(--primary-soft)]/80 hover:bg-[var(--primary-soft)]"
                          : isExpanded
                            ? "bg-[var(--accent-soft)]/40"
                            : "hover:bg-[var(--surface-soft)]/80"
                        }`}>
                      {/* New row accent stripe */}
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
                          className="px-4 py-3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>

                    {/* ── Expanded Detail Row ── */}
                    {isExpanded && (
                      <tr className="bg-[var(--accent-soft)]/40 border-b border-[var(--accent)]/20">
                        <td colSpan={columns.length} className="px-6 py-6">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">

                            {/* Banner / Preview */}
                            <div className="sm:col-span-4 space-y-2">
                              <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-1.5">
                                <LayoutGrid className="w-3 h-3" />Preview
                              </p>
                              {ext.image ? (
                                <div className="relative rounded-2xl overflow-hidden border border-[var(--accent)]/20 bg-[var(--surface)] shadow-sm aspect-video">
                                  <img
                                    src={ext.image}
                                    alt={ext.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {ext.icon && (
                                    <div className="absolute bottom-2 left-2 w-8 h-8 rounded-xl bg-[var(--surface)] shadow-md border border-[var(--border)] flex items-center justify-center">
                                      <ExtensionIcon icon={ext.icon} className="h-4 w-4 text-[var(--accent)]" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] aspect-video flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                                  <Globe2 className="w-6 h-6 text-[var(--muted)]/60" />
                                  <span className="text-xs font-medium">No preview</span>
                                </div>
                              )}

                              {/* Meta chips */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {ext.hasChromeStore && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--info)] bg-[var(--info-soft)] border border-[var(--info)]/30 px-2 py-0.5 rounded-full">
                                    <Chrome className="w-3 h-3" />Chrome Store
                                  </span>
                                )}
                                {ext.active !== false && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--success-text)] bg-[var(--success-soft)] border border-[var(--success)]/30 px-2 py-0.5 rounded-full">
                                    <BadgeCheck className="w-3 h-3" />Active
                                  </span>
                                )}
                                {ext.category && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-full capitalize">
                                    <Tag className="w-3 h-3" />{ext.category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="sm:col-span-8 space-y-5">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-bold text-[var(--foreground)] text-base leading-tight">{ext.name}</h3>
                                  {ext.rating && (
                                    <div className="mt-1">
                                      <StarRating value={ext.rating} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(ext); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-90 border border-[var(--primary)]/30 rounded-xl transition-colors">
                                    <Pencil className="w-3 h-3" />Edit
                                  </button>
                                  {ext.chromeUrl && ext.chromeUrl !== "#" && (
                                    <a
                                      href={ext.chromeUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl transition-colors">
                                      <ExternalLink className="w-3 h-3" />Store
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Description */}
                              {ext.description && (
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Description</p>
                                  <p className="text-sm text-[var(--foreground)] leading-relaxed">{ext.description}</p>
                                </div>
                              )}

                              {/* Features */}
                              {ext.features?.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Features</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                    {ext.features.map((f, i) => (
                                      <div key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                                        <div className="w-4 h-4 rounded-full bg-[var(--success-soft)] flex items-center justify-center shrink-0 mt-0.5">
                                          <Check className="w-2.5 h-2.5 text-[var(--success-text)]" />
                                        </div>
                                        <span className="leading-snug">{f}</span>
                                      </div>
                                    ))}
                                  </div>
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
          <span className="font-semibold text-[var(--foreground)]">
            {filteredCount}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[var(--foreground)]">{totalCount}</span>{" "}
          extension{totalCount !== 1 ? "s" : ""}
        </p>
        {searchQuery && filteredCount !== totalCount && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-[var(--primary)] hover:opacity-80 font-medium hover:underline transition-colors">
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
