"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { getErrorMessage } from "@/lib/apiClient";
import { updateBlogStatus } from "../services/blogsService";
import { getBlogContentQuality } from "./BlogSeoChecklist";
import { buildBlogAudit } from "./blogQualityAudit";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ExternalLink, Pencil, Trash2, Send, Ban,
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
  Maximize2, Minimize2, Columns3, Search, X, SearchCheck,
} from "lucide-react";

/* ── Tooltip ── */
function Tooltip({ label, children, direction = "top" }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(direction === "bottom"
      ? { top: r.bottom + 8, left: r.left + r.width / 2 }
      : { top: r.top - 8,   left: r.left + r.width / 2 });
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
  const isPublished = status === "published";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isPublished ? "bg-green-500" : "bg-gray-400"}`} />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

/* ── Sort Icon ── */
function SortIcon({ sorted }) {
  if (sorted === "asc")  return <ChevronUp   className="w-3.5 h-3.5 text-blue-500" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
}

function getAdminBlogQuality(blog = {}) {
  return getBlogContentQuality({
    formData: {
      ...blog,
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
    },
    imageAlt: blog.imageAlt || "",
    hasImage: Boolean(blog.image),
  });
}

function SeoScoreBadge({ blog }) {
  const quality = getAdminBlogQuality(blog);
  const firstIssue = quality.checks.find((check) => !check.done);
  const toneClass =
    quality.score >= 80
      ? "border-green-100 bg-green-50 text-green-700"
      : quality.score >= 60
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : "border-red-100 bg-red-50 text-red-700";

  return (
    <div className="min-w-[118px]">
      <div className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-black ${toneClass}`}>
        <SearchCheck className="h-3.5 w-3.5" />
        {quality.score}%
      </div>
      <p className="mt-1 max-w-[140px] truncate text-[10px] font-medium text-gray-400">
        {firstIssue ? firstIssue.label : "Publish ready"}
      </p>
    </div>
  );
}

