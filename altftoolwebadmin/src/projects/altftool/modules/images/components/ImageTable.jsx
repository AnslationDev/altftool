"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Copy, Trash2, ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Maximize2, Minimize2, Columns3, Search, X, Check,
  ExternalLink, Tag, Folder, ImageIcon,
} from "lucide-react";
import { LoadingState, EmptyState } from "@/ansets";

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
        <div className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-[var(--foreground)] text-[var(--background)] shadow-lg"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
          {direction === "bottom"
            ? <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[var(--foreground)]" />
            : <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--foreground)]" />}
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
  return <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--muted)]/50" />;
}

/* ── Resize Handle ── */
function ResizeHandle({ header }) {
  return (
    <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-0 h-full w-4 flex items-center justify-center cursor-col-resize select-none touch-none group/resize z-10 ${header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"}`}>
      <div className={`w-0.5 h-5 rounded-full transition-colors ${header.column.getIsResizing() ? "bg-[var(--primary)]" : "bg-[var(--border-strong)] group-hover/resize:bg-[var(--primary)]"}`} />
    </div>
  );
}

/* ── Column Panel ── */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-10 z-50 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl p-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border)]">
        <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Columns</span>
        <button onClick={onClose} className="p-0.5 hover:bg-[var(--surface-soft)] rounded transition"><X className="w-3.5 h-3.5 text-[var(--muted)]" /></button>
      </div>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {table.getAllLeafColumns().map((col) => {
          if (["select", "actions", "preview"].includes(col.id)) return null;
          return (
            <label key={col.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--surface-soft)] cursor-pointer">
              <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} className="w-3.5 h-3.5 accent-[var(--primary)] cursor-pointer" />
              <span className="text-sm text-[var(--foreground)] capitalize">{col.columnDef.header}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Copy Button with feedback ── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <Tooltip label={copied ? "Copied!" : "Copy URL"}>
      <button onClick={copy}
        className={`p-1.5 rounded-md transition ${copied ? "text-[var(--success)] bg-[var(--success-soft)]" : "text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]"}`}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </Tooltip>
  );
}

/* ── File size formatter ── */
function fmtSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ════════════════════════════════════
   Main ImageTable Component
