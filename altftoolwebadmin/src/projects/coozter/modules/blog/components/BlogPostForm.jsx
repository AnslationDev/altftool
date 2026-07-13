"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
  Upload,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import CoozterBlogEditor from "./CoozterBlogEditor";
import {
  EMPTY_BLOG_POST,
  createBlogPost,
  createSlug,
  updateBlogPost,
  uploadBlogImage,
} from "../service/blog.service";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";
const textareaClass =
  "w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";

export default function BlogPostForm({ mode = "create", post = null }) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    ...EMPTY_BLOG_POST,
    ...post,
    body: Array.isArray(post?.body) ? post.body : [],
    contentHtml: getInitialContentHtml(post),
    seo: { ...EMPTY_BLOG_POST.seo, ...(post?.seo || {}) },
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [slugEdited, setSlugEdited] = useState(Boolean(post?.slug));

  function setField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !slugEdited) next.slug = createSlug(value);
      if (field === "title" && !prev.seo.metaTitle)
        next.seo = { ...next.seo, metaTitle: `${value} | Coozter` };
      if (field === "excerpt" && !prev.seo.metaDescription)
        next.seo = { ...next.seo, metaDescription: value };
      if (field === "slug" && !next.seo.canonicalUrl)
        next.seo = { ...next.seo, canonicalUrl: `/blogs/${createSlug(value)}` };
      if (field === "status") next.published = value === "published";
      return next;
    });
    clearError(field);
  }

  function setSeoField(field, value) {
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));
    clearError(`seo.${field}`);
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Please upload an image file." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadBlogImage({
        file,
        onProgress: setUploadProgress,
      });
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url }));
      emitAlert({ type: "success", message: "Blog image uploaded." });
    } catch (error) {
      emitAlert({
        type: "error",
        message: error?.message || "Image upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  function validate() {
    const nextErrors = {};
    [
      "title",
      "slug",
      "category",
      "author",
      "excerpt",
      "imageUrl",
      "imageAlt",
      "readTime",
      "displayDate",
      "date",
    ].forEach((field) => {
      if (!String(form[field] || "").trim()) nextErrors[field] = "Required";
    });
    if (!stripHtml(form.contentHtml).trim())
      nextErrors.contentHtml = "Required";
    if (!String(form.seo.metaTitle || "").trim())
      nextErrors["seo.metaTitle"] = "Required";
    if (!String(form.seo.metaDescription || "").trim())
      nextErrors["seo.metaDescription"] = "Required";
    if (!String(form.seo.canonicalUrl || "").trim())
      nextErrors["seo.canonicalUrl"] = "Required";
    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (mode === "edit") {
        await updateBlogPost(post.id, preparePostPayload(form));
        emitAlert({ type: "success", message: "Blog post updated." });
      } else {
        await createBlogPost(preparePostPayload(form));
        emitAlert({ type: "success", message: "Blog post created." });
      }
      router.push("/coozter/blog");
    } catch (error) {
      emitAlert({
        type: "error",
        message: error?.message || "Failed to save blog post.",
      });
    } finally {
      setSaving(false);
    }
  }

  function clearError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/coozter/blog"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === "edit" ? "Edit Blog Post" : "Add Blog Post"}
              </h1>
              <p className="text-sm text-[var(--muted)]">
                projects/coozter/blogs/{mode === "edit" ? post?.id : "{blogId}"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving || uploading}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Post
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-5">
            <Panel title="Post Fields">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title" error={errors.title}>
                  <input
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                {/* <Field label="Slug" error={errors.slug}>
                  <input
                    value={form.slug}
                    onChange={(event) => {
                      setSlugEdited(true);
                      setField("slug", createSlug(event.target.value));
                    }}
                    className={inputClass}
                  />
                </Field> */}
                <Field label="Category" error={errors.category}>
                  <input
                    value={form.category}
                    onChange={(event) =>
                      setField("category", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Author" error={errors.author}>
                  <input
                    value={form.author}
                    onChange={(event) => setField("author", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Read time" error={errors.readTime}>
                  <input
                    value={form.readTime}
                    onChange={(event) =>
                      setField("readTime", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                {/* <Field label="Display date" error={errors.displayDate}>
                  <input
                    value={form.displayDate}
                    onChange={(event) =>
                      setField("displayDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field> */}
                <Field label="Date" error={errors.date}>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => setField("date", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Order">
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(event) => setField("order", event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Excerpt" error={errors.excerpt}>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) => setField("excerpt", event.target.value)}
                  className={textareaClass}
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  className={textareaClass}
                />
              </Field>
              <Field label="Blog content" error={errors.contentHtml}>
                <CoozterBlogEditor
                  value={form.contentHtml}
                  onChange={(value) => setField("contentHtml", value)}
                  error={errors.contentHtml}
                />
              </Field>
              <Field label="Pull quote">
                <textarea
                  rows={3}
                  value={form.pullQuote}
                  onChange={(event) =>
                    setField("pullQuote", event.target.value)
                  }
                  className={textareaClass}
                />
              </Field>
            </Panel>

            <Panel title="SEO">
              <Field label="Meta title" error={errors["seo.metaTitle"]}>
                <input
                  value={form.seo.metaTitle}
                  onChange={(event) =>
                    setSeoField("metaTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field
                label="Meta description"
                error={errors["seo.metaDescription"]}
              >
                <textarea
                  rows={3}
                  value={form.seo.metaDescription}
                  onChange={(event) =>
                    setSeoField("metaDescription", event.target.value)
                  }
                  className={textareaClass}
                />
              </Field>
              {/* <Field label="Canonical URL" error={errors["seo.canonicalUrl"]}>
                <input
                  value={form.seo.canonicalUrl}
                  onChange={(event) =>
                    setSeoField("canonicalUrl", event.target.value)
                  }
                  className={inputClass}
                />
              </Field> */}
            </Panel>
          </section>

          <aside className="space-y-5">
            <Panel title="Status">
              <select
                value={form.status}
                onChange={(event) => setField("status", event.target.value)}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) =>
                    setField(
                      "status",
                      event.target.checked ? "published" : "draft",
                    )
                  }
                />
                Published
              </label>
            </Panel>

            <Panel title="Image">
              <div className="grid h-44 place-items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.imageAlt || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-[var(--muted)]" />
                )}
              </div>
              <Field label="Image URL" error={errors.imageUrl}>
                <input
                  value={form.imageUrl}
                  onChange={(event) => setField("imageUrl", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]">
                <Upload className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => uploadImage(event.target.files?.[0])}
                />
              </label>
              {uploading ? (
                <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full bg-[var(--primary)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              ) : null}
              <Field label="Image alt" error={errors.imageAlt}>
                <input
                  value={form.imageAlt}
                  onChange={(event) => setField("imageAlt", event.target.value)}
                  className={inputClass}
                />
              </Field>
              {/* <Field label="Image fallback text">
                <input
                  value={form.image}
                  onChange={(event) => setField("image", event.target.value)}
                  className={inputClass}
                />
              </Field> */}
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}

function getInitialContentHtml(post) {
  if (post?.contentHtml || post?.bodyHtml)
    return post.contentHtml || post.bodyHtml;
  if (typeof post?.body === "string") return post.body;
  if (Array.isArray(post?.body)) {
    return post.body
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .map((item) =>
        /<[a-z][\s\S]*>/i.test(item) ? item : `<p>${escapeHtml(item)}</p>`,
      )
      .join("");
  }
  return "";
}

function preparePostPayload(form) {
  const body = htmlToParagraphs(form.contentHtml);
  return {
    ...form,
    contentHtml: form.contentHtml,
    body,
  };
}

function htmlToParagraphs(html) {
  return stripHtml(html)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote|tr)>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-[var(--danger)]">
          {error}
        </span>
      ) : null}
    </div>
  );
}
