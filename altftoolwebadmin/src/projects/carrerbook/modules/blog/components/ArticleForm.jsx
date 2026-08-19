"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Globe2,
  Image as ImageIcon,
  Info,
  Loader2,
  PlusCircle,
  Save,
  Search,
  Tag,
  Trash2,
  Type,
  UploadCloud,
  User,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import CareerBookBlogEditor from "./CareerBookBlogEditor";
import CtaButtonPicker from "./CtaButtonPicker";
import {
  EMPTY_ARTICLE,
  createBlogArticle,
  createBlogCategory,
  createSlug,
  deleteBlogImage,
  subscribeBlogCategories,
  updateBlogArticle,
  uploadBlogImage,
} from "../service/blog.service";

const teal = "bg-[#079684] hover:bg-[#087e70]";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#079684] focus:ring-2 focus:ring-[#079684]/10";
const textareaClass = "w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#079684] focus:ring-2 focus:ring-[#079684]/10";

export default function ArticleForm({ mode = "create", article = null }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [quickCategory, setQuickCategory] = useState("");
  const [form, setForm] = useState(() => ({
    ...EMPTY_ARTICLE,
    ...article,
    date: article?.date || "",
    status: article?.status || "draft",
    active: article?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [seoOpen, setSeoOpen] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(article?.slug));
  const draftKey = mode === "edit" && article?.id
    ? `careerbook-blog-edit-${article.id}`
    : "careerbook-blog-new";

  useEffect(() => {
    const unsub = subscribeBlogCategories(
      (items) => setCategories(items.filter((item) => item.active !== false)),
      () => emitAlert({ type: "error", message: "Failed to load blog categories." }),
    );
    return () => unsub();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === form.categoryId),
    [categories, form.categoryId],
  );

  const checklist = [
    ["Heading", Boolean(form.title.trim())],
    ["Author", Boolean(form.author.trim())],
    ["Category", Boolean(form.categoryId)],
    ["Date", Boolean(form.date)],
    ["Content", Boolean(form.content.trim())],
    ["Meta Title (50-60 chars)", form.seoTitle.trim().length >= 40],
    ["SEO Description", Boolean(form.seoDescription.trim())],
    ["Featured Image", Boolean(form.imageUrl)],
    ["Image Alt Text", !form.imageUrl || Boolean(form.imageAlt.trim())],
  ];

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugEdited) next.slug = createSlug(value);
      if (key === "title" && !prev.seoTitle) next.seoTitle = value;
      if (key === "excerpt" && !prev.seoDescription) next.seoDescription = value;
      if (key === "categoryId") {
        const category = categories.find((item) => item.id === value);
        next.categoryName = category?.name || "";
      }
      if (key === "status") next.active = value === "published";
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function addQuickCategory() {
    const name = quickCategory.trim();
    if (!name) return;
    try {
      await createBlogCategory({ name, slug: createSlug(name), order: categories.length + 1, active: true });
      setQuickCategory("");
      emitAlert({ type: "success", message: "Category added." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to add category." });
    }
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Featured image must be an image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Featured image must be 8MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadBlogImage({ file, onProgress: setUploadProgress });
      if (form.imagePath) {
        try {
          await deleteBlogImage(form.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "New image uploaded, but old image cleanup failed." });
        }
      }
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Featured image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteBlogImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  function validate(status) {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Heading is required.";
    if (!form.author.trim()) nextErrors.author = "Author is required.";
    if (!form.date) nextErrors.date = "Display date is required.";
    if (!form.categoryId) nextErrors.categoryId = "Select a category.";
    if (!form.content.trim()) nextErrors.content = "Content is required.";
    if (status === "published" && !form.excerpt.trim()) nextErrors.excerpt = "Excerpt is required before publishing.";
    if (form.imageUrl && !form.imageAlt.trim()) nextErrors.imageAlt = "Image alt text is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function save(status = "published") {
    if (!validate(status)) return;
    status === "draft" ? setSavingDraft(true) : setSaving(true);
    try {
      const payload = {
        ...form,
        status,
        active: status === "published",
        categoryName: selectedCategory?.name || form.categoryName,
        seoTitle: form.seoTitle || form.title,
        seoDescription: form.seoDescription || form.excerpt,
      };
      if (mode === "edit") {
        await updateBlogArticle(article.id, payload, article._collection);
        emitAlert({ type: "success", message: status === "published" ? "Blog updated." : "Draft saved." });
      } else {
        await createBlogArticle(payload);
        emitAlert({ type: "success", message: status === "published" ? "Blog published." : "Draft saved." });
      }
      router.push("/carrerbook/blog");
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save blog." });
    } finally {
      setSaving(false);
      setSavingDraft(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <BlogTopNav />

      <main className="mx-auto max-w-[1800px] px-8 py-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/carrerbook/blog")} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">{mode === "edit" ? "Edit Blog Post" : "New Blog Post"}</h1>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                <Info className="h-3 w-3" /> Auto-saved at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{form.status === "published" ? "Published" : "Draft"}</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_570px]">
          <section className="space-y-5">
            <Panel title="Post Details">
              <Field label="Heading" icon={<Type className="h-3.5 w-3.5" />} required error={errors.title}>
                <input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="Enter a compelling blog heading..." />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Author" icon={<User className="h-3.5 w-3.5" />} required error={errors.author}>
                  <input value={form.author} onChange={(event) => setField("author", event.target.value)} className={inputClass} placeholder="Author name" />
                </Field>
                <Field label="Display Date" icon={<Calendar className="h-3.5 w-3.5" />} required error={errors.date}>
                  <input type="date" value={form.date} onChange={(event) => setField("date", event.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Category" icon={<FileText className="h-3.5 w-3.5" />} required error={errors.categoryId}>
                <select value={form.categoryId} onChange={(event) => setField("categoryId", event.target.value)} className={inputClass}>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={`${category._collection}-${category.id}`} value={category.id}>{category.name}</option>)}
                </select>
              </Field>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input value={quickCategory} onChange={(event) => setQuickCategory(event.target.value)} className={inputClass} placeholder="Quick add category" />
                <button onClick={addQuickCategory} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white ${teal}`}>Add Category</button>
              </div>
            </Panel>

            <Panel title="Button Picker">
              <CtaButtonPicker
                onInsert={(html) =>
                  setField(
                    "content",
                    `${form.content || ""}${form.content?.trim() ? "\n\n" : ""}${html}`,
                  )
                }
              />
            </Panel>

            <Panel title="Content">
              <Field label="Excerpt" error={errors.excerpt}>
                <textarea value={form.excerpt} onChange={(event) => setField("excerpt", event.target.value)} rows={3} className={textareaClass} placeholder="Short blog summary..." />
              </Field>
              <Field label="Blog Content" error={errors.content}>
                <CareerBookBlogEditor value={form.content} onChange={(value) => setField("content", value)} error={errors.content} draftKey={draftKey} />
              </Field>
            </Panel>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <button onClick={() => setSeoOpen((value) => !value)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                  <Search className="h-4 w-4" /> SEO Settings
                  <span className="flex gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /></span>
                </span>
                <span className="text-xs font-semibold text-slate-500">{seoOpen ? "Hide" : "Show"}</span>
              </button>
              {seoOpen ? (
                <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-2">
                  <Field label="Meta Title">
                    <input value={form.seoTitle} onChange={(event) => setField("seoTitle", event.target.value)} className={inputClass} placeholder="Meta title" />
                  </Field>
                  <Field label="SEO Description">
                    <textarea value={form.seoDescription} onChange={(event) => setField("seoDescription", event.target.value)} rows={3} className={textareaClass} placeholder="SEO description" />
                  </Field>
                  <Field label="Slug">
                    <input
                      value={form.slug}
                      onChange={(event) => {
                        setSlugEdited(true);
                        setField("slug", createSlug(event.target.value));
                      }}
                      className={inputClass}
                    />
                  </Field>
                </div>
              ) : null}
            </section>
          </section>

          <aside className="space-y-5">
            <Panel title="Publish">
              <button onClick={() => save("draft")} disabled={savingDraft || saving} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Draft
              </button>
              <button onClick={() => save("published")} disabled={saving || savingDraft || uploading} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${teal}`}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe2 className="h-4 w-4" />} Publish Blog
              </button>
              <div className="mt-3 rounded-xl border border-teal-200 bg-teal-100/70 px-3 py-2 text-xs font-medium text-teal-700">
                Draft is auto-saved locally every 2 seconds.
              </div>
            </Panel>

            <Panel title="Featured Image" required>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                {form.imageUrl ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <img src={form.imageUrl} alt={form.imageAlt || "Featured image"} className="h-48 w-full object-cover" />
                  </div>
                ) : (
                  <label className="flex min-h-[118px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl text-slate-500">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100"><UploadCloud className="h-4 w-4" /></span>
                    <span className="text-xs font-bold">Drop or browse</span>
                    <span className="text-[10px] font-medium">JPG, PNG, WebP - Max 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
                  </label>
                )}
              </div>
              {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-[#079684]" style={{ width: `${uploadProgress}%` }} /></div> : null}
              <div className="mt-3 flex gap-2">
                <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white ${teal}`}>
                  <ImageIcon className="h-4 w-4" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
                </label>
                {form.imageUrl ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button> : null}
              </div>
              <Field label="Image Alt Text" error={errors.imageAlt}>
                <input value={form.imageAlt} onChange={(event) => setField("imageAlt", event.target.value)} className={inputClass} placeholder="Describe the image" />
              </Field>
            </Panel>

            <Panel title="Checklist">
              <div className="space-y-2">
                {checklist.map(([label, done]) => (
                  <div key={label} className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{label}</span>
                    {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-3 w-3 rounded-full bg-slate-100" />}
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </div>
      </main>
    </div>
  );
}

function BlogTopNav() {
  return (
    <header className="border-b border-slate-900 bg-white">
      <div className="mx-auto flex h-[64px] max-w-[960px] items-center justify-between px-6">
        <nav className="flex items-center gap-12">
          <span className="text-sm font-black text-slate-950">Blogs</span>
          <Link href="/carrerbook/blog" className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-[#079684]">
            <FileText className="h-3.5 w-3.5" /> All Blogs
          </Link>
          <Link href="/carrerbook/blog/add-article" className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-white ${teal}`}>
            <PlusCircle className="h-3.5 w-3.5" /> Add New Blog
          </Link>
        </nav>
        <Link href="/carrerbook/blog" className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-white ${teal}`}>
          <Tag className="h-3.5 w-3.5" /> Add Category
        </Link>
      </div>
    </header>
  );
}

function Panel({ title, required, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        {title}{required ? <span className="text-red-500">*</span> : null}
        <span className="h-px flex-1 bg-slate-100" />
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, icon, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
        {icon}{label}{required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}
