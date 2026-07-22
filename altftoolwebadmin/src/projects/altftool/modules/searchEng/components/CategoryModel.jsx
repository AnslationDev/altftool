"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { createCategory } from "../service/data.service";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  X, Loader2, CheckCircle2,
  Info, Type, Link2
} from "lucide-react";

/* ── Field wrapper ── */
function Field({ label, hint, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider">
        {icon && <span className="text-muted">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-danger font-medium">
          <CheckCircle2 className="w-3 h-3 rotate-45 text-danger" />{error}
        </p>
      )}
    </div>
  );
}

/* ── Input ── */
function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-danger focus:border-danger focus:ring-danger/30"
          : "border-border focus:ring-primary/30 focus:border-primary"
        }`}
    />
  );
}

export default function CategoryModel({ existingCategories = [], onClose }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [slug, setSlug] = useState("");

  /* ── Slugify helper ── */
  const toSlug = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleNameChange = (val) => {
    setCategoryName(val);
    setSlug(toSlug(val));
    if (formError) setFormError("");
  };

  const handleSave = async () => {
    /* ── Validation ── */
    if (!categoryName.trim()) {
      setFormError("Category name is required.");
      return;
    }
    const finalSlug = slug.trim() || toSlug(categoryName);
    if (!finalSlug) {
      setFormError("Could not generate a valid slug from the name.");
      return;
    }

    // Prevent duplicate slug
    const isDuplicate = existingCategories.some(c => c.slug === finalSlug);
    if (isDuplicate) {
      setFormError(`A category with slug "${finalSlug}" already exists.`);
      return;
    }

    /* ── Auth guard ── */
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      emitAlert({ type: "error", message: "Session expired. Please log in again." });
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const id = `cat_${finalSlug}_${Date.now()}`;

      const payload = {
        name: categoryName.trim(),
        slug: finalSlug,
        creatorUid: user.uid,
        creatorEmail: user.email,
      };

      await createCategory(id, payload);
      emitAlert({ type: "success", message: `Category "${payload.name}" created` });
      logAuditEvent({
        module: "searchEng",
        action: "CATEGORY_CREATE",
        entityType: "category",
        entityId: id,
        summary: `Created category "${payload.name}"`,
        changes: payload,
        route: "/searchEng",
      });

      setSaved(true);
      // Close the modal after a short success pulse.
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("[CategoryModel] save error:", err);
      const msg =
        err.code === "permission-denied"
          ? "Firestore permission denied. Check security rules."
          : err.message || "Failed to save category. Please try again.";
      setFormError(msg);
      emitAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface shadow-lg" role="dialog" aria-modal="true" aria-labelledby="search-category-title">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-5 sm:px-8 sm:py-6 shrink-0">
          <div>
            <h2 id="search-category-title" className="text-xl font-bold text-foreground">
              Create Category
            </h2>
            <p className="text-sm text-muted mt-0.5">
              Fill in the details below to configure the category
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close category dialog"
            className="p-2 rounded-xl text-muted hover:bg-surface-soft transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8">

          {/* Requirements banner */}
          <div className="flex gap-3 bg-primary-soft border border-primary rounded-lg p-4">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-primary">
              <p className="font-bold">Requirements</p>
              <p>Category name is required. The slug will be auto-generated.</p>
            </div>
          </div>

          {/* Form error banner */}
          {formError && (
            <div className="bg-danger-soft border border-danger rounded-lg px-5 py-3 text-sm text-danger font-medium flex items-center gap-2">
              <CheckCircle2 size={14} className="rotate-45" />
              {formError}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category Title" icon={<Type size={14} />}>
              <Input
                placeholder="e.g. Graphic Design"
                value={categoryName}
                disabled={loading}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </Field>

            <Field label="Slug" icon={<Link2 size={14} />}>
              <Input
                placeholder="graphic-design"
                value={slug}
                disabled={loading}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (formError) setFormError("");
                }}
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-surface-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <p className="text-xs text-muted">
            {saved ? (
              <span className="text-success font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Successfully Saved
              </span>
            ) : (
              <>Category will be set to <span className="font-bold text-success uppercase">Active</span></>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="h-10 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saved}
              className="flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {saved ? "Saved!" : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
