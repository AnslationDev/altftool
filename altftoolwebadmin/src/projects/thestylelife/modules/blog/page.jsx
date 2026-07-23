"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Newspaper,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { ImageField, SettingsCard, inputClass, textareaClass } from "../_shared/AdminSectionShared";
import { createSlug } from "../services/service/services.service";
import {
  DEFAULT_BLOG_SETTINGS,
  createArticle,
  deleteArticle,
  saveBlogSettings,
  subscribeArticles,
  subscribeBlogSettings,
  toggleArticleStatus,
  updateArticle,
  uploadArticleImage,
} from "./service/blog.service";

const EMPTY_ARTICLE = {
  slug: "",
  title: "",
  category: "",
  image: "",
  excerpt: "",
  date: "",
  readTime: "",
  author: "",
  content: "",
  order: 0,
  active: true,
};

function paragraphsToText(value) {
  return Array.isArray(value) ? value.join("\n\n") : String(value || "");
}

export default function ThestylelifeBlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeArticles(
      (items) => {
        setArticles(items);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load articles." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return articles
      .filter((item) => {
        const matchesSearch = !search || item.title?.toLowerCase().includes(search) || item.category?.toLowerCase().includes(search) || item.author?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active !== false) ||
          (statusFilter === "inactive" && item.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }, [articles, query, statusFilter]);

  const activeCount = articles.filter((item) => item.active !== false).length;

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
              <h1 className="text-xl font-bold text-gray-900">TheStyleLife Blog</h1>
              <p className="text-sm text-gray-500">Manage the studio articles shown on /blog, article pages, and the home preview.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", article: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Article
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Articles" value={loading ? "-" : articles.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive" value={loading ? "-" : articles.length - activeCount} tone="amber" />
        </div>

        <SettingsCard
          eyebrow="/blog Page Hero"
          title="Page hero & related strip"
          defaults={DEFAULT_BLOG_SETTINGS}
          subscribe={subscribeBlogSettings}
          save={saveBlogSettings}
          errorLabel="blog page hero"
          fields={[
            { key: "badge", label: "Badge", type: "text", placeholder: "The Edit" },
            { key: "heroHeadline", label: "Hero Headline", type: "text", required: true },
            { key: "heroSubcopy", label: "Hero Subcopy", type: "textarea", rows: 3 },
            { key: "relatedEyebrow", label: "Related Eyebrow", type: "text", half: true, placeholder: "Continue Reading" },
            { key: "relatedHeading", label: "Related Heading", type: "text", half: true, placeholder: "More From the Studio" },
          ]}
        />

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Article Management</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">{articles.length} articles</h2>
            </div>
            <span className="text-xs font-medium text-gray-400">{filteredArticles.length} shown</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_170px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by title, category, or author" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[64px_1.4fr_110px_1fr_110px_100px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Cover</span><span>Title</span><span>Category</span><span>Author</span><span>Date</span><span>Status</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : filteredArticles.length ? filteredArticles.map((item) => (
                <div key={item.id} className="grid grid-cols-[64px_1.4fr_110px_1fr_110px_100px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                  <div className="h-11 w-11 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{item.title}</p>
                    <p className="truncate font-mono text-xs font-semibold text-gray-500">{item.slug}</p>
                  </div>
                  <span className="w-fit rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{item.category || "—"}</span>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.author}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.date}</p>
                  <StatusBadge active={item.active !== false} />
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
        </section>
      </div>

      {modalState ? <ArticleModal mode={modalState.mode} article={modalState.article} articles={articles} onClose={() => setModalState(null)} /> : null}
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
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
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

function ArticleModal({ mode, article, articles, onClose }) {
  const nextOrder = useMemo(() => articles.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [articles]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_ARTICLE,
    ...article,
    content: paragraphsToText(article?.content),
    order: Number(article?.order) || nextOrder,
    active: article?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(article?.slug));

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugEdited) next.slug = createSlug(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setSlug(value) {
    setSlugEdited(true);
    setField("slug", createSlug(value));
  }

  async function save() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
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
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Article" : "Add Article"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Article details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-5">
          <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} /></Field>
            <Field label="Category"><input value={form.category} onChange={(event) => setField("category", event.target.value)} className={inputClass} placeholder="Brand Strategy" /></Field>
            <Field label="Author"><input value={form.author} onChange={(event) => setField("author", event.target.value)} className={inputClass} placeholder="Mariana Cole" /></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={(event) => setField("date", event.target.value)} className={inputClass} /></Field>
            <Field label="Read Time"><input value={form.readTime} onChange={(event) => setField("readTime", event.target.value)} className={inputClass} placeholder="6 min read" /></Field>
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
          </div>

          <ImageField
            label="Cover Image"
            value={form.image}
            onChange={(value) => setField("image", value)}
            upload={uploadArticleImage}
          />

          <Field label="Excerpt"><textarea value={form.excerpt} onChange={(event) => setField("excerpt", event.target.value)} rows={2} className={textareaClass} /></Field>
          <Field label="Content" hint="Separate paragraphs with a blank line.">
            <textarea value={form.content} onChange={(event) => setField("content", event.target.value)} rows={10} className={textareaClass} />
          </Field>

          <Field label="Status">
            <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
              <span>{form.active ? "Active" : "Inactive"}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
            </button>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Update Article" : "Add Article"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
