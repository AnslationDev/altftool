"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { emitAlert } from "@/lib/alertBus";
import { fetchAllBlogs } from "../services/blogsService";
import {
  Search, X, BookOpen, Users, Tag, Filter,
} from "lucide-react";

const stripHtml = (h) => (h || "").replace(/<[^>]+>/g, "");

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "published" ? "bg-green-500" : "bg-gray-400"}`} />
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

export default function ViewBlogs() {
  const router = useRouter();
  const [blogs, setBlogs]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter]     = useState("all");
  const [statusFilter, setStatusFilter]     = useState("all");

  useEffect(() => {
    (async () => {
      try {
        setBlogs(await fetchAllBlogs());
      } catch (err) {
        console.error(err);
        emitAlert({ type: "error", message: "Failed to load blogs" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => ["all", ...Array.from(new Set(blogs.map((b) => b.category?.trim()).filter(Boolean))).sort()], [blogs]);
  const authors    = useMemo(() => ["all", ...Array.from(new Set(blogs.map((b) => b.author).filter(Boolean)))], [blogs]);

  const filtered = useMemo(() => blogs.filter((b) => {
    if (statusFilter   !== "all" && b.status   !== statusFilter)   return false;
    if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
    if (authorFilter   !== "all" && b.author   !== authorFilter)   return false;
    if (search) {
      const q = search.toLowerCase();
      return b.heading?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q);
    }
    return true;
  }), [blogs, search, categoryFilter, authorFilter, statusFilter]);

  const hasFilters = search || categoryFilter !== "all" || authorFilter !== "all" || statusFilter !== "all";
  const clearAll   = () => { setSearch(""); setCategoryFilter("all"); setAuthorFilter("all"); setStatusFilter("all"); };

  const published        = blogs.filter((b) => b.status === "published").length;
  const drafts           = blogs.filter((b) => b.status !== "published").length;
  const uniqueCategories = new Set(blogs.map((b) => b.category).filter(Boolean)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">Loading blogs…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-5 py-7 space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Blogs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Browse and manage published posts and drafts.</p>
          </div>
          <button onClick={() => router.push("/altftool/blogs")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-sm">
            <BookOpen className="w-4 h-4" />Manage Table
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",      value: blogs.length,    color: "text-gray-800"   },
            { label: "Published",  value: published,       color: "text-green-600"  },
            { label: "Drafts",     value: drafts,          color: "text-amber-600"  },
            { label: "Categories", value: uniqueCategories,color: "text-indigo-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold tabular-nums mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blogs…"
              className="w-full pl-8 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-gray-400 transition" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
          </div>

          {[
            { value: statusFilter,   setter: setStatusFilter,   icon: <Filter className="w-3.5 h-3.5" />, options: [["all","All Status"],["published","Published"],["draft","Draft"]] },
            { value: categoryFilter, setter: setCategoryFilter, icon: <Tag    className="w-3.5 h-3.5" />, options: categories.map((c) => [c, c === "all" ? "All Categories" : c]) },
            { value: authorFilter,   setter: setAuthorFilter,   icon: <Users  className="w-3.5 h-3.5" />, options: authors.map((a) => [a, a === "all" ? "All Authors" : a]) },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{sel.icon}</span>
              <select value={sel.value} onChange={(e) => sel.setter(e.target.value)}
                className="pl-7 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 appearance-none cursor-pointer transition min-w-[140px]">
                {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400 whitespace-nowrap">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            {hasFilters && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition">
                <X className="w-3 h-3" />Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3 text-gray-400">
            <span className="text-4xl">📝</span>
            <span className="text-sm">{hasFilters ? "No blogs match your filters." : "No blogs yet."}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((blog) => {
              const preview = blog.seoDescription || stripHtml(blog.description).slice(0, 120);
              return (
                <div key={blog.id} onClick={() => router.push(`/altftool/blogs/view-blogs/${blog.id}`)}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col">
                  {blog.image ? (
                    <div className="h-44 overflow-hidden bg-gray-100 shrink-0">
                      <img src={blog.image} alt={blog.heading} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug flex-1">{blog.heading}</h2>
                      <StatusBadge status={blog.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span className="font-medium">{blog.author || "—"}</span>
                      {blog.date && <><span className="text-gray-300">·</span><span>{blog.date}</span></>}
                      {blog.category && (
                        <span className="bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">{blog.category}</span>
                      )}
                    </div>
                    {preview && <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">{preview}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}