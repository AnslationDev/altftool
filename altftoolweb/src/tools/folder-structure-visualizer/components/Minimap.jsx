"use client";

import { Folder, File } from "lucide-react";

// Compact overview of the visible tree. Each visible node is drawn as an
// indented tick; the focused/selected node is highlighted. Clicking seeks.
export default function Minimap({ visible, selectedId, zoom, onSeek }) {
  return (
    <div className="absolute bottom-3 right-3 hidden w-40 rounded-lg border border-(--border) bg-(--background)/90 p-2 shadow-md backdrop-blur sm:block">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
        Minimap · {zoom.toFixed(1)}x
      </p>
      <div className="max-h-40 overflow-hidden">
        {visible.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSeek(node.id)}
            title={node.path || node.name}
            className={`flex w-full items-center gap-1 truncate rounded px-1 py-[1px] text-left text-[10px] ${
              node.id === selectedId
                ? "bg-(--primary) text-(--primary-foreground)"
                : "text-(--muted-foreground) hover:bg-(--muted)"
            }`}
            style={{ paddingLeft: `${(node.depth + 1) * 6}px` }}
          >
            {node.type === "folder" ? (
              <Folder className="h-2.5 w-2.5 shrink-0" />
            ) : (
              <File className="h-2.5 w-2.5 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
