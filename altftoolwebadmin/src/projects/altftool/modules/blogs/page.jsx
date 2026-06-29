"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  Plus,
  RefreshCw,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import BLogStat from "./components/BlogStat";
import BlogTable from "./components/BlogTable";
import BlogExportModal from "./components/BlogExportModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  deleteBlog,
  bulkDeleteBlogs,
  fetchAllBlogsCached,
  invalidateBlogsCache,
} from "./services/blogsService";

/* Strip HTML so descriptions are searchable as plain text. */
const stripHtml = (html) => String(html || "").replace(/<[^>]+>/g, " ");

/* Build a single lowercased haystack covering every meaningful blog field so
   the global search matches across heading, author, category, status, tags,
   slug, SEO copy and body content. */
function buildSearchIndex(blog) {
  const tags = Array.isArray(blog.tags) ? blog.tags.join(" ") : blog.tags || "";
  return [
    blog.heading,
    blog.title,
    blog.author,
    blog.authorRole,
    blog.reviewedBy,
    blog.category,
    blog.status,
    blog.slug,
    blog.seoTitle,
    blog.seoDescription,
    blog.excerpt,
    tags,
    stripHtml(blog.description),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function Blogs() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Blogs");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  /* ── Load all blogs once (cached) so search/filter/sort run in-memory ── */
  const load = useCallback(async ({ force = false } = {}) => {
    try {
      if (force) {
        invalidateBlogsCache();
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchAllBlogsCached({ force });
      setAllBlogs(data);
    } catch (err) {
      console.error("Failed to load blogs", err);
      emitAlert({ type: "error", message: "Failed to load blogs" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Precompute the search index alongside each blog. */
  const indexedBlogs = useMemo(
    () => allBlogs.map((blog) => ({ blog, _search: buildSearchIndex(blog) })),
    [allBlogs],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(allBlogs.map((b) => b.category?.trim()).filter(Boolean))).sort(),
    [allBlogs],
  );
  const authorOptions = useMemo(
    () =>
      Array.from(new Set(allBlogs.map((b) => b.author?.trim()).filter(Boolean))).sort(),
    [allBlogs],
  );

  /* ── Single source of truth for the filtered list ── */
  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const queryWords = query ? query.split(/\s+/).filter(Boolean) : [];
    return indexedBlogs
      .filter(({ blog }) => {
        if (activeTab === "Drafts") return blog.status !== "published";
        if (activeTab === "Published") return blog.status === "published";
        return true;
      })
      .filter(({ blog }) => categoryFilter === "all" || blog.category === categoryFilter)
      .filter(({ blog }) => authorFilter === "all" || blog.author === authorFilter)
      .filter(({ _search }) => {
        if (queryWords.length === 0) return true;
        return queryWords.every((word) => _search.includes(word));
      })
      .map(({ blog }) => blog);
  }, [indexedBlogs, activeTab, categoryFilter, authorFilter, search]);

  const hasActiveFilters =
    Boolean(search) ||
    activeTab !== "All Blogs" ||
    categoryFilter !== "all" ||
    authorFilter !== "all";

  const clearFilters = useCallback(() => {
    setSearch("");
    setActiveTab("All Blogs");
    setCategoryFilter("all");
    setAuthorFilter("all");
  }, []);

  /* ── Single delete ── */
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBlog(deleteId);
      setAllBlogs((prev) => prev.filter((b) => b.id !== deleteId));
      setSelectedBlogs((prev) => prev.filter((id) => id !== deleteId));
      emitAlert({ type: "success", message: "Blog deleted successfully" });
      logAuditEvent({
        module: "blogs",
        action: "BLOG_DELETE",
        entityType: "blog",
        entityId: deleteId,
        summary: `Deleted blog ${deleteId}`,
        changes: { id: deleteId },
        route: "/altftool/blogs",
      });
    } catch (err) {
      console.error("Delete failed", err);
      emitAlert({ type: "error", message: "Failed to delete blog" });
    }
    setDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  /* ── Bulk delete ── */
  const confirmBulkDelete = async () => {
    if (selectedBlogs.length === 0) return;
    try {
      await bulkDeleteBlogs(selectedBlogs);
      const deletedCount = selectedBlogs.length;
      const ids = new Set(selectedBlogs);
      setAllBlogs((prev) => prev.filter((b) => !ids.has(b.id)));
      setSelectedBlogs([]);
      emitAlert({ type: "success", message: `${deletedCount} blog${deletedCount > 1 ? "s" : ""} deleted` });
      logAuditEvent({
        module: "blogs",
        action: "BLOG_BULK_DELETE",
        entityType: "blog",
        entityId: null,
        summary: `Bulk deleted ${deletedCount} blogs`,
        changes: { ids: selectedBlogs },
        route: "/altftool/blogs",
      });
    } catch (err) {
      console.error("Bulk delete failed", err);
      emitAlert({ type: "error", message: "Bulk delete failed" });
    }
    setIsBulkDeleteModalOpen(false);
  };

  const secondaryLink =
    "inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 space-y-6 sm:px-6">
        {/* ── Header ── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Blog Management
            </h1>
            <p className="mt-1 text-sm text-muted">
              Search, filter, edit and export every blog in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => load({ force: true })}
              disabled={refreshing}
              className={secondaryLink}
              aria-label="Refresh blogs"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className={secondaryLink}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <Link href="/altftool/blogs/analytics" className={secondaryLink}>
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
            </Link>
            <Link href="/altftool/blogs/quality" className={secondaryLink}>
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden md:inline">Quality</span>
            </Link>
            <Link href="/altftool/blogs/bulk-refresh" className={secondaryLink}>
              <WandSparkles className="h-4 w-4" />
              <span className="hidden md:inline">Bulk Refresh</span>
            </Link>
            <Link
              href="/altftool/blogs/add-blogs"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Plus className="h-4 w-4" />
              Add Blog
            </Link>
          </div>
        </header>

        {/* ── Stats ── */}
        <BLogStat blogs={allBlogs} loading={loading} />

        {/* ── Table ── */}
        <BlogTable
          blogs={filteredBlogs}
          setBlogs={setAllBlogs}
          setDeleteId={setDeleteId}
          openDeleteModal={() => setIsDeleteModalOpen(true)}
          selectedBlogs={selectedBlogs}
          setSelectedBlogs={setSelectedBlogs}
          openBulkDeleteModal={() => setIsBulkDeleteModalOpen(true)}
          totalCount={allBlogs.length}
          loading={loading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearch={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilter={setCategoryFilter}
          categoryOptions={categoryOptions}
          authorFilter={authorFilter}
          onAuthorFilter={setAuthorFilter}
          authorOptions={authorOptions}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </div>

      <BlogExportModal
        open={isExportModalOpen}
        blogs={allBlogs}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* ── Single delete confirm ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">Delete this blog?</h2>
            <p className="mt-1.5 text-sm text-muted">
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk delete confirm ── */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">
              Delete {selectedBlogs.length} selected blog
              {selectedBlogs.length > 1 ? "s" : ""}?
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
