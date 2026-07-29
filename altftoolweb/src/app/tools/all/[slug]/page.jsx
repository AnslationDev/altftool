import { notFound } from "next/navigation";
import ToolClient from "../../[category]/[slug]/ToolClient";
import { buildToolMetadata, getRelatedTools, getTool } from "../../toolRouteUtils";
import { getOEmbedEndpointUrl, isEmbeddable } from "@/app/embed/embedRegistry";
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

// Prerender the tool corpus so crawlers are served a cached page instead of a
// cold dynamic render. Amplify builds defer the bulk prerender (artifact-size
// limit) and let ISR fill the cache on demand instead — same guard as
// /blogs/[slug] and /tools/[category].
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return Object.keys(toolMetaMap).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const metadata = await buildToolMetadata(slug);

  // Advertise oEmbed here as well as on the widget shell. This is the URL a
  // publisher actually pastes into WordPress, Ghost or Notion; without the
  // discovery link the paste stays a plain link instead of expanding into the
  // live widget — and every embedded widget carries an attribution link back.
  // Only for slugs that really are embeddable, so a consumer never discovers
  // an endpoint that would answer 404.
  if (isEmbeddable(slug)) {
    const tool = getTool(slug);
    metadata.alternates = {
      ...metadata.alternates,
      types: {
        ...metadata.alternates?.types,
        "application/json+oembed": [
          {
            url: getOEmbedEndpointUrl(slug),
            title: `${tool?.name || slug} — AltFTool widget`,
          },
        ],
      },
    };
  }

  return metadata;
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
