"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { searchResultsMapping } from "../data/mockResults";

const PROJECT_ID = "altftool";

// ─── Deduplicate by id ────────────────────────────────────────────────────────
const dedupeById = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

/**
 * Unified search data source — 3 layers merged in priority order:
 *  Layer 1 — Mock data      (instant, always visible locally)
 *  Layer 2 — toolMetaMap   (100+ tools, static import, no network)
 *  Layer 3 — Firebase exts  (async, same logic as useFirebaseExtensions)
 *
 * Dataset updates progressively as each layer loads.
 */
export function useSearchDataSource() {
  // Start with mock immediately — local always works
  const [dataset, setDataset] = useState(searchResultsMapping);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function build() {
      const mockLayer = searchResultsMapping; // Layer 1 — already in state

      // ── Layer 2: Tools from toolMetaMap (static, instant after import) ────
      let toolResults = [];
      try {
        const { toolMetaMap } = await import("@/platform/registry/toolMetaMap");

        toolResults = Object.entries(toolMetaMap).map(([slug, tool]) => {
          const cats = Array.isArray(tool.category)
            ? tool.category
            : [tool.category].filter(Boolean);

          return {
            id: `tool__${slug}`,
            title: tool.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            url: `/tools/all/${slug}`,
            displayUrl: `altftool.com › tools › ${slug}`,
            description: tool.description || "A free online tool by AltFTool.",
            category: cats[0] || "Tool",
            tags: [
              "tool",
              ...cats.map((c) => c.toLowerCase()),
              ...slug.split("-"),
            ],
            image: null,
            isExternal: false,
          };
        });

        // Update dataset as soon as tools are ready (mock + tools visible now)
        setDataset(dedupeById([...mockLayer, ...toolResults]));
      } catch (err) {
        console.warn("[SearchEngine] toolMetaMap load failed:", err);
      }

      // ── Layer 3: Extensions from Firebase (same as useFirebaseExtensions) ──
      try {
        const extensions = await getCachedFirebaseRead("extensions:list", async () => {
          const colRef = collection(db, "projects", PROJECT_ID, "extensions");
          const snapshot = await getDocs(colRef);
          const rows = snapshot.docs.map((doc) => ({ slug: doc.id, ...doc.data() }));
          rows.sort((a, b) => a.name?.localeCompare(b.name));
          return rows;
        }, 120000);

        const extResults = extensions.map((ext) => {
          return {
            id: `ext__${ext.slug}`,
            title: ext.name || ext.slug,
            url: `/extensions/${ext.slug}`,
            displayUrl: `altftool.com › extensions › ${ext.slug}`,
            description: ext.description || "A browser extension by AltFTool.",
            category: ext.category || "Extension",
            tags: [
              "extension",
              "chrome",
              ...(ext.category ? [ext.category.toLowerCase()] : []),
              ...(ext.slug || "").split("-"),
            ],
            image: ext.iconUrl || ext.imageUrl || ext.icon || null,
            isExternal: false,
          };
        });

        // Final merge: all 3 layers, deduplicated
        setDataset(dedupeById([...mockLayer, ...toolResults, ...extResults]));
      } catch (err) {
        // Firebase unavailable locally — mock + tools still work fine
        console.warn("[SearchEngine] Firebase extensions fetch failed:", err);
      }

      setLoading(false);
    }

    build();
  }, []);

  return { dataset, loading };
}
