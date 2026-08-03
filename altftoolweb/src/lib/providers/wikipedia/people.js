import { getWikipediaActionClient, getWikipediaRestClient, getWikimediaPageviewsClient } from "./client";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Real Wikipedia categories, one per profession — each verified live to
 * actually contain direct person articles (many broad-sounding Wikipedia
 * categories are pure containers with only sub-categories and no direct
 * members, e.g. "Category:Olympic gold medalists" — confirmed empty of
 * direct members live, which is why "World Athletics Championships
 * winners" is used for athletes instead).
 */
const PEOPLE_CATEGORIES = [
  {
    id: "actors",
    label: "Actors",
    wikiCategory: "Best Actor Academy Award winners",
    image: "https://images.unsplash.com/photo-1562329265-95a6d7a83440?w=500&q=75",
    description: "Academy Award-winning actors, ranked by real Wikipedia popularity.",
  },
  {
    id: "singers",
    label: "Singers",
    wikiCategory: "Grammy Award winners",
    image: "https://images.unsplash.com/photo-1694720322566-f769f720de49?w=500&q=75",
    description: "Grammy-winning singers, ranked by real Wikipedia popularity.",
  },
  {
    id: "athletes",
    label: "Athletes",
    wikiCategory: "World Athletics Championships winners",
    image: "https://images.unsplash.com/photo-1754873361598-254d39b9bdde?w=500&q=75",
    description: "World Athletics champions, ranked by real Wikipedia popularity.",
  },
  {
    id: "business-leaders",
    label: "Business Leaders",
    wikiCategory: "American billionaires",
    image: "https://images.unsplash.com/photo-1754608264294-bb516a88291c?w=500&q=75",
    description: "Billionaire business leaders, ranked by real Wikipedia popularity.",
  },
  {
    id: "scientists",
    label: "Scientists",
    wikiCategory: "Nobel laureates in Physics",
    image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=500&q=75",
    description: "Nobel Prize-winning scientists, ranked by real Wikipedia popularity.",
  },
  {
    id: "politicians",
    label: "Politicians",
    wikiCategory: "Nobel Peace Prize laureates",
    image: "https://images.unsplash.com/photo-1658958327132-a80f8a9409fb?w=500&q=75",
    description: "Nobel Peace Prize-winning political figures, ranked by real Wikipedia popularity.",
  },
  {
    id: "authors",
    label: "Authors",
    wikiCategory: "Nobel laureates in Literature",
    image: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=500&q=75",
    description: "Nobel Prize-winning authors, ranked by real Wikipedia popularity.",
  },
];

export function getPersonCategories() {
  return PEOPLE_CATEGORIES;
}

function findCategory(categoryId) {
  return PEOPLE_CATEGORIES.find((c) => c.id === categoryId) || null;
}

/** Real, non-fabricated titles only — drops list/index articles that occasionally show up as category members. */
function isRealPersonTitle(title) {
  return !!title && !/^List of\b/i.test(title) && title !== "Head of state";
}

/** Fetches up to `limit` direct member article titles from a real Wikipedia category. */
async function fetchCategoryMembers(wikiCategory, limit = 60) {
  const client = getWikipediaActionClient();
  const data = await client.get("/api.php", {
    params: {
      action: "query",
      list: "categorymembers",
      cmtitle: `Category:${wikiCategory}`,
      cmlimit: limit,
      cmnamespace: 0,
      cmtype: "page",
      format: "json",
    },
  });
  return (data?.query?.categorymembers || []).map((m) => m.title).filter(isRealPersonTitle);
}

/** The last fully-completed calendar month, as the YYYYMMDD00 pair the pageviews API expects. */
function lastCompletedMonthRange() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const fmt = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}00`;
  return { start: fmt(start), end: fmt(end) };
}

/**
 * Real monthly Wikipedia pageviews for one article — this IS the ranking
 * metric ("famous" = "actually looked up a lot"), a genuine number from
 * Wikimedia's own analytics API, not an invented score. Articles that
 * 404 (renamed/redirected titles) or have no traffic data count as 0
 * rather than failing the whole category.
 */
async function fetchPageviews(title) {
  const { start, end } = lastCompletedMonthRange();
  const client = getWikimediaPageviewsClient();
  const article = encodeURIComponent(title.replace(/ /g, "_"));
  try {
    const data = await client.get(`/per-article/en.wikipedia/all-access/all-agents/${article}/monthly/${start}/${end}`);
    return (data.items || []).reduce((sum, item) => sum + (Number(item.views) || 0), 0);
  } catch {
    return 0;
  }
}

function formatCompactNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return String(num);
}

/** Shapes a Wikipedia summary + real pageview count into what the UI needs. */
function normalizePerson(summary, pageviews) {
  const views = formatCompactNumber(pageviews);
  const bio = summary.extract ? summary.extract.slice(0, 260) : null;
  const description = [summary.description, bio].filter(Boolean).join(". ") + (views ? ` (${views} monthly Wikipedia views.)` : "");

  return {
    id: summary.pageid,
    title: summary.title,
    subtitle: summary.description || null,
    image: summary.thumbnail?.source || null,
    // No genuine 0-10 rating exists for a person — real monthly Wikipedia
    // pageviews ARE the ranking metric (how "famous" they are right
    // now), same idea as CoinCap's market-cap rank.
    rating: null,
    description: description.trim(),
    url: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title.replace(/ /g, "_"))}`,
    pageviews,
  };
}

