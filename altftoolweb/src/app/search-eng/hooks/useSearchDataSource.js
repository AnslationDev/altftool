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
 *  Layer 4 — Admin-managed directory entries
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
            url: tool.route || tool.href || `/tools/all/${slug}`,
            displayUrl: tool.route || tool.href
              ? `altftool.com › ${(tool.route || tool.href).replace(/^\//, "")}`
              : `altftool.com › tools › ${slug}`,
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
      let extResults = [];
      try {
        const extensions = await getCachedFirebaseRead("extensions:list", async () => {
          const colRef = collection(db, "projects", PROJECT_ID, "extensions");
          const snapshot = await getDocs(colRef);
          const rows = snapshot.docs.map((doc) => ({ slug: doc.id, ...doc.data() }));
          rows.sort((a, b) => a.name?.localeCompare(b.name));
          return rows;
        }, 120000);

        extResults = extensions.map((ext) => {
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

      } catch (err) {
        // Firebase unavailable locally — mock + tools still work fine
        console.warn("[SearchEngine] Firebase extensions fetch failed:", err);
      }

      let managedResults = [];
      try {
        const managedEntries = await getCachedFirebaseRead("global-search:list", async () => {
          const colRef = collection(db, "projects", PROJECT_ID, "GlobalSearch");
          const snapshot = await getDocs(colRef);
          return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
        }, 120000);

        managedResults = managedEntries
          .filter((entry) => String(entry.status || "active").toLowerCase() === "active")
          .map((entry) => {
            const target = String(entry.redirect_url || "#").trim() || "#";
            const keywords = Array.isArray(entry.searchKeywords)
              ? entry.searchKeywords
              : String(entry.searchKeywords || "")
                  .split(",")
                  .map((keyword) => keyword.trim())
                  .filter(Boolean);
            let hostname = "altftool.com";
            let isExternal = false;

            try {
              const parsed = new URL(target, "https://altftool.com");
              hostname = parsed.hostname || hostname;
              isExternal = parsed.hostname !== "altftool.com" && parsed.hostname !== "www.altftool.com";
            } catch {
              // Invalid legacy targets stay visible but are never treated as external links.
            }

            return {
              id: `managed__${entry.id}`,
              title: entry.title || "Untitled resource",
              url: target,
              displayUrl: `${hostname} › ${entry.type || "resource"}`,
              description: entry.description || "A curated resource from AltFTool.",
              category: entry.type || "Resource",
              tags: keywords,
              image: entry.image_url || null,
              price: entry.price || null,
              isExternal,
            };
          });
      } catch (err) {
        console.warn("[SearchEngine] Managed directory fetch failed:", err);
      }

      setDataset(dedupeById([...mockLayer, ...toolResults, ...extResults, ...managedResults]));

      setLoading(false);
    }

    build();
  }, []);

  return { dataset, loading };
}
