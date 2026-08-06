/*
 * AltF Ideas corpus access (server only)
 *
 * The corpus is split by how it is actually read, not by how it was written:
 *
 *   shards/       full records for the published set (top 12k) — static pages
 *   by-vertical/  compact records for all ~117k, one file per vertical
 *   top-index     default browse payload
 *   facets.json   filter-rail counts, no records needed
 *
 * Everything is read lazily and memoised per process, so a page that only
 * needs one vertical never pays for the whole corpus.
 */

import { rehydrate } from "./compose.js";
import { readIdeasCorpusFile } from "./corpus-source.js";

export function createIdeasJsonLoader({
  readCorpusFileImpl = readIdeasCorpusFile,
} = {}) {
  const cache = new Map();

  return function loadJson(relativePath) {
    if (cache.has(relativePath)) return cache.get(relativePath);

    const promise = readCorpusFileImpl(relativePath)
      .then((bytes) => JSON.parse(Buffer.from(bytes).toString("utf8")))
      .catch((error) => {
        cache.delete(relativePath);
        const wrapped = new Error(
          `AltF Ideas corpus missing "${relativePath}". Run "npm run generate:ideas" first. (${error.message})`,
          { cause: error },
        );
        wrapped.code = error?.code;
        throw wrapped;
      });

    cache.set(relativePath, promise);
    return promise;
  };
}

const loadJson = createIdeasJsonLoader();

export const getManifest = () => loadJson("manifest.json");
export const getFacets = () => loadJson("facets.json");
export const getTopIndex = () => loadJson("top-index.json");
export const getVerticalIndex = (slug) => loadJson(`by-vertical/${slug}.json`);

/** Full records live in ranked shards, so shard 000 holds the best ideas. */
export async function getShard(n) {
  return loadJson(`shards/shard-${String(n).padStart(3, "0")}.json`);
}

export const getSlugMap = () => loadJson("slug-map.json");

/**
 * Resolve one idea by slug — for any of the 117,264, not just the stored ones.
 *
 * Reads the slug map to find the owning vertical, loads that one vertical file,
 * then rebuilds the full record from its compact DNA. Rehydration is verified
 * byte-identical to the stored records by scripts/verify-rehydration.mjs, so
 * this path is used uniformly rather than scanning shards for published ideas
 * and falling back for the rest.
 *
 * Returns `{ idea, published }` — `published` decides whether the page is
 * indexable, since we do not ask search engines to take 105k generated pages.
 */
export async function getIdeaBySlug(slug) {
  let verticalSlug;
  try {
    const slugMap = await getSlugMap();
    verticalSlug = slugMap[slug];
  } catch {
    return null;
  }
  if (!verticalSlug) return null;

  const [rows, manifest] = await Promise.all([getVerticalIndex(verticalSlug), getManifest()]);
  const compact = rows.find((row) => row.s === slug);
  if (!compact) return null;

  const idea = rehydrate(compact);
  if (!idea) return null;

  return { idea, published: compact.r <= manifest.published };
}

/**
 * Full records for a rank range. Shards are written in rank order, so a range
 * maps straight onto shard slices — a browse page reads at most two shards
 * regardless of how deep it is paginated.
 */
export async function getPublishedRange(start, count) {
  const manifest = await getManifest();
  const size = manifest.shardSize;
  const out = [];
  let cursor = start;

  while (out.length < count) {
    const shardIndex = Math.floor(cursor / size);
    if (shardIndex >= manifest.shards) break;
    const shard = await getShard(shardIndex);
    const offset = cursor - shardIndex * size;
    const slice = shard.slice(offset, offset + (count - out.length));
    if (slice.length === 0) break;
    out.push(...slice);
    cursor += slice.length;
  }
  return out;
}

/**
 * Every published record, concatenated. Used by pages whose filter needs
 * fields the compact index does not carry (startup cost, ACV, raw signals).
 * Memoised per process, so the shard reads happen once.
 */
let allPublishedPromise = null;
export function getAllPublished() {
  if (!allPublishedPromise) {
    allPublishedPromise = (async () => {
      const manifest = await getManifest();
      const shards = await Promise.all(
        Array.from({ length: manifest.shards }, (_, n) => getShard(n)),
      );
      return shards.flat();
    })().catch((error) => {
      allPublishedPromise = null;
      throw error;
    });
  }
  return allPublishedPromise;
}

/** Resolve a list of slugs to full records, preserving the given order. */
export async function getIdeasBySlugs(slugs) {
  const manifest = await getManifest();
  const wanted = new Set(slugs);
  const found = new Map();

  for (let n = 0; n < manifest.shards && found.size < wanted.size; n += 1) {
    const shard = await getShard(n);
    for (const idea of shard) {
      if (wanted.has(idea.slug)) found.set(idea.slug, idea);
    }
  }
  return slugs.map((slug) => found.get(slug)).filter(Boolean);
}

/** Every published slug — drives generateStaticParams and the sitemap. */
export async function getPublishedSlugs() {
  const index = await getTopIndex();
  return index.map((entry) => entry.s);
}

/**
 * Filter and sort the compact index. Reads one vertical file when a vertical
 * filter is present, otherwise the top index — never the whole corpus.
 */
export async function queryIdeas({
  vertical,
  mechanism,
  job,
  model,
  effort,
  collection,
  minAos,
  sort = "aos",
  page = 1,
  perPage = 24,
} = {}) {
  const source = vertical ? await getVerticalIndex(vertical) : await getTopIndex();

  let rows = source;
  if (mechanism) rows = rows.filter((r) => r.m === mechanism);
  if (job) rows = rows.filter((r) => r.j === job);
  if (model) rows = rows.filter((r) => r.mo === model);
  if (effort) rows = rows.filter((r) => r.e === effort);
  if (collection) rows = rows.filter((r) => r.c.includes(collection));
  if (Number.isFinite(minAos)) rows = rows.filter((r) => r.a >= minAos);

  if (sort === "aos") rows = [...rows].sort((a, b) => b.a - a.a);
  else if (sort === "title") rows = [...rows].sort((a, b) => a.t.localeCompare(b.t));

  const total = rows.length;
  const start = (page - 1) * perPage;
  return { rows: rows.slice(start, start + perPage), total, page, perPage };
}