/**
 * Fetches summary + real pageviews for a batch of titles with limited
 * concurrency (a category can run to 60 people) rather than one giant
 * Promise.all, same rate-limit-aware pattern used for PokeAPI/Jikan.
 * A title that fails entirely (deleted/moved article) is dropped rather
 * than surfaced as a broken card.
 */
async function fetchPeopleDetails(titles, concurrency = 10) {
  const restClient = getWikipediaRestClient();
  const results = [];

  for (let i = 0; i < titles.length; i += concurrency) {
    const batch = titles.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (title) => {
        try {
          const [summary, pageviews] = await Promise.all([
            restClient.get(`/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`),
            fetchPageviews(title),
          ]);
          if (summary.type && summary.type !== "standard") return null; // disambiguation/missing pages
          return normalizePerson(summary, pageviews);
        } catch {
          return null;
        }
      }),
    );
    results.push(...batchResults.filter(Boolean));
    if (i + concurrency < titles.length) await sleep(150);
  }

  return results;
}

/**
 * Wikipedia data doesn't change fast and pageviews are only ever
 * refreshed monthly here, so each category's full, ranked roster is
 * cached at module scope for a day rather than re-fetched every request.
 */
const categoryRosterCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getSortedCategoryRoster(categoryId) {
  const category = findCategory(categoryId);
  if (!category) return [];

  const cached = categoryRosterCache.get(categoryId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return cached.roster;

  const titles = await fetchCategoryMembers(category.wikiCategory, 60);
  const people = await fetchPeopleDetails(titles);
  const roster = people.sort((a, b) => b.pageviews - a.pageviews);

  categoryRosterCache.set(categoryId, { roster, cachedAt: Date.now() });
  return roster;
}

/** Top people within a profession, ranked by real monthly Wikipedia pageviews (highest first). */
export async function getPeopleByCategory(categoryId, { page = 1, limit = 10 } = {}) {
  const roster = await getSortedCategoryRoster(categoryId);
  const start = (page - 1) * limit;
  const people = roster.slice(start, start + limit);
  return { people, hasMore: start + limit < roster.length };
}

/**
 * Free-text person search via Wikipedia's own full-text search endpoint,
 * capped so a broad query can't trigger dozens of detail fetches at once.
 */
const MAX_SEARCH_RESULTS = 10;

export async function searchPeople(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { people: [], hasMore: false };

  const client = getWikipediaActionClient();
  const data = await client.get("/api.php", {
    params: {
      action: "query",
      list: "search",
      srsearch: trimmed,
      srnamespace: 0,
      srlimit: MAX_SEARCH_RESULTS,
      format: "json",
    },
  });
  const titles = (data?.query?.search || []).map((r) => r.title).filter(isRealPersonTitle);

  const people = (await fetchPeopleDetails(titles)).sort((a, b) => b.pageviews - a.pageviews);

  const start = (page - 1) * limit;
  const page_ = people.slice(start, start + limit);
  return { people: page_, hasMore: start + limit < people.length };
}
