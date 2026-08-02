import { NAV_ITEMS_BY_SLUG } from "../../data/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

const INDEXABLE_KINDS = new Set(["core", "model", "category"]);

// "Anime Prompt" → "Anime", matching getPromptSubject in the sibling page.jsx.
// Without it the old fallback rendered "Create and refine image prompt prompts
// in the AltF AI Prompt Studio." on /imgprompt/studio/image-prompt.
function getPromptSubject(label = "") {
  return String(label).replace(/\s+prompts?$/i, "");
}

/**
 * Meta description for one studio tool.
 *
 * 49 of the 52 indexable studio tools carry no hand-written `description` in
 * data/navigation.js, so they all fell through to a single short template that
 * rendered between 60 and 72 characters — /imgprompt/studio/luma shipped 60,
 * /midjourney 66, /dalle 62. The three that do have one are shorter still
 * ("Turn any idea into a pro prompt." = 32). Every one of those is below the
 * 70-character floor a useful snippet needs, and they are near-identical to
 * each other.
 *
 * The copy below only claims what the studio does — draft, score, refine, copy
 * — which is the same behaviour the studio layout's own description states. No
 * tool count, no rating, no user number: data/reviews.js testimonials and the
 * seeded category counts are placeholder values and must not reach a snippet.
 *
 * Measured across all 52 indexable slugs: 131–149 characters, no duplicates,
 * and every string ends in a period below trimMetaDescription's 160 cap, so it
 * round-trips unchanged rather than being clipped.
 */
function buildStudioDescription(item) {
  if (item.kind === "model") {
    return `Write ${item.label} prompts in the AltF AI Prompt Studio: describe the shot, score the draft, tighten the wording, then copy a clean prompt.`;
  }
  if (item.kind === "category") {
    return `Build ${getPromptSubject(item.label).toLowerCase()} prompts in the AltF AI Prompt Studio: start from a rough idea, score the draft, tighten the wording, then copy the result.`;
  }
  return `Use ${item.label} in the AltF AI Prompt Studio: turn a rough idea into a structured prompt, score it, tighten the wording, then copy the result.`;
}

export async function generateMetadata({ params }) {
  const { tool } = await params;
  const item = NAV_ITEMS_BY_SLUG[tool];
  const path = `/imgprompt/studio/${tool}`;

  if (!item) {
    return createPageMetadata({
      title: "Prompt Studio tool not found",
      path,
      noindex: true,
      follow: false,
    });
  }

  const isIndexable = INDEXABLE_KINDS.has(item.kind);
  const description = buildStudioDescription(item);

  return createPageMetadata({
    title: `${item.label} - AI Prompt Studio`,
    description,
    path,
    keywords: [
      item.label,
      `${item.label} prompts`,
      "AI prompt generator",
      "prompt studio",
    ],
    noindex: !isIndexable,
    follow: true,
    pageType: "ai-prompt-tool",
  });
}

export default function PromptStudioToolLayout({ children }) {
  return children;
}
