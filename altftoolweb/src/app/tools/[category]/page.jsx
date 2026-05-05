import ToolsClient from "../ToolsClient";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";

export default async function Page({ params }) {
  const { category } = await params;

  return <ToolsClient meta={toolMetaMap} category={category} />;
}
