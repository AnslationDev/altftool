"use client";

import { useMemo } from "react";

// Computes visibility, search matches, and forced-expansion for the tree.
// `filtersActive` is true when any of query / typeFilter / extensions apply.
export function useTreeFilter(root, { query, typeFilter, activeExtensions }) {
  return useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    const extSet = activeExtensions && activeExtensions.size > 0 ? activeExtensions : null;
    const filtersActive = q !== "" || extSet !== null || typeFilter !== "all";

    const visibleIds = new Set();
    const matchedIds = new Set();
    const forcedExpand = new Set();

    if (!filtersActive || !root) {
      return {
        visibleIds: null,
        matchedIds,
        forcedExpand,
        filtersActive: false,
        matchCount: 0,
      };
    }

    const dfs = (node) => {
      const passesType =
        typeFilter === "all"
          ? true
          : typeFilter === "files"
          ? node.type === "file"
          : node.type === "folder";

      let passesExt = true;
      if (node.type === "file" && extSet) {
        passesExt = extSet.has(node.extension);
      }
      const selfTypeOk = passesType && passesExt;
      const isSearchHit = q !== "" && node.name.toLowerCase().includes(q);

      let childHasVisible = false;
      node.children.forEach((child) => {
        if (dfs(child)) childHasVisible = true;
      });

      if (node.type === "folder") {
        const isContainer = childHasVisible;
        const show =
          q === ""
            ? selfTypeOk || isContainer
            : isContainer || (selfTypeOk && isSearchHit);
        if (show) {
          visibleIds.add(node.id);
          if (isSearchHit) matchedIds.add(node.id);
          if (isContainer && (q !== "" || extSet !== null || typeFilter === "files")) {
            forcedExpand.add(node.id);
          }
        }
        return show;
      }

      const show = selfTypeOk && (q === "" ? true : isSearchHit);
      if (show) {
        visibleIds.add(node.id);
        if (isSearchHit) matchedIds.add(node.id);
      }
      return show;
    };

    dfs(root);

    return {
      visibleIds,
      matchedIds,
      forcedExpand,
      filtersActive: true,
      matchCount: matchedIds.size,
    };
  }, [root, query, typeFilter, activeExtensions]);
}
