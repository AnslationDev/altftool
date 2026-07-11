"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { emitAlert } from "@/lib/alertBus";
import { updateBlogStatus } from "../services/blogsService";
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
  Search, X,
  Filter, Database, FileJson, Plus,
} from "lucide-react";

const EDIT_ROUTE = (id) => `/smartlucky/blog/edit-blog/${id}`;

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
        <div className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap"
          style={{ backgroundColor: "var(--foreground)", color: "var(--background)", top: pos.top, left: pos.left, transform: "translateX(-50%)" + (direction === "bottom" ? "" : " translateY(-100%)") }}>
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

function StatusBadge({ status }) {
  const isPublished = status === "published";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isPublished ? "bg-green-500" : "bg-gray-400"}`} />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function SourceBadge({ blog }) {
  const isMock = blog._source === "mock" || blog._seededFromMock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isMock ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
      {isMock ? <FileJson className="w-3 h-3" /> : <Database className="w-3 h-3" />}
      {isMock ? "Mock Data" : "Firebase"}
    </span>
  );
}

function BlogThumbnail({ blog }) {
  const src = blog.image || blog.thumbnail || "";
  if (!src) return <div className="w-12 h-8 rounded-md" style={{ backgroundColor: "var(--surface)" }} />;
  return (
    <div className="w-12 h-8 rounded-md overflow-hidden shrink-0 border shrink-0 flex items-center justify-center"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => { e.target.style.display = "none"; }}
      />
    </div>
  );
}

function SortIcon({ sorted }) {
  if (sorted === "asc")  return <ChevronUp   className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />;
  return <ChevronsUpDown className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} />;
}

function getAdminBlogQuality(blog) {
  const hasContent = (blog.description || blog.content || "").length > 50;
  const hasImage = !!blog.image;
  const hasExcerpt = (blog.excerpt || "").length > 20;
  const hasSeo = !!blog.seoTitle;
  let score = 0;
  if (hasContent) score += 40;
  if (hasImage)   score += 25;
  if (hasExcerpt) score += 20;
  if (hasSeo)     score += 15;
  return { score, label: score >= 80 ? "Good" : score >= 50 ? "Fair" : "Needs work" };
}

function SeoScoreBadge({ blog }) {
  const { score, label } = getAdminBlogQuality(blog);
  const color = score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-500";
  return <span className={`text-xs font-semibold ${color}`}>{label} ({score})</span>;
}

export default function BlogTable({
  blogs = [],
  loading = false,
  onDelete,
  onBulkDelete,
  onRefresh,
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    setSelectedBlogs([]);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    let list = blogs;
    const q = globalSearch.toLowerCase().trim();
    if (q) {
      list = list.filter((b) =>
        (b.heading || "").toLowerCase().includes(q) ||
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((b) => b.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter);
    }
    return list;
  }, [blogs, globalSearch, categoryFilter, statusFilter]);

  const categories = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => { if (b.category) set.add(b.category); });
    return ["all", ...Array.from(set).sort()];
  }, [blogs]);

  const allSelected = filteredBlogs.length > 0 && selectedBlogs.length === filteredBlogs.length;
  const someSelected = !allSelected && selectedBlogs.length > 0;

  const toggleAll = () => {
    if (allSelected) { setSelectedBlogs([]); }
    else { setSelectedBlogs(filteredBlogs.map((b) => b.id)); }
  };
  const toggleRow = (id) => {
    setSelectedBlogs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handlePublishToggle = async (blog) => {
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      await updateBlogStatus(blog.id, newStatus);
      emitAlert({ type: "success", title: newStatus === "published" ? "Published" : "Unpublished", message: `"${blog.heading || blog.title}" is now ${newStatus}.` });
      if (onRefresh) onRefresh();
    } catch (err) {
      emitAlert({ type: "error", title: "Failed", message: err?.message });
    }
  };

  const columns = useMemo(() => [
    {
      id: "select",
      header: () => (
        <input type="checkbox" checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected; }}
          onChange={toggleAll}
          aria-label="Select all blogs"
          className="w-4 h-4 rounded cursor-pointer"
          style={{ borderColor: "var(--border)", accentColor: "var(--primary)" }} />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={selectedBlogs.includes(row.original.id)}
          onChange={() => toggleRow(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.original.heading || "blog"}`}
          className="w-4 h-4 rounded cursor-pointer"
          style={{ borderColor: "var(--border)", accentColor: "var(--primary)" }} />
      ),
      size: 48, minSize: 48, maxSize: 48, enableSorting: false, enableResizing: false,
    },
    {
      id: "image",
      header: "Image",
      size: 70, minSize: 60, maxSize: 80,
      enableSorting: false, enableResizing: false,
      cell: ({ row }) => <BlogThumbnail blog={row.original} />,
    },
    { accessorKey: "heading",      header: "Heading",      size: 240, minSize: 120, cell: ({ getValue }) => <span className="font-medium line-clamp-2 leading-snug" style={{ color: "var(--foreground)" }}>{getValue() || "Untitled"}</span> },
    { accessorKey: "author",       header: "Author",       size: 130, minSize: 80,  cell: ({ getValue }) => <span style={{ color: "var(--muted)" }}>{getValue() || "—"}</span> },
    { accessorKey: "category",     header: "Category",     size: 120, minSize: 80,  cell: ({ getValue }) => <span style={{ color: "var(--muted)" }}>{getValue() || "—"}</span> },
    { accessorKey: "date",         header: "Publish Date", size: 120, minSize: 100, cell: ({ getValue }) => <span className="whitespace-nowrap" style={{ color: "var(--muted)" }}>{getValue() || "—"}</span> },
    {
      accessorKey: "createdAt",
      header: "Created",
      size: 110, minSize: 90,
      cell: ({ getValue }) => {
        const v = getValue();
        return <span className="whitespace-nowrap" style={{ color: "var(--muted)" }}>{v?.toDate ? v.toDate().toLocaleDateString() : "—"}</span>;
      },
    },
    { accessorKey: "status",       header: "Status",   size: 110, minSize: 90,  cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    {
      id: "source",
      header: "Source",
      size: 120, minSize: 100,
      enableSorting: false,
      cell: ({ row }) => <SourceBadge blog={row.original} />,
    },
    {
      id: "seoScore",
      header: "SEO",
      size: 130, minSize: 110,
      sortingFn: (rowA, rowB) => getAdminBlogQuality(rowA.original).score - getAdminBlogQuality(rowB.original).score,
      cell: ({ row }) => <SeoScoreBadge blog={row.original} />,
    },
    { accessorKey: "likesCount",   header: "Likes",    size: 70,  minSize: 55,  cell: ({ getValue }) => <span className="font-medium" style={{ color: "var(--muted)" }}>{getValue() ?? 0}</span> },
    { accessorKey: "commentsCount",header: "Comments", size: 90,  minSize: 70,  cell: ({ getValue }) => <span className="font-medium" style={{ color: "var(--muted)" }}>{getValue() ?? 0}</span> },
    { accessorKey: "views",        header: "Views",    size: 80,  minSize: 60,  cell: ({ getValue }) => <span className="font-medium" style={{ color: "var(--muted)" }}>{getValue() ?? 0}</span> },
    {
      id: "actions",
      header: "Actions",
      size: 200, minSize: 200, maxSize: 200, enableSorting: false, enableResizing: false,
      cell: ({ row }) => {
        const blog = row.original;
        return (
          <div className="flex items-center gap-1">
            <Tooltip label="View on site" direction="top">
              <button onClick={() => window.open(`/blogs/${blog.slug}`, "_blank")}
                className="rounded-md p-1.5 transition hover:opacity-80"
                style={{ color: "var(--muted)" }}>
                <ExternalLink size={15} />
              </button>
            </Tooltip>
            <Tooltip label="Edit" direction="top">
              <button onClick={() => router.push(EDIT_ROUTE(blog.id))}
                className="rounded-md p-1.5 transition hover:opacity-80"
                style={{ color: "var(--primary)" }}>
                <Pencil size={15} />
              </button>
            </Tooltip>
            <Tooltip label={blog.status === "published" ? "Unpublish" : "Publish"} direction="top">
              <button onClick={() => handlePublishToggle(blog)}
                className="rounded-md p-1.5 transition hover:opacity-80"
                style={{ color: "var(--muted)" }}>
                {blog.status === "published" ? <Ban size={15} /> : <Send size={15} />}
              </button>
            </Tooltip>
            <Tooltip label="Delete" direction="top">
              <button onClick={() => { if (confirm(`Delete "${blog.heading || blog.title}"?`)) onDelete(blog.id); }}
                className="rounded-md p-1.5 transition hover:opacity-80 text-red-500">
                <Trash2 size={15} />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ], [blogs, selectedBlogs, allSelected, someSelected, toggleAll, toggleRow, router, onDelete, onRefresh]);

  const table = useReactTable({
    data: filteredBlogs, columns,
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
  const rowCount = filteredBlogs.length;
  const pageCount = table.getPageCount();
  const pageSizeOptions = [10, 25, 50, 100];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading blogs…
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
          <input
            value={globalSearch}
            onChange={(e) => { setGlobalSearch(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
            placeholder="Search blogs..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground)" }}
          />
          {globalSearch && (
            <button onClick={() => setGlobalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }}>
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} style={{ color: "var(--muted)" }} />
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
            className="rounded-lg border py-2 px-3 text-sm outline-none"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground)" }}>
            {categories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
            className="rounded-lg border py-2 px-3 text-sm outline-none"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground)" }}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <button onClick={() => router.push("/smartlucky/blog/add-blogs")}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Plus size={14} /> New Blog
        </button>

        {selectedBlogs.length > 0 && (
          <button onClick={() => { if (confirm(`Delete ${selectedBlogs.length} selected blogs?`)) onBulkDelete(selectedBlogs); }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 bg-red-600">
            <Trash2 size={14} /> Delete ({selectedBlogs.length})
          </button>
        )}
      </div>

      {/* Table */}
      {filteredBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-sm" style={{ color: "var(--muted)" }}>
          <FileJson size={40} className="mb-3 opacity-40" />
          <p className="font-semibold">No blogs found</p>
          <p className="mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id}
                      colSpan={header.colSpan}
                      className="text-left font-semibold text-xs tracking-wide whitespace-nowrap px-3 py-3 select-none"
                      style={{
                        color: "var(--muted)",
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: "var(--surface)",
                        width: header.getSize(),
                        position: "relative",
                        cursor: header.column.getCanSort() ? "pointer" : "default",
                      }}
                      onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <SortIcon sorted={header.column.getIsSorted()} />}
                      </div>
                      {header.column.getCanResize() && (
                        <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none"
                          style={{ backgroundColor: "var(--border)" }} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}
                  className="transition cursor-pointer"
                  style={{ borderBottom: "1px solid var(--border)", backgroundColor: selectedBlogs.includes(row.original.id) ? "var(--surface-soft)" : "transparent" }}
                  onMouseEnter={(e) => { if (!selectedBlogs.includes(row.original.id)) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.02)"; }}
                  onMouseLeave={(e) => { if (!selectedBlogs.includes(row.original.id)) e.currentTarget.style.backgroundColor = "transparent"; }}
                  onClick={() => router.push(EDIT_ROUTE(row.original.id))}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 text-sm align-middle"
                      style={{ color: "var(--foreground)", width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {rowCount > 0 && (
        <div className="flex items-center justify-between mt-4 text-xs" style={{ color: "var(--muted)" }}>
          <span>{rowCount} blog{rowCount !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-3">
            <select value={pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded border py-1 px-2 text-xs outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground)" }}>
              {pageSizeOptions.map((s) => <option key={s} value={s}>{s} / page</option>)}
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}
                className="rounded p-1 transition disabled:opacity-30 hover:opacity-80">
                <ChevronsLeft size={16} />
              </button>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                className="rounded p-1 transition disabled:opacity-30 hover:opacity-80">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-medium" style={{ color: "var(--foreground)" }}>
                Page {pageIndex + 1} of {pageCount || 1}
              </span>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                className="rounded p-1 transition disabled:opacity-30 hover:opacity-80">
                <ChevronRight size={16} />
              </button>
              <button onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}
                className="rounded p-1 transition disabled:opacity-30 hover:opacity-80">
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
