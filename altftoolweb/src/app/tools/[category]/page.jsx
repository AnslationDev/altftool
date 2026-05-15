import ToolsClient from "../ToolsClient";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { redirect } from "next/navigation";
import { formatCategoryLabel } from "../toolRouteUtils";

const VALID_VIEW_MODES = new Set(["all", "favorites", "recent"]);

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

export default async function Page({ params, searchParams }) {
  const { category } = await params;
  const query = await searchParams;

  if (toolMetaMap[category]) {
    redirect(`/tools/all/${category}`);
  }

  const search = typeof query?.search === "string" ? query.search : "";
  const view = typeof query?.view === "string" && VALID_VIEW_MODES.has(query.view)
    ? query.view
    : "all";

  return <ToolsClient meta={toolMetaMap} category={category} initialSearch={search} initialViewMode={view} />;
}
