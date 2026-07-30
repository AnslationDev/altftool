import ToolsClient from "./ToolsClient";
import {
  getInitialToolCatalog,
  getToolCatalogCount,
  getToolCategoryCounts,
} from "./toolRouteUtils";


export default function ToolsPage(props) {
  return (
    <ToolsClient
      meta={getInitialToolCatalog("all")}
      catalogTotal={getToolCatalogCount("all")}
      categoryCounts={getToolCategoryCounts()}
      {...props}
    />
  );
}
