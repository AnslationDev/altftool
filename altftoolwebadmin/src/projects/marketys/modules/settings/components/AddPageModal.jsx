"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const COLLECTION = "projects/marketys/pages";

const ICON_OPTIONS = [
  { value: "Sparkles", label: "Sparkles" },
  { value: "ShieldCheck", label: "ShieldCheck" },
  { value: "FileText", label: "FileText" },
  { value: "Mail", label: "Mail" },
  { value: "HelpCircle", label: "HelpCircle" },
];

const DEFAULT_SECTION = { title: "", body: "" };

export default function AddPageModal({ pageId, existingPage, onClose, onSaved }) {
  const [form, setForm] = useState({
    badge: existingPage?.badge || "",
    title: existingPage?.title || "",
    intro: existingPage?.intro || "",
    icon: existingPage?.icon || "Sparkles",
    sections: existingPage?.sections?.length > 0
      ? existingPage.sections.map((s) => ({ title: s.title || "", body: s.body || "" }))
      : [{ title: "", body: "" }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSectionChange = (index, field, value) => {
    setForm((prev) => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], [field]: value };
      return { ...prev, sections };
    });
  };

  const addSection = () => {
    setForm((prev) => ({ ...prev, sections: [...prev.sections, { ...DEFAULT_SECTION }] }));
  };

  const removeSection = (index) => {
    if (form.sections.length <= 1) return;
    setForm((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
  };

  const validate = () => {
    const errs = {};
    if (!form.badge.trim()) errs.badge = "Badge is required";
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.intro.trim()) errs.intro = "Intro is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const data = {
        badge: form.badge.trim(),
        title: form.title.trim(),
        intro: form.intro.trim(),
        icon: form.icon,
        sections: form.sections.filter((s) => s.title.trim() || s.body.trim()),
        updatedAt: serverTimestamp(),
        createdAt: existingPage?.createdAt || serverTimestamp(),
      };

      await setDoc(doc(db, COLLECTION, pageId), data);
      emitAlert({ type: "success", message: "Page updated" });
      onSaved?.({ id: pageId, ...data });
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to update page" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl mt-12 mb-12 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Edit {existingPage?.title || pageId}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Badge *</label>
              <input value={form.badge} onChange={(e) => handleChange("badge", e.target.value)}
                className={`w-full rounded-lg border ${errors.badge ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.badge && <p className="mt-1 text-xs text-red-500">{errors.badge}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Icon</label>
              <select value={form.icon} onChange={(e) => handleChange("icon", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full rounded-lg border ${errors.title ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Intro *</label>
            <textarea value={form.intro} onChange={(e) => handleChange("intro", e.target.value)} rows={3}
              className={`w-full rounded-lg border ${errors.intro ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
            {errors.intro && <p className="mt-1 text-xs text-red-500">{errors.intro}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Sections</label>
              <button type="button" onClick={addSection}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
            </div>
            <div className="space-y-3">
              {form.sections.map((section, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Section {i + 1}</span>
                    {form.sections.length > 1 && (
                      <button type="button" onClick={() => removeSection(i)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <input value={section.title} onChange={(e) => handleSectionChange(i, "title", e.target.value)}
                    placeholder="Section title"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  <textarea value={section.body} onChange={(e) => handleSectionChange(i, "body", e.target.value)}
                    placeholder="Section body" rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
