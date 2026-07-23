import ToolsClient from "./ToolsClient";
import { getInitialToolCatalog, getToolCatalogCount } from "./toolRouteUtils";

export const dynamic = "force-static";

export default function ToolsPage(props) {
  return (
    <ToolsClient
      meta={getInitialToolCatalog("all")}
      catalogTotal={getToolCatalogCount("all")}
      {...props}
    />
  );
}
