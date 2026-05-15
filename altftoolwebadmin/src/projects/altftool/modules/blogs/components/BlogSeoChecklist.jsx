"use client";

import { AlertCircle, CheckCircle2, Link2, SearchCheck, Sparkles } from "lucide-react";
import { parseSourcesText } from "./BlogSourceEditor";

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

function hasFaqContent(html = "") {
  return /FAQ_ITEM|FAQ_Q|FAQ_A|<!--\s*FAQ Start\s*-->/i.test(String(html || ""));
}

function getParagraphs(html = "") {
  const matches = [...String(html).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  if (matches.length) return matches;
  return stripHtml(html)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getWordCount(value = "") {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
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

export function getBlogContentQuality({ formData = {}, imageAlt = "", hasImage = false } = {}) {
  const paragraphs = getParagraphs(formData.description);
  const plainContent = stripHtml(formData.description);
  const wordCount = getWordCount(formData.description);
  const metaTitleLength = String(formData.seoTitle || "").trim().length;
  const metaDescriptionLength = String(formData.seoDescription || "").trim().length;
  const tags = parseBlogTags(formData.tags);
  const slugPreview = getSlugPreview(formData.heading || "");
  const headingCount = countMatches(formData.description, /<h[2-3]\b/gi);
  const internalLinkCount = countMatches(formData.description, /href=["']\/(?:tools|blogs|buysmart|extensions|top|news)/gi);
  const totalLinkCount = countMatches(formData.description, /<a\b/gi);
  const imageCount = countMatches(formData.description, /<img\b/gi) + (hasImage ? 1 : 0);
  const altLength = String(imageAlt || "").trim().length;
  const firstParagraphWords = getWordCount(paragraphs[0] || plainContent.slice(0, 360));
  const longParagraphCount = paragraphs.filter((paragraph) => getWordCount(paragraph) > 120).length;
  const hasConclusion = /conclusion|final thoughts|summary|wrap up|bottom line/i.test(plainContent);
  const hasAuthoredFaq = hasFaqContent(formData.description);
  const hasTrustMetadata = Boolean(
    String(formData.authorRole || "").trim() ||
    String(formData.reviewedBy || "").trim() ||
    String(formData.editorialNote || "").trim()
  );
  const sourceCount = parseSourcesText(formData.sourcesText || formData.sources || "").length;
  const hasReviewDate = Boolean(formData.reviewedAt || formData.updatedAt);
  const schemaFieldCount = [
    formData.heading,
    formData.author,
    formData.date,
    formData.category,
    formData.seoDescription,
  ].filter((value) => String(value || "").trim()).length;
  const hasStructuredSchemaBase = schemaFieldCount >= 5 && imageCount >= 1;

  const checks = [
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
      label: "Readable depth",
      detail: `${wordCount} words`,
      done: wordCount >= 300,
    },
    {
      label: "Strong intro",
      detail: `${firstParagraphWords} intro words`,
      done: firstParagraphWords >= 35 && firstParagraphWords <= 120,
    },
    {
      label: "Section headings",
      detail: `${headingCount} H2/H3 headings`,
      done: headingCount >= 2,
    },
    {
      label: "Scannable paragraphs",
      detail: `${longParagraphCount} long paragraphs`,
      done: longParagraphCount === 0 && paragraphs.length >= 2,
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
      label: "Visual support",
      detail: `${imageCount} image${imageCount === 1 ? "" : "s"}`,
      done: imageCount >= 1,
    },
    {
      label: "Image alt text",
      detail: `${altLength}/125 characters`,
      done: altLength >= 5 && altLength <= 125,
    },
    {
      label: "Clear ending",
      detail: hasConclusion ? "Conclusion found" : "Add a summary section",
      done: hasConclusion,
    },
    {
      label: "Authored FAQ",
      detail: hasAuthoredFaq ? "FAQ schema source found" : "Add FAQ builder block",
      done: hasAuthoredFaq,
    },
    {
      label: "Trust metadata",
      detail: hasTrustMetadata ? "Author/reviewer context found" : "Add role, reviewer, or note",
      done: hasTrustMetadata,
    },
    {
      label: "Cited sources",
      detail: `${sourceCount} source${sourceCount === 1 ? "" : "s"}`,
      done: sourceCount >= 1,
    },
    {
      label: "Review date",
      detail: hasReviewDate ? "Freshness date found" : "Mark reviewed today",
      done: hasReviewDate,
    },
    {
      label: "Schema metadata",
      detail: `${schemaFieldCount}/5 article fields`,
      done: hasStructuredSchemaBase,
    },
  ];

  const suggestions = [
    !checks[2].done ? "Add more practical detail, examples, or step-by-step guidance." : null,
    !checks[3].done ? "Start with a concise intro that names the reader problem and the outcome." : null,
    !checks[5].done ? "Split long paragraphs so the article is easier to scan on mobile." : null,
    !checks[6].done ? "Add at least one internal link to a relevant tool, blog, deal, or extension." : null,
    tags.length < 3 ? "Add 3-6 topic tags for search, archives, and related posts." : null,
    totalLinkCount === 0 ? "Add one helpful outbound or internal reference where it supports the article." : null,
    !hasConclusion ? "Finish with a short conclusion or final thoughts section." : null,
    !hasAuthoredFaq ? "Add a short FAQ block so the public page can output authored FAQ schema." : null,
    !hasTrustMetadata ? "Add author role, reviewed by, or an editorial note to strengthen trust signals." : null,
    sourceCount < 1 ? "Add at least one source so the public article can show a reference block and citation schema." : null,
    !hasReviewDate ? "Use Refresh Actions to mark the article reviewed after updates." : null,
    !hasStructuredSchemaBase ? "Complete heading, author, date, category, SEO description, and featured image for rich Article schema." : null,
  ].filter(Boolean);

  return {
    checks,
    score: Math.round((checks.filter((check) => check.done).length / checks.length) * 100),
    suggestions,
    metrics: {
      wordCount,
      headingCount,
      internalLinkCount,
      longParagraphCount,
      tags: tags.length,
      sourceCount,
    },
  };
}

export function getBlogSeoChecklist({ formData = {}, imageAlt = "", hasImage = false } = {}) {
  return getBlogContentQuality({ formData, imageAlt, hasImage }).checks;
}

export default function BlogSeoChecklist({ formData, imageAlt, hasImage }) {
  const quality = getBlogContentQuality({ formData, imageAlt, hasImage });
  const checks = quality.checks;
  const doneCount = checks.filter((check) => check.done).length;
  const score = quality.score;
  const blockingCount = checks.length - doneCount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Quality & SEO</h2>
          <p className="mt-1 text-xs text-gray-500">Publish-ready score for search, social, and reading flow.</p>
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

      {quality.suggestions.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-blue-600">
            <Sparkles className="h-3.5 w-3.5" />
            Next improvements
          </div>
          <div className="space-y-1.5">
            {quality.suggestions.slice(0, 3).map((suggestion) => (
              <p key={suggestion} className="text-xs leading-5 text-blue-700">
                {suggestion}
              </p>
            ))}
          </div>
        </div>
      )}

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
