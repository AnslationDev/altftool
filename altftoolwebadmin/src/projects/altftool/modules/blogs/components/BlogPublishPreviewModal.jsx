"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  Save,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return cleanText(String(value || "").replace(/<[^>]*>/g, " "));
}

export function normalizeBlogSlug(value = "") {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeComparable(value = "") {
  return cleanText(value).toLowerCase();
}

export function buildBlogDuplicateIssues({
  blogs = [],
  currentBlogId = "",
  heading = "",
  slug = "",
} = {}) {
  const normalizedSlug = normalizeBlogSlug(slug || heading);
  const normalizedTitle = normalizeComparable(heading);
  const issues = [];

  blogs
    .filter((blog) => String(blog?.id || "") !== String(currentBlogId || ""))
    .forEach((blog) => {
      const blogSlug = normalizeBlogSlug(blog?.slug || blog?.heading || blog?.title || "");
      const blogTitle = normalizeComparable(blog?.heading || blog?.title || "");
      if (normalizedSlug && blogSlug === normalizedSlug) {
        issues.push({
          key: `slug-${blog.id}`,
          label: "Duplicate slug",
          detail: `${blog.heading || blog.title || "Untitled blog"} already uses /blogs/${normalizedSlug}.`,
        });
      }
      if (normalizedTitle && blogTitle === normalizedTitle) {
        issues.push({
          key: `title-${blog.id}`,
          label: "Duplicate title",
          detail: `${blog.heading || blog.title || "Untitled blog"} has the same title.`,
        });
      }
    });

  return issues;
}

function normalizeFieldValue(key, value) {
  if (key === "description") return stripHtml(value).slice(0, 240);
  if (Array.isArray(value)) return value.join(", ");
  return cleanText(value);
}

export function buildBlogChangeSummary({
  current = {},
  original = null,
  imageAlt = "",
  originalImageAlt = "",
  imageChanged = false,
  mode = "create",
} = {}) {
  const fields = [
    { key: "heading", label: "Heading" },
    { key: "category", label: "Category" },
    { key: "author", label: "Author" },
    { key: "date", label: "Display date" },
    { key: "seoTitle", label: "SEO title" },
    { key: "seoDescription", label: "SEO description" },
    { key: "tags", label: "Tags" },
    { key: "reviewedBy", label: "Reviewer" },
    { key: "sourcesText", label: "Sources" },
    { key: "description", label: "Content" },
  ];

  if (!original || mode === "create") {
    return fields
      .map((field) => ({
        key: field.key,
        label: field.label,
        after: normalizeFieldValue(field.key, current[field.key]),
        before: "",
      }))
      .filter((item) => item.after)
      .slice(0, 8);
  }

  const changes = fields
    .map((field) => {
      const before = normalizeFieldValue(field.key, original[field.key]);
      const after = normalizeFieldValue(field.key, current[field.key]);
      return before !== after ? { key: field.key, label: field.label, before, after } : null;
    })
    .filter(Boolean);

  if (cleanText(imageAlt) !== cleanText(originalImageAlt)) {
    changes.push({ key: "imageAlt", label: "Image alt text", before: cleanText(originalImageAlt), after: cleanText(imageAlt) });
  }
  if (imageChanged) {
    changes.push({ key: "image", label: "Featured image", before: original?.image ? "Existing image" : "No image", after: "New image selected" });
  }

  return changes.slice(0, 10);
}

function statusTone(score = 0) {
  if (score >= 85) return "bg-green-50 text-green-700 border-green-100";
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-red-50 text-red-600 border-red-100";
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-gray-800">{value || "Not set"}</p>
    </div>
  );
}

export default function BlogPublishPreviewModal({
  changedFields = [],
  duplicateIssues = [],
  finalSlug = "",
  formData = {},
  mode = "publish",
  onCancel,
  onConfirm,
  open = false,
  pending = false,
  publishGate = null,
}) {
  if (!open) return null;

  const isPublish = mode === "published";
  const gateScore = publishGate?.score || 0;
  const warnings = publishGate?.warningIssues || [];
  const blockers = publishGate?.blockingIssues || [];
  const hasDuplicates = duplicateIssues.length > 0;
  const canConfirm = !pending && !hasDuplicates && (!isPublish || blockers.length === 0);
  const Icon = isPublish ? Globe : Save;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isPublish ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-700"}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Final check</p>
              <h2 className="mt-1 text-xl font-black text-gray-900">{isPublish ? "Publish preview" : "Save draft preview"}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">Review slug, changed fields, duplicate checks, and quality status before saving.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DetailRow label="Title" value={formData.heading} />
            <DetailRow label="Status" value={isPublish ? "Published" : "Draft"} />
            <DetailRow label="Final slug" value={`/blogs/${finalSlug || normalizeBlogSlug(formData.heading) || "untitled"}`} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
            <section className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">Changed fields</p>
                  <h3 className="mt-1 text-base font-black text-gray-900">{changedFields.length || "No"} updates</h3>
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>

              <div className="mt-3 space-y-2">
                {changedFields.length ? (
                  changedFields.map((field) => (
                    <div key={field.key} className="rounded-xl bg-gray-50 px-3 py-2">
                      <p className="text-xs font-black text-gray-700">{field.label}</p>
                      {field.before ? <p className="mt-1 line-clamp-1 text-[11px] text-gray-400">Before: {field.before}</p> : null}
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">After: {field.after || "Empty"}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">No tracked field changes.</div>
                )}
              </div>
            </section>

            <aside className="space-y-3">
              <div className={`rounded-2xl border px-4 py-3 ${statusTone(gateScore)}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wider">Publish gate</p>
                  {blockers.length ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                </div>
                <p className="mt-2 text-2xl font-black">{publishGate ? gateScore : "..."}</p>
                <p className="mt-1 text-xs font-semibold">
                  {blockers.length ? `${blockers.length} blocker${blockers.length === 1 ? "" : "s"}` : `${warnings.length} warning${warnings.length === 1 ? "" : "s"}`}
                </p>
              </div>

              <div className={`rounded-2xl border px-4 py-3 ${hasDuplicates ? "border-red-100 bg-red-50 text-red-600" : "border-green-100 bg-green-50 text-green-700"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wider">Duplicate guard</p>
                  {hasDuplicates ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <p className="mt-2 text-sm font-black">{hasDuplicates ? `${duplicateIssues.length} issue${duplicateIssues.length === 1 ? "" : "s"}` : "Clear"}</p>
                <p className="mt-1 text-xs font-semibold">{hasDuplicates ? "Fix title or slug before saving." : "No matching slug/title found."}</p>
              </div>
            </aside>
          </div>

          {duplicateIssues.length ? (
            <section className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">Resolve duplicates</p>
              <div className="mt-2 space-y-1.5">
                {duplicateIssues.slice(0, 4).map((issue) => (
                  <p key={issue.key} className="text-sm leading-6 text-red-700">
                    <span className="font-black">{issue.label}:</span> {issue.detail}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          {warnings.length ? (
            <section className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wider text-amber-700">Publish warnings</p>
              <div className="mt-2 space-y-1.5">
                {warnings.slice(0, 5).map((warning) => (
                  <p key={warning.key} className="text-sm leading-6 text-amber-700">
                    <span className="font-black">{warning.label}:</span> {warning.detail}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Review more
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
            {pending ? "Saving..." : isPublish ? "Confirm publish" : "Confirm draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
