import { TOOLBAR } from "../utils/constants";
import { ToolButton } from "../utils/utils";

export default function LeftToolbar({ activeTool, onSelectTool }) {
  return (
    <aside className="sf-toolbar">
      {TOOLBAR.map(([id, label, shortcut, Icon]) => (
        <ToolButton key={id} active={activeTool === id} label={label} shortcut={shortcut} Icon={Icon} onClick={() => onSelectTool(id)} />
      ))}
    </aside>
  );
}
