#!/usr/bin/env node
/**
 * Emit a machine-readable manifest of every tool route.
 *
 * The registry is the source of truth for what exists, but it is JavaScript
 * shaped for the bundler. This writes the same information as plain data so a
 * different agent, account or tool — one that cannot run the app — can answer
 * "what is built, at what URL, and is it complete?" by reading one file.
 *
 * Completeness is derived from the files on disk rather than trusted, because
 * a half-built tool still has a tool.config.js and still appears in the
 * registry. `status` is:
 *   complete   — config + entry + a resolvable page + its own seo.js
 *   no-seo     — works, but falls back to the category SEO template
 *   incomplete — entry imports ./pages and that page is missing (breaks builds)
 *
 * Usage: node scripts/generate-tool-routes-manifest.mjs
 * Writes: docs/tool-routes.json and docs/tool-routes.csv
 */
import fs from "node:fs";
import path from "node:path";

const TOOLS_DIR = "src/tools";
const OUT_JSON = "../docs/tool-routes.json";
const OUT_CSV = "../docs/tool-routes.csv";
const LEGACY_REDIRECT_TOOL_DIRS = new Set([
  "_shared",
  "_toolfk-suite",
  "candy-crush",
]);

const PAGE_FILES = [
  "pages/index.js",
  "pages/index.jsx",
  "pages/index.ts",
  "pages/index.tsx",
];

const readConfig = (dir) => {
  const file = path.join(dir, "tool.config.js");
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, "utf8");
  const pick = (re) => (src.match(re) || [])[1] || "";
  const categories = [...src.matchAll(/"([^"]+)"/g)]
    .map((m) => m[1])
    .filter(Boolean);
  return {
    name: pick(/name:\s*"([^"]+)"/),
    // category is an array literal; take the entries inside the brackets only
    category: (src.match(/category:\s*\[([^\]]*)\]/) || [])[1]
      ? [...(src.match(/category:\s*\[([^\]]*)\]/)[1].matchAll(/"([^"]+)"/g))].map((m) => m[1])
      : (pick(/category:\s*"([^"]+)"/) ? [pick(/category:\s*"([^"]+)"/)] : []),
    description: pick(/description:\s*\n?\s*"([^"]+)"/),
    _all: categories,
  };
};

const rows = [];
for (const slug of fs.readdirSync(TOOLS_DIR).sort()) {
  const dir = path.join(TOOLS_DIR, slug);
  if (
    slug.startsWith("_") ||
    LEGACY_REDIRECT_TOOL_DIRS.has(slug) ||
    !fs.statSync(dir).isDirectory()
  ) continue;

  const cfg = readConfig(dir);
  if (!cfg) continue;

  const entryFile = ["entry.jsx", "entry.js", "entry.tsx", "entry.ts"].find((f) =>
    fs.existsSync(path.join(dir, f)),
  );
  const hasPage = PAGE_FILES.some((f) => fs.existsSync(path.join(dir, f)));
  const hasSeo = fs.existsSync(path.join(dir, "seo.js"));
  const hasLib = fs.existsSync(path.join(dir, "lib.js"));

  // Only tools whose entry actually imports ./pages need one — plenty render a
  // shared component instead and are complete without a pages/ directory.
  const needsPage = entryFile
    ? /from\s+["']\.\/pages["']/.test(fs.readFileSync(path.join(dir, entryFile), "utf8"))
    : false;

  const status = !entryFile
    ? "incomplete"
    : needsPage && !hasPage
      ? "incomplete"
      : hasSeo
        ? "complete"
        : "no-seo";

  rows.push({
    slug,
    route: `/tools/all/${slug}`,
    name: cfg.name || slug.replace(/-/g, " "),
    category: cfg.category[0] || "",
    status,
    hasOwnSeo: hasSeo,
    logicInLib: hasLib,
    description: cfg.description,
  });
}

const counts = rows.reduce((acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc), {});

fs.writeFileSync(
  OUT_JSON,
  `${JSON.stringify(
    {
      generatedFrom: "altftoolweb/src/tools",
      total: rows.length,
      counts,
      note: "Regenerate with: cd altftoolweb && node scripts/generate-tool-routes-manifest.mjs",
      tools: rows,
    },
    null,
    2,
  )}\n`,
);

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
fs.writeFileSync(
  OUT_CSV,
  ["slug,route,name,category,status,hasOwnSeo,logicInLib,description"]
    .concat(
      rows.map((r) =>
        [r.slug, r.route, r.name, r.category, r.status, r.hasOwnSeo, r.logicInLib, r.description]
          .map(esc)
          .join(","),
      ),
    )
    .join("\n") + "\n",
);

console.log(
  `✅ tool routes manifest: ${rows.length} tools ` +
    Object.entries(counts)
      .map(([k, v]) => `${k}=${v}`)
      .join(" "),
);
