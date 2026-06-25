import { TOOLBAR } from "../utils/constants";
import { ToolButton } from "../utils/utils";

export default function LeftToolbar({ toolbar = TOOLBAR, activeTool, onSelectTool }) {
  return (
    <aside className="sf-toolbar">
      {toolbar.map(([id, label, shortcut, Icon]) => (
        <ToolButton key={id} active={activeTool === id} label={label} shortcut={shortcut} Icon={Icon} onClick={() => onSelectTool(id)} />
      ))}
    </aside>
  );
}
