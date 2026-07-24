"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Star } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const COLLECTION = "projects/marketys/reviews";

const INITIAL = {
  title: "",
  category: "SEO & Research",
  rating: 5,
  summary: "",
  author: "",
  role: "",
  result: "",
  resultLabel: "",
};

const CATEGORIES = [
  "SEO & Research", "Design & Content", "Email Marketing",
  "Marketing", "eCommerce", "Hosting", "Productivity",
];

export default function AddReviewModal({ existingReview, onClose, onSaved }) {
  const isEdit = Boolean(existingReview);
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingReview) {
      setForm({
        title: existingReview.title || "",
        category: existingReview.category || "SEO & Research",
        rating: existingReview.rating || 5,
        summary: existingReview.summary || "",
        author: existingReview.author || "",
        role: existingReview.role || "",
        result: existingReview.result || "",
        resultLabel: existingReview.resultLabel || "",
      });
    }
  }, [existingReview]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.summary.trim()) errs.summary = "Summary is required";
    if (!form.author.trim()) errs.author = "Author is required";
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
        ...form,
        title: form.title.trim(),
        summary: form.summary.trim(),
        author: form.author.trim(),
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateDoc(doc(db, COLLECTION, existingReview.id), data);
        emitAlert({ type: "success", message: "Review updated" });
      } else {
        data.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, COLLECTION), data);
        data.id = ref.id;
        emitAlert({ type: "success", message: "Review created" });
      }
      onSaved?.(data);
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: isEdit ? "Failed to update review" : "Failed to create review" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl mt-12 mb-12 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Review" : "Add Review"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => handleChange("title", e.target.value)}
                className={`w-full rounded-lg border ${errors.title ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => handleChange("rating", star)}
                    className="p-0.5 transition hover:scale-110">
                    <Star className={`h-5 w-5 ${star <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Summary *</label>
              <textarea value={form.summary} onChange={(e) => handleChange("summary", e.target.value)} rows={3}
                className={`w-full rounded-lg border ${errors.summary ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.summary && <p className="mt-1 text-xs text-red-500">{errors.summary}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Author *</label>
              <input value={form.author} onChange={(e) => handleChange("author", e.target.value)}
                className={`w-full rounded-lg border ${errors.author ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <input value={form.role} onChange={(e) => handleChange("role", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Result (e.g. +38%)</label>
              <input value={form.result} onChange={(e) => handleChange("result", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Result Label</label>
              <input value={form.resultLabel} onChange={(e) => handleChange("resultLabel", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Update Review" : "Create Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
