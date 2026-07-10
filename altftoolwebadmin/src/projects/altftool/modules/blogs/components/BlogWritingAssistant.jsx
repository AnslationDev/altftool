"use client";

import {
  Check,
  CheckCircle2,
  FileText,
  HelpCircle,
  PenLine,
  PlusCircle,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { emitAlert } from "@/lib/alertBus";
import { parseBlogTags } from "./BlogSeoChecklist";

/* ── Attached-helper markers ─────────────────────────────────────────────
   Block helpers wrap their HTML in comment markers. The blog content itself
   is the single source of truth: a helper is "attached" when its marker is
   present in the draft, so the state survives refreshes, draft restores, and
   editing sessions — and removal is always exact. Comments are invisible on
   the public blog. */
const MARKER_PREFIX = "ALTFT_WRITING_HELPER";
const startMarker = (id) => `<!-- ${MARKER_PREFIX}:${id} START -->`;
const endMarker = (id) => `<!-- ${MARKER_PREFIX}:${id} END -->`;
const wrapHelperBlock = (id, html) => `${startMarker(id)}\n${html}\n${endMarker(id)}`;
const hasHelperBlock = (description = "", id) => String(description).includes(startMarker(id));

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeHelperBlock(description = "", id) {
  const pattern = new RegExp(
    `[ \\t]*${escapeRegExp(startMarker(id))}[\\s\\S]*?${escapeRegExp(endMarker(id))}[ \\t]*`,
    "g",
  );
  return String(description).replace(pattern, "").replace(/\n{3,}/g, "\n\n").trim();
}

const normalizeFieldValue = (value = "") => String(value ?? "").replace(/\s+/g, " ").trim();

function fieldsMatch(formData = {}, fields = {}) {
  const entries = Object.entries(fields);
  if (!entries.length) return false;
  return entries.every(([key, suggested]) => {
    const current = normalizeFieldValue(formData[key]);
    return current !== "" && current === normalizeFieldValue(suggested);
  });
}

const clearedFields = (fields = {}) =>
  Object.fromEntries(Object.keys(fields).map((key) => [key, ""]));

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "best",
  "blog",
  "can",
  "for",
  "from",
  "guide",
  "how",
  "into",
  "online",
  "that",
  "the",
  "this",
  "tool",
  "tools",
  "use",
  "using",
  "with",
  "your",
]);

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceCase(value = "") {
  const text = String(value).trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimToSentence(value = "", maxLength = 158) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength).replace(/\s+\S*$/, "");
  return clipped.replace(/[.,;:!?-]+$/, "");
}

function getKeywords(formData = {}) {
  const source = [
    formData.heading,
    formData.category,
    formData.tags,
    stripHtml(formData.description || "").slice(0, 900),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const counts = new Map();
  source
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word)
    .slice(0, 6);
}

function buildMetaTitle(formData = {}) {
  const heading = formData.heading?.trim() || "AltFTool practical guide";
  if (heading.length >= 50 && heading.length <= 60) return heading;

  const withBrand = `${heading} | AltFTool Guide`;
  if (withBrand.length <= 60) return withBrand;
  return trimToSentence(heading, 60);
}

function buildMetaDescription(formData = {}) {
  const heading = formData.heading?.trim() || "this AltFTool guide";
  const plain = stripHtml(formData.description || "");
  const contentLead = trimToSentence(plain, 132);

  if (contentLead.length >= 120 && contentLead.length <= 160) return contentLead;

  const category = formData.category?.trim() || "digital tools";
  return trimToSentence(
    `Learn ${heading.toLowerCase()} with practical steps, key checks, and quick tips for ${category.toLowerCase()} workflows on AltFTool.`,
    158
  );
}

function buildTags(formData = {}) {
  const current = parseBlogTags(formData.tags || "");
  const category = formData.category?.trim();
  const keywords = getKeywords(formData).map((word) => word.replace(/-/g, " "));
  return [...new Set([category, ...current, ...keywords].filter(Boolean))].slice(0, 6);
}

