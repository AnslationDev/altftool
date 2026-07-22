"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  EMPTY_ARTICLE,
  createBlogArticle,
  createSlug,
  deleteBlogArticleImage,
  updateBlogArticle,
  uploadBlogArticleImage,
} from "../service/blog.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = `${inputClass} resize-none`;

function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function ArticleForm({ mode = "create", article = null }) {
  const router = useRouter();
  const isEdit = mode === "edit" && Boolean(article?.id);

  const [form, setForm] = useState(() => ({
    ...EMPTY_ARTICLE,
    ...article,
    content:
      Array.isArray(article?.content) && article.content.length ? article.content : [""],
    active: article?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [slugEdited, setSlugEdited] = useState(Boolean(article?.slug));
  const [seoTitleEdited, setSeoTitleEdited] = useState(Boolean(article?.seoTitle));
  const [seoDescriptionEdited, setSeoDescriptionEdited] = useState(Boolean(article?.seoDescription));

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title") {
        if (!slugEdited) next.slug = createSlug(value);
        if (!seoTitleEdited) next.seoTitle = value;
      }
      if (key === "excerpt" && !seoDescriptionEdited) next.seoDescription = value;
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updateParagraph(index, value) {
    setForm((prev) => {
      const content = [...prev.content];
      content[index] = value;
      return { ...prev, content };
    });
  }

  function addParagraph() {
    setForm((prev) => ({ ...prev, content: [...prev.content, ""] }));
  }

  function removeParagraph(index) {
    setForm((prev) => ({
      ...prev,
      content: prev.content.length > 1 ? prev.content.filter((_, i) => i !== index) : prev.content,
    }));
  }

  async function handleImageUpload(file) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadBlogArticleImage({ file, onProgress: setUploadProgress });
      const oldPath = form.imagePath;
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      if (oldPath) {
        try {
          await deleteBlogArticleImage(oldPath);
        } catch {
          emitAlert({ type: "warning", message: "New image uploaded, but old image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Article image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteBlogArticleImage(path);
      emitAlert({ type: "success", message: "Article image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!form.author.trim()) nextErrors.author = "Author is required.";
    if (!form.date) nextErrors.date = "Date is required.";
    if (!form.excerpt.trim()) nextErrors.excerpt = "Excerpt is required.";
    if (!form.content.some((paragraph) => paragraph.trim())) {
      nextErrors.content = "At least one paragraph of content is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        content: form.content.map((paragraph) => paragraph.trim()).filter(Boolean),
      };
      if (isEdit) {
        await updateBlogArticle(article.id, payload);
        emitAlert({ type: "success", message: "Article updated." });
        logAuditEvent({
          module: "blog",
          action: "BLOG_UPDATE",
          entityType: "blogArticle",
          entityId: article.id,
          summary: `Updated blog article ${form.title}`,
          changes: payload,
          route: "/campaignastra/blog",
        });
      } else {
        const id = await createBlogArticle(payload);
        emitAlert({ type: "success", message: "Article created." });
        logAuditEvent({
          module: "blog",
          action: "BLOG_CREATE",
          entityType: "blogArticle",
          entityId: id,
          summary: `Created blog article ${form.title}`,
          changes: payload,
          route: "/campaignastra/blog",
        });
      }
      router.push("/campaignastra/blog");
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/campaignastra/blog")}
            className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            aria-label="Back to blog"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Article" : "Add Article"}
            </h1>
            <p className="text-sm text-gray-500">
              {isEdit ? "Update this blog article." : "Publish a new Campaignastra blog article."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-5">
            <Panel title="Article details">
              <Field label="Title" required error={errors.title}>
                <input
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  className={inputClass}
                  placeholder="How to plan your next product launch"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" required error={errors.category}>
                  <input
                    value={form.category}
                    onChange={(event) => setField("category", event.target.value)}
                    className={inputClass}
                    placeholder="Strategy"
                  />
                </Field>
                <Field label="Author" required error={errors.author}>
                  <input
                    value={form.author}
                    onChange={(event) => setField("author", event.target.value)}
                    className={inputClass}
                    placeholder="Author name"
                  />
                </Field>
              </div>

              <Field label="Date" required error={errors.date}>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setField("date", event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Slug">
                <input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setField("slug", createSlug(event.target.value));
                  }}
                  className={inputClass}
                  placeholder="how-to-plan-your-next-product-launch"
                />
              </Field>

              <Field label="Excerpt" required error={errors.excerpt}>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) => setField("excerpt", event.target.value)}
                  className={textareaClass}
                  placeholder="Short summary shown in the blog listing..."
                />
              </Field>
            </Panel>

            <Panel title="Content">
              <div className="space-y-3">
                {form.content.map((paragraph, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      rows={4}
                      value={paragraph}
                      onChange={(event) => updateParagraph(index, event.target.value)}
                      className={`${textareaClass} flex-1`}
                      placeholder={`Paragraph ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeParagraph(index)}
                      disabled={form.content.length === 1}
                      className="h-fit rounded-lg border border-gray-200 p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Remove paragraph ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.content ? (
                <span className="block text-xs font-medium text-red-500">{errors.content}</span>
              ) : null}
              <button
                type="button"
                onClick={addParagraph}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add paragraph
              </button>
            </Panel>

            <Panel title="SEO">
              <Field label="SEO title">
                <input
                  value={form.seoTitle}
                  onChange={(event) => {
                    setSeoTitleEdited(true);
                    setField("seoTitle", event.target.value);
                  }}
                  className={inputClass}
                  placeholder="Defaults to the article title"
                />
              </Field>
              <Field label="SEO description">
                <textarea
                  rows={3}
                  value={form.seoDescription}
                  onChange={(event) => {
                    setSeoDescriptionEdited(true);
                    setField("seoDescription", event.target.value);
                  }}
                  className={textareaClass}
                  placeholder="Defaults to the excerpt"
                />
              </Field>
            </Panel>
          </section>

          <aside className="space-y-5">
            <Panel title="Featured image">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt={form.title || "Article image"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                {uploading ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gray-900 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(event) => handleImageUpload(event.target.files?.[0])}
                    />
                  </label>
                  {form.imageUrl ? (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </Panel>

            <Panel title="Status">
              <button
                type="button"
                onClick={() => setField("active", !form.active)}
                className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold transition ${
                  form.active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Panel>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Update Article" : "Publish Article"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
