import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { getCategory } from "../../data/categories";
import { NAV_ITEMS_BY_SLUG } from "../../data/navigation";
import StudioToolClient from "./studio-tool-client";

// Same set the sibling layout uses to decide `noindex`: exactly these 52 studio
// tools are indexable and in the sitemap. The library/utility views (history,
// favorites, settings, …) are per-user surfaces that ship noindex, so they get
// no structured data — describing a private view to an answer engine would be
// describing something it can never see.
const INDEXABLE_KINDS = new Set(["core", "model", "category"]);

function getPromptSubject(item) {
  // "Anime Prompt" → "Anime", so the copy below reads "Anime prompts" instead
  // of "Anime Prompt prompts". Labels that aren't already prompt-suffixed
  // ("Midjourney", "Prompt Generator") are left alone.
  return item.label.replace(/\s+prompts?$/i, "");
}

// Every field is read from the studio's own registry: `item.description` is the
// hand-written subtitle, and category tools fall back to the category
// description the workspace header actually renders. Nothing here publishes a
// rating, a user count or a price — data/reviews.js testimonials and the seeded
// `category.count` are placeholder values, so they stay out of the markup.
function getStudioDescription(item) {
  if (item.description) return item.description;

  const category = getCategory(item.categorySlug);
  if (category?.description) return category.description;

  return `Create and refine ${getPromptSubject(item).toLowerCase()} prompts in the AltF AI Prompt Studio.`;
}

export default async function StudioToolPage({ params }) {
  const { tool } = await params;
  const slug = String(tool);
  const item = NAV_ITEMS_BY_SLUG[slug];
  const path = `/imgprompt/studio/${slug}`;
  const describable = Boolean(item) && INDEXABLE_KINDS.has(item.kind);

  return (
    <>
      {/* These 52 studio URLs shipped only the root layout's Organization and
          WebSite nodes. Each one is a free, browser-based prompt tool, so they
          get the same SoftwareApplication + BreadcrumbList shape as
          /altflovepdf/[toolSlug] — built from the registry's own label,
          description and slug. Rendered at request time, so it costs no
          prerendered-artifact bytes. */}
      {describable ? (
        <JsonLd
          id={`imgprompt-studio-schema-${slug}`}
          data={[
            createToolJsonLd({
              slug,
              path,
              tool: {
                name: `${item.label} - AI Prompt Studio`,
                description: getStudioDescription(item),
                category: "DesignApplication",
                topics: [item.label, `${getPromptSubject(item)} prompts`, "AI prompt generator"],
              },
            }),
            createBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "AI Prompt Studio", path: "/imgprompt/studio" },
              { name: item.label, path },
            ]),
          ]}
        />
      ) : null}
      <StudioToolClient slug={slug} />
    </>
  );
}
