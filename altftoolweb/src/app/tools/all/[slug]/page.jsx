import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { notFound } from "next/navigation";
import ToolClient from "../../[category]/[slug]/ToolClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = toolMetaMap[slug];

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested tool does not exist.",
    };
  }

  return {
    title: tool.name,
    description: tool.description,
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;

  if (!toolMetaMap[slug]) {
    notFound();
  }

  return <ToolClient slug={slug} />;
}
