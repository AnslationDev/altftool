"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import FileIcon from "./FileIcon";
import { formatBytes } from "../utils/format";

function highlightParts(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return text;
  const re = new RegExp(`(${escaped})`, "i");
  const segments = text.split(re);
  return segments.map((seg, i) =>
    seg.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="rounded bg-(--primary) px-0.5 text-(--primary-foreground)"
      >
        {seg}
      </mark>
    ) : (
      <span key={i}>{seg}</span>
    )
  );
}

function TreeNodeBase({
  node,
  expanded,
  toggle,
  selectedId,
  onSelect,
  focusedId,
  onFocusNode,
  matched,
  query,
  visibleIds,
}) {
  const reduce = useReducedMotion();
  const isFolder = node.type === "folder";
  const isOpen = isFolder && expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const isFocused = focusedId === node.id;
  const isMatch = matched.has(node.id);

  if (visibleIds && !visibleIds.has(node.id)) return null;

  const row = (
    <div
      className={`group flex items-center rounded-lg transition-colors ${
        isSelected ? "bg-(--primary)/10" : "hover:bg-(--muted)"
      } ${isMatch ? "ring-1 ring-(--primary)" : ""}`}
    >
      <button
        type="button"
        data-node-id={node.id}
        tabIndex={isFocused ? 0 : -1}
        onClick={() => {
          onSelect(node);
          if (isFolder) toggle(node.id);
        }}
        onFocus={() => onFocusNode(node.id)}
        aria-label={`${node.type === "folder" ? "Folder" : "File"}: ${node.name}`}
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
      >
        {isFolder ? (
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-(--muted-foreground) transition-transform duration-150 ${
              isOpen ? "rotate-90" : ""
            }`}
            aria-hidden="true"
          />
        ) : (
          <span className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <FileIcon node={node} isOpen={isOpen} />
        <span
          className={`truncate text-sm ${
            isMatch ? "font-semibold text-(--foreground)" : "text-(--foreground)"
          }`}
        >
          {highlightParts(node.name, query)}
        </span>
        {isMatch && (
          <span className="ml-1 shrink-0 rounded-full bg-(--primary) px-1.5 text-[10px] font-semibold text-(--primary-foreground)">
            match
          </span>
        )}
        {node.type === "file" && node.size > 0 && (
          <span className="ml-auto shrink-0 pl-2 text-xs text-(--muted-foreground)">
            {formatBytes(node.size)}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <li
      role="treeitem"
      aria-expanded={isFolder ? isOpen : undefined}
      aria-level={node.depth + 1}
      aria-selected={isSelected}
      className="list-none"
    >
      {row}
      {isFolder && (
        <AnimatePresenceUL open={isOpen} reduce={reduce}>
          <ul role="group" className="ml-3 border-l border-(--border) pl-1">
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                expanded={expanded}
                toggle={toggle}
                selectedId={selectedId}
                onSelect={onSelect}
                focusedId={focusedId}
                onFocusNode={onFocusNode}
                matched={matched}
                query={query}
                visibleIds={visibleIds}
              />
            ))}
          </ul>
        </AnimatePresenceUL>
      )}
    </li>
  );
}

function AnimatePresenceUL({ open, reduce, children }) {
  if (!open) return null;
  if (reduce) return children;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}

const TreeNode = memo(TreeNodeBase);
export default TreeNode;
