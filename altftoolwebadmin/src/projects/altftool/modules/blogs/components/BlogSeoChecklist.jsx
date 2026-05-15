"use client";

import { AlertCircle, CheckCircle2, Link2, SearchCheck } from "lucide-react";

export function parseBlogTags(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((tag) => String(tag).trim()).filter(Boolean))];
  }

  return [
    ...new Set(
      String(value || "")
        .split(/[,\n]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countMatches(value = "", pattern) {
  return (String(value).match(pattern) || []).length;
}

function getSlugPreview(heading = "") {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBlogSeoChecklist({ formData = {}, imageAlt = "", hasImage = false } = {}) {
  const plainContent = stripHtml(formData.description);
  const wordCount = plainContent ? plainContent.split(/\s+/).filter(Boolean).length : 0;
  const metaTitleLength = String(formData.seoTitle || "").trim().length;
  const metaDescriptionLength = String(formData.seoDescription || "").trim().length;
  const tags = parseBlogTags(formData.tags);
  const slugPreview = getSlugPreview(formData.heading || "");
  const headingCount = countMatches(formData.description, /<h[2-3]\b/gi);
  const internalLinkCount = countMatches(formData.description, /href=["']\/(?:tools|blogs|buysmart|extensions|top|news)/gi);
  const altLength = String(imageAlt || "").trim().length;

  return [
    {
      label: "Search title",
      detail: `${metaTitleLength}/60 characters`,
      done: metaTitleLength >= 50 && metaTitleLength <= 60,
    },
    {
      label: "Meta description",
      detail: `${metaDescriptionLength}/160 characters`,
      done: metaDescriptionLength >= 120 && metaDescriptionLength <= 160,
    },
    {
      label: "Readable content",
      detail: `${wordCount} words`,
      done: wordCount >= 300,
    },
    {
      label: "Section headings",
      detail: `${headingCount} H2/H3 headings`,
      done: headingCount >= 2,
    },
    {
      label: "Internal links",
      detail: `${internalLinkCount} AltFTool links`,
      done: internalLinkCount >= 1,
    },
    {
      label: "Topic tags",
      detail: `${tags.length} tags`,
      done: tags.length >= 3,
    },
    {
      label: "Clean slug",
      detail: slugPreview ? `${slugPreview.length} characters` : "Generated from heading",
      done: slugPreview.length >= 8 && slugPreview.length <= 75,
    },
    {
      label: "Featured image",
      detail: hasImage ? "Ready" : "Missing",
      done: hasImage,
    },
    {
      label: "Image alt text",
      detail: `${altLength}/125 characters`,
      done: altLength >= 5 && altLength <= 125,
    },
  ];
}

export default function BlogSeoChecklist({ formData, imageAlt, hasImage }) {
  const checks = getBlogSeoChecklist({ formData, imageAlt, hasImage });
  const doneCount = checks.filter((check) => check.done).length;
  const score = Math.round((doneCount / checks.length) * 100);
  const blockingCount = checks.length - doneCount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">SEO Checklist</h2>
          <p className="mt-1 text-xs text-gray-500">Publish-ready score for search, social, and reading quality.</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-600">
          {score}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${score >= 80 ? "bg-green-500" : score >= 55 ? "bg-amber-400" : "bg-red-400"}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-start justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className={check.done ? "font-semibold text-gray-700" : "font-semibold text-gray-500"}>
                {check.label}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400">{check.detail}</p>
            </div>
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${check.done ? "bg-green-100" : "bg-amber-100"}`}>
              {check.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-[11px]">
        <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-2.5 py-2 text-gray-500">
          <SearchCheck className="h-3.5 w-3.5 text-blue-500" />
          {doneCount}/{checks.length} ready
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-2.5 py-2 text-gray-500">
          <Link2 className="h-3.5 w-3.5 text-blue-500" />
          {blockingCount} to improve
        </div>
      </div>
    </div>
  );
}
