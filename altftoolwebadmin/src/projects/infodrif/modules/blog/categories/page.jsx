"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Search, Tags, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  EMPTY_BLOG_CATEGORY,
  createBlogCategory,
  deleteBlogCategory,
  subscribeBlogCategories,
  toggleBlogCategoryStatus,
  updateBlogCategory,
} from "../service/blog.service";

const ROUTE = "/infodrif/blog/categories";

const inputClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground";
const cardClass = "rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]";

function Field({ label, required, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-danger">{error}</span> : null}
    </label>
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

export default function InfodrifBlogCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalCategory, setModalCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeBlogCategories(
      (data) => {
        setCategories(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load blog categories." });
        setLoading(false);
      },
    );
  }, []);

  const filteredCategories = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    const sorted = [...categories].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    if (!queryText) return sorted;
    return sorted.filter((category) =>
      String(category.title || "").toLowerCase().includes(queryText),
    );
  }, [categories, search]);

  const nextOrder = categories.length
    ? Math.max(...categories.map((category) => Number(category.order || 0))) + 1
    : 0;

  async function handleSave(form) {
    setSaving(true);
    try {
      if (modalCategory?.id) {
        await updateBlogCategory(modalCategory.id, form);
        emitAlert({ type: "success", message: "Category updated." });
        logAuditEvent({
          module: "blog",
          action: "BLOG_CATEGORY_UPDATE",
          entityType: "blogCategory",
          entityId: modalCategory.id,
          summary: `Updated blog category ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        const id = await createBlogCategory(form);
        emitAlert({ type: "success", message: "Category added." });
        logAuditEvent({
          module: "blog",
          action: "BLOG_CATEGORY_CREATE",
          entityType: "blogCategory",
          entityId: id,
          summary: `Created blog category ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalCategory(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save category." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteBlogCategory(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "blog",
        action: "BLOG_CATEGORY_DELETE",
        entityType: "blogCategory",
        entityId: deleteTarget.id,
        summary: `Deleted blog category ${deleteTarget.title}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete category." });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleToggle(category) {
    try {
      await toggleBlogCategoryStatus(category.id, !category.active);
      emitAlert({
        type: "success",
        message: `${category.title} set to ${category.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update category status." });
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
              <Tags className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Infodrif Blog Categories</h1>
              <p className="text-sm text-muted">
                Manage the category filter shown above the article list.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/infodrif/blog" className={outlineButtonClass}>
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            <button
              type="button"
              onClick={() => setModalCategory({ ...EMPTY_BLOG_CATEGORY, order: nextOrder })}
              className={primaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface-soft px-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories"
                className="w-48 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
            <span className="ml-auto text-xs font-medium text-muted">
              {filteredCategories.length} of {categories.length} categories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-md bg-surface-soft" />
                      </td>
                    </tr>
                  ))
                ) : filteredCategories.length ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="transition hover:bg-surface-soft">
                      <td className="px-4 py-3 font-semibold text-foreground">{category.order}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{category.title}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggle(category)}>
                          <StatusBadge active={category.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalCategory(category)}
                            className="rounded-md p-2 text-primary transition hover:bg-primary-soft"
                            aria-label={`Edit ${category.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(category)}
                            className="rounded-md p-2 text-danger transition hover:bg-danger-soft"
                            aria-label={`Delete ${category.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center">
                      <Tags className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        No categories found
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Add the first Infodrif blog category.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalCategory ? (
        <CategoryModal
          category={modalCategory.id ? modalCategory : null}
          defaults={modalCategory}
          saving={saving}
          onClose={() => setModalCategory(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete category"
          message={`Delete the "${deleteTarget.title}" category? Articles keep their category text.`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function CategoryModal({ category, defaults, saving, onClose, onSave }) {
  const [form, setForm] = useState(category || defaults || EMPTY_BLOG_CATEGORY);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(category?.id);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title?.trim()) nextErrors.title = "Title is required.";
    if (Number.isNaN(Number(form.order)) || Number(form.order) < 0) {
      nextErrors.order = "Order must be zero or higher.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Category</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              {isEdit ? "Edit category" : "Add category"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-surface-soft hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Field
            label="Title"
            required
            error={errors.title}
            hint='The site uses "All" as the reset filter — keep one category named All.'
          >
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={inputClass}
              placeholder="Marketing Tips"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Order" error={errors.order}>
              <input
                type="number"
                min="0"
                value={form.order}
                onChange={(event) => updateField("order", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <button
                type="button"
                onClick={() => updateField("active", !form.active)}
                className={`flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm font-semibold transition ${
                  form.active
                    ? "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-success-soft text-success"
                    : "border-border bg-surface-soft text-muted"
                }`}
              >
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    form.active ? "bg-success" : "bg-[var(--muted)]"
                  }`}
                />
              </button>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={outlineButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Update category" : "Add category"}
          </button>
        </div>
      </form>
    </div>
  );
}
