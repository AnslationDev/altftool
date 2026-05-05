// hooks/useBlogSearch.js
import { useMemo } from "react";

/**
 * Filters an already-loaded blogs array by a text query.
 * For full-corpus search beyond loaded pages, see hybrid note below.
 */
export function useBlogSearch(blogs, query) {
  return useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => {
      const title    = (b.heading  || b.title   || "").toLowerCase();
      const excerpt  = (b.excerpt  || b.description || "").toLowerCase();
      const category = (b.category || "").toLowerCase();
      return title.includes(q) || excerpt.includes(q) || category.includes(q);
    });
  }, [blogs, query]);
}

/*
 * HYBRID SEARCH NOTE
 * ------------------
 * For a full-corpus search (beyond the current page of loaded blogs),
 * use Algolia / Typesense and index only list fields.
 * Or: maintain a separate Firestore "search_index" collection with
 * lightweight docs and query it with where("tokens", "array-contains", word).
 *
 * For most blogs (<500 posts) the pure client-side approach above is
 * sufficient because all published slugs/titles fit comfortably in memory.
 * Use loadAll() helper below in that case.
 */