/*
 * Proves that a rehydrated idea is byte-identical to the stored one.
 *
 * The corpus ships full records for only the top 12,000 of 117,264. The other
 * 105,264 are reconstructed at request time from ~120 bytes of compact DNA.
 * That is only safe while composeIdea's pseudo-random draw ORDER is stable —
 * inserting or reordering a single draw silently changes every idea.
 *
 * This script compares every stored record against its rehydrated twin and
 * exits non-zero on any mismatch, so that breakage fails loudly in CI rather
 * than shipping subtly-wrong prose on a hundred thousand pages.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { rehydrate } from "../packages/core/src/ideas/compose.js";

const dataDir = process.argv[2] || join(process.cwd(), "public", "data", "ideas");

if (!existsSync(join(dataDir, "manifest.json"))) {
  console.error(`✗ no corpus at ${dataDir}. Run "npm run generate:ideas" first.`);
  process.exit(1);
}

const readJson = (p) => JSON.parse(readFileSync(join(dataDir, p), "utf8"));
const manifest = readJson("manifest.json");
const index = readJson("top-index.json");
const byId = new Map(index.map((row) => [row.s, row]));

let checked = 0;
let mismatched = 0;
const samples = [];

for (let n = 0; n < manifest.shards; n += 1) {
  const shard = readJson(`shards/shard-${String(n).padStart(3, "0")}.json`);

  for (const stored of shard) {
    const compact = byId.get(stored.slug);
    if (!compact) {
      mismatched += 1;
      if (samples.length < 5) samples.push(`${stored.slug}: missing from top-index`);
      continue;
    }

    const rebuilt = rehydrate(compact);
    checked += 1;

    if (!rebuilt) {
      mismatched += 1;
      if (samples.length < 5) samples.push(`${stored.slug}: rehydrate() returned null`);
      continue;
    }

    const a = JSON.stringify(stored);
    const b = JSON.stringify(rebuilt);
    if (a !== b) {
      mismatched += 1;
      if (samples.length < 5) {
        // report the first differing field rather than dumping two 2KB blobs
        const diff = Object.keys(stored).find(
          (k) => JSON.stringify(stored[k]) !== JSON.stringify(rebuilt[k]),
        );
        samples.push(
          `${stored.slug}: field "${diff}"\n    stored:    ${JSON.stringify(stored[diff]).slice(0, 160)}\n    rehydrated:${JSON.stringify(rebuilt[diff]).slice(0, 160)}`,
        );
      }
    }
  }
}

/* Spot-check that unpublished ideas rehydrate at all — they have no stored
   counterpart to diff against, so this only asserts they resolve cleanly. */
let unpublishedOk = 0;
let unpublishedBad = 0;
const verticalSlugs = Object.keys(manifest.byVertical);
for (const slug of verticalSlugs.slice(0, 12)) {
  const rows = readJson(`by-vertical/${slug}.json`);
  const deep = rows.filter((row) => row.r > manifest.published).slice(0, 25);
  for (const row of deep) {
    const rebuilt = rehydrate(row);
    if (rebuilt?.title && rebuilt.problem && rebuilt.competitors?.length === 3) unpublishedOk += 1;
    else {
      unpublishedBad += 1;
      if (samples.length < 8) samples.push(`${row.s}: unpublished rehydrate incomplete`);
    }
  }
}

console.log(`checked ${checked.toLocaleString()} stored records`);
console.log(`  byte-identical after rehydration: ${(checked - mismatched).toLocaleString()}`);
console.log(`  mismatched: ${mismatched.toLocaleString()}`);
console.log(`spot-checked ${(unpublishedOk + unpublishedBad).toLocaleString()} unpublished ideas`);
console.log(`  rehydrated cleanly: ${unpublishedOk.toLocaleString()}`);

if (samples.length) {
  console.log("\nfirst failures:");
  for (const s of samples) console.log(`  - ${s}`);
}

if (mismatched > 0 || unpublishedBad > 0) {
  console.error("\n✗ rehydration is NOT faithful — do not ship unpublished dossiers");
  process.exit(1);
}

console.log("\n✓ rehydration is byte-identical; unpublished ideas resolve correctly");
