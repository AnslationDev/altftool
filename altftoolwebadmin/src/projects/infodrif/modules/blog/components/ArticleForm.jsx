"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
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
  CONTENT_BLOCK_LABELS,
  CONTENT_BLOCK_TYPES,
  EMPTY_ARTICLE,
  createBlogArticle,
  createEmptyBlock,
  createSlug,
  deleteBlogAuthorAvatar,
  deleteBlogBlockImage,
  deleteBlogArticleImage,
  deleteBlogHeroImage,
  subscribeBlogCategories,
  updateBlogArticle,
  uploadBlogAuthorAvatar,
  uploadBlogBlockImage,
  uploadBlogArticleImage,
  uploadBlogHeroImage,
} from "../service/blog.service";

const ROUTE = "/infodrif/blog";

const inputClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const textareaClass =
  "w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const monoTextareaClass = `${textareaClass} font-mono text-xs`;
const selectClass =
  "h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[var(--focus-ring)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground disabled:opacity-60";
const dashedButtonClass =
  "inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground";
const iconButtonClass =
  "grid h-8 w-8 place-items-center rounded-md border border-border text-muted transition hover:bg-surface-soft hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";

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

function Panel({ title, action, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Small inline uploader for a url/path pair. Always reports both values. */
function ImagePairField({ label, hint, url, path, upload, remove, onChange, onUploadingChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const setUploadingState = (next) => {
    setUploading(next);
    onUploadingChange?.(next);
  };

  async function handleUpload(file) {
    if (!file) return;
    setUploadingState(true);
    setProgress(0);
    try {
      const uploaded = await upload({ file, onProgress: setProgress });
      // Do not delete the previous blob here: the form may still be
      // discarded (unsaved-changes back navigation, etc.) before the outer
      // Save runs, and the Firestore document still points at it until
      // then. Only an explicit "Remove" click (handleRemove below) or
      // deleting the parent record should ever delete Storage blobs.
      onChange({ url: uploaded.url, path: uploaded.path });
      emitAlert({ type: "success", message: "Image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploadingState(false);
    }
  }

  async function handleRemove() {
    const previousPath = path;
    onChange({ url: "", path: "" });
    if (!previousPath) return;
    try {
      await remove(previousPath);
      emitAlert({ type: "success", message: "Image removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Image cleared from the form, but Storage cleanup failed.",
      });
    }
  }

  return (
    <Field label={label} hint={hint}>
      <div className="rounded-md border border-dashed border-border bg-surface-soft p-3">
        <div className="flex h-28 items-center justify-center overflow-hidden rounded-md border border-border bg-surface">
          {url ? (
            <img src={url} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted" />
          )}
        </div>
        {uploading ? (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
        <div className="mt-3 flex gap-2">
          <label className={`${primaryButtonClass} flex-1 cursor-pointer`}>
            <Upload className="h-3.5 w-3.5" />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />
          </label>
          {url ? (
            <button type="button" onClick={handleRemove} className={outlineButtonClass}>
              Remove
            </button>
          ) : null}
        </div>
        <input
          value={url || ""}
          onChange={(event) => onChange({ url: event.target.value, path })}
          className={`${inputClass} mt-2`}
          placeholder="https://... (or upload above)"
        />
      </div>
    </Field>
  );
}

/**
 * Block editor. `content` is an array of typed blocks — the public renderer
 * switches on `type`, so changing a block's type swaps which inputs show and
 * the service drops the keys that no longer belong.
 */
function BlockEditor({ blocks, onChange, onUploadingChange, emptyLabel }) {
  function updateBlock(index, patch) {
    onChange(blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)));
  }

  function changeType(index, type) {
    onChange(blocks.map((block, i) => (i === index ? createEmptyBlock(type) : block)));
  }

  function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeBlock(index) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function addBlock(type) {
    onChange([...blocks, createEmptyBlock(type)]);
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={index} className="rounded-md border border-border bg-surface-soft p-3">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary-soft px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {index + 1}
            </span>
            <select
              value={block.type}
              onChange={(event) => changeType(index, event.target.value)}
              className={selectClass}
              aria-label={`Block ${index + 1} type`}
            >
              {CONTENT_BLOCK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CONTENT_BLOCK_LABELS[type]}
                </option>
              ))}
            </select>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className={iconButtonClass}
                aria-label={`Move block ${index + 1} up`}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                className={iconButtonClass}
                aria-label={`Move block ${index + 1} down`}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-soft"
                aria-label={`Remove block ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <BlockBody
            block={block}
            index={index}
            onPatch={(patch) => updateBlock(index, patch)}
            onUploadingChange={onUploadingChange}
          />
        </div>
      ))}

      {!blocks.length ? (
        <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted">
          {emptyLabel || "No blocks yet. Add the first one below."}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {CONTENT_BLOCK_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className={dashedButtonClass}
          >
            <Plus className="h-3.5 w-3.5" />
            {CONTENT_BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockBody({ block, index, onPatch, onUploadingChange }) {
  if (block.type === "list") {
    const items = block.items?.length ? block.items : [""];
    return (
      <div className="space-y-2">
        {items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex gap-2">
            <input
              value={item}
              onChange={(event) =>
                onPatch({
                  items: items.map((entry, i) => (i === itemIndex ? event.target.value : entry)),
                })
              }
              className={inputClass}
              placeholder={`List item ${itemIndex + 1}`}
            />
            <button
              type="button"
              onClick={() => onPatch({ items: items.filter((_, i) => i !== itemIndex) })}
              disabled={items.length === 1}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Remove list item ${itemIndex + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onPatch({ items: [...items, ""] })}
          className={dashedButtonClass}
        >
          <Plus className="h-3.5 w-3.5" />
          Add list item
        </button>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="space-y-3">
        <ImagePairField
          label="Block image"
          url={block.imageUrl}
          path={block.imagePath}
          upload={uploadBlogBlockImage}
          remove={deleteBlogBlockImage}
          onUploadingChange={onUploadingChange}
          onChange={({ url, path }) => onPatch({ imageUrl: url, imagePath: path })}
        />
        <Field label="Caption">
          <input
            value={block.caption || ""}
            onChange={(event) => onPatch({ caption: event.target.value })}
            className={inputClass}
            placeholder="Teams collaborating to improve business workflows."
          />
        </Field>
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className="space-y-3">
        <Field label="Language">
          <input
            value={block.language || ""}
            onChange={(event) => onPatch({ language: event.target.value })}
            className={inputClass}
            placeholder="python"
          />
        </Field>
        <Field label="Code">
          <textarea
            rows={8}
            value={block.code || ""}
            onChange={(event) => onPatch({ code: event.target.value })}
            className={monoTextareaClass}
            placeholder="import runpod"
            spellCheck={false}
          />
        </Field>
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <div className="space-y-3">
        <Field label="Quote">
          <textarea
            rows={2}
            value={block.text || ""}
            onChange={(event) => onPatch({ text: event.target.value })}
            className={textareaClass}
            placeholder="Efficiency is doing better what is already being done."
          />
        </Field>
        <Field label="Quote author">
          <input
            value={block.author || ""}
            onChange={(event) => onPatch({ author: event.target.value })}
            className={inputClass}
            placeholder="Peter Drucker"
          />
        </Field>
      </div>
    );
  }

  if (block.type === "heading") {
    return (
      <input
        value={block.text || ""}
        onChange={(event) => onPatch({ text: event.target.value })}
        className={`${inputClass} font-semibold`}
        placeholder={`Heading ${index + 1}`}
      />
    );
  }

  return (
    <textarea
      rows={4}
      value={block.text || ""}
      onChange={(event) => onPatch({ text: event.target.value })}
      className={textareaClass}
      placeholder={`Paragraph ${index + 1}`}
    />
  );
}

export default function ArticleForm({ mode = "create", article = null }) {
  const router = useRouter();
  const isEdit = mode === "edit" && Boolean(article?.id);

  const [form, setForm] = useState(() => ({
    ...EMPTY_ARTICLE,
    ...article,
    author: { ...EMPTY_ARTICLE.author, ...(article?.author || {}) },
    tags: Array.isArray(article?.tags) ? article.tags : [],
    tableOfContents: Array.isArray(article?.tableOfContents) ? article.tableOfContents : [],
    content: Array.isArray(article?.content) ? article.content : [],
    whatsNext: {
      content: Array.isArray(article?.whatsNext?.content) ? article.whatsNext.content : [],
    },
    relatedArticles: Array.isArray(article?.relatedArticles) ? article.relatedArticles : [],
    active: article?.active !== false,
  }));
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagsDraft, setTagsDraft] = useState(() => (article?.tags || []).join(", "));

  // Once the user types in one of these, stop deriving it from title/excerpt.
  const [slugEdited, setSlugEdited] = useState(Boolean(article?.slug));
  const [seoTitleEdited, setSeoTitleEdited] = useState(Boolean(article?.seoTitle));
  const [seoDescriptionEdited, setSeoDescriptionEdited] = useState(Boolean(article?.seoDescription));

  useEffect(() => {
    return subscribeBlogCategories(
      (data) => setCategories(data.filter((category) => category.active !== false)),
      () => {},
    );
  }, []);

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

  function setAuthorField(key, value) {
    setForm((prev) => ({ ...prev, author: { ...prev.author, [key]: value } }));
  }

  function updateTocEntry(index, key, value) {
    setForm((prev) => ({
      ...prev,
      tableOfContents: prev.tableOfContents.map((entry, i) =>
        i === index ? { ...entry, [key]: value } : entry,
      ),
    }));
  }

  function addTocEntry() {
    setForm((prev) => ({
      ...prev,
      tableOfContents: [
        ...prev.tableOfContents,
        { title: "", anchor: "", order: prev.tableOfContents.length },
      ],
    }));
  }

  function removeTocEntry(index) {
    setForm((prev) => ({
      ...prev,
      tableOfContents: prev.tableOfContents.filter((_, i) => i !== index),
    }));
  }

  function updateRelated(index, key, value) {
    setForm((prev) => ({
      ...prev,
      relatedArticles: prev.relatedArticles.map((entry, i) =>
        i === index ? { ...entry, [key]: value } : entry,
      ),
    }));
  }

  function addRelated() {
    setForm((prev) => ({
      ...prev,
      relatedArticles: [
        ...prev.relatedArticles,
        {
          title: "",
          slug: "",
          date: "",
          category: "",
          imageUrl: "",
          imagePath: "",
          order: prev.relatedArticles.length,
        },
      ],
    }));
  }

  function removeRelated(index) {
    setForm((prev) => ({
      ...prev,
      relatedArticles: prev.relatedArticles.filter((_, i) => i !== index),
    }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.excerpt.trim()) nextErrors.excerpt = "Excerpt is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
    if (!form.content.length) nextErrors.content = "Add at least one content block.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      tags: tagsDraft
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    try {
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
          route: ROUTE,
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
          route: ROUTE,
        });
      }
      router.push(ROUTE);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTE)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-muted transition hover:bg-surface-soft hover:text-foreground"
            aria-label="Back to blog"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEdit ? "Edit Article" : "Add Article"}
            </h1>
            <p className="text-sm text-muted">
              {isEdit ? "Update this blog article." : "Publish a new Infodrif blog article."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-5">
            <Panel title="Article details">
              <Field label="Title" required error={errors.title}>
                <input
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  className={inputClass}
                  placeholder="How to Choose Affiliate Offers That Convert"
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

              <Field
                label="Slug"
                required
                error={errors.slug}
                hint="Derived from the title until you edit it."
              >
                <input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setField("slug", createSlug(event.target.value));
                  }}
                  className={inputClass}
                  placeholder="how-to-choose-affiliate-offers"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" required error={errors.category}>
                  <input
                    value={form.category}
                    onChange={(event) => setField("category", event.target.value)}
                    className={inputClass}
                    placeholder="Marketing Tips"
                    list="infodrif-blog-categories"
                  />
                  <datalist id="infodrif-blog-categories">
                    {categories.map((category) => (
                      <option key={category.id} value={category.title} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Tag" hint="The small pill on the card (e.g. News).">
                  <input
                    value={form.tag}
                    onChange={(event) => setField("tag", event.target.value)}
                    className={inputClass}
                    placeholder="News"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" hint="Free text — matches whatever the site displays.">
                  <input
                    value={form.date}
                    onChange={(event) => setField("date", event.target.value)}
                    className={inputClass}
                    placeholder="2026-05-18"
                  />
                </Field>
                <Field label="Read time">
                  <input
                    value={form.readTime}
                    onChange={(event) => setField("readTime", event.target.value)}
                    className={inputClass}
                    placeholder="6 min read"
                  />
                </Field>
              </div>

              <Field label="Tags" hint="Comma separated.">
                <input
                  value={tagsDraft}
                  onChange={(event) => setTagsDraft(event.target.value)}
                  className={inputClass}
                  placeholder="Business, Productivity, Growth"
                />
              </Field>
            </Panel>

            <Panel title="Author">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    value={form.author.name}
                    onChange={(event) => setAuthorField("name", event.target.value)}
                    className={inputClass}
                    placeholder="Sophia Williams"
                  />
                </Field>
                <Field label="Role">
                  <input
                    value={form.author.role}
                    onChange={(event) => setAuthorField("role", event.target.value)}
                    className={inputClass}
                    placeholder="Business Strategy Consultant"
                  />
                </Field>
              </div>
              <ImagePairField
                label="Avatar"
                url={form.author.avatarUrl}
                path={form.author.avatarPath}
                upload={uploadBlogAuthorAvatar}
                remove={deleteBlogAuthorAvatar}
                onUploadingChange={setUploading}
                onChange={({ url, path }) =>
                  setForm((prev) => ({
                    ...prev,
                    author: { ...prev.author, avatarUrl: url, avatarPath: path },
                  }))
                }
              />
            </Panel>

            <Panel title="Content">
              {errors.content ? (
                <span className="block text-xs font-medium text-danger">{errors.content}</span>
              ) : null}
              <BlockEditor
                blocks={form.content}
                onChange={(content) => setField("content", content)}
                onUploadingChange={setUploading}
                emptyLabel="No content blocks yet. Add a paragraph to get started."
              />
            </Panel>

            <Panel title="What's Next">
              <BlockEditor
                blocks={form.whatsNext.content}
                onChange={(content) => setForm((prev) => ({ ...prev, whatsNext: { content } }))}
                onUploadingChange={setUploading}
                emptyLabel="Optional closing section shown after the article body."
              />
            </Panel>

            <Panel
              title="Table of contents"
              action={
                <button type="button" onClick={addTocEntry} className={dashedButtonClass}>
                  <Plus className="h-3.5 w-3.5" />
                  Add entry
                </button>
              }
            >
              {form.tableOfContents.length ? (
                <div className="space-y-2">
                  {form.tableOfContents.map((entry, index) => (
                    <div
                      key={index}
                      className="grid gap-2 sm:grid-cols-[1.6fr_1fr_80px_40px]"
                    >
                      <input
                        value={entry.title || ""}
                        onChange={(event) => updateTocEntry(index, "title", event.target.value)}
                        className={inputClass}
                        placeholder="Title"
                      />
                      <input
                        value={entry.anchor || ""}
                        onChange={(event) => updateTocEntry(index, "anchor", event.target.value)}
                        className={inputClass}
                        placeholder="anchor"
                      />
                      <input
                        type="number"
                        min="0"
                        value={entry.order ?? index}
                        onChange={(event) => updateTocEntry(index, "order", event.target.value)}
                        className={inputClass}
                        aria-label={`Table of contents entry ${index + 1} order`}
                      />
                      <button
                        type="button"
                        onClick={() => removeTocEntry(index)}
                        className="grid h-10 w-10 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-soft"
                        aria-label={`Remove table of contents entry ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted">
                  No table of contents entries.
                </p>
              )}
            </Panel>

            <Panel
              title="Related articles"
              action={
                <button type="button" onClick={addRelated} className={dashedButtonClass}>
                  <Plus className="h-3.5 w-3.5" />
                  Add related
                </button>
              }
            >
              {form.relatedArticles.length ? (
                <div className="space-y-3">
                  {form.relatedArticles.map((entry, index) => (
                    <div key={index} className="rounded-md border border-border bg-surface-soft p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Field label="Title">
                          <input
                            value={entry.title || ""}
                            onChange={(event) => updateRelated(index, "title", event.target.value)}
                            className={inputClass}
                            placeholder="Getting Started with Serverless GPUs"
                          />
                        </Field>
                        <Field label="Slug">
                          <input
                            value={entry.slug || ""}
                            onChange={(event) =>
                              updateRelated(index, "slug", createSlug(event.target.value))
                            }
                            className={inputClass}
                            placeholder="getting-started-with-serverless-gpus"
                          />
                        </Field>
                        <Field label="Date">
                          <input
                            value={entry.date || ""}
                            onChange={(event) => updateRelated(index, "date", event.target.value)}
                            className={inputClass}
                            placeholder="January 20, 2025"
                          />
                        </Field>
                        <Field label="Category">
                          <input
                            value={entry.category || ""}
                            onChange={(event) =>
                              updateRelated(index, "category", event.target.value)
                            }
                            className={inputClass}
                            placeholder="Tutorial"
                          />
                        </Field>
                        <Field label="Image URL">
                          <input
                            value={entry.imageUrl || ""}
                            onChange={(event) =>
                              updateRelated(index, "imageUrl", event.target.value)
                            }
                            className={inputClass}
                            placeholder="https://..."
                          />
                        </Field>
                        <Field label="Order">
                          <input
                            type="number"
                            min="0"
                            value={entry.order ?? index}
                            onChange={(event) => updateRelated(index, "order", event.target.value)}
                            className={inputClass}
                          />
                        </Field>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeRelated(index)}
                          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted">
                  No related articles linked.
                </p>
              )}
            </Panel>

            <Panel title="SEO">
              <Field label="SEO title" hint="Defaults to the article title until you edit it.">
                <input
                  value={form.seoTitle}
                  onChange={(event) => {
                    setSeoTitleEdited(true);
                    setField("seoTitle", event.target.value);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="SEO description" hint="Defaults to the excerpt until you edit it.">
                <textarea
                  rows={3}
                  value={form.seoDescription}
                  onChange={(event) => {
                    setSeoDescriptionEdited(true);
                    setField("seoDescription", event.target.value);
                  }}
                  className={textareaClass}
                />
              </Field>
            </Panel>
          </section>

          <aside className="space-y-5">
            <Panel title="Card image">
              <ImagePairField
                label="Image"
                hint="Shown on the blog listing card."
                url={form.imageUrl}
                path={form.imagePath}
                upload={uploadBlogArticleImage}
                remove={deleteBlogArticleImage}
                onUploadingChange={setUploading}
                onChange={({ url, path }) =>
                  setForm((prev) => ({ ...prev, imageUrl: url, imagePath: path }))
                }
              />
            </Panel>

            <Panel title="Hero image">
              <ImagePairField
                label="Hero image"
                hint="Shown at the top of the article page."
                url={form.heroImageUrl}
                path={form.heroImagePath}
                upload={uploadBlogHeroImage}
                remove={deleteBlogHeroImage}
                onUploadingChange={setUploading}
                onChange={({ url, path }) =>
                  setForm((prev) => ({ ...prev, heroImageUrl: url, heroImagePath: path }))
                }
              />
            </Panel>

            <Panel title="Publishing">
              <Field label="Order">
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(event) => setField("order", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Status">
                <button
                  type="button"
                  onClick={() => setField("active", !form.active)}
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
            </Panel>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className={`${primaryButtonClass} w-full`}
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
