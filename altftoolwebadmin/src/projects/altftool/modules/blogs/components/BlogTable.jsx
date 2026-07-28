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
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ExternalLink, Pencil, Trash2, Send, Ban,
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
  Maximize2, Minimize2, Columns3, Search, X, SearchCheck,
  Filter, Tag, Users,
} from "lucide-react";
import { EmptyState, LoadingState } from "@/ansets";

const BLOG_TABLE_PREFS_KEY = "altftool-admin:blog-table:v2";
const EDIT_ROUTE = (id) => `/altftool/blogs/edit-blog/${id}`;

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
        <div className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-foreground text-background shadow-lg"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPublished ? "bg-success-soft text-success" : "bg-surface-soft text-muted"}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isPublished ? "bg-success" : "bg-muted"}`} />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

/* ── Sort Icon ── */
function SortIcon({ sorted }) {
  if (sorted === "asc")  return <ChevronUp   className="w-3.5 h-3.5 text-primary" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-primary" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-muted/50" />;
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
      ? "bg-success-soft text-success"
      : quality.score >= 60
        ? "bg-warning-soft text-warning"
        : "bg-danger-soft text-danger";

  return (
    <div className="min-w-[118px]">
      <div className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold ${toneClass}`}>
        <SearchCheck className="h-3.5 w-3.5" />
        {quality.score}%
      </div>
      <p className="mt-1 max-w-[140px] truncate text-[10px] font-medium text-muted">
        {firstIssue ? firstIssue.label : "Publish ready"}
      </p>
    </div>
  );
}

/* ── Column Panel ── */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-10 z-50 w-56 bg-surface border border-border rounded-xl shadow-lg p-3">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Columns</span>
        <button onClick={onClose} className="p-0.5 hover:bg-surface-soft rounded transition" aria-label="Close column panel">
          <X className="w-3.5 h-3.5 text-muted" />
        </button>
      </div>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {table.getAllLeafColumns().map((col) => {
          if (col.id === "select" || col.id === "actions") return null;
          return (
            <label key={col.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-soft cursor-pointer">
              <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} className="w-3.5 h-3.5 accent-[var(--primary)] cursor-pointer" />
              <span className="text-sm text-foreground capitalize">{col.columnDef.header}</span>
            </label>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => table.getAllLeafColumns().forEach((column) => column.toggleVisibility(true))}
        className="mt-3 w-full rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs font-bold text-foreground transition hover:bg-surface"
      >
        Show all columns
      </button>
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
      <div className={`w-0.5 h-5 rounded-full transition-colors ${header.column.getIsResizing() ? "bg-primary" : "bg-border group-hover/resize:bg-primary"}`} />
    </div>
  );
}

/* ── Filter select ── */
function FilterSelect({ icon: Icon, value, onChange, options, label }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="min-w-[140px] cursor-pointer appearance-none rounded-lg border border-border bg-surface py-1.5 pl-7 pr-7 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
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
  totalCount = 0,
  loading,
  tabs = ["All Blogs", "Published", "Drafts"],
  activeTab, onTabChange,
  search, onSearch,
  categoryFilter = "all", onCategoryFilter, categoryOptions = [],
  authorFilter = "all", onAuthorFilter, authorOptions = [],
  hasActiveFilters = false, onClearFilters,
}) {
  const router = useRouter();
  const [sorting, setSorting]               = useState([]);
  const [pagination, setPagination]         = useState({ pageIndex: 0, pageSize: 10 });
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing]     = useState({});
  const [preferencesReady, setPreferencesReady] = useState(false);
  const columnPanelRef                      = useRef(null);

  const openEditor = useCallback((id) => router.push(EDIT_ROUTE(id)), [router]);

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

  /* Reset to first page whenever the filtered result set changes. */
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [blogs.length, activeTab, search, categoryFilter, authorFilter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(BLOG_TABLE_PREFS_KEY) || "{}");
      if (saved.columnVisibility && typeof saved.columnVisibility === "object") setColumnVisibility(saved.columnVisibility);
      if (saved.columnSizing && typeof saved.columnSizing === "object") setColumnSizing(saved.columnSizing);
      if (saved.pageSize) setPagination((p) => ({ ...p, pageSize: saved.pageSize }));
    } catch {
      /* Broken table preferences should not block the admin table. */
    } finally {
      setPreferencesReady(true);
    }
  }, []);

  useEffect(() => {
    if (!preferencesReady || typeof window === "undefined") return;
    window.localStorage.setItem(
      BLOG_TABLE_PREFS_KEY,
      JSON.stringify({ columnVisibility, columnSizing, pageSize: pagination.pageSize }),
    );
  }, [columnSizing, columnVisibility, pagination.pageSize, preferencesReady]);

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

  const allSelected  = blogs.length > 0 && blogs.every((b) => selectedBlogs.includes(b.id));
  const someSelected = selectedBlogs.length > 0 && !allSelected;
  const toggleRow    = (id) => setSelectedBlogs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll    = () => allSelected ? setSelectedBlogs([]) : setSelectedBlogs(blogs.map((b) => b.id));

  const RowActions = ({ blog }) => (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <Tooltip label="View blog">
        <button onClick={() => router.push(`/altftool/blogs/view-blogs/${blog.id}`)} className="p-1.5 rounded-md text-info hover:bg-info-soft transition" aria-label="View blog">
          <ExternalLink className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip label="Edit blog">
        <button onClick={() => openEditor(blog.id)} className="p-1.5 rounded-md text-warning hover:bg-warning-soft transition" aria-label="Edit blog">
          <Pencil className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip label="Delete blog">
        <button onClick={() => { setDeleteId(blog.id); openDeleteModal(); }} className="p-1.5 rounded-md text-danger hover:bg-danger-soft transition" aria-label="Delete blog">
          <Trash2 className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip label={blog.status === "published" ? "Unpublish" : "Publish"}>
        <button onClick={() => togglePublish(blog)}
          className={`p-1.5 rounded-md transition ${blog.status === "published" ? "text-muted hover:bg-surface-soft" : "text-success hover:bg-success-soft"}`}
          aria-label={blog.status === "published" ? "Unpublish blog" : "Publish blog"}>
          {blog.status === "published" ? <Ban className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        </button>
      </Tooltip>
    </div>
  );

  const columns = useMemo(() => [
    {
      id: "select",
      header: () => (
        <input type="checkbox" checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected; }}
          onChange={toggleAll}
          aria-label="Select all blogs"
          className="w-4 h-4 rounded border-border cursor-pointer accent-[var(--primary)]" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={selectedBlogs.includes(row.original.id)}
          onChange={() => toggleRow(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.original.heading || "blog"}`}
          className="w-4 h-4 rounded border-border cursor-pointer accent-[var(--primary)]" />
      ),
      size: 48, minSize: 48, maxSize: 48, enableSorting: false, enableResizing: false,
    },
    { accessorKey: "heading",      header: "Heading",      size: 260, minSize: 120, cell: ({ getValue }) => <span className="font-medium text-foreground line-clamp-2 leading-snug">{getValue() || "Untitled"}</span> },
    { accessorKey: "author",       header: "Author",       size: 140, minSize: 80,  cell: ({ getValue }) => <span className="text-muted">{getValue() || "—"}</span> },
    { accessorKey: "category",     header: "Category",     size: 130, minSize: 80,  cell: ({ getValue }) => <span className="text-muted">{getValue() || "—"}</span> },
    { accessorKey: "date",         header: "Publish Date", size: 130, minSize: 100, cell: ({ getValue }) => <span className="text-muted whitespace-nowrap">{getValue() || "—"}</span> },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 120, minSize: 100,
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="text-muted whitespace-nowrap">{v?.toDate ? v.toDate().toLocaleDateString() : "—"}</span>;
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
    { accessorKey: "likesCount",   header: "Likes",    size: 80,  minSize: 60,  cell: ({ getValue }) => <span className="text-muted font-medium">{getValue() ?? 0}</span> },
    { accessorKey: "commentsCount",header: "Comments", size: 100, minSize: 80,  cell: ({ getValue }) => <span className="text-muted font-medium">{getValue() ?? 0}</span> },
    { accessorKey: "views",        header: "Views",    size: 90,  minSize: 70,  cell: ({ getValue }) => <span className="text-muted font-medium">{getValue() ?? 0}</span> },
    {
      id: "actions",
      header: "Actions",
      size: 170, minSize: 170, maxSize: 170, enableSorting: false, enableResizing: false,
      cell: ({ row }) => <RowActions blog={row.original} />,
    },
  ], [blogs, selectedBlogs, allSelected, someSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  const table = useReactTable({
    data: blogs, columns,
    state: { sorting, columnVisibility, columnSizing, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    getRowId: (row) => row.id,
  });

  const { pageIndex, pageSize } = pagination;
  const rowCount = blogs.length;
  const pageCount = table.getPageCount();
  const pageSizeOptions = [10, 25, 50, 100];
  const startRow = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow   = Math.min((pageIndex + 1) * pageSize, rowCount);
  const pageRows = table.getRowModel().rows;

  const statusOptions = [["all", "All status"], ["published", "Published"], ["draft", "Draft"]];

  const clearFiltersAction = hasActiveFilters ? (
    <button type="button" onClick={onClearFilters}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-soft px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface">
      <X className="w-3.5 h-3.5" />Clear filters
    </button>
  ) : undefined;

  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-surface flex flex-col"
    : "bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col";

  return (
    <div className={wrapperClass}>

      {/* ── Toolbar: tabs + view controls ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3 border-b border-border bg-surface-soft shrink-0 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => onTabChange?.(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface border border-border text-muted hover:bg-surface"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={columnPanelRef}>
              <Tooltip label="Toggle columns" direction="bottom">
                <button onClick={() => setShowColumnPanel((v) => !v)}
                  type="button"
                  aria-label="Toggle blog table columns"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${showColumnPanel ? "bg-primary-soft border-primary/30 text-primary" : "bg-surface border-border text-muted hover:bg-surface"}`}>
                  <Columns3 className="w-3.5 h-3.5" />Columns
                </button>
              </Tooltip>
              {showColumnPanel && <ColumnPanel table={table} onClose={() => setShowColumnPanel(false)} />}
            </div>
            <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} direction="bottom">
              <button onClick={() => setIsFullscreen((v) => !v)}
                type="button"
                aria-label={isFullscreen ? "Exit blog table fullscreen" : "Open blog table fullscreen"}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-muted hover:bg-surface transition">
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                {isFullscreen ? "Exit" : "Fullscreen"}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* ── Search + filters ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input value={search ?? ""} onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search blogs — title, author, category, tags…"
              aria-label="Search blogs"
              className="w-full pl-8 pr-8 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted transition" />
            {search && (
              <button onClick={() => onSearch?.("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition" aria-label="Clear search">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <FilterSelect icon={Filter} label="Filter by status" value={activeTab === "Published" ? "published" : activeTab === "Drafts" ? "draft" : "all"}
            onChange={(v) => onTabChange?.(v === "published" ? "Published" : v === "draft" ? "Drafts" : "All Blogs")}
            options={statusOptions} />
          <FilterSelect icon={Tag} label="Filter by category" value={categoryFilter} onChange={(v) => onCategoryFilter?.(v)}
            options={[["all", "All categories"], ...categoryOptions.map((c) => [c, c])]} />
          <FilterSelect icon={Users} label="Filter by author" value={authorFilter} onChange={(v) => onAuthorFilter?.(v)}
            options={[["all", "All authors"], ...authorOptions.map((a) => [a, a])]} />

          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <button onClick={onClearFilters} className="flex items-center gap-1 rounded-lg bg-surface-soft px-2.5 py-1 text-xs font-semibold text-muted transition hover:text-foreground" aria-label="Clear all filters">
                <X className="w-3 h-3" />Clear
              </button>
            )}
            <span className="whitespace-nowrap text-xs font-medium text-muted">
              {rowCount} of {totalCount} blog{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selectedBlogs.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-danger-soft border-b border-border shrink-0 sm:px-5">
          <span className="text-sm font-medium text-danger">{selectedBlogs.length} blog{selectedBlogs.length > 1 ? "s" : ""} selected</span>
          <button onClick={openBulkDeleteModal}
            className="flex items-center gap-1.5 bg-danger text-[var(--danger-foreground)] text-sm font-semibold px-4 py-1.5 rounded-lg transition hover:opacity-90">
            <Trash2 className="w-3.5 h-3.5" />Delete Selected
          </button>
        </div>
      )}

      {/* ── Desktop table ── */}
      <div className={`hidden md:block overflow-auto flex-1 ${isFullscreen ? "min-h-0" : ""}`}>
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <LoadingState variant="table" rows={8} />
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={SearchCheck}
                    title={hasActiveFilters ? "No matching blogs" : "No blogs found"}
                    description={hasActiveFilters ? "No blogs match your search or filters. Clear them to see everything." : "Create a draft or refresh data to populate this view."}
                    action={clearFiltersAction}
                  />
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const isSelected = selectedBlogs.includes(row.original.id);
                return (
                  <tr key={row.id}
                    onClick={() => openEditor(row.original.id)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") openEditor(row.original.id); }}
                    title="Open in editor"
                    className={`cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 ${isSelected ? "bg-primary-soft" : "hover:bg-surface-soft"}`}>
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

      {/* ── Mobile cards ── */}
      <div className="md:hidden flex-1 overflow-auto divide-y divide-border">
        {loading ? (
          <div className="p-4"><LoadingState variant="table" rows={5} /></div>
        ) : pageRows.length === 0 ? (
          <EmptyState
            icon={SearchCheck}
            title={hasActiveFilters ? "No matching blogs" : "No blogs found"}
            description={hasActiveFilters ? "No blogs match your search or filters." : "Create a draft to populate this view."}
            action={clearFiltersAction}
          />
        ) : (
          pageRows.map((row) => {
            const blog = row.original;
            const isSelected = selectedBlogs.includes(blog.id);
            return (
              <div key={row.id}
                onClick={() => openEditor(blog.id)}
                className={`p-4 transition-colors ${isSelected ? "bg-primary-soft" : "active:bg-surface-soft"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleRow(blog.id)}
                    aria-label={`Select ${blog.heading || "blog"}`}
                    className="mt-1 h-4 w-4 rounded border-border accent-[var(--primary)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{blog.heading || "Untitled"}</h3>
                      <StatusBadge status={blog.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {blog.author || "—"}{blog.category ? ` · ${blog.category}` : ""}{blog.date ? ` · ${blog.date}` : ""}
                    </p>
                    <div className="mt-3"><RowActions blog={blog} /></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-surface-soft border-t border-border shrink-0 sm:px-5">
        <p className="text-xs text-muted">
          {rowCount === 0 ? "No results" : `Showing ${startRow}–${endRow} of ${rowCount}`}
        </p>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted sm:inline">Rows</span>
            <select value={pageSize} onChange={(e) => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
              aria-label="Rows per page"
              className="text-xs border border-border rounded-md px-2 py-1 bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="First page"><ChevronsLeft  className="w-4 h-4 text-muted" /></button>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Previous page"><ChevronLeft   className="w-4 h-4 text-muted" /></button>
            <span className="text-xs text-muted px-2">Page <span className="font-semibold text-foreground">{pageIndex + 1}</span> of <span className="font-semibold text-foreground">{Math.max(pageCount, 1)}</span></span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Next page"><ChevronRight  className="w-4 h-4 text-muted" /></button>
            <button onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition" aria-label="Last page"><ChevronsRight className="w-4 h-4 text-muted" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
