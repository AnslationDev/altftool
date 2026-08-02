import { NAV_ITEMS_BY_SLUG } from "../../data/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getStudioToolDescription } from "../toolDescriptions";

const INDEXABLE_KINDS = new Set(["core", "model", "category"]);

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
  // Was `item.description || \`Create and refine ${item.label.toLowerCase()}
  // prompts…\``, which had two faults. The subtitles in navigation.js are
  // 28-34 characters, and the fallback was 59-69 — 35 of these 52 indexable
  // URLs shipped a description under the 70-character floor. And lowercasing
  // the label produced "midjourney", "dall·e" and, for the nine labels that
  // already end in "Prompt", "anime prompt prompts".
  const description = getStudioToolDescription(item);

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
