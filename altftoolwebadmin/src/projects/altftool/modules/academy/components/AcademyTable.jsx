"use client";

import { Fragment, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight,
  Pencil, Trash2, ExternalLink, Star,
  Columns3, Maximize2, Minimize2, X, Check, Search,
  LayoutGrid, SlidersHorizontal,
  Tag, Globe2, BadgeCheck, Eye, EyeOff,
  DollarSign, BookOpen,
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
          className="pointer-events-none fixed z-[9999] px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap bg-gray-900 text-white shadow-xl"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
          {direction === "bottom"
            ? <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-gray-900" />
            : <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900" />}
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
  if (sorted === "asc") return <ChevronUp className="w-3.5 h-3.5 text-blue-500" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover/hd:text-gray-500 transition-colors" />;
}

/* ── Resize Handle ── */
function ResizeHandle({ header }) {
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-0 h-full w-4 flex items-center justify-center cursor-col-resize select-none touch-none group/rz z-10 ${header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"}`}>
      <div className={`w-0.5 h-5 rounded-full transition-colors ${header.column.getIsResizing() ? "bg-blue-500" : "bg-gray-300 group-hover/rz:bg-blue-400"}`} />
    </div>
  );
}

/* ── Column Panel ── */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-11 z-50 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Columns</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
      <div className="space-y-0.5">
        {table.getAllLeafColumns().map((col) => {
          if (["select", "actions"].includes(col.id)) return null;
          const visible = col.getIsVisible();
          return (
            <label key={col.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors">
              <div className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all ${visible ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-gray-400"}`}>
                {visible && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <input type="checkbox" className="sr-only" checked={visible} onChange={col.getToggleVisibilityHandler()} />
              <span className={`text-sm transition-colors ${visible ? "text-gray-800 font-medium" : "text-gray-500"}`}>{col.columnDef.header}</span>
              {visible
                ? <Eye className="w-3 h-3 text-gray-300 ml-auto" />
                : <EyeOff className="w-3 h-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Star Rating ── */
function StarRating({ value }) {
  if (!value) return <span className="text-gray-400 text-xs">—</span>;
  const stars = Math.round(value);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < stars ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-600 tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

/* ── Academy Banner Cell ── */
function AcademyBannerCell({ academy }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = academy.image && !imgError;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative shrink-0 w-16 h-9 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
        {hasImage ? (
          <img
            src={academy.image}
            alt={academy.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
            <span className="text-indigo-400 font-bold text-sm">{academy.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <span className="font-semibold text-gray-900 text-sm truncate block leading-tight">{academy.name}</span>
        {academy.subCategory && (
          <span className="text-[11px] text-indigo-500 font-medium mt-0.5 block truncate capitalize">{academy.subCategory}</span>
        )}
      </div>
    </div>
  );
}

/* ── New Badge ── */
function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
      New
    </span>
  );
}

/* ── Price Badge ── */
function PriceBadge({ price }) {
  if (price === undefined || price === null || price === "") return <span className="text-gray-400 text-xs">—</span>;
  const num = Number(price);
  if (num === 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      Free
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full tabular-nums">
      <DollarSign className="w-3 h-3" />{num.toLocaleString()}
    </span>
  );
}

/* ════════════════════════════════════════
   Main AcademyTable
════════════════════════════════════════ */
export default function AcademyTable({
  academies = [],
  selected = [],
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

  const allSelected = academies.length > 0 && selected.length === academies.length;
  const someSelected = selected.length > 0 && selected.length < academies.length;

  /* ── Sorted + filtered data ── */
  const filteredAcademies = useMemo(() => {
    const sorted = [...academies].sort((a, b) => {
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
  }, [academies, searchQuery]);

  /* ── New-badge tracking ── */
  const initialIdsRef = useRef(null);
  const [newIds, setNewIds] = useState(new Set());
  useEffect(() => {
    if (initialIdsRef.current === null) {
      initialIdsRef.current = new Set(academies.map((a) => a.id));
      return;
    }
    const fresh = academies.filter((a) => !initialIdsRef.current.has(a.id)).map((a) => a.id);
    if (fresh.length > 0) {
      setNewIds((prev) => new Set([...prev, ...fresh]));
      initialIdsRef.current = new Set(academies.map((a) => a.id));
      const t = setTimeout(() => {
        setNewIds((prev) => { const next = new Set(prev); fresh.forEach((id) => next.delete(id)); return next; });
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [academies]);

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
          className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selected.includes(row.original.id)}
          onChange={() => toggleSelect(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
        />
      ),
      size: 48, minSize: 48, maxSize: 48,
      enableSorting: false, enableResizing: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Academy",
      size: 280, minSize: 180,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AcademyBannerCell academy={row.original} />
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
        if (!val) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold capitalize border border-indigo-100">
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
      accessorKey: "price",
      header: "Price",
      size: 120, minSize: 90,
      cell: ({ getValue }) => <PriceBadge price={getValue()} />,
    },
    {
      id: "url",
      header: "Website",
      size: 120, minSize: 100,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.academyUrl ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
            <Globe2 className="w-3 h-3" />Available
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 120, minSize: 120, maxSize: 120,
      enableSorting: false, enableResizing: false,
      cell: ({ row }) => {
        const academy = row.original;
        const isExpanded = expandedId === academy.id;
        return (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Tooltip label="Edit">
              <button
                onClick={() => onEdit(academy)}
                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-all hover:scale-110 active:scale-95">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            {academy.academyUrl && (
              <Tooltip label="Visit Website">
                <a
                  href={academy.academyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all hover:scale-110 active:scale-95 inline-flex">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Tooltip>
            )}
            <Tooltip label="Delete">
              <button
                onClick={() => onDelete(academy.id)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all hover:scale-110 active:scale-95">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip label={isExpanded ? "Collapse" : "Expand"}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : academy.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all hover:scale-110 active:scale-95">
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ], [academies, selected, allSelected, someSelected, expandedId, newIds]); // eslint-disable-line

  const table = useReactTable({
    data: filteredAcademies,
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

  const totalCount = academies.length;
  const filteredCount = filteredAcademies.length;

  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white flex flex-col"
    : "bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col overflow-hidden";

  return (
    <div className={wrapperClass}>

      {/* ── Top Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100 shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search academies… (⌘F)"
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Count */}
        <span className="text-xs text-gray-400 shrink-0">
          {searchQuery && filteredCount !== totalCount
            ? <><span className="font-semibold text-gray-600">{filteredCount}</span> of {totalCount}</>
            : <><span className="font-semibold text-gray-600">{totalCount}</span> academ{totalCount !== 1 ? "ies" : "y"}</>}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Column toggler */}
          <div className="relative" ref={columnPanelRef}>
            <Tooltip label="Manage columns" direction="bottom">
              <button
                onClick={() => setShowColumnPanel((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${showColumnPanel ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"}`}>
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Bulk Action Bar ── */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{selected.length}</span>
            </div>
            <span className="text-sm font-semibold text-red-700">
              {selected.length} academ{selected.length !== 1 ? "ies" : "y"} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSelectAll()}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors">
              Clear selection
            </button>
            <button
              onClick={() => onDelete(selected)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-red-200 hover:shadow-red-300">
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
              <tr key={hg.id} className="bg-gray-50/95 backdrop-blur-sm border-b border-gray-200/70">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize(), position: "relative" }}
                    className="px-4 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest select-none group/hd">
                    <div
                      className={`flex items-center gap-1.5 ${header.column.getCanSort() ? "cursor-pointer hover:text-gray-800 transition-colors" : ""}`}
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

          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Search className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-600">No academies found</p>
                      {searchQuery && (
                        <p className="text-xs text-gray-400">
                          No results for "<span className="font-medium">{searchQuery}</span>"
                          {" · "}
                          <button onClick={() => setSearchQuery("")} className="text-blue-500 hover:underline">clear search</button>
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const academy = row.original;
                const isSelected = selected.includes(academy.id);
                const isExpanded = expandedId === academy.id;
                const isNew = newIds.has(academy.id);

                return (
                  <Fragment key={row.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : academy.id)}
                      onMouseEnter={() => setHoveredRowId(academy.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      className={`cursor-pointer transition-all duration-150 relative
                        ${isNew ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}
                        ${isSelected
                          ? "bg-blue-50/80 hover:bg-blue-50"
                          : isExpanded
                            ? "bg-indigo-50/40"
                            : "hover:bg-gray-50/80"
                        }`}>
                      {isNew && (
                        <td
                          className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 rounded-r"
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
                      <tr className="bg-gradient-to-b from-indigo-50/40 to-transparent border-b border-indigo-100/60">
                        <td colSpan={columns.length} className="px-6 py-6">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">

                            {/* Preview */}
                            <div className="sm:col-span-4 space-y-2">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <LayoutGrid className="w-3 h-3" />Preview
                              </p>
                              {academy.image ? (
                                <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-white shadow-sm aspect-video">
                                  <img
                                    src={academy.image}
                                    alt={academy.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 aspect-video flex flex-col items-center justify-center gap-2 text-gray-400">
                                  <BookOpen className="w-6 h-6 text-gray-300" />
                                  <span className="text-xs font-medium">No preview</span>
                                </div>
                              )}

                              {/* Meta chips */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {academy.category && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full capitalize">
                                    <Tag className="w-3 h-3" />{academy.category}
                                  </span>
                                )}
                                {academy.subCategory && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full capitalize">
                                    {academy.subCategory}
                                  </span>
                                )}
                                {(academy.price === 0 || academy.price === "0") && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    <BadgeCheck className="w-3 h-3" />Free
                                  </span>
                                )}
                                {academy.academyUrl && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                    <Globe2 className="w-3 h-3" />Has Website
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="sm:col-span-8 space-y-5">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-bold text-gray-900 text-base leading-tight">{academy.name}</h3>
                                  {academy.rating > 0 && (
                                    <div className="mt-1">
                                      <StarRating value={academy.rating} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(academy); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                                    <Pencil className="w-3 h-3" />Edit
                                  </button>
                                  {academy.academyUrl && (
                                    <a
                                      href={academy.academyUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors">
                                      <ExternalLink className="w-3 h-3" />Visit
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Description */}
                              {academy.description && (
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</p>
                                  <p className="text-sm text-gray-700 leading-relaxed">{academy.description}</p>
                                </div>
                              )}

                              {/* Price */}
                              {(academy.price !== undefined && academy.price !== null && academy.price !== "") && (
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</p>
                                  <PriceBadge price={academy.price} />
                                </div>
                              )}

                              {/* Features */}
                              {academy.features?.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Features</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                    {academy.features.map((f, i) => (
                                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                          <Check className="w-2.5 h-2.5 text-green-600" />
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
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-t border-gray-100 shrink-0">
        <p className="text-xs text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-600">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold text-gray-600">{totalCount}</span>{" "}
          academ{totalCount !== 1 ? "ies" : "y"}
        </p>
        {searchQuery && filteredCount !== totalCount && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium hover:underline transition-colors">
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}