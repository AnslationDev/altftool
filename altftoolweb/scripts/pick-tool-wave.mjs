#!/usr/bin/env node
/**
 * Pick the next wave of tools to build from the ideas backlog.
 *
 * The backlog is a TSV of ~11,000 tool ideas (columns: ID, Category, Idea Name,
 * Short Description, Priority, …, ROUTES, STATUS, Subcategory). This script
 * selects the next N that do not exist yet, so re-running it after a wave lands
 * naturally advances — there is no cursor to keep in sync.
 *
 * Only categories that are pure client-side computation are eligible: the build
 * agents may not add dependencies, so media/AI/PDF ideas are held back until
 * their libraries are in place.
 *
 * Usage:
 *   node scripts/pick-tool-wave.mjs 500 > wave.json
 *   node scripts/pick-tool-wave.mjs 500 --tsv /path/to/backlog.tsv
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = path.join(HERE, "..", "src", "tools");

const argv = process.argv.slice(2);
const count = Number(argv.find((a) => /^\d+$/.test(a)) || 500);
const tsvFlag = argv.indexOf("--tsv");
const TSV =
  tsvFlag >= 0
    ? argv[tsvFlag + 1]
    : path.join(process.env.HOME, "Desktop", "ALTFTOOL-NEW-TOOL-IDEAS.tsv");

// Buildable with zero new dependencies: arithmetic, strings, dates, canvas/DOM.
const SAFE_CATEGORIES = new Map([
  ["Calculators", "Calculators"],
  ["Finance Calculators", "Finance Calculators"],
  ["Health Calculators", "Health Calculators"],
  ["Health & Fitness", "Health & Fitness"],
  ["Converters", "Converters"],
  ["Generators", "Generators"],
  ["Text & Writing", "Text & Writing"],
  ["Text and Writing", "Text & Writing"], // backlog uses the prose form
  ["Business", "Business"],
  ["Productivity", "Productivity"],
  ["Education & Science", "Education & Science"],
  ["Education and Science", "Education & Science"],
  ["Developer", "Developer"],
  ["Design & Color", "Design & Color"],
  ["Design and Color", "Design & Color"],
  ["Marketing & Social", "Marketing & Social"],
  ["Marketing and Social", "Marketing & Social"],
  ["Lifestyle", "Lifestyle"],
  ["Security & Privacy", "Security & Privacy"],
  ["Security and Privacy", "Security & Privacy"],
]);

if (!fs.existsSync(TSV)) {
  process.stderr.write(`backlog not found: ${TSV}\n`);
  process.exit(1);
}

const existing = new Set(
  fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name),
);

const rows = fs.readFileSync(TSV, "utf8").split("\n").slice(1);
const picked = [];
const seen = new Set();

// P0 first, then P1, then P2 — highest-demand ideas ship earliest.
for (const priority of ["P0", "P1", "P2"]) {
  for (const line of rows) {
    if (picked.length >= count) break;
    const c = line.split("\t");
    if (c.length < 12) continue;
    const [, rawCategory, name, desc, prio] = c;
    if (prio !== priority) continue;
    const category = SAFE_CATEGORIES.get((rawCategory || "").trim());
    if (!category) continue;
    const slug = (c[9] || "").replace("/tools/all/", "").trim();
    if (!slug || existing.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    picked.push({
      slug,
      name: (name || "").trim(),
      category,
      desc: (desc || "").trim(),
      sub: (c[11] || "").trim(),
    });
  }
  if (picked.length >= count) break;
}

process.stdout.write(JSON.stringify(picked));
process.stderr.write(
  `picked ${picked.length} of ${count} requested (${existing.size} tools already exist)\n`,
);
