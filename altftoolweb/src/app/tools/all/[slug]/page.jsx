import { notFound } from "next/navigation";
import ToolClient from "../../[category]/[slug]/ToolClient";
import { buildToolMetadata, getRelatedTools, getTool } from "../../toolRouteUtils";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createItemListJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { buildToolSeoContent } from "../../toolSeoContent";
import ToolSeoSection from "../../ToolSeoSection";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

// Served from the edge instead of the origin on every hit. Before this, the
// root layout's `await connection()` made all 3,753 tool URLs dynamic and the
// responses carried no-store, so every view paid ~205 ms of origin TTFB;
// /tools/developer, already force-static, answers in ~32 ms from the same PoP.
// force-static overrides the layout's connection() — /blogs/[slug] has run this
// exact shape in production since well before this change.
//
// generateStaticParams returns [] deliberately: nothing is prerendered at build
// time (3,753 pages of HTML would not fit the artifact gate), pages are cached
// on first request instead. The effective TTL is usually 300s rather than a
// day — the root layout's loadSeoConfig() fetch declares revalidate 300 and
// Next takes the minimum across a render.
export const dynamic = "force-static";
export const revalidate = 86400;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return [];
}


export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildToolMetadata(slug);
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  const toolPath = `/tools/all/${slug}`;
  const seoContent = buildToolSeoContent(slug, tool);
  const relatedItems = getRelatedTools(slug, 6).map((item) => ({
    name: item.name,
    path: `/tools/all/${item.slug}`,
  }));

  return (
    <>
      <JsonLd
        id={`tool-schema-${slug}`}
        data={[
          createToolJsonLd({ slug, tool, category: "all" }),
          // Only tools with real per-tool steps/FAQs emit HowTo/FAQPage.
          // Templated fallback copy is shared across ~1,900 URLs, and Google
          // requires this markup to be unique to the page.
          seoContent.hasCuratedSteps
            ? createHowToJsonLd({
              path: toolPath,
              name: `${tool.name} workflow`,
              description: seoContent.summary,
              steps: seoContent.steps,
            })
            : null,
          seoContent.hasCuratedFaqs
            ? createFaqJsonLd({ path: toolPath, questions: seoContent.faqs })
            : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: tool.name, path: toolPath },
          ]),
          // Entity relations: Tool → related Tools (internal linking graph).
          createItemListJsonLd({
            path: toolPath,
            name: `Tools related to ${tool.name}`,
            items: relatedItems,
          }),
        ]}
      />
      <ToolClient slug={slug} category="all" />
      <ToolSeoSection slug={slug} tool={tool} category="all" />
    </>
  );
}
