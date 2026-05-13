import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const toolsDir = path.join(rootDir, "altftoolweb/src/tools");
const metaPath = path.join(rootDir, "altftoolweb/src/platform/registry/toolMetaMap.js");
const runtimePath = path.join(rootDir, "altftoolweb/src/platform/registry/toolRuntimeMap.js");
const ignoredToolDirs = new Set(["_toolfk-suite"]);
const validEntryFiles = ["entry.js", "entry.jsx", "entry.ts", "entry.tsx"];
const iconAliases = {
  "search-icon": "search",
  volume2: "volume-2",
  wand2: "wand-2",
  "fas fa-code": "code",
  "bar-chart3icon": "bar-chart-3",
  "bar-chart2": "bar-chart-2",
  "graph-up-trend": "trending-up",
  code2: "code-2",
};

function normalizeIcon(icon) {
  const value = typeof icon === "string" ? icon.trim() : "";
  if (!value) return "wrench";
  if (iconAliases[value]) return iconAliases[value];
  return /^[a-z0-9-]+$/.test(value) ? value : "wrench";
}

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeCategory(category) {
  if (Array.isArray(category)) return category.map((item) => cleanText(item)).filter(Boolean);
  const value = cleanText(category);
  return value ? [value] : [];
}

async function exists(filePath) {
  return fs.access(filePath).then(() => true, () => false);
}

async function readToolMetaMap() {
  const source = await fs.readFile(metaPath, "utf8");
  const match = source.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);
  if (!match) throw new Error("Unable to parse generated toolMetaMap.js");
  return JSON.parse(match[1]);
}

async function readToolConfig(slug) {
  const configPath = path.join(toolsDir, slug, "tool.config.js");
  const moduleUrl = `${pathToFileURL(configPath).href}?registryCheck=${Date.now()}-${slug}`;
  const configModule = await import(moduleUrl);
  return configModule.default ?? configModule.toolConfig ?? {};
}

function formatMismatch(slug, field, expected, actual) {
  return `${slug}: generated meta ${field} is stale (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`;
}

async function main() {
  const failures = [];
  const metaMap = await readToolMetaMap();
  const runtimeMapSource = await fs.readFile(runtimePath, "utf8").catch(() => "");
  const dirents = await fs.readdir(toolsDir, { withFileTypes: true });
  const toolDirs = dirents
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !ignoredToolDirs.has(name) && !name.startsWith("."))
    .sort();
  const expectedSlugs = [];

  for (const slug of toolDirs) {
    const toolPath = path.join(toolsDir, slug);
    const entryFile = await Promise.all(
      validEntryFiles.map(async (file) => ((await exists(path.join(toolPath, file))) ? file : null)),
    ).then((matches) => matches.find(Boolean));
    const configPath = path.join(toolPath, "tool.config.js");
    const hasConfig = await exists(configPath);

    if (!entryFile && !hasConfig) {
      failures.push(`${slug}: public tool folder must include an entry file and tool.config.js`);
      continue;
    }

    expectedSlugs.push(slug);

    if (!entryFile) {
      failures.push(`${slug}: missing entry file (${validEntryFiles.join(", ")})`);
    }

    if (!hasConfig) {
      failures.push(`${slug}: missing tool.config.js`);
      continue;
    }

    let config;
    try {
      config = await readToolConfig(slug);
    } catch (error) {
      failures.push(`${slug}: tool.config.js failed to import (${error.message})`);
      continue;
    }

    const name = cleanText(config.name);
    const description = cleanText(config.description);
    const categories = normalizeCategory(config.category || "Other");

    if (config.slug !== slug) failures.push(`${slug}: config slug must exactly match folder name`);
    if (name.length < 3) failures.push(`${slug}: config name is missing or too short`);
    if (description.length < 18) failures.push(`${slug}: config description is missing or too short`);
    if (!categories.length) failures.push(`${slug}: config category must contain at least one category`);

    const expectedMeta = {
      name: name || slug.replace(/-/g, " "),
      description,
      category: Array.isArray(config.category) ? categories : categories[0],
      icon: normalizeIcon(config.icon ?? "wrench"),
      iconColor: cleanText(config.iconColor) || "text-muted-foreground",
    };
    const generatedMeta = metaMap[slug];

    if (!generatedMeta) {
      failures.push(`${slug}: missing from generated toolMetaMap.js`);
    } else {
      for (const field of ["name", "description", "category", "icon", "iconColor"]) {
        if (JSON.stringify(generatedMeta[field]) !== JSON.stringify(expectedMeta[field])) {
          failures.push(formatMismatch(slug, field, expectedMeta[field], generatedMeta[field]));
        }
      }
    }

    const runtimeLine = `"${slug}": () => import("@/tools/${slug}/entry")`;
    if (entryFile && runtimeMapSource && !runtimeMapSource.includes(runtimeLine)) {
      failures.push(`${slug}: missing from generated toolRuntimeMap.js`);
    }
  }

  const metaSlugs = Object.keys(metaMap).sort();
  const missingDirs = metaSlugs.filter((slug) => !expectedSlugs.includes(slug));
  const missingMeta = expectedSlugs.filter((slug) => !metaSlugs.includes(slug));

  if (missingDirs.length) failures.push(`toolMetaMap has entries without public tool folders: ${missingDirs.join(", ")}`);
  if (missingMeta.length) failures.push(`public tool folders missing generated meta: ${missingMeta.join(", ")}`);

  if (failures.length) {
    console.error(`Tool registry check failed with ${failures.length} issue(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`Tool registry check passed (${expectedSlugs.length} routeable tools).`);
}

await main();
