
"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { createCategory, updateCategory } from "../service/category.service";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  X, Plus, Trash2, Loader2, CheckCircle2,
  Info, ChevronDown, ChevronUp, Type,
  Link2, Layers, FileText
} from "lucide-react";

/* ── Field wrapper ── */
function Field({ label, hint, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <CheckCircle2 className="w-3 h-3 rotate-45 text-red-500" />{error}
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
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
        }`}
    />
  );
}

/* ── Textarea ── */
function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition resize-none
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
        }`}
    />
  );
}

export default function CategoryCreateModal({
  existingCategory = null,
  onClose,
}) {
  const isEdit = !!existingCategory;
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(true);
  const [formError, setFormError] = useState("");

  const [category, setCategory] = useState(
    existingCategory || {
      name: "",
      description: "",
      slug: "",
      heroTitle: "",
      heroSubtitle: "",
      sections: [],
    }
  );

  const handleChange = (field, value) => {
    setCategory((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formError) setFormError("");
  };

  const addSection = () => {
    setCategory((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "",
          description: "",
        },
      ],
    }));
  };

  const removeSection = (index) => {
    const updated = [...category.sections];
    updated.splice(index, 1);
    handleChange("sections", updated);
  };

  const updateSection = (index, field, value) => {
    const updated = [...category.sections];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    handleChange("sections", updated);
  };

  /* ── Slugify helper ── */
  const toSlug = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleSave = async () => {
    /* ── Validation ── */
    if (!category.name.trim()) {
      setFormError("Category name is required.");
      return;
    }
    const slug = category.slug.trim() || toSlug(category.name);
    if (!slug) {
      setFormError("Could not generate a valid slug from the name.");
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
      const id = isEdit
        ? existingCategory.id
        : `cat_${toSlug(category.name)}_${Date.now()}`;

      const payload = {
        name: category.name.trim(),
        description: category.description.trim(),
        slug,
        heroTitle: category.heroTitle.trim(),
        heroSubtitle: category.heroSubtitle.trim(),
        sections: category.sections.map((s) => ({
          title: s.title.trim(),
          description: s.description.trim(),
        })),
        status: existingCategory?.status || "active",
        creatorUid: user.uid,
        creatorEmail: user.email,
      };

      if (isEdit) {
        await updateCategory(existingCategory.id, payload);
        emitAlert({ type: "success", message: `Category "${payload.name}" updated` });
        logAuditEvent({
          module: "pintrest",
          action: "CATEGORY_UPDATE",
          entityType: "category",
          entityId: existingCategory.id,
          summary: `Updated category "${payload.name}"`,
          changes: payload,
          route: "/pintrest",
        });
      } else {
        await createCategory(id, payload);
        emitAlert({ type: "success", message: `Category "${payload.name}" created` });
        logAuditEvent({
          module: "pintrest",
          action: "CATEGORY_CREATE",
          entityType: "category",
          entityId: id,
          summary: `Created category "${payload.name}"`,
          changes: payload,
          route: "/pintrest",
        });
      }

      setSaved(true);
      // subscribeCategories in page.jsx will pick up the change automatically.
      // Close the modal after a short success pulse.
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("[CategoryModal] save error:", err);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Category" : "Create Category"}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Fill in the details below to configure the category
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">

          {/* Requirements banner */}
          <div className="flex gap-3 bg-blue-50/80 border border-blue-100 rounded-2xl p-4">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-bold">Requirements</p>
              <p>Title, description and slug are required for each category.</p>
            </div>
          </div>

          {/* Form error banner */}
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm text-red-600 font-medium flex items-center gap-2">
              <CheckCircle2 size={14} className="rotate-45" />
              {formError}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category Title" icon={<Type size={14} />}>
              <Input
                placeholder="e.g. Graphic Design"
                value={category.name}
                disabled={loading}
                onChange={(e) => {
                  handleChange("name", e.target.value);
                  if (!isEdit && !category.slug) {
                    handleChange("slug", toSlug(e.target.value));
                  }
                }}
              />
            </Field>

            <Field label="Slug" icon={<Link2 size={14} />}>
              <Input
                placeholder="graphic-design"
                value={category.slug}
                disabled={loading}
                onChange={(e) => handleChange("slug", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Description" icon={<FileText size={14} />}>
            <Textarea
              placeholder="A brief description of this category…"
              value={category.description}
              disabled={loading}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Field>

          {/* Hero Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hero Configuration</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Hero Title">
                <Input
                  placeholder="The best of design"
                  value={category.heroTitle}
                  disabled={loading}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                />
              </Field>

              <Field label="Hero Subtitle">
                <Input
                  placeholder="Curated by our team"
                  value={category.heroSubtitle}
                  disabled={loading}
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Sections Editor */}
          <div className="space-y-4 pt-2">
            <button
              onClick={() => setSectionsOpen(!sectionsOpen)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gray-100 group-hover:bg-blue-200 transition-colors" />
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center gap-2">
                  <Layers size={12} />
                  Category Sections ({category.sections.length})
                </span>
                <div className="h-px flex-1 bg-gray-100 group-hover:bg-blue-200 transition-colors" />
              </div>
              <div className="ml-3 text-gray-400 group-hover:text-blue-500 transition-colors">
                {sectionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {sectionsOpen && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {category.sections.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/30 relative group/section">
                    <button
                      onClick={() => removeSection(index)}
                      className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/section:opacity-100"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="grid grid-cols-1 gap-4">
                      <Field label={`Section ${index + 1} Title`}>
                        <Input
                          placeholder="e.g. Design Principles"
                          value={section.title}
                          disabled={loading}
                          onChange={(e) => updateSection(index, "title", e.target.value)}
                        />
                      </Field>

                      <Field label={`Section ${index + 1} Description`}>
                        <Textarea
                          placeholder="What is this section about?"
                          rows={2}
                          value={section.description}
                          disabled={loading}
                          onChange={(e) => updateSection(index, "description", e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addSection}
                  disabled={loading}
                  className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Add New Section</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            {saved ? (
              <span className="text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Successfully Saved
              </span>
            ) : (
              <>Category will be set to <span className="font-bold text-green-600 uppercase">Active</span></>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-white border border-gray-200 rounded-2xl transition">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saved}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {saved ? "Saved!" : isEdit ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}