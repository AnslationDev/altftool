"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  deleteBlog,
  bulkDeleteBlogs,
  fetchAllBlogsWithMockData,
  invalidateBlogsCache,
  invalidateAllBlogsCache,
} from "./services/blogsService";
import BlogTable from "./components/BlogTable";

export default function BlogsPage() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    try {
      if (force) {
        invalidateBlogsCache();
        invalidateAllBlogsCache();
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchAllBlogsWithMockData({ force });
      setAllBlogs(data);
    } catch (err) {
      console.error("Failed to load blogs", err);
      emitAlert({ type: "error", title: "Load failed", message: err?.message || "Could not fetch blogs." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id);
      emitAlert({ type: "success", title: "Deleted", message: "Blog deleted successfully." });
      load(true);
    } catch (err) {
      emitAlert({ type: "error", title: "Delete failed", message: err?.message });
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await bulkDeleteBlogs(ids);
      emitAlert({ type: "success", title: "Deleted", message: `${ids.length} blog(s) deleted.` });
      load(true);
    } catch (err) {
      emitAlert({ type: "error", title: "Bulk delete failed", message: err?.message });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold sm:text-xl" style={{ color: "var(--foreground)" }}>Blog Management</h1>
            <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>Manage all blog posts. Mock data is seeded to Firebase on first load.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(true)} disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground)" }}>
              {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <BlogTable
        blogs={allBlogs}
        loading={loading}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onRefresh={() => load(true)}
      />
    </div>
  );
}
