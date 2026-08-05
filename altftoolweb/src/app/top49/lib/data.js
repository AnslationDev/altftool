/**
 * Top 49 — the query layer.
 *
 * The full dataset is compiled once at module load and then served from
 * in-memory indexes. Every exported query is async so the call sites read the
 * same way they would against a real database — swapping this file for a
 * Postgres/Firestore implementation would not require touching any page.
 */

import { categories, getCategoryBySlug } from '../data/categories.js';
import { groups, getGroup, getGroupForCategory } from '../data/groups.js';
import { catalogs } from '../data/index.js';
import { compile } from './build.js';
import { seeded } from './format.js';

/** This route runs on curated editorial mock data, surfaced in the UI. */
export const IS_MOCK_DATA = true;

const { lists, items, rankings } = compile(catalogs);

// ── indexes ────────────────────────────────────────────────────────────────
const listBySlug = new Map(lists.map((l) => [l.slug, l]));
const itemBySlug = new Map(items.map((i) => [i.slug, i]));

const listsByCategory = new Map();
lists.forEach((l) => {
  if (!listsByCategory.has(l.categorySlug)) listsByCategory.set(l.categorySlug, []);
  listsByCategory.get(l.categorySlug).push(l);
});

const rankingsByList = new Map();
rankings.forEach((r) => {
  if (!rankingsByList.has(r.listSlug)) rankingsByList.set(r.listSlug, []);
  rankingsByList.get(r.listSlug).push(r);
});
rankingsByList.forEach((arr) => arr.sort((a, b) => a.rank - b.rank));

const rankingsByItem = new Map();
rankings.forEach((r) => {
  if (!rankingsByItem.has(r.itemSlug)) rankingsByItem.set(r.itemSlug, []);
  rankingsByItem.get(r.itemSlug).push(r);
});

// ── derived category stats (never hardcoded, so counts cannot drift) ───────
const categoryStats = new Map();
categories.forEach((c) => {
  const catLists = listsByCategory.get(c.slug) || [];
  const itemCount = catLists.reduce((sum, l) => sum + l.itemCount, 0);
  const votes = catLists.reduce((sum, l) => sum + l.totalVotes, 0);
  categoryStats.set(c.slug, {
    listCount: catLists.length,
    itemCount,
    totalVotes: votes,
    primaryListSlug: catLists[0]?.slug || null,
  });
});

function decorate(category) {
  if (!category) return undefined;
  return { ...category, ...(categoryStats.get(category.slug) || {}) };
}

// ── totals used across the landing page ───────────────────────────────────
export const totals = {
  categories: categories.length,
  groups: groups.length,
  lists: lists.length,
  items: items.length,
  rankings: rankings.length,
  votes: lists.reduce((sum, l) => sum + l.totalVotes, 0),
};

// ── categories & groups ───────────────────────────────────────────────────

export async function getCategories() {
  return categories.map(decorate);
}

export async function getCategory(slug) {
  return decorate(getCategoryBySlug(slug));
}

export async function getTrendingCategories(limit = 8) {
  return categories
    .filter((c) => c.isTrending)
    .slice(0, limit)
    .map(decorate);
}

export async function getGroups() {
  return groups;
}

export async function getGroupsWithCategories() {
  return groups.map((group) => ({
    group,
    categories: categories
      .filter((c) => group.categorySlugs.includes(c.slug))
      .map(decorate),
  }));
}

export async function getGroupWithCategories(slug) {
  const group = getGroup(slug);
  if (!group) return undefined;
  return {
    group,
    categories: categories
      .filter((c) => group.categorySlugs.includes(c.slug))
      .map(decorate),
  };
}

export async function getCategoryGroup(categorySlug) {
  return getGroupForCategory(categorySlug);
}

// ── lists ─────────────────────────────────────────────────────────────────

export async function getAllLists() {
  return lists;
}

export async function getList(categorySlug, listSlug) {
  const list = listBySlug.get(listSlug);
  if (!list) return undefined;
  if (categorySlug && list.categorySlug !== categorySlug) return undefined;
  return list;
}

export async function getListBySlug(listSlug) {
  return listBySlug.get(listSlug);
}

export async function getListsByCategory(categorySlug) {
  return listsByCategory.get(categorySlug) || [];
}

export async function getFeaturedLists(limit = 6) {
  const featured = lists.filter((l) => l.isFeatured);
  const pool = featured.length >= limit ? featured : lists;
  return [...pool]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, limit);
}

export async function getTrendingLists(limit = 10) {
  const trending = lists.filter((l) => l.isTrending);
  const pool = trending.length >= limit ? trending : lists;
  return [...pool]
    .sort((a, b) => seeded(`trend:${b.slug}`) - seeded(`trend:${a.slug}`))
    .slice(0, limit);
}

