/**
 * Top 49 — catalog compiler.
 *
 * Catalogs are authored in a compact shape (see data/catalogs/*.js). This module
 * expands them into the three normalised collections the rest of the route
 * queries: lists, items and rankings.
 *
 * Everything is deterministic — scores, vote counts and rank movement are all
 * derived from stable string hashes, never from Math.random — so the server and
 * client always render identical markup.
 */

import { hash, seeded, seededInt, slugify } from './format.js';

const FLOOR_SCORE = 71.5;

/**
 * @typedef {Object} SeedItem
 * @property {string}   n     Name
 * @property {string}  [s]    Subtitle / byline
 * @property {string}   b     Blurb — 1-2 real sentences
 * @property {string}  [d]    Optional long description; composed if absent
 * @property {string}  [img]  Unsplash photo id
 * @property {Object}  [a]    Attributes, keyed by column key
 * @property {string[]}[t]    Tags
 * @property {string[]}[pros]
 * @property {string[]}[cons]
 * @property {string}  [note] Editorial note shown against the ranking
 * @property {{label:string,url:string}[]} [links]
 */

/**
 * Expand one catalog into normalised records.
 * @param {Object} catalog
 */
function compileCatalog(catalog, acc) {
  const categorySlug = catalog.category;

  catalog.lists.forEach((raw) => {
    const listSlug = raw.slug;
    const seeds = raw.items || [];
    const count = seeds.length;
    if (!count) return;

    const criteria = normaliseCriteria(raw.criteria);
    const decay = count > 1 ? (topBase(listSlug) - FLOOR_SCORE) / (count - 1) : 0;

    let previousScore = Infinity;
    let listVotes = 0;

    seeds.forEach((seed, index) => {
      const rank = index + 1;
      const itemSlug = seed.slug || slugify(seed.n);
      const seedKey = `${listSlug}:${itemSlug}`;

      // ── score ──────────────────────────────────────────────────────────
      const base = topBase(listSlug) - (rank - 1) * decay;
      const scoreBreakdown = {};
      let weighted = 0;
      criteria.forEach((criterion, ci) => {
        const spread = (seeded(`${seedKey}:c${ci}`) - 0.5) * 6.4;
        const value = clamp(round1(base + spread), 54, 99.4);
        scoreBreakdown[criterion.name] = value;
        weighted += criterion.weight * value;
      });
      // Keep scores strictly monotonic so rank order and score order agree.
      const score = clamp(round1(Math.min(weighted, previousScore - 0.1)), 50, 99.6);
      previousScore = score;

      // ── engagement ─────────────────────────────────────────────────────
      const votes =
        Math.round(
          (16800 - rank * 190 + seededInt(`${seedKey}:v`, -1400, 1400)) / 10,
        ) * 10;
      const safeVotes = Math.max(420, votes);
      listVotes += safeVotes;

      // ── movement ───────────────────────────────────────────────────────
      const isNew = rank > 3 && seeded(`${seedKey}:new`) < 0.09;
      const drift = seededInt(`${seedKey}:prev`, -4, 4);
      const previousRank = isNew ? null : clamp(rank + drift, 1, count);

      const isEditorsPick = rank <= 3 || seeded(`${seedKey}:pick`) < 0.11;

      acc.rankings.push({
        listSlug,
        itemSlug,
        rank,
        previousRank,
        score,
        scoreBreakdown,
        votes: safeVotes,
        isEditorsPick,
        isTie: false,
        editorialNote: seed.note || null,
      });

      // ── item (deduped globally, appearsIn merged) ──────────────────────
      const existing = acc.itemMap.get(itemSlug);
      if (existing) {
        // Two different entries resolving to one slug would silently discard
        // the second one's data, so surface it instead of swallowing it.
        if (existing.name !== seed.n) {
          acc.collisions.push(`${itemSlug}: "${existing.name}" vs "${seed.n}"`);
        }
        if (!existing.appearsIn.includes(listSlug)) existing.appearsIn.push(listSlug);
        return;
      }

      const attributes = normaliseAttributes(seed.a, raw.columns);
      acc.itemMap.set(itemSlug, {
        slug: itemSlug,
        name: seed.n,
        subtitle: seed.s || null,
        kind: raw.itemKind || categorySlug,
        categorySlug,
        summary: seed.b,
        description: seed.d || composeDescription(seed, attributes),
        image: seed.img || raw.image || null,
        imageAlt: seed.alt || `${seed.n}${seed.s ? ` — ${seed.s}` : ''}`,
        attributes,
        tags: seed.t || [],
        pros: seed.pros || [],
        cons: seed.cons || [],
        links: seed.links || [],
        appearsIn: [listSlug],
      });
    });

    acc.lists.push({
      slug: listSlug,
      categorySlug,
      title: raw.title,
      shortTitle: raw.shortTitle || raw.title,
      tagline: raw.tagline,
      intro: raw.intro,
      image: raw.image || null,
      criteria,
      columns: raw.columns || [],
      filters: raw.filters || [],
      faqs: (raw.faqs || []).map((f) => ({
        question: f.q || f.question,
        answer: f.a || f.answer,
      })),
      dataAsOf: raw.dataAsOf || '2026-07-01',
      updateFrequency: raw.updateFrequency || 'monthly',
      updatedAt: `${raw.dataAsOf || '2026-07-01'}T00:00:00.000Z`,
      itemCount: count,
      totalVotes: listVotes,
      isFeatured: Boolean(raw.featured),
      isTrending: Boolean(raw.trending),
      relatedListSlugs: raw.related || [],
      methodologyNote: raw.methodologyNote || null,
    });
  });
}

