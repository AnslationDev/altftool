import { NAV_ITEMS_BY_SLUG } from "../../data/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

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
  const description =
    item.description ||
    `Create and refine ${item.label.toLowerCase()} prompts in the AltF AI Prompt Studio.`;

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
