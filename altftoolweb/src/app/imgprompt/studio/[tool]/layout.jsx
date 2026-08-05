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
    // Branded in the string. The /imgprompt/studio layout sets a plain-string
    // title, which consumes the root layout's "%s | AltFTool" template, so all
    // 60 of these shipped with no site name at all (22-39 characters). Writing
    // the brand in makes resolveDocumentTitle mark the title absolute, so it
    // renders the same whether or not that template reaches this segment.
    // Measured across every NAV_ITEMS_BY_SLUG entry: 33-50 characters, none
    // over 60.
    title: `${item.label} - AI Prompt Studio | AltFTool`,
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
