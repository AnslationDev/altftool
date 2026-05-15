"use client";

import {
  CheckCircle2,
  FileText,
  HelpCircle,
  PenLine,
  PlusCircle,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Tags,
} from "lucide-react";
import { useMemo, useState } from "react";
import { emitAlert } from "@/lib/alertBus";
import { parseBlogTags } from "./BlogSeoChecklist";

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

function ActionButton({ icon: Icon, label, caption, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-800 group-hover:text-blue-700">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-gray-500">{caption}</span>
      </span>
    </button>
  );
}

export default function BlogWritingAssistant({
  formData = {},
  onApplyFields,
  onInsertBlock,
}) {
  const [lastAction, setLastAction] = useState("");

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

  const apply = (label, callback) => {
    callback();
    setLastAction(label);
    emitAlert({ type: "success", message: `${label} applied.` });
    window.setTimeout(() => setLastAction(""), 1600);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Writing Helper</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            One-click SEO, tags, intro, and ending blocks generated from the current draft.
          </p>
        </div>
        {lastAction ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <ActionButton
          icon={SearchCheck}
          label="Fill SEO fields"
          caption="Meta title and description sized for search previews."
          onClick={() =>
            apply("SEO fields", () =>
              onApplyFields?.({
                seoTitle: suggestions.metaTitle,
                seoDescription: suggestions.metaDescription,
              })
            )
          }
        />
        <ActionButton
          icon={Tags}
          label="Generate topic tags"
          caption={suggestions.tags.length ? suggestions.tags.join(", ") : "Uses heading, category, and draft content."}
          onClick={() =>
            apply("Topic tags", () =>
              onApplyFields?.({
                tags: suggestions.tags.join(", "),
              })
            )
          }
        />
        <ActionButton
          icon={PenLine}
          label="Insert intro paragraph"
          caption="Adds a concise opening that names the reader outcome."
          onClick={() => apply("Intro paragraph", () => onInsertBlock?.(suggestions.intro))}
        />
        <ActionButton
          icon={FileText}
          label="Insert final thoughts"
          caption="Adds a clear closing section for content quality scoring."
          onClick={() => apply("Final thoughts", () => onInsertBlock?.(suggestions.conclusion))}
        />
        <ActionButton
          icon={HelpCircle}
          label="Insert FAQ block"
          caption="Adds three schema-ready Q&A items for rich results."
          onClick={() => apply("FAQ block", () => onInsertBlock?.(suggestions.faq))}
        />
        <ActionButton
          icon={ShieldCheck}
          label="Fill trust fields"
          caption="Adds author role, reviewer, and editorial note."
          onClick={() => apply("Trust fields", () => onApplyFields?.(suggestions.trustFields))}
        />
      </div>

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
        <div className="mb-1 flex items-center gap-1.5 font-semibold">
          <PlusCircle className="h-3.5 w-3.5" />
          Draft preview
        </div>
        <p className="line-clamp-2">{suggestions.metaDescription}</p>
      </div>
    </div>
  );
}
