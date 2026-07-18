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
  Tags,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_BLOG_DETAIL_SETTINGS,
  DEFAULT_BLOG_SETTINGS,
  deleteBlogArticle,
  deleteBlogArticleImage,
  deleteBlogHeroImage,
  saveBlogDetailSettings,
  saveBlogSettings,
  subscribeBlogArticles,
  subscribeBlogDetailSettings,
  subscribeBlogSettings,
  toggleBlogArticleStatus,
} from "./service/blog.service";

const ROUTE = "/infodrif/blog";

const inputClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const textareaClass =
  "w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground";
const cardClass = "rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function StatCard({ label, value, tone = "muted" }) {
  const toneClass = {
    muted: "bg-surface-soft text-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
  }[tone];

  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xl font-bold ${toneClass}`}>
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
          ? "bg-success-soft text-success ring-1 ring-[color-mix(in_srgb,var(--success)_35%,transparent)]"
          : "bg-surface-soft text-muted ring-1 ring-border"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-[var(--muted)]"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function InfodrifBlogPage() {
  const [settings, setSettings] = useState(DEFAULT_BLOG_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_BLOG_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [detail, setDetail] = useState(DEFAULT_BLOG_DETAIL_SETTINGS);
  const [detailDraft, setDetailDraft] = useState(DEFAULT_BLOG_DETAIL_SETTINGS);
  const [detailSaving, setDetailSaving] = useState(false);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeBlogSettings(
      (data) => {
        setSettings(data);
        setSettingsDraft(data);
      },
      () => emitAlert({ type: "error", message: "Failed to load blog settings." }),
    );

    const unsubDetail = subscribeBlogDetailSettings(
      (data) => {
        setDetail(data);
        setDetailDraft(data);
      },
      () => emitAlert({ type: "error", message: "Failed to load article page settings." }),
    );

    const unsubArticles = subscribeBlogArticles(
      (data) => {
        setArticles(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load blog articles." });
        setLoading(false);
      },
    );

    return () => {
      unsubSettings();
      unsubDetail();
      unsubArticles();
    };
  }, []);

  const sortedArticles = useMemo(
    () => [...articles].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedArticles.filter((article) => {
      const matchesSearch =
        !queryText ||
        [article.title, article.category, article.tag, article.slug].some((value) =>
          String(value || "").toLowerCase().includes(queryText),
        );
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? article.active : !article.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedArticles, statusFilter]);

  const activeCount = articles.filter((article) => article.active).length;

  async function handleSaveSettings() {
    setSettingsSaving(true);
    try {
      await saveBlogSettings(settingsDraft);
      emitAlert({ type: "success", message: "Blog settings saved." });
      logAuditEvent({
        module: "blog",
        action: "BLOG_SETTINGS_UPDATE",
        entityType: "blogSettings",
        entityId: "settings",
        summary: "Updated Infodrif blog list page copy",
        changes: settingsDraft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save blog settings." });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleSaveDetail() {
    setDetailSaving(true);
    try {
      await saveBlogDetailSettings(detailDraft);
      emitAlert({ type: "success", message: "Article page settings saved." });
      logAuditEvent({
        module: "blog",
        action: "BLOG_DETAIL_SETTINGS_UPDATE",
        entityType: "blogDetailSettings",
        entityId: "detail",
        summary: "Updated Infodrif article page chrome",
        changes: detailDraft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save article settings." });
    } finally {
      setDetailSaving(false);
    }
  }

  async function handleToggle(article) {
    try {
      await toggleBlogArticleStatus(article.id, !article.active);
      emitAlert({
        type: "success",
        message: `${article.title} set to ${article.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update article status." });
    }
  }

  async function handleDeleteArticle() {
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
      if (deleteTarget.heroImagePath) {
        try {
          await deleteBlogHeroImage(deleteTarget.heroImagePath);
        } catch {
          emitAlert({
            type: "warning",
            message: "Article deleted, but hero image cleanup failed.",
          });
        }
      }
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "blog",
        action: "BLOG_DELETE",
        entityType: "blogArticle",
        entityId: deleteTarget.id,
        summary: `Deleted blog article ${deleteTarget.title}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete article." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Infodrif Blog</h1>
              <p className="text-sm text-muted">
                Manage blog page copy, article page chrome, and published articles.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`${ROUTE}/categories`} className={outlineButtonClass}>
              <Tags className="h-4 w-4" />
              Categories
            </Link>
            <Link href={`${ROUTE}/add-article`} className={primaryButtonClass}>
              <Plus className="h-4 w-4" />
              Add Article
            </Link>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className={`${cardClass} p-5`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Page copy
                </p>
                <h2 className="mt-1 text-base font-bold text-foreground">Blog list page</h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsDraft(settings)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading">
                <input
                  value={settingsDraft.heading || ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({ ...prev, heading: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="Blog & articles"
                />
              </Field>
              <Field label="List heading">
                <input
                  value={settingsDraft.listHeading || ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({ ...prev, listHeading: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="Blog and articles"
                />
              </Field>
              <Field label="List subheading">
                <input
                  value={settingsDraft.listSubheading || ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({ ...prev, listSubheading: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="Latest insights and trends"
                />
              </Field>
              <Field label="Read more label">
                <input
                  value={settingsDraft.readMoreLabel || ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({ ...prev, readMoreLabel: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="Read more"
                />
              </Field>
              <Field label="Default tag" hint="Used when an article has no tag of its own.">
                <input
                  value={settingsDraft.defaultTag || ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({ ...prev, defaultTag: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="News"
                />
              </Field>
              <Field label="Default image URL">
                <input
                  value={settingsDraft.defaultImageUrl || ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({ ...prev, defaultImageUrl: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Default image path" hint="Storage path for the default image, if uploaded.">
                <input
                  value={settingsDraft.defaultImagePath || ""}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({ ...prev, defaultImagePath: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="projects/infodrif/blog/..."
                />
              </Field>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className={primaryButtonClass}
              >
                {settingsSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Blog Settings
              </button>
            </div>
          </section>

          <section className={`${cardClass} p-5`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Article page
                </p>
                <h2 className="mt-1 text-base font-bold text-foreground">Article page chrome</h2>
              </div>
              <button
                type="button"
                onClick={() => setDetailDraft(detail)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Author heading">
                <input
                  value={detailDraft.authorHeading || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({ ...prev, authorHeading: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Date heading">
                <input
                  value={detailDraft.dateHeading || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({ ...prev, dateHeading: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Table of contents heading">
                <input
                  value={detailDraft.tableOfContentsHeading || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({
                      ...prev,
                      tableOfContentsHeading: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Share heading">
                <input
                  value={detailDraft.shareHeading || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({ ...prev, shareHeading: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Get started label">
                <input
                  value={detailDraft.getStartedLabel || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({ ...prev, getStartedLabel: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="What's next heading">
                <input
                  value={detailDraft.whatsNextHeading || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({ ...prev, whatsNextHeading: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Related articles heading">
                <input
                  value={detailDraft.relatedArticlesHeading || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({
                      ...prev,
                      relatedArticlesHeading: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Image overlay title" hint="Supports line breaks.">
                <textarea
                  rows={2}
                  value={detailDraft.imageOverlayTitle || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({ ...prev, imageOverlayTitle: event.target.value }))
                  }
                  className={textareaClass}
                />
              </Field>
              <Field label="Image overlay subtitle">
                <input
                  value={detailDraft.imageOverlaySubtitle || ""}
                  onChange={(event) =>
                    setDetailDraft((prev) => ({
                      ...prev,
                      imageOverlaySubtitle: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSaveDetail}
                disabled={detailSaving}
                className={primaryButtonClass}
              >
                {detailSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Article Page Settings
              </button>
            </div>
          </section>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Articles" value={loading ? "-" : articles.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="success" />
          <StatCard
            label="Inactive"
            value={loading ? "-" : articles.length - activeCount}
            tone="warning"
          />
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface-soft px-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles"
                className="w-56 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[var(--focus-ring)]"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="ml-auto text-xs font-medium text-muted">
              {filteredArticles.length} of {articles.length} articles
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Thumbnail</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-md bg-surface-soft" />
                      </td>
                    </tr>
                  ))
                ) : filteredArticles.length ? (
                  filteredArticles.map((article) => (
                    <tr key={article.id} className="transition hover:bg-surface-soft">
                      <td className="px-4 py-3 font-semibold text-foreground">{article.order}</td>
                      <td className="px-4 py-3">
                        <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-soft">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted" />
                          )}
                        </div>
                      </td>
                      <td className="max-w-[280px] px-4 py-3">
                        <p className="font-semibold text-foreground">{article.title}</p>
                        <p className="truncate text-xs text-muted">/{article.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{article.category || "-"}</td>
                      <td className="px-4 py-3 text-muted">{article.date || "-"}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggle(article)}>
                          <StatusBadge active={article.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`${ROUTE}/edit-article/${encodeURIComponent(article.id)}`}
                            className="rounded-md p-2 text-primary transition hover:bg-primary-soft"
                            aria-label={`Edit ${article.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(article)}
                            className="rounded-md p-2 text-danger transition hover:bg-danger-soft"
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
                      <BookOpen className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        No articles found
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Add the first Infodrif blog article.
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
          message={`Delete "${deleteTarget.title}" from the Infodrif blog?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteArticle}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
