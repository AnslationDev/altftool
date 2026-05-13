import { notFound } from "next/navigation";
import ToolClient from "../../[category]/[slug]/ToolClient";
import { buildToolMetadata, getTool } from "../../toolRouteUtils";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { buildToolSeoContent } from "../../toolSeoContent";

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

  return (
    <>
      <JsonLd
        id={`tool-schema-${slug}`}
        data={[
          createToolJsonLd({ slug, tool, category: "all" }),
          createHowToJsonLd({
            path: toolPath,
            name: `${tool.name} workflow`,
            description: seoContent.summary,
            steps: seoContent.steps,
          }),
          createFaqJsonLd({ path: toolPath, questions: seoContent.faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: tool.name, path: toolPath },
          ]),
        ]}
      />
      <ToolClient slug={slug} category="all" />
    </>
  );
}
