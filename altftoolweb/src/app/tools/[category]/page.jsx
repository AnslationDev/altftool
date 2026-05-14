import ToolsClient from "../ToolsClient";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { redirect } from "next/navigation";

const VALID_VIEW_MODES = new Set(["all", "favorites", "recent"]);

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
