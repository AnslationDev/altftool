"use client";

import { ChevronRight, Home } from "lucide-react";

// Breadcrumb path from root to the selected node. Clicking a crumb refocuses.
export default function Breadcrumb({ selectedNode, onSelect, setFocusedId }) {
  if (!selectedNode) {
    return (
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-xs text-(--muted-foreground)"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
        <span>No selection</span>
      </nav>
    );
  }

  const chain = [];
  let current = selectedNode;
  while (current) {
    chain.unshift(current);
    current = current.parent;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 overflow-hidden text-xs"
    >
      {chain.map((node, i) => {
        const isLast = i === chain.length - 1;
        return (
          <span key={node.id} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 text-(--muted-foreground)"
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              disabled={isLast}
              onClick={() => {
                setFocusedId(node.id);
                onSelect(node);
              }}
              className={`max-w-[12rem] truncate rounded px-1.5 py-0.5 ${
                isLast
                  ? "font-semibold text-(--foreground)"
                  : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
              }`}
            >
              {i === 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" aria-hidden="true" />
                  {node.name}
                </span>
              ) : (
                node.name
              )}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
