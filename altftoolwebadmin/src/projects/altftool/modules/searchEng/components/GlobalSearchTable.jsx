"use client";

import { Fragment, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAuth } from "firebase/auth";
import { updateData, deleteData } from "../service/data.service";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, X, Pause, Play, Trash2, Pencil,
  ChevronRight, ExternalLink, Copy, Check,
  Columns3, Maximize2, Minimize2,
  ImageIcon, DollarSign, Layers, Inbox
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
  const hide = useCallback(()  => setPos(null), []);
  const tip = pos && typeof document !== "undefined"
    ? createPortal(
        <div className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-lg"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
          {direction === "bottom"
            ? <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-foreground" />
            : <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />}
        </div>, document.body)
    : null;
  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>{children}</div>
      {tip}
    </>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      status === "active" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-success" : "bg-warning"}`} />
      {status === "active" ? "Active" : "Paused"}
    </span>
  );
}

/* ── Sort Icon ── */
function SortIcon({ sorted }) {
  if (sorted === "asc") return <ChevronUp className="w-3.5 h-3.5 text-primary" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-primary" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-muted" />;
}

/* ── Resize Handle ── */
function ResizeHandle({ header }) {
  return (
    <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-0 h-full w-4 flex items-center justify-center cursor-col-resize select-none touch-none group/rz z-10
        ${header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"}`}>
      <div className={`w-0.5 h-5 rounded-full transition-colors
        ${header.column.getIsResizing() ? "bg-primary" : "bg-border group-hover/rz:bg-primary"}`} />
    </div>
  );
}

/* ── Column Panel ── */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-10 z-50 w-52 bg-surface border border-border rounded-xl shadow-xl p-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Columns</span>
        <button type="button" onClick={onClose} aria-label="Close column settings" className="grid h-8 w-8 place-items-center rounded-md hover:bg-surface-soft">
          <X className="w-3.5 h-3.5 text-muted" />
        </button>
      </div>
      <div className="space-y-1">
        {table.getAllLeafColumns().map((col) => {
          if (["select", "actions", "expand"].includes(col.id)) return null;
          return (
            <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-soft cursor-pointer">
              <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} className="h-4 w-4 accent-primary" />
              <span className="text-sm text-foreground">{col.columnDef.header}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Copy ID button ── */
function CopyId({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" aria-label="Copy item ID" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-surface-soft hover:text-foreground">
      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

/* ── Value badge ── */
function ValueBadge({ value, icon, colorClass }) {
  if (value === null || value === undefined || value === "") return <span className="text-muted">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${colorClass}`}>
      {icon}
      {value}
    </span>
  );
}

/* ══════════════════════════════════════
   Main DataTable
══════════════════════════════════════ */
export default function GlobalSearchTable({ items, onEdit, refresh }) {
  const [loadingId, setLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const columnPanelRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (columnPanelRef.current && !columnPanelRef.current.contains(e.target)) setShowColumnPanel(false); };
    if (showColumnPanel) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showColumnPanel]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setIsFullscreen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  /* ── Filtered data ── */
  const filtered = useMemo(() => items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      item.title?.toLowerCase().includes(q) ||
      item.id?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      (item.extraTags || []).some(tag => tag.toLowerCase().includes(q)) ||
      (item.searchKeywords || []).some(kw => kw.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  }), [items, search, statusFilter]);

  /* ── Selection ── */
  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const someSelected = selected.length > 0 && selected.length < filtered.length;
  const toggleRow = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => allSelected ? setSelected([]) : setSelected(filtered.map((a) => a.id));

  /* ── Actions ── */
  const toggleStatus = async (item) => {
    if (!getAuth().currentUser) { emitAlert({ type: "error", message: "Session expired" }); return; }
    setLoadingId(item.id);
    try {
      const next = item.status === "active" ? "paused" : "active";
      await updateData(item.id, { status: next });
      emitAlert({ type: "success", message: item.status === "active" ? "Item paused" : "Item resumed" });
      logAuditEvent({
        module: "globalSearch",
        action: "GS_STATUS_CHANGE",
        entityType: "globalSearch",
        entityId: item.id,
        summary: `Set global search item ${item.id} to ${next}`,
        changes: { status: next },
        route: "/searchEng",
      });
      refresh?.();
    } catch { emitAlert({ type: "error", message: "Failed to update status" }); }
    finally { setLoadingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoadingId(deleteTarget.id);
    try {
      await deleteData(deleteTarget.id);
      emitAlert({ type: "success", message: "Item deleted" });
      logAuditEvent({
        module: "globalSearch",
        action: "GS_DELETE",
        entityType: "globalSearch",
        entityId: deleteTarget.id,
        summary: `Deleted global search item ${deleteTarget.id}`,
        changes: { id: deleteTarget.id, title: deleteTarget.title ?? null },
        route: "/searchEng",
      });
      setDeleteTarget(null);
      refresh?.();
    } catch { emitAlert({ type: "error", message: "Failed to delete item" }); }
    finally { setLoadingId(null); }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    setLoadingId("bulk");
    try {
      await Promise.all(selected.map((id) => deleteData(id)));
      emitAlert({ type: "success", message: `${selected.length} item${selected.length > 1 ? "s" : ""} deleted` });
      logAuditEvent({
        module: "globalSearch",
        action: "GS_BULK_DELETE",
        entityType: "globalSearch",
        entityId: null,
        summary: `Bulk deleted ${selected.length} global search items`,
        changes: { ids: selected },
        route: "/searchEng",
      });
      setSelected([]);
      refresh?.();
    } catch { emitAlert({ type: "error", message: "Bulk delete failed" }); }
    finally { setLoadingId(null); }
  };

  /* ── Columns ── */
  const columns = useMemo(() => [
    {
      id: "select",
      header: () => (
        <input type="checkbox" checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected; }}
          onChange={toggleAll}
          className="h-4 w-4 cursor-pointer accent-primary" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={selected.includes(row.original.id)}
          onChange={() => toggleRow(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 cursor-pointer accent-primary" />
      ),
      size: 48, minSize: 48, maxSize: 48, enableSorting: false, enableResizing: false,
    },
    {
      id: "item",
      header: "Title",
      size: 260, minSize: 160,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            {item.image_url
              ? <img src={item.image_url} alt={item.title} className="w-8 h-8 rounded-lg object-cover border border-border shrink-0 bg-surface-soft" />
              : <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4 text-muted" />
                </div>}
            <span className="font-medium text-foreground truncate">{item.title || "—"}</span>
          </div>
        );
      },
    },
    {
      id: "itemId",
      header: "ID",
      size: 160, minSize: 100,
      cell: ({ row }) => (
        <span className="flex items-center font-mono text-xs text-muted max-w-[140px]">
          <span className="truncate">{row.original.id}</span>
          <CopyId text={row.original.id} />
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 110, minSize: 90,
      cell: ({ getValue }) => (
        <ValueBadge
          value={getValue()}
          icon={<Layers className="w-3 h-3" />}
          colorClass="bg-primary-soft text-primary"
        />
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      size: 110, minSize: 90,
      cell: ({ getValue }) => {
        const val = getValue();
        if (!val) return <span className="text-muted">—</span>;
        return (
          <ValueBadge
            value={val}
            icon={<DollarSign className="w-3 h-3" />}
            colorClass="bg-success-soft text-success"
          />
        );
      },
    },
    {
      accessorKey: "redirect_url",
      header: "URL",
      size: 120, minSize: 90,
      cell: ({ getValue }) => {
        const url = getValue();
        if (!url) return <span className="text-muted">—</span>;
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary transition" onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="w-3.5 h-3.5" /> Link
          </a>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110, minSize: 90,
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: "actions",
      header: "Actions",
      size: 140, minSize: 140, maxSize: 140, enableSorting: false, enableResizing: false,
      cell: ({ row }) => {
        const item = row.original;
        const busy = loadingId === item.id;
        return (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Tooltip label="Edit item">
              <button type="button" aria-label={`Edit ${item.title || "item"}`} onClick={() => onEdit(item)} disabled={busy}
                className="grid h-9 w-9 place-items-center rounded-md text-primary transition hover:bg-primary-soft disabled:opacity-40">
                <Pencil className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={item.status === "active" ? "Pause item" : "Resume item"}>
              <button type="button" aria-label={`${item.status === "active" ? "Pause" : "Resume"} ${item.title || "item"}`} onClick={() => toggleStatus(item)} disabled={busy}
                className={`grid h-9 w-9 place-items-center rounded-md transition disabled:opacity-40
                  ${item.status === "active" ? "text-warning hover:bg-warning-soft" : "text-success hover:bg-success-soft"}`}>
                {item.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </Tooltip>
            <Tooltip label="Delete item">
              <button type="button" aria-label={`Delete ${item.title || "item"}`} onClick={() => setDeleteTarget(item)} disabled={busy}
                className="grid h-9 w-9 place-items-center rounded-md text-danger transition hover:bg-danger-soft disabled:opacity-40">
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={expandedId === item.id ? "Collapse" : "Expand"}>
              <button type="button" aria-label={`${expandedId === item.id ? "Collapse" : "Expand"} ${item.title || "item"}`} aria-expanded={expandedId === item.id} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-surface-soft hover:text-foreground">
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedId === item.id ? "rotate-90" : ""}`} />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ], [items, selected, allSelected, someSelected, loadingId, expandedId]);

  const table = useReactTable({
    data: filtered,
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
    ? "fixed inset-0 z-50 bg-surface flex flex-col"
    : "bg-surface rounded-lg border border-border shadow-sm flex flex-col overflow-hidden";

  return (
    <>
      <div className={wrapperClass}>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3 px-5 pt-4 pb-3 bg-surface-soft border-b border-border shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Status pills */}
            <div className="flex gap-1.5">
              {["all", "active", "paused"].map((s) => (
                <button type="button" key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                    ${statusFilter === s ? "bg-foreground text-background" : "bg-surface border border-border text-muted hover:bg-surface-soft"}`}>
                  {s === "all" ? "All Items" : s}
                </button>
              ))}
            </div>
            {/* Right tools */}
            <div className="flex items-center gap-1.5">
              <div className="relative" ref={columnPanelRef}>
                <Tooltip label="Toggle columns" direction="bottom">
                  <button type="button" onClick={() => setShowColumnPanel((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition
                      ${showColumnPanel ? "bg-primary-soft border-primary text-primary" : "bg-surface border-border text-muted hover:bg-surface-soft"}`}>
                    <Columns3 className="w-3.5 h-3.5" />Columns
                  </button>
                </Tooltip>
                {showColumnPanel && <ColumnPanel table={table} onClose={() => setShowColumnPanel(false)} />}
              </div>
              <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} direction="bottom">
                <button type="button" onClick={() => setIsFullscreen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-muted hover:bg-surface-soft transition">
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  {isFullscreen ? "Exit" : "Fullscreen"}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Search + count */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, ID, type, or tags…"
                className="w-full pl-8 pr-8 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted transition" />
              {search && (
                <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-soft hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs text-muted whitespace-nowrap">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Bulk bar ── */}
        {selected.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-danger-soft border-b border-danger shrink-0">
            <span className="text-sm font-medium text-danger">
              {selected.length} item{selected.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSelected([])} className="h-9 rounded-md px-3 text-xs text-muted transition hover:bg-surface hover:text-foreground">
                Clear
              </button>
              <button type="button" onClick={bulkDelete} disabled={loadingId === "bulk"}
                className="flex h-9 items-center gap-1.5 rounded-md border border-danger bg-surface px-3 text-xs font-semibold text-danger transition hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-60">
                <Trash2 className="w-3.5 h-3.5" />
                {loadingId === "bulk" ? "Deleting…" : "Delete Selected"}
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className={`overflow-auto flex-1 ${isFullscreen ? "min-h-0" : ""}`}>
          <table className="text-sm" style={{ width: table.getTotalSize(), minWidth: "100%" }}>
            <thead className="sticky top-0 z-20">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-surface-soft border-b border-border">
                  {hg.headers.map((header) => (
                    <th key={header.id} style={{ width: header.getSize(), position: "relative" }}
                      className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider select-none">
                      <div className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer hover:text-foreground" : ""}`}
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

            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-soft text-muted"><Inbox className="h-5 w-5" /></span>
                      <span className="text-sm">No items found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isSelected = selected.includes(row.original.id);
                  const isExpanded = expandedId === row.original.id;
                  return (
                    <Fragment key={row.id}>
                      <tr onClick={() => setExpandedId(isExpanded ? null : row.original.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-primary-soft hover:bg-primary-soft" : "hover:bg-surface-soft"}`}>
                        {row.getVisibleCells().map((cell) => (
                           <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-4 py-3 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>

                      {/* Expanded row */}
                      {isExpanded && (
                        <tr className="border-b border-primary/30 bg-primary-soft/40">
                          <td colSpan={columns.length} className="px-6 py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Description */}
                              <div className="space-y-1 lg:col-span-2">
                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Description</p>
                                <p className="text-sm text-muted leading-relaxed">
                                  {row.original.description || <span className="text-muted">—</span>}
                                </p>
                              </div>
                              {/* Keywords */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Keywords</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {row.original.searchKeywords?.length > 0 ? (
                                    row.original.searchKeywords.map((kw, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-surface border border-border rounded-md text-[10px] text-muted font-medium">
                                        {kw}
                                      </span>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted">No keywords</p>
                                  )}
                                </div>
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
        <div className="px-5 py-3 bg-surface-soft border-t border-border shrink-0">
          <p className="text-xs text-muted">
            {filtered.length} of {items.length} item{items.length !== 1 ? "s" : ""} shown
          </p>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-surface p-6 shadow-lg" role="alertdialog" aria-modal="true" aria-labelledby="delete-search-item-title">
            <h2 id="delete-search-item-title" className="mb-1 text-base font-semibold text-foreground">Delete Item</h2>
            <p className="text-sm text-muted mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">"{deleteTarget.title || deleteTarget.id}"</span>?
              {" "}This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-md border border-border bg-surface px-4 text-sm text-muted transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} disabled={loadingId === deleteTarget.id}
                className="h-10 rounded-md border border-danger bg-surface px-4 text-sm font-semibold text-danger transition hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-60">
                {loadingId === deleteTarget.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
