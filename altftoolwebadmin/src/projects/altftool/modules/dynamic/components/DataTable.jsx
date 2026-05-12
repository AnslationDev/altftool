"use client";

import { Fragment, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAuth } from "firebase/auth";
import { updateData, deleteData } from "../service/data.service";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { getErrorMessage } from "@/lib/apiClient";
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
  ChevronsLeft, ChevronsRight,
  ImageIcon, Percent, DollarSign,
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
        <div className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-gray-800 text-white shadow-lg"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
          {direction === "bottom"
            ? <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
            : <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />}
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
      status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-green-500" : "bg-amber-400"}`} />
      {status === "active" ? "Active" : "Paused"}
    </span>
  );
}

/* ── Sort Icon ── */
function SortIcon({ sorted }) {
  if (sorted === "asc") return <ChevronUp className="w-3.5 h-3.5 text-blue-500" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
}

/* ── Resize Handle ── */
function ResizeHandle({ header }) {
  return (
    <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-0 h-full w-4 flex items-center justify-center cursor-col-resize select-none touch-none group/rz z-10
        ${header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"}`}>
      <div className={`w-0.5 h-5 rounded-full transition-colors
        ${header.column.getIsResizing() ? "bg-blue-500" : "bg-gray-300 group-hover/rz:bg-blue-400"}`} />
    </div>
  );
}

/* ── Column Panel ── */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-10 z-50 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Columns</span>
        <button onClick={onClose} className="p-0.5 hover:bg-gray-100 rounded">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
      <div className="space-y-1">
        {table.getAllLeafColumns().map((col) => {
          if (["select", "actions", "expand"].includes(col.id)) return null;
          return (
            <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} className="w-3.5 h-3.5 accent-blue-500" />
              <span className="text-sm text-gray-700">{col.columnDef.header}</span>
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
    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 p-0.5 text-gray-300 hover:text-gray-500 transition">
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

/* ── Value badge ── */
function ValueBadge({ value, icon, colorClass }) {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
      {icon}
      {value}%
    </span>
  );
}

/* ══════════════════════════════════════
   Main DataTable
══════════════════════════════════════ */
export default function DataTable({ items, onEdit, refresh }) {
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
    const matchSearch = !q || item.title?.toLowerCase().includes(q) || item.id?.toLowerCase().includes(q);
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
        module: "data",
        action: "DATA_STATUS_CHANGE",
        entityType: "data",
        entityId: item.id,
        summary: `Set data item ${item.id} to ${next}`,
        changes: { status: next },
        route: "/data",
      });
      refresh?.();
    } catch (error) { emitAlert({ type: "error", message: getErrorMessage(error, "Failed to update status") }); }
    finally { setLoadingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoadingId(deleteTarget.id);
    try {
      await deleteData(deleteTarget.id);
      emitAlert({ type: "success", message: "Item deleted" });
      logAuditEvent({
        module: "data",
        action: "DATA_DELETE",
        entityType: "data",
        entityId: deleteTarget.id,
        summary: `Deleted data item ${deleteTarget.id}`,
        changes: { id: deleteTarget.id, title: deleteTarget.title ?? null },
        route: "/data",
      });
      setDeleteTarget(null);
      refresh?.();
    } catch (error) { emitAlert({ type: "error", message: getErrorMessage(error, "Failed to delete item") }); }
    finally { setLoadingId(null); }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    setLoadingId("bulk");
    try {
      await Promise.all(selected.map((id) => deleteData(id)));
      emitAlert({ type: "success", message: `${selected.length} item${selected.length > 1 ? "s" : ""} deleted` });
      logAuditEvent({
        module: "data",
        action: "DATA_BULK_DELETE",
        entityType: "data",
        entityId: null,
        summary: `Bulk deleted ${selected.length} data items`,
        changes: { ids: selected },
        route: "/data",
      });
      setSelected([]);
      refresh?.();
    } catch (error) { emitAlert({ type: "error", message: getErrorMessage(error, "Bulk delete failed") }); }
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
          className="w-4 h-4 rounded accent-blue-500 cursor-pointer" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={selected.includes(row.original.id)}
          onChange={() => toggleRow(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded accent-blue-500 cursor-pointer" />
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
            {item.logo
              ? <img src={item.logo} alt={item.title} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0 bg-gray-50" />
              : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4 text-gray-300" />
                </div>}
            <span className="font-medium text-gray-800 truncate">{item.title || "—"}</span>
          </div>
        );
      },
    },
    {
      id: "itemId",
      header: "ID",
      size: 160, minSize: 100,
      cell: ({ row }) => (
        <span className="flex items-center font-mono text-xs text-gray-400 max-w-[140px]">
          <span className="truncate">{row.original.id}</span>
          <CopyId text={row.original.id} />
        </span>
      ),
    },
    {
      accessorKey: "cashback",
      header: "Cashback",
      size: 110, minSize: 90,
      cell: ({ getValue }) => (
        <ValueBadge
          value={getValue()}
          icon={<Percent className="w-3 h-3" />}
          colorClass="bg-emerald-50 text-emerald-700"
        />
      ),
    },
    {
      accessorKey: "discount",
      header: "Discount",
      size: 110, minSize: 90,
      cell: ({ getValue }) => (
        <ValueBadge
          value={getValue()}
          icon={<DollarSign className="w-3 h-3" />}
          colorClass="bg-violet-50 text-violet-700"
        />
      ),
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
              <button onClick={() => onEdit(item)} disabled={busy}
                className="p-1.5 rounded-md text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-40">
                <Pencil className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={item.status === "active" ? "Pause item" : "Resume item"}>
              <button onClick={() => toggleStatus(item)} disabled={busy}
                className={`p-1.5 rounded-md transition disabled:opacity-40
                  ${item.status === "active" ? "text-amber-500 hover:bg-amber-50" : "text-green-500 hover:bg-green-50"}`}>
                {item.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </Tooltip>
            <Tooltip label="Delete item">
              <button onClick={() => setDeleteTarget(item)} disabled={busy}
                className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40">
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={expandedId === item.id ? "Collapse" : "Expand"}>
              <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedId === item.id ? "rotate-90" : ""}`} />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ], [items, selected, allSelected, someSelected, loadingId, expandedId]); // eslint-disable-line

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
    ? "fixed inset-0 z-50 bg-white flex flex-col"
    : "bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden";

  return (
    <>
      <div className={wrapperClass}>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3 px-5 pt-4 pb-3 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Status pills */}
            <div className="flex gap-1.5">
              {["all", "active", "paused"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                    ${statusFilter === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                  {s === "all" ? "All Items" : s}
                </button>
              ))}
            </div>
            {/* Right tools */}
            <div className="flex items-center gap-1.5">
              <div className="relative" ref={columnPanelRef}>
                <Tooltip label="Toggle columns" direction="bottom">
                  <button onClick={() => setShowColumnPanel((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition
                      ${showColumnPanel ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                    <Columns3 className="w-3.5 h-3.5" />Columns
                  </button>
                </Tooltip>
                {showColumnPanel && <ColumnPanel table={table} onClose={() => setShowColumnPanel(false)} />}
              </div>
              <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} direction="bottom">
                <button onClick={() => setIsFullscreen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition">
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  {isFullscreen ? "Exit" : "Fullscreen"}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Search + count */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or ID…"
                className="w-full pl-8 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 placeholder:text-gray-400 transition" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Bulk bar ── */}
        {selected.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-red-50 border-b border-red-100 shrink-0">
            <span className="text-sm font-medium text-red-700">
              {selected.length} item{selected.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected([])} className="text-xs text-gray-500 hover:text-gray-700 transition px-2 py-1 rounded hover:bg-white">
                Clear
              </button>
              <button onClick={bulkDelete} disabled={loadingId === "bulk"}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
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
                <tr key={hg.id} className="bg-gray-50 border-b border-gray-100">
                  {hg.headers.map((header) => (
                    <th key={header.id} style={{ width: header.getSize(), position: "relative" }}
                      className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider select-none">
                      <div className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer hover:text-gray-700" : ""}`}
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
                  <td colSpan={columns.length} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📭</span>
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
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}`}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-4 py-3 align-middle">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>

                      {/* Expanded row */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/40 border-b border-indigo-100">
                          <td colSpan={columns.length} className="px-6 py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                              {/* Description */}
                              <div className="space-y-1 lg:col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {row.original.description || <span className="text-gray-400">—</span>}
                                </p>
                              </div>
                              {/* Logo */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logo</p>
                                {row.original.logo
                                  ? <div className="rounded-xl overflow-hidden border border-indigo-100 bg-white inline-block">
                                      <img src={row.original.logo} alt="Logo" className="max-h-20 max-w-[120px] object-contain p-2" />
                                    </div>
                                  : <p className="text-sm text-gray-400">No logo</p>}
                              </div>
                              {/* Banner */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Banner</p>
                                {row.original.banner
                                  ? <div className="rounded-xl overflow-hidden border border-indigo-100 bg-white inline-block">
                                      <img src={row.original.banner} alt="Banner" className="max-h-20 object-contain" />
                                    </div>
                                  : <p className="text-sm text-gray-400">No banner</p>}
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
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400">
            {filtered.length} of {items.length} item{items.length !== 1 ? "s" : ""} shown
          </p>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Delete Item</h2>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">"{deleteTarget.title || deleteTarget.id}"</span>?
              {" "}This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={loadingId === deleteTarget.id}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-lg transition">
                {loadingId === deleteTarget.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