export async function getRelatedLists(slugs = [], fallbackCategory, limit = 3) {
  const direct = slugs.map((s) => listBySlug.get(s)).filter(Boolean);
  if (direct.length >= limit) return direct.slice(0, limit);
  const filler = (listsByCategory.get(fallbackCategory) || []).filter(
    (l) => !direct.some((d) => d.slug === l.slug),
  );
  return [...direct, ...filler].slice(0, limit);
}

// ── ranked items ──────────────────────────────────────────────────────────

/**
 * Fetch the ranked rows of a list with sorting, filtering and pagination.
 *
 * @param {string} listSlug
 * @param {Object} [options]
 * @param {string}  [options.sort]     'rank' | 'score' | 'votes' | attribute key
 * @param {'asc'|'desc'} [options.dir]
 * @param {string[]} [options.tags]    Tag filter (OR within the group)
 * @param {[number,number]} [options.range]
 * @param {string} [options.rangeKey]
 * @param {boolean} [options.editorsPick]
 * @param {string} [options.q]
 * @param {number} [options.page]
 * @param {number} [options.limit]
 */
export async function getRankedItems(listSlug, options = {}) {
  const {
    sort = 'rank',
    dir = sort === 'rank' ? 'asc' : 'desc',
    tags = [],
    range = null,
    rangeKey = null,
    editorsPick = false,
    q = '',
    page = 1,
    limit = 12,
  } = options;

  const listRankings = rankingsByList.get(listSlug) || [];
  let rows = listRankings
    .map((ranking) => ({ ranking, item: itemBySlug.get(ranking.itemSlug) }))
    .filter((row) => Boolean(row.item));

  const unfilteredTotal = rows.length;

  if (tags.length) {
    rows = rows.filter((row) => row.item.tags.some((t) => tags.includes(t)));
  }

  if (range && rangeKey) {
    const [min, max] = range;
    rows = rows.filter((row) => {
      const attr = row.item.attributes.find((a) => a.key === rangeKey);
      const value = Number(attr?.value);
      if (Number.isNaN(value)) return true;
      return value >= min && value <= max;
    });
  }

  if (editorsPick) {
    rows = rows.filter((row) => row.ranking.isEditorsPick);
  }

  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.item.name.toLowerCase().includes(needle) ||
        row.item.summary.toLowerCase().includes(needle) ||
        row.item.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }

  rows.sort((a, b) => compareRows(a, b, sort, dir));

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  // Clamp rather than returning an empty page: an out-of-range ?page= should
  // land on the last real page, not on a misleading "no results" screen.
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * limit;
  const paged = rows.slice(start, start + limit);

  return {
    rows: paged,
    total,
    unfilteredTotal,
    page: safePage,
    requestedPage: page,
    limit,
    pageCount,
    hasMore: start + limit < total,
    isFiltered: total !== unfilteredTotal,
  };
}

function compareRows(a, b, sort, dir) {
  const mult = dir === 'asc' ? 1 : -1;
  let av;
  let bv;

  if (sort === 'rank') {
    av = a.ranking.rank;
    bv = b.ranking.rank;
  } else if (sort === 'score') {
    av = a.ranking.score;
    bv = b.ranking.score;
  } else if (sort === 'votes') {
    av = a.ranking.votes;
    bv = b.ranking.votes;
  } else if (sort === 'name') {
    return a.item.name.localeCompare(b.item.name) * mult;
  } else {
    av = a.item.attributes.find((x) => x.key === sort)?.value;
    bv = b.item.attributes.find((x) => x.key === sort)?.value;
  }

  if (av === undefined || av === null) return 1;
  if (bv === undefined || bv === null) return -1;
  if (typeof av === 'string' || typeof bv === 'string') {
    return String(av).localeCompare(String(bv)) * mult;
  }
  if (av === bv) return a.ranking.rank - b.ranking.rank;
  return (av < bv ? -1 : 1) * mult;
}

/** Top three of a list, used for the podium. */
export async function getPodium(listSlug) {
  const listRankings = (rankingsByList.get(listSlug) || []).slice(0, 3);
  return listRankings
    .map((ranking) => ({ ranking, item: itemBySlug.get(ranking.itemSlug) }))
    .filter((row) => Boolean(row.item));
}

/** Every row of a list, unpaginated — used by JSON-LD and the compare picker. */
export async function getAllRankedItems(listSlug) {
  return (rankingsByList.get(listSlug) || [])
    .map((ranking) => ({ ranking, item: itemBySlug.get(ranking.itemSlug) }))
    .filter((row) => Boolean(row.item));
}

