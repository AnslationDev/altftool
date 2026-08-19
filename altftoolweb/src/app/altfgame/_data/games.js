// Game catalog — single source of truth for the platform.
// Raw data lives in games.json; this module derives every list the UI needs.
// Pure data + pure functions: safe to import from server and client components.
import raw from "./games.json";

export const GAMES = raw;

// Display taxonomy. Every game declares exactly one of these categories.
export const CATEGORY_META = [
  { name: "Action", emoji: "⚡", color: "#ef4444" },
  { name: "Adventure", emoji: "🗺️", color: "#f97316" },
  { name: "Racing", emoji: "🏎️", color: "#8b5cf6" },
  { name: "Puzzle", emoji: "🧩", color: "#6366f1" },
  { name: "Arcade", emoji: "👾", color: "#ec4899" },
  { name: "Sports", emoji: "🏆", color: "#10b981" },
  { name: "Multiplayer", emoji: "👥", color: "#06b6d4" },
  { name: "Kids", emoji: "🧸", color: "#facc15" },
  { name: "Strategy", emoji: "♟️", color: "#64748b" },
];

export const CATEGORIES = CATEGORY_META.map((c) => ({
  ...c,
  slug: c.name.toLowerCase(),
  count: GAMES.filter((g) => g.category === c.name).length,
})).filter((c) => c.count > 0);

export const GAME_MAP = Object.fromEntries(GAMES.map((g) => [g.slug, g]));

export function getGame(slug) {
  return GAME_MAP[slug] ?? null;
}

export const FEATURED = GAMES.filter((g) => g.featured);
export const TRENDING = GAMES.filter((g) => g.trending);
export const NEW_RELEASES = GAMES.filter((g) => g.isNew);

// No play-count or rating data exists anywhere in this catalog (see
// gameContent.js: "Nothing is invented — no review counts, no player
// numbers, no awards"), so a real "most played" ranking can't be computed.
// POPULAR reuses the hand-curated `featured` flag rather than fabricate a
// popularity metric — it's a distinct editorial set from TRENDING, not an
// alias of it.
export const POPULAR = FEATURED;

export function getByCategory(name) {
  return GAMES.filter((g) => g.category === name);
}

export function categoryFromSlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function topCategories(n = 3) {
  return [...CATEGORIES].sort((a, b) => b.count - a.count).slice(0, n);
}

// Same-category games first; topped up with other catalog games so the
// section is never empty (some categories only have one game).
export function getRelated(slug, limit = 8) {
  const game = GAME_MAP[slug];
  if (!game) return [];
  const sameCategory = GAMES.filter((g) => g.slug !== slug && g.category === game.category);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const fillers = GAMES.filter(
    (g) => g.slug !== slug && g.category !== game.category
  );
  return [...sameCategory, ...fillers].slice(0, limit);
}

// Catalog picks excluding the current game (play-page sidebar).
export function getRecommended(slug, limit = 6) {
  return GAMES.filter((g) => g.slug !== slug).slice(0, limit);
}

// Personalised home recommendations: prefer categories the player has
// favorited, skip games already favorited.
export function getRecommendedFromFavorites(favoriteSlugs, limit = 8) {
  const favs = new Set(favoriteSlugs);
  const favCategories = new Set(
    [...favs].map((s) => GAME_MAP[s]?.category).filter(Boolean)
  );
  const score = (g) => (favCategories.has(g.category) ? 1 : 0);
  return GAMES.filter((g) => !favs.has(g.slug))
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
