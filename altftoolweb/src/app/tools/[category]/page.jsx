import ToolsClient from "../ToolsClient";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";

const VALID_VIEW_MODES = new Set(["all", "favorites", "recent"]);

export default async function Page({ params, searchParams }) {
  const { category } = await params;
  const query = await searchParams;
  const search = typeof query?.search === "string" ? query.search : "";
  const view = typeof query?.view === "string" && VALID_VIEW_MODES.has(query.view)
    ? query.view
    : "all";

  return <ToolsClient meta={toolMetaMap} category={category} initialSearch={search} initialViewMode={view} />;
}