function buildIntro(formData = {}) {
  const heading = formData.heading?.trim() || "This guide";
  const category = formData.category?.trim() || "digital work";

  return `<p><strong>${heading}</strong> gives you a practical way to handle ${category.toLowerCase()} without wasting time. Use this guide to understand the main steps, avoid common mistakes, and move from decision to action faster.</p>`;
}

function buildConclusion(formData = {}) {
  const heading = formData.heading?.trim() || "this guide";

  return `<h2>Final thoughts</h2><p>${sentenceCase(heading)} works best when the next step is clear. Review the checklist above, compare the related resources, and keep the workflow simple enough to repeat whenever you need it.</p>`;
}

function buildTrustFields(formData = {}) {
  const category = formData.category?.trim();
  return {
    authorRole: category ? `${category} Guide Editor` : "AltFTool Editorial",
    reviewedBy: "AltFTool Editorial Team",
    editorialNote: "Reviewed for clarity, freshness, practical usefulness, and reader-safe recommendations.",
  };
}

function buildFaqBlock(formData = {}) {
  const heading = formData.heading?.trim() || "this guide";
  const category = formData.category?.trim() || "AltFTool";
  const summary = buildMetaDescription(formData);
  const questions = [
    {
      q: `What is ${heading} about?`,
      a: summary,
    },
    {
      q: `Who should read this ${category} guide?`,
      a: `This guide is useful for readers who want a quick, practical way to understand ${heading.toLowerCase()} and apply the advice without extra setup.`,
    },
    {
      q: `How should I use this guide?`,
      a: "Start with the key steps, check the examples, then use the related AltFTool resources to complete the workflow faster.",
    },
  ];

  const items = questions
    .map(
      (item) => `
  <div class="FAQ_ITEM">
    <button class="FAQ_Q">
      <span>${escapeHtml(item.q)}</span>
      <span class="FAQ_ICON"></span>
    </button>
    <div class="FAQ_A">
      <p>${escapeHtml(item.a)}</p>
    </div>
  </div>`,
    )
    .join("");

  return `<!-- FAQ Start -->
<h2 class="FAQ_HEADING">Frequently asked questions</h2>
<div class="FAQ_WRAPPER" data-icon="plus">
${items}

</div>
<!-- FAQ End -->`;
}

