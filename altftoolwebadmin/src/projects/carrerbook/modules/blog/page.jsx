"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Columns3,
  Edit3,
  Eye,
  FileText,
  Heart,
  Maximize2,
  MessageCircle,
  Minimize2,
  PencilLine,
  PlusCircle,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  createBlogCategory,
  createSlug,
  deleteBlogArticle,
  deleteBlogCategory,
  deleteBlogImage,
  subscribeBlogArticles,
  subscribeBlogCategories,
  toggleBlogArticleStatus,
} from "./service/blog.service";

const teal = "bg-[#079684] hover:bg-[#087e70]";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#079684] focus:ring-2 focus:ring-[#079684]/10";

const COLUMN_DEFS = [
  { key: "title", label: "Heading" },
  { key: "author", label: "Author" },
  { key: "category", label: "Category" },
  { key: "date", label: "Publish Date" },
  { key: "created", label: "Created" },
  { key: "status", label: "Status" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
];

export default function BlogPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() =>
    Object.fromEntries(COLUMN_DEFS.map((col) => [col.key, true])),
  );
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const unsubCategories = subscribeBlogCategories(
      (items) => {
        setCategories(items);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load blog categories." });
        setLoading(false);
      },
    );
    const unsubArticles = subscribeBlogArticles(
      (items) => setArticles(items),
      () => emitAlert({ type: "error", message: "Failed to load blog articles." }),
    );
    return () => {
      unsubCategories();
      unsubArticles();
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: articles.length,
      published: articles.filter((item) => item.status === "published" && item.active !== false).length,
      drafts: articles.filter((item) => item.status !== "published" || item.active === false).length,
      likes: articles.reduce((sum, item) => sum + (Number(item.likes) || 0), 0),
      comments: articles.reduce((sum, item) => sum + (Number(item.commentsCount) || 0), 0),
    };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return articles
      .filter((article) => {
        if (activeTab === "published") return article.status === "published" && article.active !== false;
        if (activeTab === "draft") return article.status !== "published" || article.active === false;
        return true;
      })
      .filter((article) => {
        if (!search) return true;
        return [article.title, article.author, article.categoryName, article.slug]
          .some((value) => String(value || "").toLowerCase().includes(search));
      })
      .sort((a, b) => {
        const aCreated = a.createdAt?.toMillis?.() || 0;
        const bCreated = b.createdAt?.toMillis?.() || 0;
        return bCreated - aCreated;
      });
  }, [activeTab, articles, query]);

  // Fullscreen: lock body scroll and let Escape exit, matching the pattern
  // used by the richer table components elsewhere in the admin (e.g. leadtree).
  useEffect(() => {
    if (!isFullscreen) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Drop selections that fall out of the current filtered/search view so a
  // stale id never lingers after a tab switch, search, or delete.
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filteredArticles.some((article) => article.id === id)));
  }, [filteredArticles]);

  const visibleColumnDefs = COLUMN_DEFS.filter((col) => visibleColumns[col.key]);
  const allVisibleSelected = filteredArticles.length > 0 && filteredArticles.every((article) => selectedIds.includes(article.id));

  function toggleSelectAll() {
    setSelectedIds(allVisibleSelected ? [] : filteredArticles.map((article) => article.id));
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected blog${selectedIds.length > 1 ? "s" : ""}?`)) return;
    const targets = filteredArticles.filter((article) => selectedIds.includes(article.id));
    let failures = 0;
    for (const article of targets) {
      try {
        await deleteBlogArticle(article.id, article._collection);
        if (article.imagePath) {
          try {
            await deleteBlogImage(article.imagePath);
          } catch {
            // Image cleanup failure is non-fatal for a bulk delete.
          }
        }
      } catch {
        failures += 1;
      }
    }
    setSelectedIds([]);
    if (failures) {
      emitAlert({ type: "error", message: `${targets.length - failures} of ${targets.length} blogs deleted; ${failures} failed.` });
    } else {
      emitAlert({ type: "success", message: `${targets.length} blog${targets.length > 1 ? "s" : ""} deleted.` });
    }
  }

  function renderCell(article, key) {
    switch (key) {
      case "title":
        return <td key={key} className="max-w-[330px] px-5 py-4 font-semibold text-slate-900">{article.title}</td>;
      case "author":
        return <td key={key} className="px-5 py-4">{article.author || "-"}</td>;
      case "category":
        return <td key={key} className="px-5 py-4">{article.categoryName || "Uncategorized"}</td>;
      case "date":
        return <td key={key} className="px-5 py-4">{article.date || "-"}</td>;
      case "created":
        return <td key={key} className="px-5 py-4">{formatDate(article.createdAt)}</td>;
      case "status":
        return (
          <td key={key} className="px-5 py-4">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${article.status === "published" && article.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {article.status === "published" && article.active !== false ? "Published" : "Draft"}
            </span>
          </td>
        );
      case "likes":
        return <td key={key} className="px-5 py-4">{Number(article.likes) || 0}</td>;
      case "comments":
        return <td key={key} className="px-5 py-4">{Number(article.commentsCount) || 0}</td>;
      default:
        return null;
    }
  }

  async function toggleArticle(article) {
    try {
      await toggleBlogArticleStatus(article.id, article.active === false, article._collection);
      emitAlert({ type: "success", message: "Article status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update article." });
    }
  }

  async function deleteArticle(article) {
    if (!window.confirm(`Delete "${article.title}"?`)) return;
    try {
      await deleteBlogArticle(article.id, article._collection);
      if (article.imagePath) {
        try {
          await deleteBlogImage(article.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Article deleted, but image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Article deleted." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete article." });
    }
  }

  function editArticle(article) {
    if (!article?.id) {
      emitAlert({ type: "error", message: "Cannot edit this article because its document id is missing." });
      return;
    }
    router.push(`/carrerbook/blog/edit-article/${encodeURIComponent(article.id)}`);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <BlogTopNav onAddCategory={() => setCategoryModalOpen(true)} />

      <main className="mx-auto max-w-[1800px] px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Manage your Blogs</h1>
          <Link href="/carrerbook/blog/add-article" className={`rounded-lg px-5 py-3 text-sm font-bold text-white shadow-sm ${teal}`}>
            Add Blog
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="bg-slate-50 px-12 py-11">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Total Posts" value={stats.total} icon={<FileText className="h-8 w-8 text-[#079684]" />} />
              <StatCard label="Published Posts" value={stats.published} icon={<Eye className="h-8 w-8 text-emerald-600" />} />
              <StatCard label="Draft Posts" value={stats.drafts} icon={<PencilLine className="h-8 w-8 text-amber-500" />} />
              <StatCard label="Total Likes" value={stats.likes} icon={<Heart className="h-8 w-8 text-red-500" />} />
              <StatCard label="Total Comments" value={stats.comments} icon={<MessageCircle className="h-8 w-8 text-violet-500" />} />
            </div>
          </div>
        </section>

        <section className={isFullscreen ? "fixed inset-0 z-40 flex flex-col overflow-hidden rounded-none border-0 bg-white" : "mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>All Blogs</TabButton>
                <TabButton active={activeTab === "draft"} onClick={() => setActiveTab("draft")}>Drafts</TabButton>
                <TabButton active={activeTab === "published"} onClick={() => setActiveTab("published")}>Published</TabButton>
              </div>
              <label className="relative block w-[330px] max-w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by heading or author..." />
              </label>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-2">
                <div className="relative">
                  <button type="button" onClick={() => setColumnsMenuOpen((value) => !value)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    <Columns3 className="h-4 w-4" /> Columns
                  </button>
                  {columnsMenuOpen ? (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setColumnsMenuOpen(false)} />
                      <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                        <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">Show Columns</p>
                        <div className="space-y-1.5">
                          {COLUMN_DEFS.map((col) => (
                            <label key={col.key} className="flex items-center gap-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={visibleColumns[col.key]}
                                onChange={() => setVisibleColumns((prev) => ({ ...prev, [col.key]: !prev[col.key] }))}
                                className="h-3.5 w-3.5 rounded border-slate-300"
                              />
                              {col.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
                <button type="button" onClick={() => setIsFullscreen((value) => !value)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
              <span className="text-xs font-semibold text-slate-500">{filteredArticles.length} blogs</span>
            </div>
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center justify-between border-b border-slate-200 bg-red-50 px-5 py-3">
              <span className="text-sm font-semibold text-red-700">{selectedIds.length} selected</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSelectedIds([])} className="text-sm font-semibold text-slate-600 hover:text-slate-800">Clear</button>
                <button type="button" onClick={deleteSelected} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-red-700">
                  <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                </button>
              </div>
            </div>
          ) : null}

          <div className={`overflow-x-auto ${isFullscreen ? "flex-1 overflow-y-auto" : ""}`}>
            <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all blogs"
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>
                  {visibleColumnDefs.map((col) => <Th key={col.key}>{col.label}</Th>)}
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={visibleColumnDefs.length + 2} className="px-5 py-12 text-center font-semibold text-slate-500">Loading blogs...</td></tr>
                ) : filteredArticles.length ? filteredArticles.map((article) => (
                  <tr key={`${article._collection}-${article.id}`} className="text-slate-600 hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(article.id)}
                        onChange={() => toggleSelectOne(article.id)}
                        aria-label={`Select ${article.title || "blog"}`}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    {visibleColumnDefs.map((col) => renderCell(article, col.key))}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => editArticle(article)} title="Edit" className="text-amber-600 hover:text-amber-700"><Edit3 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => deleteArticle(article)} title="Delete" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        <button type="button" onClick={() => toggleArticle(article)} title="Toggle status" className="text-slate-500 hover:text-slate-700"><Ban className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={visibleColumnDefs.length + 2} className="px-5 py-12 text-center font-semibold text-slate-500">No blogs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {categoryModalOpen ? (
        <ManageCategoriesModal
          categories={categories}
          onClose={() => setCategoryModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function BlogTopNav({ onAddCategory }) {
  return (
    <header className="border-b border-slate-900 bg-white">
      <div className="mx-auto flex h-[94px] max-w-[1360px] items-center justify-between px-6">
        <nav className="flex items-center gap-14">
          <span className="text-lg font-black text-slate-950">Blogs</span>
          <Link href="/carrerbook/blog" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#079684]">
            <FileText className="h-4 w-4" /> All Blogs
          </Link>
          <Link href="/carrerbook/blog/add-article" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#079684]">
            <PlusCircle className="h-4 w-4" /> Add New Blog
          </Link>
        </nav>
        <button onClick={onAddCategory} className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white shadow-sm ${teal}`}>
          <Tag className="h-4 w-4" /> Add Category
        </button>
      </div>
    </header>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="flex min-h-[92px] items-center justify-between rounded-2xl bg-white px-6 shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-800">{value}</p>
      </div>
      {icon}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${active ? "border-[#079684] bg-[#079684] text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
      {children}
    </button>
  );
}

