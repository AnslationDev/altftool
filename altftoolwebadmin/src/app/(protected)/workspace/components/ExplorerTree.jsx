"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Layers, Loader2 } from "lucide-react";

function CountBadge({ count, active }) {
  if (!count) return null;
  return (
    <span
      className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
        active
          ? "bg-[color-mix(in_srgb,var(--primary-foreground)_25%,transparent)] text-[var(--primary-foreground)]"
          : "bg-[var(--surface-soft)] text-[var(--muted)]"
      }`}
    >
      {count > 999 ? "999+" : count}
    </span>
  );
}

function TreeNode({ node, depth, selectedPath, onSelect, authFetch }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState(null);
  const [loading, setLoading] = useState(false);
  const isSelected = selectedPath === node.hierarchyPath;

  const toggle = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!node.hasChildren) return;
      const next = !expanded;
      setExpanded(next);
      if (next && children === null) {
        setLoading(true);
        const data = await authFetch(`/api/activity/tree?path=${encodeURIComponent(node.hierarchyPath)}`);
        setChildren(data?.children || []);
        setLoading(false);
      }
    },
    [expanded, children, node, authFetch],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node.hierarchyPath)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(node.hierarchyPath); } }}
        className={`group flex items-center gap-1.5 rounded-lg py-1.5 pr-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
          isSelected
            ? "bg-[var(--primary)] font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)]"
            : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
        }`}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={node.hasChildren ? (expanded ? "Collapse" : "Expand") : undefined}
          className="grid h-4 w-4 shrink-0 place-items-center rounded"
          tabIndex={-1}
        >
          {node.hasChildren ? (
            loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
          )}
        </button>
        <span className="truncate">{node.label}</span>
        <CountBadge count={node.count} active={isSelected} />
      </div>

      {expanded && children?.map((c) => (
        <TreeNode key={c.hierarchyPath} node={c} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} authFetch={authFetch} />
      ))}
    </div>
  );
}

export default function ExplorerTree({ selectedPath, onSelect, authFetch }) {
  const [roots, setRoots] = useState(null);

  useEffect(() => {
    let alive = true;
    authFetch("/api/activity/tree").then((d) => { if (alive) setRoots(d?.children || []); });
    return () => { alive = false; };
  }, [authFetch]);

  return (
    <nav className="space-y-0.5" aria-label="Workspace explorer">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect("")}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(""); } }}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
          selectedPath === ""
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
        }`}
      >
        <Layers className="h-4 w-4 shrink-0" strokeWidth={1.9} />
        All Activity
      </div>

      {roots === null ? (
        <div className="flex items-center gap-2 px-2.5 py-3 text-xs text-[var(--muted)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading workspace…
        </div>
      ) : roots.length === 0 ? (
        <p className="px-2.5 py-3 text-xs text-[var(--muted)]">No projects registered.</p>
      ) : (
        roots.map((n) => (
          <TreeNode key={n.hierarchyPath} node={n} depth={0} selectedPath={selectedPath} onSelect={onSelect} authFetch={authFetch} />
        ))
      )}
    </nav>
  );
}
