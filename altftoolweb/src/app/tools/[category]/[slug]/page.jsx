import { notFound } from "next/navigation";
import ToolClient from "./ToolClient";
import { buildToolMetadata, getTool } from "../../toolRouteUtils";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

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

  return (
    <>
      <JsonLd
        id={`tool-schema-${category}-${slug}`}
        data={[
          createToolJsonLd({ slug, tool, category }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: category === "all" ? "All Tools" : category, path: `/tools/${category}` },
            { name: tool.name, path: `/tools/${category}/${slug}` },
          ]),
        ]}
      />
      <ToolClient slug={slug} category={category} />
    </>
  );
}
