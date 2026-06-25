import { Copy, Group, Layers, Link, Lock, SendToBack, Trash2, Ungroup } from "lucide-react";

function ClipboardIcon(props) {
  return <Copy {...props} />;
}

export default function ContextMenu({
  menu,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onGroup,
  onUngroup,
  onLock,
  onAddLink,
  onClose,
}) {
  if (!menu) return null;

  const actions = [
    ["Copy", Copy, onCopy],
    ["Paste", ClipboardIcon, onPaste],
    ["Duplicate", Layers, onDuplicate],
    ["Delete", Trash2, onDelete],
    ["Bring to Front", Layers, onBringToFront],
    ["Send to Back", SendToBack, onSendToBack],
    ["Group", Group, onGroup],
    ["Ungroup", Ungroup, onUngroup],
    ["Lock", Lock, onLock],
    ["Add Link", Link, onAddLink],
  ];

  return (
    <div className="sf-menu" style={{ left: menu.x, top: menu.y }}>
      {actions.map(([label, Icon, run]) => (
        <button
          key={label}
          onClick={() => {
            run();
            onClose();
          }}
        >
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </div>
  );
}