════════════════════════════════════ */
export default function ImageTable({
  images = [],
  setImages,
  setDeleteId,
  openDeleteModal,
  selectedImages,
  setSelectedImages,
  openBulkDeleteModal,
  rowCount = 0,
  paginationModel,
  onPaginationModelChange,
  loading,
  tabs = ["All", "Photos", "Illustrations", "Icons", "Banners", "Tools", "Extensions", "Other"],
  activeTab,
  onTabChange,
  search,
  onSearch,
}) {
  const [sorting, setSorting] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const columnPanelRef = useRef(null);

  const { page, pageSize } = paginationModel;
  const pageCount = Math.ceil(rowCount / pageSize);

  useEffect(() => {
    const handler = (e) => { if (columnPanelRef.current && !columnPanelRef.current.contains(e.target)) setShowColumnPanel(false); };
    if (showColumnPanel) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColumnPanel]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setIsFullscreen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  const allSelected = images.length > 0 && selectedImages.length === images.length;
  const someSelected = selectedImages.length > 0 && selectedImages.length < images.length;
  const toggleRow = (id) => setSelectedImages((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => allSelected ? setSelectedImages([]) : setSelectedImages(images.map((b) => b.id));

  const columns = useMemo(() => [
    {
      id: "select",
      header: () => (
        <input type="checkbox" checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected; }}
          onChange={toggleAll}
          className="w-4 h-4 rounded border-[var(--border)] cursor-pointer accent-[var(--primary)]" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={selectedImages.includes(row.original.id)}
          onChange={() => toggleRow(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-[var(--border)] cursor-pointer accent-[var(--primary)]" />
      ),
      size: 48, minSize: 48, maxSize: 48, enableSorting: false, enableResizing: false,
    },
    {
      id: "preview",
      header: "Preview",
      size: 80, minSize: 80, maxSize: 80, enableSorting: false, enableResizing: false,
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--surface-soft)] border border-[var(--border)] shrink-0">
          {row.original.url
            ? <img src={row.original.url} alt={row.original.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-[var(--muted)]/40 text-lg">🖼</div>}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      size: 200, minSize: 120,
      cell: ({ getValue }) => <span className="font-medium text-[var(--foreground)] truncate block max-w-[180px]">{getValue()}</span>,
    },
    {
      accessorKey: "folder",
      header: "Folder",
      size: 120, minSize: 80,
      cell: ({ getValue }) => getValue()
        ? <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full font-medium"><Folder className="w-3 h-3" />{getValue()}</span>
        : <span className="text-[var(--muted)]">—</span>,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      size: 180, minSize: 100,
      enableSorting: false,
      cell: ({ getValue }) => {
        const tags = getValue() || [];
        if (!tags.length) return <span className="text-[var(--muted)]">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="inline-flex items-center gap-0.5 text-[10px] bg-[var(--surface-soft)] text-[var(--muted)] px-1.5 py-0.5 rounded font-medium">
                <Tag className="w-2.5 h-2.5" />{t}
              </span>
            ))}
            {tags.length > 3 && <span className="text-[10px] text-[var(--muted)]">+{tags.length - 3}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "dimensions",
      header: "Dimensions",
      size: 110, minSize: 90,
      cell: ({ getValue }) => <span className="text-[var(--muted)] text-xs font-mono">{getValue() || "—"}</span>,
    },
    {
      accessorKey: "size",
      header: "Size",
      size: 90, minSize: 70,
      cell: ({ getValue }) => <span className="text-[var(--muted)] text-xs">{fmtSize(getValue())}</span>,
    },
    {
      accessorKey: "mimeType",
      header: "Type",
      size: 90, minSize: 70,
      cell: ({ getValue }) => {
        const v = getValue() || "";
        const ext = v.split("/")[1]?.toUpperCase() || "—";
        return <span className="text-[10px] font-bold text-[var(--muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded">{ext}</span>;
      },
    },
    {
      accessorKey: "uploadedAt",
      header: "Uploaded",
      size: 120, minSize: 100,
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="text-[var(--muted)] text-xs whitespace-nowrap">{v ? v.toDate().toLocaleDateString() : "—"}</span>;
      },
    },
    {
      id: "url",
      header: "URL",
      size: 120, minSize: 100, enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <CopyButton text={row.original.url} />
          <Tooltip label="Open in new tab">
            <a href={row.original.url} target="_blank" rel="noreferrer"
              className="p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Tooltip>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 80, minSize: 80, maxSize: 80, enableSorting: false, enableResizing: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Tooltip label="Delete image">
            <button onClick={() => { setDeleteId(row.original.id); openDeleteModal(); }}
              className="p-1.5 rounded-md text-[var(--danger)]/70 hover:bg-[var(--danger-soft)] hover:text-[var(--danger-text)] transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ], [images, selectedImages, allSelected, someSelected]); // eslint-disable-line

  const table = useReactTable({
    data: images, columns,
    state: { sorting, columnVisibility, columnSizing },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    manualPagination: true,
    pageCount,
    getRowId: (row) => row.id,
  });

  const pageSizeOptions = [10, 25, 50];
  const startRow = rowCount === 0 ? 0 : page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, rowCount);
  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-[var(--surface)] flex flex-col"
    : "bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] flex flex-col overflow-hidden";

  return (
    <div className={wrapperClass}>

      {/* ── Nav bar: tabs + search + toolbar ── */}
      <div className="flex flex-col gap-3 px-5 pt-4 pb-3 border-b border-[var(--border)] bg-[var(--surface-soft)] shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => onTabChange?.(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)]"}`}>
                {tab}
              </button>
            ))}
          </div>
          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={columnPanelRef}>
              <Tooltip label="Toggle columns" direction="bottom">
                <button onClick={() => setShowColumnPanel((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${showColumnPanel ? "bg-[var(--primary-soft)] border-[var(--primary)]/30 text-[var(--primary)]" : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)]"}`}>
                  <Columns3 className="w-3.5 h-3.5" />Columns
                </button>
              </Tooltip>
              {showColumnPanel && <ColumnPanel table={table} onClose={() => setShowColumnPanel(false)} />}
            </div>
            <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} direction="bottom">
              <button onClick={() => setIsFullscreen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] transition">
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {isFullscreen ? "Exit" : "Fullscreen"}
              </button>
            </Tooltip>
          </div>
        </div>
        {/* Search + count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
            <input value={search ?? ""} onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search by title or tag..."
              className="w-full pl-8 pr-8 py-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)] placeholder:text-[var(--muted)] transition" />
            {search && (
              <button onClick={() => onSearch?.("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-[var(--muted)] font-medium whitespace-nowrap">{rowCount} image{rowCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* ── Bulk bar ── */}
      {selectedImages.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--danger-soft)] border-b border-[var(--danger)]/20 shrink-0">
          <span className="text-sm font-medium text-[var(--danger-text)]">{selectedImages.length} image{selectedImages.length > 1 ? "s" : ""} selected</span>
          <button onClick={openBulkDeleteModal}
            className="flex items-center gap-1.5 bg-[var(--danger)] hover:opacity-90 text-[var(--danger-foreground)] text-sm font-semibold px-4 py-1.5 rounded-lg transition">
            <Trash2 className="w-3.5 h-3.5" />Delete Selected
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className={`overflow-auto flex-1 ${isFullscreen ? "min-h-0" : ""}`}>
        {loading ? (
          <LoadingState variant="table" rows={8} />
        ) : table.getRowModel().rows.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No images found" />
        ) : (
          <table className="text-sm" style={{ width: table.getTotalSize(), minWidth: "100%" }}>
            <thead className="sticky top-0 z-20">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-[var(--surface-soft)] border-b border-[var(--border)]">
                  {hg.headers.map((header) => (
                    <th key={header.id} style={{ width: header.getSize(), position: "relative" }}
                      className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider select-none">
                      <div className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer hover:text-[var(--foreground)]" : ""}`}
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
              {table.getRowModel().rows.map((row) => {
                const isSelected = selectedImages.includes(row.original.id);
                return (
                  <tr key={row.id} onClick={() => toggleRow(row.original.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-[var(--primary-soft)] hover:bg-[color-mix(in_srgb,var(--primary-soft)_65%,var(--primary))]" : "hover:bg-[var(--surface-soft)]"}`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-4 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-[var(--surface-soft)] border-t border-[var(--border)] shrink-0">
        <p className="text-xs text-[var(--muted)]">{rowCount === 0 ? "No results" : `Showing ${startRow}–${endRow} of ${rowCount} images`}</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">Rows per page</span>
            <select value={pageSize} onChange={(e) => onPaginationModelChange({ page: 0, pageSize: Number(e.target.value) })}
              className="text-xs border border-[var(--border)] rounded-md px-2 py-1 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:[box-shadow:var(--focus-ring)]">
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onPaginationModelChange({ page: 0, pageSize })} disabled={page === 0} className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronsLeft className="w-4 h-4 text-[var(--muted)]" /></button>
            <button onClick={() => onPaginationModelChange({ page: page - 1, pageSize })} disabled={page === 0} className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronLeft className="w-4 h-4 text-[var(--muted)]" /></button>
            <span className="text-xs text-[var(--muted)] px-2">Page <span className="font-semibold">{page + 1}</span> of <span className="font-semibold">{Math.max(pageCount, 1)}</span></span>
            <button onClick={() => onPaginationModelChange({ page: page + 1, pageSize })} disabled={page >= pageCount - 1} className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronRight className="w-4 h-4 text-[var(--muted)]" /></button>
            <button onClick={() => onPaginationModelChange({ page: pageCount - 1, pageSize })} disabled={page >= pageCount - 1} className="p-1 rounded hover:bg-[var(--surface-soft)] disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronsRight className="w-4 h-4 text-[var(--muted)]" /></button>
          </div>
        </div>
      </div>

    </div>
  );
}