/** Distinct tag values actually present in a list, with live counts. */
export async function getListFacets(listSlug) {
  const rows = await getAllRankedItems(listSlug);
  const counts = new Map();
  rows.forEach(({ item }) => {
    item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
  });
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

// ── items ─────────────────────────────────────────────────────────────────

export async function getItem(slug) {
  return itemBySlug.get(slug);
}

export async function getItems(slugs = []) {
  return slugs.map((s) => itemBySlug.get(s)).filter(Boolean);
}

export async function getItemRankings(slug) {
  const rows = rankingsByItem.get(slug) || [];
  return rows
    .map((ranking) => ({ ranking, list: listBySlug.get(ranking.listSlug) }))
    .filter((row) => Boolean(row.list))
    .sort((a, b) => a.ranking.rank - b.ranking.rank);
}

/** Neighbours in a list, for prev/next navigation on the item page. */
export async function getItemNeighbours(listSlug, rank) {
  const listRankings = rankingsByList.get(listSlug) || [];
  const prev = listRankings.find((r) => r.rank === rank - 1);
  const next = listRankings.find((r) => r.rank === rank + 1);
  const wrap = (r) => (r ? { ranking: r, item: itemBySlug.get(r.itemSlug) } : null);
  return { prev: wrap(prev), next: wrap(next) };
}

/** Other entries from the same list, excluding the current one. */
export async function getSimilarItems(itemSlug, limit = 6) {
  const item = itemBySlug.get(itemSlug);
  if (!item) return [];
  const primaryList = item.appearsIn[0];
  const rows = await getAllRankedItems(primaryList);
  return rows.filter((row) => row.item.slug !== itemSlug).slice(0, limit);
}

// ── search ────────────────────────────────────────────────────────────────

export async function searchAll(query, { limit = 24 } = {}) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) {
    return { query: '', categories: [], lists: [], items: [], total: 0 };
  }

  const matchedCategories = categories
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
    .map(decorate)
    .slice(0, limit);

  const matchedLists = lists
    .filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.tagline.toLowerCase().includes(q) ||
        l.intro.toLowerCase().includes(q),
    )
    .slice(0, limit);

  const matchedItems = items
    .filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        (i.subtitle || '').toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .map((item) => {
      const best = (rankingsByItem.get(item.slug) || []).slice().sort((a, b) => a.rank - b.rank)[0];
      return { item, ranking: best || null };
    })
    .sort((a, b) => (a.ranking?.rank ?? 999) - (b.ranking?.rank ?? 999))
    .slice(0, limit);

  return {
    query,
    categories: matchedCategories,
    lists: matchedLists,
    items: matchedItems,
    total: matchedCategories.length + matchedLists.length + matchedItems.length,
  };
}

/** Popular queries shown on the empty search screen. */
export async function getSearchSuggestions(limit = 10) {
  return [...lists]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, limit)
    .map((l) => ({ label: l.shortTitle, href: `/top49/${l.categorySlug}/${l.slug}` }));
}

// ── compare ───────────────────────────────────────────────────────────────

/**
 * Build a comparison table for up to four items: the union of their attribute
 * keys, plus each item's best ranking.
 */
export async function getComparison(slugs = []) {
  const picked = slugs.map((s) => itemBySlug.get(s)).filter(Boolean).slice(0, 4);
  if (!picked.length) return { items: [], attributeKeys: [], rows: [] };

  const keys = [];
  picked.forEach((item) => {
    item.attributes.forEach((attr) => {
      if (!keys.some((k) => k.key === attr.key)) {
        keys.push({ key: attr.key, label: attr.label, format: attr.format, unit: attr.unit });
      }
    });
  });

  const withRanking = picked.map((item) => {
    const best = (rankingsByItem.get(item.slug) || [])
      .slice()
      .sort((a, b) => a.rank - b.rank)[0];
    return { item, ranking: best || null, list: best ? listBySlug.get(best.listSlug) : null };
  });

  const rows = keys.map((meta) => ({
    ...meta,
    values: withRanking.map(({ item }) => item.attributes.find((a) => a.key === meta.key) || null),
  }));

  return { items: withRanking, attributeKeys: keys, rows };
}

/** Candidate pool for the compare picker — top entries of the biggest lists. */
export async function getCompareCandidates(limit = 60) {
  const pool = [];
  [...lists]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .forEach((list) => {
      (rankingsByList.get(list.slug) || []).slice(0, 6).forEach((ranking) => {
        const item = itemBySlug.get(ranking.itemSlug);
        if (item && !pool.some((p) => p.item.slug === item.slug)) {
          pool.push({ item, ranking, list });
        }
      });
    });
  return pool.slice(0, limit);
}

// ── static params for prerendering ────────────────────────────────────────

export function allCategoryParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function allListParams() {
  return lists.map((l) => ({ category: l.categorySlug, list: l.slug }));
}

export function allItemParams() {
  return items.map((i) => ({ item: i.slug }));
}
