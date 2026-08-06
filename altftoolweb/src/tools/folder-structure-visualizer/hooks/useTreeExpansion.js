"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";

// Manages the set of expanded folder node ids.
export function useTreeExpansion(root) {
  const [expanded, setExpanded] = useState(() => new Set());

  // Reset expansion when the tree changes; default-expand top folders.
  useEffect(() => {
    if (!root) {
      setExpanded(new Set());
      return;
    }
    const initial = new Set();
    if (root.children.length > 0) initial.add(root.id);
    root.children.slice(0, 3).forEach((c) => {
      if (c.children.length) initial.add(c.id);
    });
    setExpanded(initial);
  }, [root]);

  const toggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!root) return;
    const all = new Set();
    const walk = (node) => {
      if (node.children.length > 0) {
        all.add(node.id);
        node.children.forEach(walk);
      }
    };
    walk(root);
    setExpanded(all);
  }, [root]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  return {
    expanded,
    toggle,
    expandAll,
    collapseAll,
  };
}
