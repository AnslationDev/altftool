/* ============================================================
   AltF Ideas — corpus generator
   ------------------------------------------------------------
   All composition logic lives in packages/core/src/ideas/compose.js and is
   shared verbatim with the runtime rehydrator, so a stored record and a
   rehydrated one are byte-identical. This script only walks the DNA space,
   calibrates signals across the whole corpus, and writes the output layout.

   Usage:  node scripts/generate-ideas.mjs [outDir]
   Verify: node scripts/verify-rehydration.mjs
   ============================================================ */

import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  VERTICALS,
  JOBS,
  MECHANISMS,
  WEDGES,
  MODELS,
  COLLECTION_RULES,
  TIERS,
} from "../packages/core/src/ideas/taxonomy.js";
import {
  composeIdea,
  finalizeIdea,
  jobsForVertical,
  modelsFor,
  rngFor,
  hash32,
  slugify,
  SIGNAL_KEYS,
  WEIGHTS,
} from "../packages/core/src/ideas/compose.js";

const outDir = process.argv[2] || join(process.cwd(), "public", "data", "ideas");
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const SHARD_SIZE = 2500;
const PUBLISHED = 12000; // gets full stored records + static pages + sitemap

const staged = [];
const seenSlug = new Set();
const seenFingerprint = new Set();
let rejected = 0;

/* ---------- PASS 1 — walk the DNA space ---------- */
for (let vi = 0; vi < VERTICALS.length; vi += 1) {
  const v = VERTICALS[vi];
  const jobs = jobsForVertical(v);

  for (let bi = 0; bi < v.buyers.length; bi += 1) {
    const buyer = v.buyers[bi];

    for (const job of jobs) {
      const ji = JOBS.indexOf(job);

      for (const mechKey of job.mech.slice(0, 3)) {
        if (!MECHANISMS[mechKey]) continue;

        const baseSeed = `${v.slug}|${buyer}|${job.name}|${mechKey}`;
        const rBase = rngFor(baseSeed);
        const wedgePool = [...WEDGES].sort(() => rBase() - 0.5).slice(0, 4);

        for (const wedge of wedgePool) {
          const wi = WEDGES.indexOf(wedge);
          const rw = rngFor(`${baseSeed}|${wedge.name}`);

          for (const model of modelsFor(v, job, rw)) {
            const moi = MODELS.indexOf(model);
            const composed = composeIdea({ vertical: v, buyer, job, mechKey, wedge, model });

            if (seenFingerprint.has(composed.fingerprint)) {
              rejected += 1;
              continue;
            }
            seenFingerprint.add(composed.fingerprint);

            /* Slugs must always resolve — never drop an idea for a collision.
               Disambiguate with progressively more DNA, then a stable hash. */
            let slug = slugify(composed.title);
            if (seenSlug.has(slug)) {
              for (const suffix of [v.slug, slugify(buyer), slugify(model.name), slugify(wedge.name)]) {
                slug = slugify(`${composed.title} ${suffix}`);
                if (!seenSlug.has(slug)) break;
              }
              if (seenSlug.has(slug)) {
                slug = `${slugify(composed.title)}-${hash32(composed.fingerprint).toString(36).slice(0, 5)}`;
                if (seenSlug.has(slug)) {
                  rejected += 1;
                  continue;
                }
              }
            }
            seenSlug.add(slug);

            staged.push({ composed, slug, axis: { vi, bi, ji, mk: mechKey, wi, moi } });
          }
        }
      }
    }
  }
}

/* ---------- PASS 2 — calibrate signals across the whole corpus ----------
   Raw signals cluster around their axis means, which would make every idea's
   SignalBars fingerprint look identical. Each signal is mapped onto its own
   percentile curve so the corpus actually spreads. AOS stays the true weighted
   mean of the displayed signals — the transparency promise breaks if the parts
   do not add up to the whole. */
const SPREAD_LO = 21;
const SPREAD_HI = 97;

const calibrated = staged.map(() => ({}));
for (const key of SIGNAL_KEYS) {
  const order = staged
    .map((s, i) => [s.composed.rawScores[key], i])
    .sort((a, b) => a[0] - b[0]);
  const n = order.length;
  for (let rank = 0; rank < n; rank += 1) {
    const p = n === 1 ? 0.5 : rank / (n - 1);
    // mild S-curve: realistic centre mass, both tails still populated
    const shaped = 0.5 + 0.5 * Math.sign(2 * p - 1) * Math.abs(2 * p - 1) ** 0.86;
    calibrated[order[rank][1]][key] = Math.round(SPREAD_LO + (SPREAD_HI - SPREAD_LO) * shaped);
  }
}

const scoredRows = staged.map((s, i) => {
  const scores = calibrated[i];
  const aos = Math.round(SIGNAL_KEYS.reduce((sum, k) => sum + scores[k] * WEIGHTS[k], 0) / 100);
  return { ...s, scores, aos };
});

scoredRows.sort((a, b) => b.aos - a.aos); // best first — shard 000 is the good stuff

const all = scoredRows.map((row, i) =>
  finalizeIdea(row.composed, {
    id: String(i + 1).padStart(6, "0"),
    slug: row.slug,
    rank: i + 1,
    scores: row.scores,
    aos: row.aos,
  }),
);

