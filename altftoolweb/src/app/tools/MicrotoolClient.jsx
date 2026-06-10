import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import ToolsClient from "./ToolsClient";

export const dynamic = "force-static";

export default function ToolsPage(props) {
  return <ToolsClient meta={toolMetaMap} {...props} />;
}
