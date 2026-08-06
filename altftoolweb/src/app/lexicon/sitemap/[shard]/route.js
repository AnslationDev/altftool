import { LETTERS } from "@altftool/core/lexicon";
import {
  getCollectionIndex,
  getLetterIndex,
  getManifest,
  getPairs,
} from "@altftool/core/lexicon/corpus";
import { getSiteUrl } from "@/platform/seo/generateMetadata";
import { GUIDES } from "@/app/lexicon/learn/guides";
import { GAMES } from "@/app/lexicon/games/_shared/catalog";
import { TOOLS } from "@/app/lexicon/tools/_shared/catalog";

/*
 * Child sitemaps for AltF Lexicon, named by /lexicon/sitemap.xml.
 *
 * The sitemap protocol caps one document at 50,000 URLs and 50MB, and the
 * corpus is larger than that, so the section is split into bounded shards:
 *
 *   /lexicon/sitemap/pages     every hub, browse letter, collection, generated
 *                              word list, learn guide, game and tool
 *   /lexicon/sitemap/words-N   the word pages, URLS_PER_SHARD at a time
 *
 * Every corpus read is wrapped so a missing corpus degrades to a smaller but
 * still-valid document instead of 500-ing the sitemap.
 */

/*
 * Deliberately force-dynamic.
 *
 * Baking these at build time put 10.5 MiB of XML into the deploy artifact —
 * two 4.8 MiB shards listing 83,253 word URLs — against a 215 MiB ceiling the
 * app is already pressed against. A sitemap is fetched by machines, roughly
 * once a day. Rendering it on first request and caching the response for 24
 * hours costs one cold generation and gives the whole 10.5 MiB back.
 *
 * The index at ../../sitemap.xml stays force-static: it is four lines long, and
 * it is the document crawlers reach first.
 */
export const dynamic = "force-dynamic";

/* Must match URLS_PER_SHARD in ../../sitemap.xml/route.js. */
const URLS_PER_SHARD = 40000;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/*
 * Learn guides, games and tools are authored pages rather than corpus rows.
 *
 * Their slugs come from the same catalogs the pages themselves render from,
 * rather than a list maintained here. A hand-kept allow-list is safe on the day
 * it is written and wrong the first time somebody adds a tool — either the new
 * page is invisible to crawlers, or a removed one leaves a 404 in the sitemap,
 * and neither failure announces itself.
 */
const LEARN_GUIDE_SLUGS = GUIDES.map((guide) => guide.slug);
const GAME_SLUGS = GAMES.map((game) => game.slug);
const TOOL_SLUGS = TOOLS.map((tool) => tool.slug);

/* ------------------------------------------------------------------ *
 * URL sets
 * ------------------------------------------------------------------ */

/*
 * /lexicon/search is deliberately absent: it is a query surface, not a
 * document. The per-word /lexicon/thesaurus/<slug> and /lexicon/rhymes/<slug>
 * views are absent for a different reason — they are alternate cuts of the word
 * page that already ships below, and listing all three would triple this
 * sitemap for no new content.
 */
function hubUrls() {
  return [
    { path: "/lexicon", priority: 0.95, changefreq: "weekly" },
    { path: "/lexicon/browse", priority: 0.88, changefreq: "weekly" },
    { path: "/lexicon/words", priority: 0.86, changefreq: "weekly" },
    { path: "/lexicon/collections", priority: 0.85, changefreq: "weekly" },
    { path: "/lexicon/word-of-the-day", priority: 0.84, changefreq: "daily" },
    { path: "/lexicon/thesaurus", priority: 0.82, changefreq: "weekly" },
    { path: "/lexicon/compare", priority: 0.82, changefreq: "weekly" },
    { path: "/lexicon/learn", priority: 0.8, changefreq: "weekly" },
    { path: "/lexicon/games", priority: 0.78, changefreq: "weekly" },
    { path: "/lexicon/tools", priority: 0.78, changefreq: "weekly" },
    { path: "/lexicon/sources", priority: 0.5, changefreq: "monthly" },

    /* A–Z browse, plus the "0" bucket. The browse route generates params for
       LETTERS *and* "0" — 329 entries whose slug starts with a digit or symbol,
       linked from the letter grid as "#". Listing only a–z here left a real,
       linked page out of the sitemap. */
    ...[...LETTERS, "0"].map((letter) => ({
      path: `/lexicon/browse/${letter}`,
      priority: 0.8,
      changefreq: "weekly",
    })),

    ...LEARN_GUIDE_SLUGS.map((slug) => ({
      path: `/lexicon/learn/${slug}`,
      priority: 0.74,
      changefreq: "monthly",
    })),
    ...GAME_SLUGS.map((slug) => ({
      path: `/lexicon/games/${slug}`,
      priority: 0.7,
      changefreq: "monthly",
    })),
    ...TOOL_SLUGS.map((slug) => ({
      path: `/lexicon/tools/${slug}`,
      priority: 0.7,
      changefreq: "monthly",
    })),
  ];
}

