"use client";

import { toolMetaMap } from "@/platform/registry/clientToolMetaMap";
import { CANONICAL_CATEGORIES, slugifyCategory } from "@/platform/registry/categoryTaxonomy";

/**
 * AltF Assistant — client-side answer engine.
 *
 * Answers questions about AltFTool (FAQ intents) and finds tools/games from
 * the 600+ tool registry (search intent). Pure functions over static data:
 * no network, no API key, instant answers. Loaded lazily on first
 * interaction so the home page pays nothing up front.
 */

const STOPWORDS = new Set([
  "a", "an", "and", "any", "are", "can", "do", "does", "for", "free", "have",
  "how", "i", "in", "is", "it", "me", "my", "need", "of", "on", "online",
  "or", "please", "some", "that", "the", "there", "to", "tool", "tools",
  "want", "what", "which", "with", "you",
]);

const GAME_CATEGORY = "Games";

function tokenize(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function toolCategories(tool) {
  return Array.isArray(tool.category) ? tool.category : [tool.category].filter(Boolean);
}

function scoreTool(slug, tool, tokens, rawQuery) {
  const name = (tool.name || "").toLowerCase();
  const description = (tool.description || "").toLowerCase();
  const slugText = slug.replace(/-/g, " ");
  const categories = toolCategories(tool).map((value) => String(value).toLowerCase());
  const topics = (tool.topics || []).map((value) => String(value).toLowerCase());
  let score = 0;

  if (name === rawQuery || slugText === rawQuery) score += 120;
  if (name.startsWith(rawQuery)) score += 60;
  if (name.includes(rawQuery) && rawQuery.length > 3) score += 35;

  for (const token of tokens) {
    if (name.split(/\s+/).includes(token)) score += 24;
    else if (name.includes(token)) score += 14;
    if (slugText.includes(token)) score += 12;
    if (categories.some((value) => value.includes(token))) score += 8;
    if (topics.some((value) => value.includes(token))) score += 6;
    if (description.includes(token)) score += 4;
  }

  return score;
}

export function searchTools(query, { limit = 5, gamesOnly = false } = {}) {
  const rawQuery = query.toLowerCase().trim();
  const tokens = tokenize(query);
  if (!tokens.length && !rawQuery) return [];

  return Object.entries(toolMetaMap)
    .filter(([, tool]) =>
      gamesOnly ? toolCategories(tool).includes(GAME_CATEGORY) : true,
    )
    .map(([slug, tool]) => ({
      slug,
      name: tool.name || slug,
      description: tool.description || "",
      score: scoreTool(slug, tool, tokens, rawQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ slug, name, description }) => ({
      href: `/tools/all/${slug}`,
      label: name,
      description,
    }));
}

function matchCategory(query) {
  const tokens = tokenize(query);
  if (!tokens.length) return null;

  let best = null;
  for (const category of CANONICAL_CATEGORIES) {
    const label = category.label.toLowerCase();
    const hits = tokens.filter((token) => label.includes(token)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { category, hits };
  }
  return best?.category ?? null;
}

const TOOL_COUNT = Object.keys(toolMetaMap).length;
const GAME_COUNT = Object.values(toolMetaMap).filter((tool) =>
  toolCategories(tool).includes(GAME_CATEGORY),
).length;

const FAQ_INTENTS = [
  {
    pattern: /(what|kya)\s+(is|hai)\s+altf|about\s+altftool|altftool\s+(kya|about)/i,
    answer: () => ({
      text: `AltFTool is a free "everything platform" for the browser — ${TOOL_COUNT}+ tools, ${GAME_COUNT}+ games, curated extensions, deals, blogs, and daily-use utilities. Everything runs client-side in your browser: fast, private, and free.`,
      links: [
        { href: "/tools/all", label: "Browse all tools" },
        { href: "/games", label: "Play games" },
        { href: "/policypages/about", label: "About AltFTool" },
      ],
    }),
  },
  {
    pattern: /\b(free|cost|price|paid|subscription|charge)\b/i,
    answer: () => ({
      text: "Yes — AltFTool is completely free. No sign-up required for any tool, no hidden charges. An optional account only adds extras like syncing your favorites.",
      links: [{ href: "/tools/all", label: "Start using tools" }],
    }),
  },
  {
    pattern: /\b(privacy|private|safe|secure|data|upload|server)\b/i,
    answer: () => ({
      text: "Your files stay on your device. AltFTool tools run entirely in your browser — images, PDFs, and text you process are never uploaded to our servers.",
      links: [{ href: "/policypages/privacy", label: "Privacy policy" }],
    }),
  },
  {
    pattern: /\b(how many|kitne)\b.*\b(tools?|games?)\b|\bcount\b/i,
    answer: () => ({
      text: `Right now AltFTool has ${TOOL_COUNT}+ free tools across ${CANONICAL_CATEGORIES.length} categories, including ${GAME_COUNT}+ browser games — and the catalog grows every week.`,
      links: [
        { href: "/tools/all", label: "All tools" },
        { href: "/games", label: "All games" },
      ],
    }),
  },
  {
    pattern: /\b(categor(y|ies)|sections?|browse|explore)\b/i,
    answer: () => ({
      text: `Tools are organized into ${CANONICAL_CATEGORIES.length} categories — ${CANONICAL_CATEGORIES.slice(0, 8)
        .map((category) => category.label)
        .join(", ")}, and more.`,
      links: CANONICAL_CATEGORIES.slice(0, 6).map((category) => ({
        href: `/tools/${category.slug}`,
        label: category.label,
      })),
    }),
  },
  {
    pattern: /\b(game|games|khel|play)\b/i,
    answer: (query) => {
      const results = searchTools(query, { limit: 4, gamesOnly: true });
      return {
        text:
          results.length > 0
            ? `Here are some games that match — all free, no downloads:`
            : `AltFTool has ${GAME_COUNT}+ free browser games — puzzle, arcade, word, board, and card games. No downloads, no sign-up.`,
        links:
          results.length > 0
            ? [...results, { href: "/games", label: "Browse all games →" }]
            : [{ href: "/games", label: "Browse all games" }],
      };
    },
  },
  {
    pattern: /\b(extension|chrome|addon|add-on)\b/i,
    answer: () => ({
      text: "AltFTool curates the best browser extensions for productivity, privacy, and creativity — with honest write-ups.",
      links: [{ href: "/extensions", label: "Browse extensions" }],
    }),
  },
  {
    pattern: /\b(deal|deals|discount|offer|coupon)\b/i,
    answer: () => ({
      text: "Check AltF Deals for software discounts and exclusive offers, updated regularly.",
      links: [
        { href: "/deals", label: "AltF Deals" },
        { href: "/exclusivedeals", label: "Exclusive deals" },
      ],
    }),
  },
  {
    pattern: /\b(blog|blogs|article|read|news)\b/i,
    answer: () => ({
      text: "The AltFTool blog covers tool guides, comparisons, and productivity tips; the News hub tracks tech updates.",
      links: [
        { href: "/blogs", label: "Read the blog" },
        { href: "/news", label: "Tech news" },
      ],
    }),
  },
  {
    pattern: /\b(account|sign\s?in|sign\s?up|login|logout|register)\b/i,
    answer: () => ({
      text: "You can create a free account to save favorites and sync preferences — or keep using every tool without one.",
      links: [
        { href: "/account/signup", label: "Create account" },
        { href: "/account/login", label: "Sign in" },
      ],
    }),
  },
  {
    pattern: /\b(request|missing|suggest|idea|feature)\b/i,
    answer: () => ({
      text: "Missing a tool? Tell us what you need and we'll consider building it.",
      links: [{ href: "/request-a-tool", label: "Request a tool" }],
    }),
  },
  {
    pattern: /\b(contact|support|help|issue|problem|bug)\b/i,
    answer: () => ({
      text: "Something broken or need help? Reach the team through the contact page.",
      links: [{ href: "/policypages/contact", label: "Contact support" }],
    }),
  },
  {
    pattern: /\b(labs?|experiments?|interactive|experience)\b/i,
    answer: () => ({
      text: "AltFTool Labs hosts experimental interactive experiences — playful things that don't fit a normal tool page.",
      links: [{ href: "/labs", label: "Explore Labs" }],
    }),
  },
  {
    pattern: /\b(buysmart|buy smart|compare products?|which.*(buy|purchase)|shopping research)\b/i,
    answer: () => ({
      text: "BuySmart helps you research products and compare options before buying.",
      links: [{ href: "/buysmart", label: "Open BuySmart" }],
    }),
  },
  {
    pattern: /\b(academy|learn|course|tutorial)\b/i,
    answer: () => ({
      text: "AltFTool Academy has learning resources and guides to level up your skills.",
      links: [{ href: "/academy", label: "Visit Academy" }],
    }),
  },
  {
    pattern: /\b(brand.*rating|rating.*brand|review.*brand|trusted brands?)\b/i,
    answer: () => ({
      text: "Brand Ratings collects consumer ratings so you can check a brand before you buy.",
      links: [{ href: "/brandrating", label: "Brand Ratings" }],
    }),
  },
  {
    pattern: /\b(licen[cs]es?|open.?source|credits?)\b/i,
    answer: () => ({
      text: "AltFTool is built on open-source software — the licenses page credits every project we use.",
      links: [{ href: "/licenses", label: "Open source licenses" }],
    }),
  },
];

/**
 * Flagship suite tasks that live outside the tool registry
 * (AltFLovePDF / AltFLoveIMG standalone apps). Checked before registry
 * search so "compress a pdf" lands on the dedicated suite page.
 */
const SUITE_SHORTCUTS = [
  { pattern: /compress.*pdf|pdf.*compress|shrink.*pdf|reduce.*pdf.*size/i, href: "/altflovepdf/compress-pdf", label: "Compress PDF — AltFLovePDF" },
  { pattern: /pdf.*(to|into).*word|word.*from.*pdf/i, href: "/altflovepdf/pdf-to-word", label: "PDF to Word — AltFLovePDF" },
  { pattern: /pdf.*(to|into).*excel/i, href: "/altflovepdf/pdf-to-excel", label: "PDF to Excel — AltFLovePDF" },
  { pattern: /protect.*pdf|password.*pdf|lock.*pdf/i, href: "/altflovepdf/protect-pdf", label: "Protect PDF — AltFLovePDF" },
  { pattern: /merge.*pdf|combine.*pdf|join.*pdf/i, href: "/altflovepdf/merge-pdf", label: "Merge PDF — AltFLovePDF" },
  { pattern: /remove.*background|background.*remov|bg.*remov/i, href: "/altfloveimg/background-remover", label: "Background Remover — AltFLoveIMG" },
  { pattern: /upscale|enhance.*image|image.*quality/i, href: "/altfloveimg/upscaler", label: "Image Upscaler — AltFLoveIMG" },
  { pattern: /watermark.*image|image.*watermark/i, href: "/altfloveimg/watermark", label: "Add Watermark — AltFLoveIMG" },
];

/**
 * Main entry: answer a user query with { text, links[] }.
 */
export function answerQuery(rawQuery) {
  const query = String(rawQuery || "").trim();
  if (!query) {
    return {
      text: "Ask me anything about AltFTool, or describe the tool you need — e.g. \"compress a PDF\" or \"resize photo to 20KB\".",
      links: [],
    };
  }

  // 0. Flagship suite tasks (PDF compress, bg removal…) beat everything.
  const suite = SUITE_SHORTCUTS.find((entry) => entry.pattern.test(query));
  if (suite) {
    const related = searchTools(query, { limit: 3 });
    return {
      text: "This one's covered by a dedicated AltFTool suite:",
      links: [
        { href: suite.href, label: suite.label },
        ...related,
      ],
    };
  }

  // 1. Tool search first when the query names a concrete task/tool — FAQ
  //    words like "free"/"games" often appear inside tool queries too.
  const results = searchTools(query, { limit: 5 });
  const strongMatch = results.length > 0 && tokenize(query).length >= 1;

  // 2. FAQ intents win only when the query looks like a question about the
  //    platform rather than a task ("is it free" vs "free logo maker").
  const faq = FAQ_INTENTS.find((intent) => intent.pattern.test(query));
  const looksLikeQuestion =
    /\b(what|how|is|are|does|can|why|who|where|kya|kaise|kitne)\b/i.test(query) ||
    query.endsWith("?");

  if (faq && (looksLikeQuestion || !strongMatch)) {
    return faq.answer(query);
  }

  if (strongMatch) {
    const category = matchCategory(query);
    const links = [...results];
    if (category) {
      links.push({
        href: `/tools/${category.slug}`,
        label: `All ${category.label} →`,
      });
    }
    return {
      text:
        results.length === 1
          ? "This looks like the tool you need:"
          : "Here's what I found for that:",
      links,
    };
  }

  const category = matchCategory(query);
  if (category) {
    return {
      text: `Browse our ${category.label} collection — ${category.description}`,
      links: [{ href: `/tools/${category.slug}`, label: category.label }],
    };
  }

  return {
    text: `I couldn't find an exact match. Try the full search — ${TOOL_COUNT}+ tools are indexed by name, task, and category.`,
    links: [
      { href: `/tools/all?q=${encodeURIComponent(query)}`, label: `Search "${query}"` },
      { href: "/tools/all", label: "Browse all tools" },
    ],
  };
}

export const SUGGESTED_PROMPTS = [
  "Compress a PDF",
  "Resize image to 20KB",
  "What is AltFTool?",
  "EMI calculator",
  "Play a puzzle game",
  "Is my data private?",
];
