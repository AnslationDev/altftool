import SecurityInspectorWorkspace from "../_shared/SecurityInspectorWorkspace";
import toolConfig from "./tool.config";
export default function ToolEntry() { return <SecurityInspectorWorkspace title={toolConfig.name} description={toolConfig.description} />; }
