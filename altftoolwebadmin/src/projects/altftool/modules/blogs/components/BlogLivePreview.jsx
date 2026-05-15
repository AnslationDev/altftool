"use client";

import {
  AlertCircle,
  Calendar,
  Clock3,
  Eye,
  FileText,
  ImageIcon,
  Monitor,
  Search,
  Smartphone,
  Tags,
} from "lucide-react";
import { useMemo, useState } from "react";
import { parseBlogTags } from "./BlogSeoChecklist";

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizePreviewHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\shref=(["'])javascript:[\s\S]*?\1/gi, ' href="#"');
}

function generateSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function BlogLivePreview({
  formData = {},
  imagePreview = "",
  imageAlt = "",
}) {
  const [mode, setMode] = useState("desktop");

  const preview = useMemo(() => {
    const heading = formData.heading?.trim() || "Untitled blog preview";
    const category = formData.category?.trim() || "Category";
    const author = formData.author?.trim() || "AltFTool Editorial";
    const authorRole = formData.authorRole?.trim() || "Editorial";
    const plainContent = stripHtml(formData.description || "");
    const wordCount = plainContent ? plainContent.split(/\s+/).filter(Boolean).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 180));
    const slug = generateSlug(heading);
    const excerpt = formData.seoDescription?.trim() || plainContent.slice(0, 155);
    const seoTitle = formData.seoTitle?.trim() || heading;
    const tags = parseBlogTags(formData.tags || "").slice(0, 5);
    const html = sanitizePreviewHtml(formData.description || "<p>Start writing to see the article body preview here.</p>");
    const warnings = [
      !formData.heading?.trim() ? "Heading missing" : null,
      !formData.category?.trim() ? "Category missing" : null,
      !formData.seoDescription?.trim() ? "Meta description missing" : null,
      !imagePreview ? "Featured image missing" : null,
      imagePreview && !imageAlt?.trim() ? "Image alt text missing" : null,
      wordCount > 0 && wordCount < 300 ? "Article is still thin" : null,
    ].filter(Boolean);

    return {
      author,
      authorRole,
      category,
      excerpt,
      heading,
      html,
      readTime,
      seoTitle,
      slug,
      tags,
      warnings,
      wordCount,
    };
  }, [formData, imageAlt, imagePreview]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Live Preview</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Public page, SEO snippet, and reading health before publish.
          </p>
        </div>
        <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          {[
            { value: "desktop", icon: Monitor, label: "Desktop preview" },
            { value: "mobile", icon: Smartphone, label: "Mobile preview" },
          ].map((item) => {
            const Icon = item.icon;
            const active = mode === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
                title={item.label}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  active ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat icon={FileText} label="Words" value={preview.wordCount} />
        <Stat icon={Clock3} label="Read" value={`${preview.readTime}m`} />
        <Stat icon={Tags} label="Tags" value={preview.tags.length} />
      </div>

      <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <Search className="h-3.5 w-3.5" />
          Search Result
        </div>
        <p className="truncate text-[11px] text-emerald-700">altftool.com/blogs/{preview.slug || "new-blog"}</p>
        <p className="mt-1 line-clamp-1 text-sm font-semibold text-blue-700">{preview.seoTitle}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
          {preview.excerpt || "Add an SEO description so Google and social previews have a clear summary."}
        </p>
      </div>

      <div className={`mx-auto transition-all ${mode === "mobile" ? "max-w-[280px]" : "max-w-full"}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="relative flex h-36 items-end bg-gray-100">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt={imageAlt || preview.heading}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="relative p-3 text-white">
              <span className="inline-flex h-6 items-center rounded-lg bg-blue-600 px-2 text-[10px] font-bold uppercase tracking-wide">
                {preview.category}
              </span>
              <h3 className="mt-2 line-clamp-2 text-base font-bold leading-tight">{preview.heading}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-white/80">
                <span>{preview.author}</span>
                <span className="h-1 w-1 rounded-full bg-white/35" />
                <span>{preview.authorRole}</span>
                <span className="h-1 w-1 rounded-full bg-white/35" />
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(formData.date)}
                </span>
              </div>
            </div>
          </div>

          <div className="max-h-56 overflow-hidden p-4">
            <div
              className="space-y-3 text-sm leading-6 text-gray-700 [&_a]:font-semibold [&_a]:text-blue-600 [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_img]:rounded-xl [&_li]:ml-4 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: preview.html }}
            />
          </div>
        </div>
      </div>

      {preview.warnings.length ? (
        <div className="mt-4 space-y-2">
          {preview.warnings.slice(0, 4).map((warning) => (
            <div key={warning} className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {warning}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          Preview looks publish-ready.
        </div>
      )}
    </div>
  );
}
