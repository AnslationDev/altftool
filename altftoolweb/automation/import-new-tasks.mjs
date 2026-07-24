import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = process.argv[2];
if (!source) {
  console.error("Usage: node automation/import-new-tasks.mjs <sheet-export.tsv>");
  process.exit(1);
}

const rows = fs
  .readFileSync(path.resolve(source), "utf8")
  .replace(/\r\n?/g, "\n")
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("\t"));

const header = rows.shift();
const column = (name) => header.indexOf(name);
const slugify = (value) =>
  String(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const backlog = rows
  .filter((row) => !String(row[column("ROUTES")] || "").trim())
  .map((row) => ({
    id: Number(row[column("ID")]),
    slug: slugify(row[column("Idea Name")]),
    name: String(row[column("Idea Name")] || "").trim(),
    description: String(row[column("Short Description")] || "").trim(),
    category: String(row[column("Category")] || "").trim(),
    priority: String(row[column("Priority")] || "").trim(),
  }))
  .filter((entry) => entry.id && entry.slug && entry.name);

const duplicateSlugs = backlog
  .map((entry) => entry.slug)
  .filter((slug, index, all) => all.indexOf(slug) !== index);
if (duplicateSlugs.length) {
  throw new Error(`Duplicate slugs: ${[...new Set(duplicateSlugs)].join(", ")}`);
}

const output = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "new-tasks-backlog.json",
);
fs.writeFileSync(
  output,
  `${JSON.stringify(
    {
      generatedFrom: "NEW TASKS rows with blank ROUTES",
      count: backlog.length,
      tools: backlog,
    },
    null,
    2,
  )}\n`,
);
console.log(`Wrote ${backlog.length} pending tools to ${output}`);
