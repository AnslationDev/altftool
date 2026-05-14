import { notFound, redirect } from "next/navigation";
import ToolClient from "./ToolClient";
import { buildToolMetadata, getTool, getToolCategories, slugifyRouteSegment } from "../../toolRouteUtils";
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

  return (
    <>
      <JsonLd
        id={`tool-schema-${category}-${slug}`}
        data={[
          createToolJsonLd({ slug, tool, category }),
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
            { name: category === "all" ? "All Tools" : category, path: `/tools/${category}` },
            { name: tool.name, path: toolPath },
          ]),
        ]}
      />
      <ToolClient slug={slug} category={category} />
    </>
  );
}
