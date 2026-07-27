#!/usr/bin/env node
/**
 * Pick the next wave of tools to build from the ideas TSV.
 *
 * Skips anything already present in src/tools, so re-running after a wave
 * lands naturally advances to the next batch. Restricted to categories that
 * are pure client-side computation — those need no new dependencies, which is
 * the hard constraint the build agents work under.
 *
 * Usage: node scripts/pick-wave.mjs <count>   ->  JSON array on stdout
 */
import fs from "node:fs";
import path from "node:path";

const TSV = path.join(process.env.HOME, "Desktop/ALTFTOOL-NEW-TOOL-IDEAS.tsv");
const TOOLS_DIR = path.join(import.meta.dirname, "../src/tools");
const count = Number(process.argv[2] || 500);

const SAFE_CATEGORIES = new Set([
  "Calculators",
  "Finance Calculators",
  "Health Calculators",
  "Health & Fitness",
  "Converters",
  "Generators",
  "Text & Writing",
  "Business",
  "Productivity",
  "Education & Science",
  "Developer",
  "Design & Color",
  "Marketing & Social",
  "Lifestyle",
  "Security & Privacy",
]);

// Canonical spellings — the TSV uses "&" already, but guard the common slips.
const CATEGORY_FIX = {
  "Text and Writing": "Text & Writing",
  "Education and Science": "Education & Science",
  "Design and Color": "Design & Color",
  "Marketing and Social": "Marketing & Social",
  "Security and Privacy": "Security & Privacy",
  "Health and Fitness": "Health & Fitness",
};

const existing = new Set(
  fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name),
);

const rows = fs.readFileSync(TSV, "utf8").split("\n").slice(1);
const picked = [];
const seen = new Set();

for (const priority of ["P0", "P1", "P2"]) {
  for (const line of rows) {
    if (picked.length >= count) break;
    const c = line.split("\t");
    if (c.length < 12) continue;
    const category = CATEGORY_FIX[c[1]] || c[1];
    const [, , name, desc, prio] = c;
    if (prio !== priority) continue;
    if (!SAFE_CATEGORIES.has(category)) continue;
    const slug = (c[9] || "").replace("/tools/all/", "").trim();
    if (!slug || existing.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    picked.push({
      slug,
      name: name.trim(),
      category,
      desc: desc.trim(),
      sub: (c[11] || "").trim(),
    });
  }
  if (picked.length >= count) break;
}

process.stdout.write(JSON.stringify(picked));
process.stderr.write(
  `picked ${picked.length} of ${count} requested (skipped ${existing.size} existing)\n`,
);
