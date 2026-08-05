import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { NAV_ITEMS_BY_SLUG } from "../../data/navigation";
import {
  getPromptSubject,
  getStudioToolDescription,
} from "../toolDescriptions";
import StudioToolClient from "./studio-tool-client";

// Same set the sibling layout uses to decide `noindex`: exactly these 52 studio
// tools are indexable and in the sitemap. The library/utility views (history,
// favorites, settings, …) are per-user surfaces that ship noindex, so they get
// no structured data — describing a private view to an answer engine would be
// describing something it can never see.
const INDEXABLE_KINDS = new Set(["core", "model", "category"]);

// The description comes from ../toolDescriptions, the same module the sibling
// layout's generateMetadata uses, so a tool's structured data and its meta
// description can never describe it differently.
//
// It no longer falls back to `item.description` or the category description:
// the first is a 28-34 character sidebar subtitle and the second is a seeded
// template ("X prompts engineered for stunning, consistent AI results.")
// repeated verbatim across all ~120 categories. Nothing here publishes a
// rating, a user count or a price — the seeded `category.count` is a
// placeholder value, so it stays out of the markup.

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
                description: getStudioToolDescription(item),
                category: "DesignApplication",
                topics: [
                  item.label,
                  `${getPromptSubject(item.label)} prompts`,
                  "AI prompt generator",
                ],
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
