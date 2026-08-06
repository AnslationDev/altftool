// ============================================================================
// Top3 — Data access layer (selectors)
// ----------------------------------------------------------------------------
// UI components never touch the raw arrays directly. When a real backend is
// introduced, only these functions need to become async — the components and
// their prop shapes stay exactly the same.
// ============================================================================

import { categories, rankings } from "./content";

export const getAllRankings = () => rankings;

export const getAllCategories = () => categories;

export const getRankingBySlug = (slug) =>
  rankings.find((r) => r.slug === slug);

export const getCategoryBySlug = (slug) =>
  categories.find((c) => c.slug === slug);

export const getCategoryByName = (name) =>
  categories.find((c) => c.name === name);

export const getRankingsByCategory = (name) =>
  rankings.filter((r) => r.category === name);

export const getCategoryCount = (name) =>
  getRankingsByCategory(name).length;

export const getPopularRankings = (limit = 6) =>
  [...rankings].sort((a, b) => b.popularity - a.popularity).slice(0, limit);

export const getRelatedRankings = (current, limit = 3) => {
  const sameCategory = rankings.filter(
    (r) => r.category === current.category && r.id !== current.id
  );
  const elsewhere = rankings
    .filter((r) => r.category !== current.category && r.id !== current.id)
    .sort((a, b) => b.popularity - a.popularity);
  return [...sameCategory, ...elsewhere].slice(0, limit);
};

export const searchRankings = (query, category) => {
  const q = query.trim().toLowerCase();
  return rankings.filter((r) => {
    const inCategory = !category || category === "All" || r.category === category;
    if (!inCategory) return false;
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.products.some(
        (p) =>
          p.name.toLowerCase().includes(q) || p.maker.toLowerCase().includes(q)
      )
    );
  });
};

// --- formatting helpers ----------------------------------------------------

export const formatLongDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export const formatShortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const rankLabel = (rank) =>
  rank === 1 ? "Best overall" : rank === 2 ? "Runner-up" : "Also great";

/** Union of spec labels across a ranking's three products, in first-seen order. */
export const specMatrix = (ranking) => {
  const labels = [];
  ranking.products.forEach((p) =>
    p.specs.forEach((s) => {
      if (!labels.includes(s.label)) labels.push(s.label);
    })
  );
  return labels.map((label) => ({
    label,
    values: ranking.products.map(
      (p) => p.specs.find((s) => s.label === label)?.value ?? "—"
    ),
  }));
};
