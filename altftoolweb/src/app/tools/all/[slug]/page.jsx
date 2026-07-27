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