/** Deterministic per-list ceiling so every list does not start at exactly 97. */
function topBase(listSlug) {
  return 95.4 + (hash(listSlug) % 32) / 10; // 95.4 – 98.5
}

function normaliseCriteria(criteria) {
  const list = (criteria || []).map((c) => ({
    name: c.name,
    weight: Number(c.weight) || 0,
    description: c.description || '',
  }));
  const total = list.reduce((sum, c) => sum + c.weight, 0);
  if (!total) return list;
  // Normalise to exactly 1 so the displayed percentages always add to 100.
  return list.map((c) => ({ ...c, weight: c.weight / total }));
}

function normaliseAttributes(attrs, columns) {
  if (!attrs) return [];
  const byKey = new Map((columns || []).map((c) => [c.key, c]));
  return Object.entries(attrs).map(([key, value]) => {
    const column = byKey.get(key);
    return {
      key,
      label: column?.label || titleCase(key),
      value,
      unit: column?.unit,
      format: column?.format || inferFormat(key, value),
    };
  });
}

function inferFormat(key, value) {
  if (/year|released|founded/.test(key)) return 'year';
  if (/runtime|minutes|duration/.test(key)) return 'duration';
  if (/rating|imdb|score/.test(key)) return 'rating';
  if (/price|cost|msrp/.test(key)) return 'price';
  if (/percent|share|rate/.test(key)) return 'percent';
  if (typeof value === 'number' && value >= 1000) return 'number';
  return 'text';
}

function titleCase(key) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * Compose a longer description when a catalog entry does not supply one.
 * Uses only real values already present on the entry — never invented facts.
 */
function composeDescription(seed, attributes) {
  const parts = [seed.b];

  const factual = attributes
    .filter((a) => a.value !== null && a.value !== undefined && a.value !== '')
    .slice(0, 3)
    .map((a) => `${a.label.toLowerCase()} ${a.value}${a.unit ? ` ${a.unit}` : ''}`);
  if (factual.length) {
    parts.push(`Recorded specifics: ${factual.join(', ')}.`);
  }

  if (seed.pros?.length) {
    parts.push(`Panel highlighted ${joinList(seed.pros.map(lowerFirst))}.`);
  }
  if (seed.cons?.length) {
    parts.push(`The reservation on record is ${joinList(seed.cons.map(lowerFirst))}.`);
  }
  return parts.filter(Boolean).join(' ');
}

function lowerFirst(s = '') {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function joinList(arr = []) {
  if (arr.length <= 1) return arr[0] || '';
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Compile every catalog into the normalised dataset.
 * @param {Object[]} catalogs
 */
export function compile(catalogs) {
  const acc = { lists: [], rankings: [], itemMap: new Map(), collisions: [] };
  catalogs.forEach((catalog) => {
    if (catalog?.lists?.length) compileCatalog(catalog, acc);
  });

  if (acc.collisions.length && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[top49] ${acc.collisions.length} slug collision(s) — entries were merged:\n  ` +
        [...new Set(acc.collisions)].join('\n  '),
    );
  }

  return {
    lists: acc.lists,
    items: [...acc.itemMap.values()],
    rankings: acc.rankings,
    collisions: [...new Set(acc.collisions)],
  };
}
