import { Search, Wand2 } from "lucide-react";

export default function CommandPalette({
  open,
  query,
  index,
  commands,
  onQueryChange,
  onIndexChange,
  onRun,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="sf-palette-backdrop" onClick={onClose}>
      <div className="sf-palette" onClick={(event) => event.stopPropagation()}>
        <div className="sf-search">
          <Search className="h-5 w-5" />
          <input autoFocus placeholder="Run a command…" value={query} onChange={(event) => onQueryChange(event.target.value)} />
        </div>
        <div className="sf-command-list">
          {commands.map((action, actionIndex) => (
            <button
              key={action.label}
              className={actionIndex === index ? "is-active" : ""}
              onMouseEnter={() => onIndexChange(actionIndex)}
              onClick={() => onRun(action)}
            >
              <Wand2 className="h-4 w-4" /> {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
