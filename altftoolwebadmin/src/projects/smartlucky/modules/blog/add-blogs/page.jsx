"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { createBlog, isSlugTaken } from "../services/blogsService";

function generateSlug(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-");
}

export default function AddBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    heading: "",
    slug: "",
    category: "",
    author: "Smart Lucky Editorial",
    excerpt: "",
    content: "",
    image: "",
    status: "draft",
    tags: "",
    seoTitle: "",
    seoDescription: "",
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleHeadingChange = (value) => {
    set("heading", value);
    if (!form.slug || form.slug === generateSlug(form.heading)) {
      set("slug", generateSlug(value));
    }
  };

  const [preview, setPreview] = useState(false);

  const handleSave = async () => {
    const { heading, slug } = form;
    if (!heading.trim()) {
      emitAlert({ type: "error", title: "Validation", message: "Blog title is required." });
      return;
    }
    if (!slug.trim()) {
      emitAlert({ type: "error", title: "Validation", message: "Slug is required." });
      return;
    }

    try {
      const taken = await isSlugTaken(slug);
      if (taken) {
        emitAlert({ type: "error", title: "Slug taken", message: "This slug is already in use. Please choose another." });
        return;
      }
    } catch {
      // best-effort
    }

    setSaving(true);
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      await createBlog({
        heading: form.heading,
        title: form.heading,
        slug: form.slug,
        category: form.category,
        author: form.author,
        excerpt: form.excerpt,
        description: form.content,
        content: form.content,
        image: form.image,
        status: form.status,
        tags,
        seoTitle: form.seoTitle || form.heading,
        seoDescription: form.seoDescription || form.excerpt,
        date: new Date().toISOString().split("T")[0],
        sources: [],
        sourceNotes: "",
        views: 0,
        likesCount: 0,
        commentsCount: 0,
      });
      emitAlert({ type: "success", title: "Created", message: "Blog post created successfully." });
      router.push("/smartlucky/blog");
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not create blog." });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2";
  const labelClass = "mb-1.5 block text-xs font-semibold tracking-wide";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/smartlucky/blog")}
              className="rounded-lg p-2 transition hover:opacity-80"
              style={{ color: "var(--muted)" }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="truncate text-lg font-extrabold sm:text-xl" style={{ color: "var(--foreground)" }}>New Blog Post</h1>
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>Create a new blog post for Smart Lucky.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(!preview)}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:opacity-80"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--foreground)" }}>
              <Eye size={14} /> {preview ? "Edit" : "Preview"}
            </button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {preview ? (
        <div className="rounded-xl border p-6 sm:p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          {form.image && (
            <img src={form.image} alt="" className="w-full h-48 object-cover rounded-lg mb-6" />
          )}
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>{form.heading || "Untitled"}</h1>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>By {form.author} | {new Date().toLocaleDateString()}</p>
          {form.excerpt && (
            <p className="text-sm mb-4 italic" style={{ color: "var(--muted)" }}>{form.excerpt}</p>
          )}
          <div className="prose prose-sm max-w-none" style={{ color: "var(--foreground)" }}>
            {form.content.split("\n").map((p, i) => <p key={i} className="mb-3">{p}</p>)}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>Title *</label>
                <input value={form.heading} onChange={(e) => handleHeadingChange(e.target.value)}
                  className={inputClass} placeholder="Enter blog title"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>Slug *</label>
                <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
                  className={inputClass} placeholder="blog-post-slug"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ color: "var(--muted)" }}>Category</label>
                  <input value={form.category} onChange={(e) => set("category", e.target.value)}
                    className={inputClass} placeholder="e.g. Casino, Poker, Slots"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className={labelClass} style={{ color: "var(--muted)" }}>Author</label>
                  <input value={form.author} onChange={(e) => set("author", e.target.value)}
                    className={inputClass}
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)}
                  className={inputClass}
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Content</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                  className={inputClass} rows={2} placeholder="Brief summary of the blog post"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", resize: "vertical" }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>Content (body)</label>
                <textarea value={form.content} onChange={(e) => set("content", e.target.value)}
                  className={inputClass} rows={12} placeholder="Write your blog content here..."
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", resize: "vertical" }} />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Media</h3>
            <div>
              <label className={labelClass} style={{ color: "var(--muted)" }}>Featured Image URL</label>
              <input value={form.image} onChange={(e) => set("image", e.target.value)}
                className={inputClass} placeholder="https://example.com/image.jpg"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
              {form.image && (
                <div className="mt-2 rounded-lg overflow-hidden border w-48 h-32"
                  style={{ borderColor: "var(--border)" }}>
                  <img src={form.image} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>SEO Title</label>
                <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)}
                  className={inputClass} placeholder="SEO optimized title"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>SEO Description</label>
                <textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)}
                  className={inputClass} rows={2} placeholder="Meta description for search results"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", resize: "vertical" }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: "var(--muted)" }}>Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
                  className={inputClass} placeholder="casino, poker, strategy"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