/* ── Column Panel ── */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-10 z-50 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Columns</span>
        <button onClick={onClose} className="p-0.5 hover:bg-gray-100 rounded transition">
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {table.getAllLeafColumns().map((col) => {
          if (col.id === "select" || col.id === "actions") return null;
          return (
            <label key={col.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} className="w-3.5 h-3.5 accent-blue-500 cursor-pointer" />
              <span className="text-sm text-gray-700 capitalize">{col.columnDef.header}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Resize Handle ── */
function ResizeHandle({ header }) {
  return (
    <div
      onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-0 h-full w-4 flex items-center justify-center cursor-col-resize select-none touch-none group/resize z-10 ${header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
    >
      <div className={`w-0.5 h-5 rounded-full transition-colors ${header.column.getIsResizing() ? "bg-blue-500" : "bg-gray-300 group-hover/resize:bg-blue-400"}`} />
    </div>
  );
}

/* ══════════════════════════════════════
   Main BlogTable
══════════════════════════════════════ */
export default function BlogTable({
  blogs = [], setBlogs,
  setDeleteId, openDeleteModal,
  selectedBlogs, setSelectedBlogs,
  openBulkDeleteModal,
  rowCount = 0, paginationModel, onPaginationModelChange,
  loading,
  tabs = ["All Blogs", "Drafts", "Published"],
  activeTab, onTabChange,
  search, onSearch,
}) {
  const router = useRouter();
  const [sorting, setSorting]               = useState([]);
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing]     = useState({});
  const columnPanelRef                      = useRef(null);

  const { page, pageSize } = paginationModel;
  const pageCount = Math.ceil(rowCount / pageSize);

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

  /* ── Toggle publish status ── */
  const togglePublish = async (blog) => {
    const newStatus = blog.status === "published" ? "draft" : "published";
    if (newStatus === "published") {
      const audit = buildBlogAudit(blog);
      if (audit.gaps.length > 0) {
        const firstGap = audit.gaps[0]?.label || "Publish Gate";
        emitAlert({
          type: "warning",
          message: `Publish Gate has ${audit.gaps.length} open item${audit.gaps.length === 1 ? "" : "s"} (${firstGap}). Open the editor to review and publish.`,
        });
        return;
      }
    }

    setBlogs((prev) => prev.map((b) => b.id === blog.id ? { ...b, status: newStatus } : b));
    try {
      await updateBlogStatus(blog.id, newStatus);
      emitAlert({ type: "success", message: newStatus === "published" ? "Blog published" : "Blog unpublished" });
      logAuditEvent({
        module: "blogs",
        action: "BLOG_STATUS_CHANGE",
        entityType: "blog",
        entityId: blog.id,
        summary: `Set blog ${blog.id} to ${newStatus}`,
        changes: { status: newStatus },
        route: "/altftool/blogs",
      });
    } catch (err) {
      console.error(err);
      setBlogs((prev) => prev.map((b) => b.id === blog.id ? { ...b, status: blog.status } : b));
      emitAlert({ type: "error", message: getErrorMessage(err, "Failed to update status") });
    }
  };

  const allSelected  = blogs.length > 0 && selectedBlogs.length === blogs.length;
  const someSelected = selectedBlogs.length > 0 && selectedBlogs.length < blogs.length;
  const toggleRow    = (id) => setSelectedBlogs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll    = () => allSelected ? setSelectedBlogs([]) : setSelectedBlogs(blogs.map((b) => b.id));

  const columns = useMemo(() => [
    {
      id: "select",
      header: () => (
        <input type="checkbox" checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected; }}
          onChange={toggleAll}
          className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-blue-500" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={selectedBlogs.includes(row.original.id)}
          onChange={() => toggleRow(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-blue-500" />
      ),
      size: 48, minSize: 48, maxSize: 48, enableSorting: false, enableResizing: false,
    },
    { accessorKey: "heading",      header: "Heading",      size: 260, minSize: 120, cell: ({ getValue }) => <span className="font-medium text-gray-800 line-clamp-2 leading-snug">{getValue()}</span> },
    { accessorKey: "author",       header: "Author",       size: 140, minSize: 80,  cell: ({ getValue }) => <span className="text-gray-600">{getValue()}</span> },
    { accessorKey: "category",     header: "Category",     size: 130, minSize: 80,  cell: ({ getValue }) => <span className="text-gray-500">{getValue() || "—"}</span> },
    { accessorKey: "date",         header: "Publish Date", size: 130, minSize: 100, cell: ({ getValue }) => <span className="text-gray-500 whitespace-nowrap">{getValue()}</span> },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 120, minSize: 100,
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="text-gray-500 whitespace-nowrap">{v ? v.toDate().toLocaleDateString() : "—"}</span>;
      },
    },
    { accessorKey: "status",       header: "Status",   size: 120, minSize: 90,  cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    {
      id: "seoScore",
      header: "SEO",
      size: 150,
      minSize: 120,
      sortingFn: (rowA, rowB) => getAdminBlogQuality(rowA.original).score - getAdminBlogQuality(rowB.original).score,
      cell: ({ row }) => <SeoScoreBadge blog={row.original} />,
    },
    { accessorKey: "likesCount",   header: "Likes",    size: 80,  minSize: 60,  cell: ({ getValue }) => <span className="text-gray-600 font-medium">{getValue() ?? 0}</span> },
    { accessorKey: "commentsCount",header: "Comments", size: 100, minSize: 80,  cell: ({ getValue }) => <span className="text-gray-600 font-medium">{getValue() ?? 0}</span> },
    {
  accessorKey: "views",
  header: "Views",
  size: 90,
  minSize: 70,
  cell: ({ getValue }) => (
    <span className="text-gray-600 font-medium">
      {getValue() ?? 0}
    </span>
  ),
},
    {
      id: "actions",
      header: "Actions",
      size: 160, minSize: 160, maxSize: 160, enableSorting: false, enableResizing: false,
      cell: ({ row }) => {
        const blog = row.original;
        return (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Tooltip label="View blog">
              <button onClick={() => router.push(`/altftool/blogs/view-blogs/${blog.id}`)} className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition">
                <ExternalLink className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label="Edit blog">
              <button onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)} className="p-1.5 rounded-md text-amber-500 hover:bg-amber-50 transition">
                <Pencil className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label="Delete blog">
              <button onClick={() => { setDeleteId(blog.id); openDeleteModal(); }} className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip label={blog.status === "published" ? "Unpublish" : "Publish"}>
              <button onClick={() => togglePublish(blog)}
                className={`p-1.5 rounded-md transition ${blog.status === "published" ? "text-gray-400 hover:bg-gray-100" : "text-green-500 hover:bg-green-50"}`}>
                {blog.status === "published" ? <Ban className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ], [blogs, selectedBlogs, allSelected, someSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  const table = useReactTable({
    data: blogs, columns,
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
  const endRow   = Math.min((page + 1) * pageSize, rowCount);

  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white flex flex-col"
    : "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col";

  return (
    <div className={wrapperClass}>

      {/* ── Nav: tabs + search + toolbar ── */}
      <div className="flex flex-col gap-3 px-5 pt-4 pb-3 border-b border-gray-100 bg-gray-50 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => onTabChange?.(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={columnPanelRef}>
              <Tooltip label="Toggle columns" direction="bottom">
                <button onClick={() => setShowColumnPanel((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${showColumnPanel ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={search ?? ""} onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search by heading or author..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 placeholder:text-gray-400 transition" />
            {search && (
              <button onClick={() => onSearch?.("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{rowCount} blog{rowCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selectedBlogs.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-red-50 border-b border-red-100 shrink-0">
          <span className="text-sm font-medium text-red-700">{selectedBlogs.length} blog{selectedBlogs.length > 1 ? "s" : ""} selected</span>
          <button onClick={openBulkDeleteModal}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition">
            <Trash2 className="w-3.5 h-3.5" />Delete Selected
          </button>
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
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <span className="text-3xl">📝</span>
                    <span className="text-sm">No blogs found</span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedBlogs.includes(row.original.id);
                return (
                  <tr key={row.id} onClick={() => toggleRow(row.original.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
        <p className="text-xs text-gray-500">
          {rowCount === 0 ? "No results" : `Showing ${startRow}–${endRow} of ${rowCount} blogs`}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rows per page</span>
            <select value={pageSize} onChange={(e) => onPaginationModelChange({ page: 0, pageSize: Number(e.target.value) })}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400">
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onPaginationModelChange({ page: 0, pageSize })} disabled={page === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronsLeft  className="w-4 h-4 text-gray-600" /></button>
            <button onClick={() => onPaginationModelChange({ page: page - 1, pageSize })} disabled={page === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronLeft   className="w-4 h-4 text-gray-600" /></button>
            <span className="text-xs text-gray-600 px-2">Page <span className="font-semibold">{page + 1}</span> of <span className="font-semibold">{Math.max(pageCount, 1)}</span></span>
            <button onClick={() => onPaginationModelChange({ page: page + 1, pageSize })} disabled={page >= pageCount - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronRight  className="w-4 h-4 text-gray-600" /></button>
            <button onClick={() => onPaginationModelChange({ page: pageCount - 1, pageSize })} disabled={page >= pageCount - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronsRight className="w-4 h-4 text-gray-600" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
