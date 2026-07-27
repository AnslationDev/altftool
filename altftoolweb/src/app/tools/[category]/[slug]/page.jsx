import { notFound, redirect } from "next/navigation";
import ToolClient from "./ToolClient";
import {
  buildToolMetadata,
  getRelatedTools,
  getTool,
  getToolCategories,
  slugifyRouteSegment,
} from "../../toolRouteUtils";
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
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";
export const revalidate = 86400;

// Prerender each tool under its own canonical categories so crawlers get a
// cached page. Amplify builds defer the bulk prerender (artifact-size limit)
// and let ISR fill the cache on demand — same guard as /blogs/[slug].
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];

  const params = [];
  Object.entries(toolMetaMap).forEach(([slug, tool]) => {
    const seen = new Set();
    getToolCategories(tool).forEach((category) => {
      const categorySlug = slugifyRouteSegment(category);
      // "all" is served by the dedicated /tools/all/[slug] route.
      if (!categorySlug || categorySlug === "all" || seen.has(categorySlug)) return;
      seen.add(categorySlug);
      params.push({ category: categorySlug, slug });
    });
  });
  return params;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildToolMetadata(slug);
}

export default async function ToolPage({ params }) {
  const { category, slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  const categorySlugs = getToolCategories(tool).map(slugifyRouteSegment);
  if (category !== "all" && !categorySlugs.includes(slugifyRouteSegment(category))) {
    redirect(`/tools/all/${slug}`);
  }

  const toolPath = `/tools/${category}/${slug}`;
  const seoContent = buildToolSeoContent(slug, tool);
  const relatedItems = getRelatedTools(slug, 6).map((item) => ({
    name: item.name,
    path: `/tools/all/${item.slug}`,
  }));

  return (
    <>
      <JsonLd
        id={`tool-schema-${category}-${slug}`}
        data={[
          createToolJsonLd({ slug, tool, category }),
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
            { name: category === "all" ? "All Tools" : category, path: `/tools/${category}` },
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
      <ToolClient slug={slug} category={category} />
      <ToolSeoSection slug={slug} tool={tool} category={category} />
    </>
  );
}