function Th({ children }) {
  return <th className="px-5 py-3 font-black">{children}</th>;
}

function ManageCategoriesModal({ categories, onClose }) {
  const [newCategories, setNewCategories] = useState([""]);
  const [saving, setSaving] = useState(false);

  async function removeCategory(category) {
    if (!window.confirm(`Delete "${category.name}"? Categories with articles cannot be deleted.`)) return;
    try {
      await deleteBlogCategory(category.id, category._collection);
      emitAlert({ type: "success", message: "Category deleted." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete category." });
    }
  }

  async function save() {
    const names = newCategories.map((item) => item.trim()).filter(Boolean);
    if (!names.length) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await Promise.all(names.map((name, index) => createBlogCategory({
        name,
        slug: createSlug(name),
        order: categories.length + index + 1,
        active: true,
      })));
      emitAlert({ type: "success", message: "Categories saved." });
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save categories." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[385px] rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">Manage Categories</h2>

        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Existing Categories</p>
          <div className="mt-3 max-h-[210px] space-y-2 overflow-y-auto pr-1">
            {categories.length ? categories.map((category) => (
              <div key={`${category._collection}-${category.id}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800">
                <span className="truncate">{category.name}</span>
                <button onClick={() => removeCategory(category)} className="ml-3 text-slate-500 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-semibold text-slate-500">No categories yet.</p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Add New Categories</p>
          <div className="mt-2 space-y-2">
            {newCategories.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={value}
                  onChange={(event) => setNewCategories((prev) => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                  className="h-11 flex-1 rounded-md border border-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-[#079684]/20"
                  placeholder="Category name"
                />
                <button onClick={() => setNewCategories((prev) => prev.filter((_, itemIndex) => itemIndex !== index))} className="text-slate-500 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setNewCategories((prev) => [...prev, ""])} className="mt-3 text-sm font-semibold text-[#079684]">+ Add Another</button>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900">Cancel</button>
          <button onClick={save} disabled={saving} className={`rounded-md px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${teal}`}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US");
}
