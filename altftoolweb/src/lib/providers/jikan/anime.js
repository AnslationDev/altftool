import { getJikanClient } from "./client";
import { cleanDescription } from "@/lib/providers/_shared/normalize";

function buildSubtitle(anime) {
  return [anime.type, anime.year].filter(Boolean).join(" · ") || null;
}

/** Shapes a raw Jikan/MAL anime object into what the UI needs. */
function normalizeAnime(anime) {
  return {
    id: anime.mal_id,
    title: anime.title_english || anime.title,
    subtitle: buildSubtitle(anime),
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
    // MyAnimeList's `score` is a real 0-10 user rating — the same scale
    // this app already uses for TMDB's vote_average, so unlike most
    // other providers here, this one gets a genuine displayed rating
    // instead of null.
    rating: typeof anime.score === "number" ? anime.score : null,
    description: cleanDescription(anime.synopsis),
    url: anime.url || null,
  };
}

/**
 * A curated set of real MyAnimeList genre IDs (verified against the live
 * /v4/genres/anime endpoint) — powers the "browse by category" grid. The
 * anime themselves are always real, live-fetched; this only decides
 * which category buttons the grid offers, same idea as TMDB's curated
 * genre list.
 */
const ANIME_CATEGORIES = [
  {
    id: "1",
    label: "Action",
    image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=75",
    description: "High-stakes battles and adrenaline-fueled arcs.",
  },
  {
    id: "2",
    label: "Adventure",
    image: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=500&q=75",
    description: "Journeys, quests, and worlds worth exploring.",
  },
  {
    id: "4",
    label: "Comedy",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=75",
    description: "The lighter side — gags, timing, and good laughs.",
  },
  {
    id: "8",
    label: "Drama",
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=500&q=75",
    description: "Character-driven stories with real emotional weight.",
  },
  {
    id: "10",
    label: "Fantasy",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=75",
    description: "Magic, myth, and worlds beyond our own.",
  },
  {
    id: "22",
    label: "Romance",
    image: "https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=500&q=75",
    description: "Love stories in every shape and pace.",
  },
  {
    id: "24",
    label: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=500&q=75",
    description: "Future tech, space, and ideas that push past today.",
  },
  {
    id: "36",
    label: "Slice of Life",
    image: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=500&q=75",
    description: "Everyday moments, told with quiet warmth.",
  },
  {
    id: "14",
    label: "Horror",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=500&q=75",
    description: "Scares and suspense, not for the faint-hearted.",
  },
  {
    id: "37",
    label: "Supernatural",
    image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&q=75",
    description: "Spirits, powers, and things beyond explanation.",
  },
];

export function getAnimeCategories() {
  return ANIME_CATEGORIES;
}

/**
 * Jikan's filtered/sorted /v4/anime endpoint (genre + order_by + sort)
 * was consistently unreliable in testing — live requests repeatedly
 * returned 504 "Jikan failed to connect to MyAnimeList", while the plain
 * /v4/top/anime endpoint answered reliably on its own. So category
 * browsing fetches real top-ranked anime from the reliable endpoint (a
 * couple of pages, each already carrying real genre tags and real MAL
 * scores) and filters by genre in memory, instead of depending on the
 * flaky filtered endpoint.
 *
 * Jikan enforces a strict ~3 requests/second limit — firing the page
 * requests with Promise.all briefly burst past that and triggered the
 * same 504s this was meant to avoid (confirmed live), so pages are
 * fetched one at a time with a small gap instead.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTopAnimePages(client, pages) {
  const all = [];
  for (let page = 1; page <= pages; page += 1) {
    const result = await client.get("/top/anime", { params: { limit: 25, page } });
    all.push(...(result.data || []));
    if (page < pages) await sleep(400);
  }
  return all;
}

/** Top anime within a single genre, ranked by MyAnimeList's own real score (already sorted — /top/anime returns rank order). */
export async function getAnimeByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const genreId = Number(categoryId);
  if (!genreId) return { anime: [], hasMore: false };

  const client = getJikanClient();
  const all = await fetchTopAnimePages(client, 2); // top 50, real MAL rank order
  const filtered = all.filter((anime) => (anime.genres || []).some((g) => g.mal_id === genreId));

  const start = (page - 1) * limit;
  const anime = filtered.slice(start, start + limit).map(normalizeAnime);
  return { anime, hasMore: start + limit < filtered.length };
}

/** Free-text anime search via Jikan's own /v4/anime?q= endpoint, sorted by real score. */
export async function searchAnime(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { anime: [], hasMore: false };

  const client = getJikanClient();
  const data = await client.get("/anime", { params: { q: trimmed, limit: 20 } });
  const list = (data.data || [])
    .map(normalizeAnime)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const start = (page - 1) * limit;
  const anime = list.slice(start, start + limit);
  return { anime, hasMore: start + limit < list.length };
}
