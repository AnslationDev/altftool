"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { createBlog, updateBlog } from "../services/blogService";
import { emitAlert } from "@/lib/alertBus";
import ImageUpload from "../../../components/ImageUpload";

const INITIAL = {
  title: "",
  slug: "",
  category: "Marketing",
  excerpt: "",
  content: "",
  image: "",
  tags: "",
  author: "",
  authorAvatar: "",
  status: "draft",
};

const CATEGORIES = [
  "Marketing", "Digital Marketing", "SEO Tools", "Affiliate Marketing",
  "Reviews", "Advertising", "Email Marketing", "Social Media",
  "Ecommerce", "AI Marketing", "Web Hosting", "Career",
];

function generateSlug(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-");
}

export default function AddBlogModal({ existingBlog, onClose, onSaved }) {
  const isEdit = Boolean(existingBlog);
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingBlog) {
      setForm({
        title: existingBlog.title || "",
        slug: existingBlog.slug || "",
        category: existingBlog.category || "Marketing",
        excerpt: existingBlog.excerpt || "",
        content: (existingBlog.content || []).join("\n\n"),
        image: existingBlog.image || "",
        tags: Array.isArray(existingBlog.tags) ? existingBlog.tags.join(", ") : "",
        author: existingBlog.author?.name || existingBlog.author || "",
        authorAvatar: existingBlog.author?.avatar || "",
        status: existingBlog.status || "draft",
      });
    }
  }, [existingBlog]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !isEdit) {
        next.slug = generateSlug(value);
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (!form.excerpt.trim()) errs.excerpt = "Excerpt is required";
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
        title: form.title.trim(),
        slug: form.slug.trim(),
        category: form.category,
        excerpt: form.excerpt.trim(),
        content: form.content.split("\n\n").filter(Boolean),
        image: form.image.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        author: { name: form.author.trim() || "Marketys Editorial", avatar: form.authorAvatar.trim() },
        status: form.status,
      };

      if (isEdit) {
        await updateBlog(existingBlog.id, data);
        emitAlert({ type: "success", message: "Blog updated successfully" });
      } else {
        const docRef = await createBlog(data);
        data.id = docRef.id;
        emitAlert({ type: "success", message: "Blog created successfully" });
      }
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      emitAlert({ type: "error", message: isEdit ? "Failed to update blog" : "Failed to create blog" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl mt-12 mb-12 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Blog" : "Add Blog"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => handleChange("title", e.target.value)}
                className={`w-full rounded-lg border ${errors.title ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt *</label>
              <textarea value={form.excerpt} onChange={(e) => handleChange("excerpt", e.target.value)} rows={2}
                className={`w-full rounded-lg border ${errors.excerpt ? "border-red-400" : "border-gray-300"} px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Content (paragraphs separated by blank line)</label>
              <textarea value={form.content} onChange={(e) => handleChange("content", e.target.value)} rows={8}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono" />
            </div>

            <div>
              <ImageUpload value={form.image} onChange={(v) => handleChange("image", v)} label="Image" folder="marketys/blogs" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Author</label>
              <input value={form.author} onChange={(e) => handleChange("author", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>

            <div>
              <ImageUpload value={form.authorAvatar} onChange={(v) => handleChange("authorAvatar", v)} label="Author Avatar" folder="marketys/blogs/authors" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => handleChange("tags", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => handleChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Update Blog" : "Create Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
