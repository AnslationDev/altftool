"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Newspaper, Plus, Save, Search, Trash2, Upload, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createArticle,
  createCategory,
  deleteArticle,
  deleteBlogCover,
  deleteCategory,
  subscribeArticles,
  subscribeCategories,
  toggleArticleStatus,
  updateArticle,
  uploadBlogCover,
} from "./service/blog.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_ARTICLE = {
  slug: "",
  title: "",
  image: "",
  imagePath: "",
  excerpt: "",
  category: "",
  author: "",
  date: "",
  readingTime: "",
  tags: "",
  content: "",
  relatedSlugs: "",
  order: 0,
  active: true,
};

function linesToText(value) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

function paragraphsToText(value) {
  return Array.isArray(value) ? value.join("\n\n") : String(value || "");
}

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubArticles = subscribeArticles(
      (items) => {
        setArticles(items);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load articles." });
        setLoading(false);
      },
    );
    const unsubCategories = subscribeCategories(
      (items) => setCategories(items),
      () => emitAlert({ type: "error", message: "Failed to load categories." }),
    );
    return () => {
      unsubArticles();
      unsubCategories();
    };
  }, []);

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return articles
      .filter((item) => {
        const matchesSearch = !search || item.title?.toLowerCase().includes(search) || item.slug?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active !== false) ||
          (statusFilter === "inactive" && item.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [articles, query, statusFilter]);

  const activeCount = articles.filter((item) => item.active !== false).length;

  const previewArticles = useMemo(
    () =>
      articles
        .filter((item) => item.active !== false)
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [articles],
  );

  async function toggleArticle(item) {
    try {
      await toggleArticleStatus(item.id, item.active === false);
      emitAlert({ type: "success", message: "Article status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteArticle(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteBlogCover(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Article deleted, but image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Article deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete article." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DailyHnt Blog</h1>
              <p className="text-sm text-gray-500">Manage blog categories and articles.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", article: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Article
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Articles" value={loading ? "-" : articles.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Categories" value={categories.length} tone="amber" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="flex flex-col gap-5">
            <CategoryManager categories={categories} articles={articles} />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Article Management</p>
                  <h2 className="mt-1 text-base font-bold text-gray-900">{articles.length} articles</h2>
                </div>
                <span className="text-xs font-medium text-gray-400">{filteredArticles.length} shown</span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_170px]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by title or slug" />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[60px_1fr_1fr_100px_90px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Cover</span><span>Title</span><span>Slug</span><span>Category</span><span>Status</span><span>Actions</span>
                  </div>
                  {loading ? (
                    <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}</div>
                  ) : filteredArticles.length ? filteredArticles.map((item) => (
                    <div key={item.id} className="grid grid-cols-[60px_1fr_1fr_100px_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                      <div className="h-11 w-11 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-3 h-5 w-5 text-gray-300" />}
                      </div>
                      <p className="truncate font-bold text-gray-900">{item.title}</p>
                      <p className="truncate font-mono text-xs font-semibold text-gray-500">{item.slug}</p>
                      <p className="truncate text-xs font-semibold text-gray-500">{item.category}</p>
                      <button type="button" onClick={() => toggleArticle(item)} className="w-fit">
                        <StatusBadge active={item.active !== false} />
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => toggleArticle(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                        <button onClick={() => setModalState({ mode: "edit", article: item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )) : (
                    <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No articles found.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              <span className="ml-auto text-xs font-medium text-gray-400">DailyHnt · Field Notes</span>
            </div>
            <BlogPreview articles={previewArticles} loading={loading} />
          </section>
        </div>
      </div>

      {modalState ? <ArticleModal mode={modalState.mode} article={modalState.article} articles={articles} categories={categories} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete article"
          message={`Delete "${deleteTarget.title || deleteTarget.slug}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "text-gray-900",
    green: "text-emerald-600",
    amber: "text-amber-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function BlogPreview({ articles, loading }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#0a0a0a] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c6f135]">Field Notes</p>
      <h3 className="mt-2 max-w-md text-lg font-semibold leading-snug text-[#ededed]">
        Recent writing from the build team.
      </h3>

      {loading ? (
        <div className="mt-5 space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-xl border border-[#262626] bg-[#111111]" />
          ))}
        </div>
      ) : articles.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {articles.slice(0, 4).map((post) => (
            <div key={post.id || post.slug} className="group flex flex-col overflow-hidden rounded-xl border border-[#262626] bg-[#0a0a0a] transition-colors hover:border-[#c6f135] hover:bg-[#111111]">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-[#262626]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {post.category ? (
                  <span className="absolute left-3 top-3 rounded-sm bg-[#c6f135] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#0a0a0a]">
                    {post.category}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8a8a]">
                  {[post.date, post.readingTime].filter(Boolean).join(" · ") || "Draft"}
                </span>
                <h4 className="mt-2 text-sm font-medium leading-snug text-[#ededed]">{post.title || "Untitled article"}</h4>
                <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-[#8a8a8a]">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-[#262626] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#8a8a8a]">No active articles to preview</p>
        </div>
      )}
    </div>
  );
}

function CategoryManager({ categories, articles }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sorted = useMemo(() => [...categories].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)), [categories]);

  async function addCategory() {
    if (!name.trim()) {
      emitAlert({ type: "error", message: "Category name is required." });
      return;
    }
    setSaving(true);
    try {
      const nextOrder = categories.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
      await createCategory({ name, order: nextOrder, active: true });
      setName("");
      emitAlert({ type: "success", message: "Category added." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to add category." });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      emitAlert({ type: "success", message: "Category deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete category." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Blog Categories</p>
      <h2 className="mt-1 text-base font-bold text-gray-900">{categories.length} categories</h2>

      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addCategory()}
          className={inputClass}
          placeholder="New category name"
        />
        <button onClick={addCategory} disabled={saving} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {sorted.length ? sorted.map((item) => {
          const inUse = articles.filter((article) => article.category === item.name).length;
          return (
            <div key={item.id} className="flex items-center gap-2 rounded-xl border border-gray-200 py-1.5 pl-3 pr-1.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-[10px] text-gray-400">{inUse} article{inUse === 1 ? "" : "s"}</p>
              </div>
              <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          );
        }) : (
          <p className="w-full rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs font-medium text-gray-400">No categories yet.</p>
        )}
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete category"
          message={`Delete category "${deleteTarget.name}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function ArticleModal({ mode, article, articles, categories, onClose }) {
  const nextOrder = useMemo(() => articles.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [articles]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_ARTICLE,
    ...article,
    tags: linesToText(article?.tags),
    relatedSlugs: linesToText(article?.relatedSlugs),
    content: paragraphsToText(article?.content),
    order: Number(article?.order) || nextOrder,
    active: article?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Cover must be an image file." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadBlogCover({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, image: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Cover uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, image: "", imagePath: "" }));
    try {
      await deleteBlogCover(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateArticle(article.id, form);
        emitAlert({ type: "success", message: "Article updated." });
      } else {
        await createArticle(form);
        emitAlert({ type: "success", message: "Article added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Article" : "Add Article"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Article details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
          <div>
            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.image ? <img src={form.image} alt="Cover preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
            <div className="mt-3 flex gap-2">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                <Upload className="h-3.5 w-3.5" /> Upload Cover
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
              </label>
              {form.image ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setField("slug", event.target.value.toLowerCase())} className={inputClass} placeholder="my-first-post" /></Field>
              <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select value={form.category} onChange={(event) => setField("category", event.target.value)} className={inputClass}>
                  <option value="">Select category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </Field>
              <Field label="Author"><input value={form.author} onChange={(event) => setField("author", event.target.value)} className={inputClass} placeholder="team slug" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date (YYYY-MM-DD)"><input type="date" value={form.date} onChange={(event) => setField("date", event.target.value)} className={inputClass} /></Field>
              <Field label="Reading Time"><input value={form.readingTime} onChange={(event) => setField("readingTime", event.target.value)} className={inputClass} placeholder="5 min read" /></Field>
              <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
            </div>
            <Field label="Excerpt"><textarea value={form.excerpt} onChange={(event) => setField("excerpt", event.target.value)} rows={2} className={textareaClass} /></Field>
          </div>
        </div>

        <div className="mt-5">
          <Field label="Content (separate each paragraph with a blank line)">
            <textarea value={form.content} onChange={(event) => setField("content", event.target.value)} rows={10} className={textareaClass} placeholder={"First paragraph...\n\nSecond paragraph..."} />
          </Field>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Tags (one per line)"><textarea value={form.tags} onChange={(event) => setField("tags", event.target.value)} rows={4} className={textareaClass} /></Field>
          <Field label="Related Slugs (one per line)"><textarea value={form.relatedSlugs} onChange={(event) => setField("relatedSlugs", event.target.value)} rows={4} className={textareaClass} /></Field>
        </div>

        <div className="mt-5">
          <Field label="Status">
            <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold sm:w-64 ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
              <span>{form.active ? "Active" : "Inactive"}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
            </button>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Update Article" : "Add Article"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
