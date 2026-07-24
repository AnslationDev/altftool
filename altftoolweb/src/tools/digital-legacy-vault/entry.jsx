import PrivateRecordWorkspace from "../_shared/PrivateRecordWorkspace";
import toolConfig from "./tool.config";
export default function ToolEntry() { return <PrivateRecordWorkspace title={toolConfig.name} description={toolConfig.description} fields={["Record", "Instructions"]} exportName="digital-legacy-vault" />; }
