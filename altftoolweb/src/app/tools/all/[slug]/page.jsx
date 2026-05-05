import { notFound } from "next/navigation";
import ToolClient from "../../[category]/[slug]/ToolClient";
import { buildToolMetadata, getTool } from "../../toolRouteUtils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildToolMetadata(slug);
}

export default async function ToolPage({ params }) {
  const { slug } = await params;

  if (!getTool(slug)) {
    notFound();
  }

  return <ToolClient slug={slug} category="all" />;
}
