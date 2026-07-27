import { TOOL_CATALOG } from "@/config/toolCatalog.generated";

import ToolCatalogClient from "./ToolCatalogClient";

export default function ToolCatalogPage() {
  return <ToolCatalogClient catalog={TOOL_CATALOG} />;
}
