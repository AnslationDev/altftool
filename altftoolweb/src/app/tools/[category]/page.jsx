import ToolsClient from "../ToolsClient";
import ToolHubLinks from "../ToolHubLinks";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { redirect } from "next/navigation";
import { formatCategoryLabel, getToolCategorySlugs } from "../toolRouteUtils";

export const dynamic = "force-static";
export const revalidate = 86400;

export function generateStaticParams() {
  return getToolCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const label = formatCategoryLabel(category);
  const isAll = category === "all";

  return createPageMetadata({
    title: isAll ? "All Online Tools - Free Browser Microtools" : `${label} Tools - Free Online Utilities`,
    description: isAll
      ? "Browse every AltFTool microtool in one fast directory, including converters, developer helpers, PDF tools, calculators, media tools, and productivity utilities."
      : `Browse free ${label.toLowerCase()} tools on AltFTool with quick browser-based workflows, copy-ready results, and mobile-friendly utility pages.`,
    path: `/tools/${category}`,
  });
}

export default async function Page({ params }) {
  const { category } = await params;

  if (toolMetaMap[category]) {
    redirect(`/tools/all/${category}`);
  }

  return (
    <>
      <ToolsClient meta={toolMetaMap} category={category} />
      <ToolHubLinks category={category} />
    </>
  );
}