/* ---------- PASS 3 — write a shippable layout ----------
   A single 300MB blob is not deployable. The corpus is split by how it is
   actually read:

     shards/       full records for the published set — static pages + sitemap
     by-vertical/  compact records for every idea, one file per vertical
     top-index     default browse payload
     facets.json   filter-rail counts, no records needed

   Ideas outside the published set still resolve: the compact record carries
   its DNA axis indices and calibrated scores, and the runtime rehydrates the
   full record through the same composeIdea used here. */
const compact = (idea, i) => ({
  i: idea.id,
  s: idea.slug,
  t: idea.title,
  a: idea.aos,
  r: idea.rank,
  sc: SIGNAL_KEYS.map((k) => idea.scores[k]),
  ...scoredRows[i].axis,
  v: idea.dna.verticalSlug,
  m: idea.dna.mechanismKey,
  j: slugify(idea.dna.job),
  b: slugify(idea.dna.buyer),
  mo: slugify(idea.dna.model),
  e: idea.build.effort,
  c: idea.collections,
});

const index = all.map(compact);

mkdirSync(join(outDir, "shards"), { recursive: true });
mkdirSync(join(outDir, "by-vertical"), { recursive: true });

/* The end of the slice must be clamped to PUBLISHED, not just the loop bound:
   with SHARD_SIZE not dividing PUBLISHED evenly, an unclamped final slice
   spills past the published cutoff and writes records that have no entry in
   top-index.json. */
const publishedCount = Math.min(PUBLISHED, all.length);
let shardNo = 0;
for (let i = 0; i < publishedCount; i += SHARD_SIZE) {
  writeFileSync(
    join(outDir, "shards", `shard-${String(shardNo).padStart(3, "0")}.json`),
    JSON.stringify(all.slice(i, Math.min(i + SHARD_SIZE, publishedCount))),
  );
  shardNo += 1;
}

const byVerticalRecords = {};
for (const row of index) (byVerticalRecords[row.v] ||= []).push(row);
for (const [slug, recs] of Object.entries(byVerticalRecords)) {
  writeFileSync(join(outDir, "by-vertical", `${slug}.json`), JSON.stringify(recs));
}

writeFileSync(join(outDir, "top-index.json"), JSON.stringify(index.slice(0, PUBLISHED)));

/* Slug -> vertical lookup, so resolving an unpublished idea reads one small
   file plus one vertical file instead of scanning all 61. */
const slugMap = {};
for (const row of index) slugMap[row.s] = row.v;
writeFileSync(join(outDir, "slug-map.json"), JSON.stringify(slugMap));

const facets = { vertical: {}, mechanism: {}, job: {}, buyer: {}, model: {}, effort: {}, collection: {}, tier: {} };
for (const it of index) {
  facets.vertical[it.v] = (facets.vertical[it.v] || 0) + 1;
  facets.mechanism[it.m] = (facets.mechanism[it.m] || 0) + 1;
  facets.job[it.j] = (facets.job[it.j] || 0) + 1;
  facets.buyer[it.b] = (facets.buyer[it.b] || 0) + 1;
  facets.model[it.mo] = (facets.model[it.mo] || 0) + 1;
  facets.effort[it.e] = (facets.effort[it.e] || 0) + 1;
  const t = it.a >= TIERS.s ? "S" : it.a >= TIERS.a ? "A" : it.a >= TIERS.b ? "B" : "C";
  facets.tier[t] = (facets.tier[t] || 0) + 1;
  for (const c of it.c) facets.collection[c] = (facets.collection[c] || 0) + 1;
}
writeFileSync(join(outDir, "facets.json"), JSON.stringify(facets, null, 1));

const aosDesc = index.map((x) => x.a);
const manifest = {
  generatedFrom: "packages/core/src/ideas/taxonomy.js",
  total: all.length,
  rejected,
  published: Math.min(PUBLISHED, all.length),
  shards: shardNo,
  shardSize: SHARD_SIZE,
  publishCutoffAos: index[PUBLISHED - 1]?.a ?? 0,
  verticals: VERTICALS.length,
  jobs: JOBS.length,
  mechanisms: Object.keys(MECHANISMS).length,
  wedges: WEDGES.length,
  models: MODELS.length,
  aos: {
    min: aosDesc[aosDesc.length - 1],
    max: aosDesc[0],
    median: aosDesc[Math.floor(aosDesc.length / 2)],
    tierS: index.filter((i) => i.a >= TIERS.s).length,
    tierA: index.filter((i) => i.a >= TIERS.a && i.a < TIERS.s).length,
    tierB: index.filter((i) => i.a >= TIERS.b && i.a < TIERS.a).length,
    tierC: index.filter((i) => i.a < TIERS.b).length,
  },
  byVertical: facets.vertical,
  byCollection: facets.collection,
  top50: index.slice(0, 50).map((x) => ({ slug: x.s, title: x.t, aos: x.a, vertical: x.v })),
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`✓ generated ${all.length.toLocaleString()} ideas`);
console.log(`  stored full records: ${manifest.published.toLocaleString()} across ${shardNo} shards`);
console.log(`  rehydratable from compact DNA: ${(all.length - manifest.published).toLocaleString()}`);
console.log(`  rejected (duplicate fingerprint/slug): ${rejected.toLocaleString()}`);
console.log(`  AOS  min ${manifest.aos.min}  median ${manifest.aos.median}  max ${manifest.aos.max}`);
console.log(`  tiers  S:${manifest.aos.tierS}  A:${manifest.aos.tierA}  B:${manifest.aos.tierB}  C:${manifest.aos.tierC}`);
console.log(`  output: ${outDir}`);