function HelperButton({ icon: Icon, label, caption, attached, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={attached}
      aria-label={attached ? `Remove ${label}` : `Add ${label}`}
      title={attached ? `Remove "${label}" from this post` : `Add "${label}" to this post`}
      className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        attached
          ? "border-primary bg-primary-soft shadow-sm"
          : "border-border bg-surface-soft/70 hover:border-primary hover:bg-primary-soft"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors duration-200 ${
          attached ? "bg-primary text-white" : "bg-surface text-primary"
        }`}
      >
        {attached ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`block truncate text-sm font-semibold transition-colors duration-200 ${
              attached ? "text-primary" : "text-foreground group-hover:text-primary"
            }`}
          >
            {label}
          </span>
          {attached && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <CheckCircle2 className="h-3 w-3" />
              Added
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted">{caption}</span>
        {attached && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-danger opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <X className="h-3 w-3" />
            Click to remove
          </span>
        )}
      </span>
    </button>
  );
}

export default function BlogWritingAssistant({
  formData = {},
  onApplyFields,
  onInsertBlock,
}) {
  // Field helpers remember what they last applied so the "Added" state stays
  // visible even if the underlying suggestion drifts as the draft evolves.
  const [appliedFields, setAppliedFields] = useState({});

  const suggestions = useMemo(() => {
    const tags = buildTags(formData);

    return {
      metaTitle: buildMetaTitle(formData),
      metaDescription: buildMetaDescription(formData),
      tags,
      intro: buildIntro(formData),
      conclusion: buildConclusion(formData),
      faq: buildFaqBlock(formData),
      trustFields: buildTrustFields(formData),
    };
  }, [formData]);

  const description = formData.description || "";

  /* ── Helper definitions — one array drives buttons, state, add, and remove ── */
  const helpers = [
    {
      id: "seo",
      icon: SearchCheck,
      label: "SEO fields",
      caption: "Meta title and description sized for search previews.",
      type: "fields",
      fields: {
        seoTitle: suggestions.metaTitle,
        seoDescription: suggestions.metaDescription,
      },
    },
    {
      id: "tags",
      icon: Tags,
      label: "Topic tags",
      caption: suggestions.tags.length
        ? suggestions.tags.join(", ")
        : "Uses heading, category, and draft content.",
      type: "fields",
      fields: { tags: suggestions.tags.join(", ") },
    },
    {
      id: "intro",
      icon: PenLine,
      label: "Intro paragraph",
      caption: "Adds a concise opening that names the reader outcome.",
      type: "block",
      html: suggestions.intro,
    },
    {
      id: "conclusion",
      icon: FileText,
      label: "Final thoughts",
      caption: "Adds a clear closing section for content quality scoring.",
      type: "block",
      html: suggestions.conclusion,
    },
    {
      id: "faq",
      icon: HelpCircle,
      label: "FAQ block",
      caption: "Adds three schema-ready Q&A items for rich results.",
      type: "block",
      html: suggestions.faq,
    },
    {
      id: "trust",
      icon: ShieldCheck,
      label: "Trust fields",
      caption: "Adds author role, reviewer, and editorial note.",
      type: "fields",
      fields: suggestions.trustFields,
    },
  ];

  /* ── Single source of truth: derive "attached" from the draft itself ──
     Block helpers: their marker is present in the content.
     Field helpers: the fields still hold what the helper filled in. */
  const isAttached = (helper) => {
    if (helper.type === "block") return hasHelperBlock(description, helper.id);
    return (
      fieldsMatch(formData, helper.fields) ||
      (appliedFields[helper.id] ? fieldsMatch(formData, appliedFields[helper.id]) : false)
    );
  };

  const addHelper = (helper) => {
    if (helper.type === "block") {
      // Never attach twice — replace the existing block instead of duplicating.
      if (hasHelperBlock(description, helper.id)) {
        onApplyFields?.({
          description: `${removeHelperBlock(description, helper.id)}\n\n${wrapHelperBlock(helper.id, helper.html)}`,
        });
      } else {
        onInsertBlock?.(wrapHelperBlock(helper.id, helper.html));
      }
    } else {
      onApplyFields?.(helper.fields);
      setAppliedFields((prev) => ({ ...prev, [helper.id]: helper.fields }));
    }
    emitAlert({ type: "success", message: `${helper.label} added to this post.` });
  };

  const removeHelper = (helper) => {
    if (helper.type === "block") {
      onApplyFields?.({ description: removeHelperBlock(description, helper.id) });
    } else {
      onApplyFields?.(clearedFields(helper.fields));
      setAppliedFields((prev) => {
        const next = { ...prev };
        delete next[helper.id];
        return next;
      });
    }
    emitAlert({ type: "success", message: `${helper.label} removed from this post.` });
  };

  const toggleHelper = (helper) => {
    if (isAttached(helper)) {
      removeHelper(helper);
    } else {
      addHelper(helper);
    }
  };

  const attachedCount = helpers.filter(isAttached).length;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-muted">Writing Helper</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            One-click SEO, tags, intro, and ending blocks generated from the current draft. Click a
            helper to add it — click again to remove it.
          </p>
        </div>
        {attachedCount > 0 && (
          <span
            role="status"
            aria-label={`${attachedCount} writing helper${attachedCount === 1 ? "" : "s"} active`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {attachedCount} active
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {helpers.map((helper) => (
          <HelperButton
            key={helper.id}
            icon={helper.icon}
            label={helper.label}
            caption={helper.caption}
            attached={isAttached(helper)}
            onToggle={() => toggleHelper(helper)}
          />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-primary bg-primary-soft px-3 py-2 text-xs leading-5 text-primary">
        <div className="mb-1 flex items-center gap-1.5 font-semibold">
          <PlusCircle className="h-3.5 w-3.5" />
          Draft preview
        </div>
        <p className="line-clamp-2">{suggestions.metaDescription}</p>
      </div>
    </div>
  );
}
