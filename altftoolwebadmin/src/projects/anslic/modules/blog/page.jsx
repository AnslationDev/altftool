"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_BLOG_SETTINGS,
  deleteBlogArticle,
  deleteBlogArticleImage,
  saveBlogSettings,
  subscribeBlogArticles,
  subscribeBlogSettings,
} from "./service/blog.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>
        {value}
      </p>
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

export default function AnslicBlogPage() {
  const [settings, setSettings] = useState(DEFAULT_BLOG_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_BLOG_SETTINGS);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let settingsReady = false;
    let articlesReady = false;

    const markReady = () => {
      if (settingsReady && articlesReady) setLoading(false);
    };

    const unsubSettings = subscribeBlogSettings(
      (data) => {
        settingsReady = true;
        setSettings(data);
        setSettingsDraft(data);
        markReady();
      },
      () => {
        settingsReady = true;
        emitAlert({ type: "error", message: "Failed to load blog settings" });
        markReady();
      },
    );

    const unsubArticles = subscribeBlogArticles(
      (data) => {
        articlesReady = true;
        setArticles(data);
        markReady();
      },
      () => {
        articlesReady = true;
        emitAlert({ type: "error", message: "Failed to load blog articles" });
        markReady();
      },
    );

    return () => {
      unsubSettings();
      unsubArticles();
    };
  }, []);

  const sortedArticles = useMemo(
    () => [...articles].sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    if (!queryText) return sortedArticles;
    return sortedArticles.filter((article) =>
      [article.title, article.category, article.author].some((value) =>
        String(value || "").toLowerCase().includes(queryText),
      ),
    );
  }, [search, sortedArticles]);

  const activeCount = articles.filter((article) => article.active).length;
  const inactiveCount = articles.length - activeCount;

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await saveBlogSettings(settingsDraft);
      emitAlert({ type: "success", message: "Blog settings saved." });
      logAuditEvent({
        module: "blog",
        action: "BLOG_SETTINGS_UPDATE",
        entityType: "blogSettings",
        entityId: "settings",
        summary: "Updated Anslic blog page copy",
        route: "/anslic/blog",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteBlogArticle(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteBlogArticleImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Article deleted, but image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "blog",
        action: "BLOG_DELETE",
        entityType: "blogArticle",
        entityId: deleteTarget.id,
        summary: `Deleted blog article ${deleteTarget.title}`,
        route: "/anslic/blog",
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete article." });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Anslic Blog</h1>
              <p className="text-sm text-gray-500">
                Manage blog page copy and published articles.
              </p>
            </div>
          </div>
          <Link
            href="/anslic/blog/add-article"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Add Article
          </Link>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Page copy
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-900">Blog page settings</h2>
            </div>
            <button
              type="button"
              onClick={() => setSettingsDraft(settings)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow">
              <input
                value={settingsDraft.eyebrow}
                onChange={(event) => updateSettingsDraft("eyebrow", event.target.value)}
                className={inputClass}
                placeholder="Insights"
              />
            </Field>
            <Field label="Title">
              <input
                value={settingsDraft.title}
                onChange={(event) => updateSettingsDraft("title", event.target.value)}
                className={inputClass}
                placeholder="From the Blog"
              />
            </Field>
            <Field label="Subtitle">
              <input
                value={settingsDraft.subtitle}
                onChange={(event) => updateSettingsDraft("subtitle", event.target.value)}
                className={inputClass}
                placeholder="Playbooks and perspectives from the Anslic team."
              />
            </Field>
            <Field label="SEO title">
              <input
                value={settingsDraft.seoTitle}
                onChange={(event) => updateSettingsDraft("seoTitle", event.target.value)}
                className={inputClass}
                placeholder="Blog | Anslic"
              />
            </Field>
            <Field label="SEO description">
              <input
                value={settingsDraft.seoDescription}
                onChange={(event) => updateSettingsDraft("seoDescription", event.target.value)}
                className={inputClass}
                placeholder="Playbooks and perspectives from the Anslic team."
              />
            </Field>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
              {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Blog Settings
            </button>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Articles" value={loading ? "-" : articles.length} />
          <StatCard label="Active Articles" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive Articles" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles"
                className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <span className="ml-auto text-xs font-medium text-gray-400">
              {filteredArticles.length} of {articles.length} articles
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Thumbnail</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredArticles.length ? (
                  filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="max-w-[280px] px-4 py-3 font-semibold text-gray-900">
                        {article.title}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{article.category || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{article.author || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{article.date || "-"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge active={article.active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/anslic/blog/edit-article/${encodeURIComponent(article.id)}`}
                            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                            aria-label={`Edit ${article.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(article)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label={`Delete ${article.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <BookOpen className="mx-auto h-8 w-8 text-gray-200" />
                      <p className="mt-3 text-sm font-semibold text-gray-500">
                        No articles found
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Add the first Anslic blog article.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete article"
          message={`Delete "${deleteTarget.title}" from the Anslic blog?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteArticle}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