/*
 * Comparison pages. Only the computed pairs go in — the route will render any
 * two words in the corpus, but a sitemap listing every possible combination
 * would be 10 billion URLs of mostly nonsense.
 */
async function comparisonUrls() {
  let pairs = [];
  try {
    pairs = (await getPairs()) || [];
  } catch {
    return [];
  }

  return pairs.map((pair) => ({
    path: `/lexicon/compare/${pair.a}-vs-${pair.b}`,
    // Homophones carry the highest search intent of the three kinds.
    priority: pair.kind === "homophone" ? 0.72 : 0.66,
    changefreq: "monthly",
  }));
}

async function collectionUrls() {
  let index = [];
  try {
    index = (await getCollectionIndex()) || [];
  } catch {
    index = [];
  }

  return index
    .filter((collection) => collection?.slug)
    .map((collection) => ({
      path: `/lexicon/collections/${collection.slug}`,
      priority: 0.76,
      changefreq: "weekly",
    }));
}

async function wordListUrls() {
  let manifest = null;
  try {
    manifest = await getManifest();
  } catch {
    return [];
  }

  const totals = manifest?.listTotals || {};
  const urls = [];

  const push = (slug, priority) => {
    urls.push({ path: `/lexicon/words/${slug}`, priority, changefreq: "monthly" });
  };

  /* Starting-with pages come from listTotals.starting rather than
     manifest.letters, because manifest.letters also carries the "0" bucket for
     digit-initial slugs and no starting-with-0 list is generated. */
  for (const letter of Object.keys(totals.starting || {})) {
    push(`starting-with-${letter}`, 0.66);
  }
  for (const length of manifest?.lengths || []) {
    push(`${length}-letter-words`, 0.66);
  }
  /* Cross keys are "<length>-<letter>", e.g. "10-a". */
  for (const key of manifest?.cross || []) {
    const [length, letter] = String(key).split("-");
    if (!length || !letter) continue;
    push(`${length}-letter-words-starting-with-${letter}`, 0.58);
  }
  for (const suffix of manifest?.suffixes || []) {
    push(`ending-in-${suffix}`, 0.58);
  }
  for (const letters of manifest?.containing || []) {
    push(`containing-${letters}`, 0.58);
  }

  return urls;
}

/**
 * Every slug that gets its own word page, in a stable order.
 *
 * Phrases are skipped. 64,225 of the 147,478 entries are multi-word lemmas
 * ("st. john's wort", "united states"), and while each has a real page, they
 * are near-zero-demand URLs that would push this section from 83,253 to 135,783
 * indexable pages — three shards become four and the crawl budget goes to
 * pages nobody searches for. They stay reachable through browse, search and the
 * collections that contain them.
 */
async function indexableWordSlugs() {
  const slugs = [];

  for (const letter of ["0", ...LETTERS]) {
    let rows = [];
    try {
      rows = (await getLetterIndex(letter)) || [];
    } catch {
      rows = [];
    }
    for (const row of rows) {
      if (!row?.ix || row.ph) continue;
      slugs.push(row.s);
    }
  }

  return slugs;
}

/* ------------------------------------------------------------------ *
 * Route
 * ------------------------------------------------------------------ */

async function wordShardCount() {
  try {
    const manifest = await getManifest();
    const words = Number(manifest.words || 0);
    return words > 0 ? Math.ceil(words / URLS_PER_SHARD) : 0;
  } catch {
    return 0;
  }
}

function notFoundResponse() {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(_request, { params }) {
  const { shard } = await params;
  const site = getSiteUrl();

  let entries = [];

  if (shard === "pages") {
    entries = [
      ...hubUrls(),
      ...(await collectionUrls()),
      ...(await wordListUrls()),
      ...(await comparisonUrls()),
    ];
  } else {
    // No leading zero aliases, and reject an out-of-range shard before the
    // route reads all 27 letter indexes. Unknown paths must be a real 404, not
    // an empty XML document crawlers will keep requesting.
    const match = /^words-([1-9]\d*)$/.exec(String(shard || ""));
    if (!match) return notFoundResponse();

    const shardNumber = Number(match[1]);
    const availableShards = await wordShardCount();
    if (!Number.isSafeInteger(shardNumber) || shardNumber > availableShards) {
      return notFoundResponse();
    }

    const slugs = await indexableWordSlugs();
    const start = (shardNumber - 1) * URLS_PER_SHARD;
    entries = slugs.slice(start, start + URLS_PER_SHARD).map((slug) => ({
      path: `/lexicon/word/${slug}`,
      priority: 0.64,
      changefreq: "monthly",
    }));
  }

  const urls = entries
    .map(
      ({ path, priority, changefreq }) =>
        `<url><loc>${escapeXml(`${site}${path}`)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
