import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { resolveToolCategories } from "../src/platform/registry/categoryTaxonomy.js";

const require = createRequire(import.meta.url);
const TOOLS_DIR = "src/tools";
const OUTPUT = "src/platform/registry/toolMetaMap.js";
const SLUG_OUTPUT = "src/platform/registry/toolSlugs.js";
const LEGACY_REDIRECT_TOOL_DIRS = new Set([
  "_shared",
  "_toolfk-suite",
  "candy-crush",
]);
const ICON_ALIASES = {
  "search-icon": "search",
  volume2: "volume-2",
  wand2: "wand-2",
  "fas fa-code": "code",
  "bar-chart3icon": "bar-chart-3",
  "bar-chart2": "bar-chart-2",
  "graph-up-trend": "trending-up",
  code2: "code-2",
};

const toolMeta = {};
const categoryErrors = [];
const cleanText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const titleizeSlug = (slug) =>
  String(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
const normalizeIcon = (icon) => {
  const value = typeof icon === "string" ? icon.trim() : "";
  if (!value) return "wrench";
  if (ICON_ALIASES[value]) return ICON_ALIASES[value];
  return /^[a-z0-9-]+$/.test(value) ? value : "wrench";
};
const hasSourceFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).some((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return hasSourceFiles(entryPath);
    return /\.[cm]?[jt]sx?$/.test(entry.name);
  });
const inferFallbackCategory = (slug) => {
  if (/(heart|sleep|medicine|hydration|vegan|lacto|caffeine|ibuprofen|gestational|sauna|bmi|macro|fluid)/.test(slug)) {
    return "Health Calculators";
  }
  if (/(palette|poster|banner|graphic|image|photo|font|logo|design|color)/.test(slug)) {
    return "Design & Color";
  }
  if (/(video|audio|narration|audiobook|subtitle|voiceover|frame-rate|watch-time)/.test(slug)) {
    return "Video & Audio";
  }
  if (/(social|caption|hashtag|newsletter|marketing|cta)/.test(slug)) {
    return "Marketing & Social";
  }
  if (/(calculator|estimator|planner|tracker)/.test(slug)) {
    return "Calculators";
  }
  return "Other";
};
const inferFallbackIcon = (slug) => {
  if (/(heart|health|medicine|hydration|sleep|macro|vegan|lacto|caffeine)/.test(slug)) return "heart-pulse";
  if (/(palette|color)/.test(slug)) return "palette";
  if (/(poster|banner|graphic|image|photo)/.test(slug)) return "image";
  if (/(video|frame|watch-time)/.test(slug)) return "video";
  if (/(audio|narration|audiobook)/.test(slug)) return "headphones";
  if (/(calculator|estimator)/.test(slug)) return "calculator";
  return "wrench";
};

const toolDirs = fs.readdirSync(TOOLS_DIR);

for (const dir of toolDirs) {
  if (LEGACY_REDIRECT_TOOL_DIRS.has(dir)) continue;

  const configPath = path.join(
    TOOLS_DIR,
    dir,
    "tool.config.js"
  );

  let config = {};
  if (!fs.existsSync(configPath)) {
    const toolPath = path.join(TOOLS_DIR, dir);
    if (!fs.statSync(toolPath).isDirectory() || !hasSourceFiles(toolPath)) continue;
    const name = titleizeSlug(dir);
    config = {
      name,
      description: `Create a quick, copy-ready output for ${name}.`,
      category: inferFallbackCategory(dir),
      icon: inferFallbackIcon(dir),
      iconColor: "text-(--primary)",
    };
  } else {
    try {
      const configModule = await import(pathToFileURL(path.resolve(configPath)).href);
      config = configModule.default ?? configModule.toolConfig ?? {};
    } catch {
      // Fallback for CommonJS-style configs (module.exports) under "type": "module".
      try {
        const code = fs.readFileSync(configPath, "utf8");
        const moduleShim = { exports: {} };
        new Function("module", "exports", "require", "console", code)(
          moduleShim,
          moduleShim.exports,
          require,
          console,
        );
        config = moduleShim.exports ?? {};
      } catch (fallbackError) {
        console.warn(`⚠️ Skipping "${dir}" (config could not be loaded): ${fallbackError.message}`);
        continue;
      }
    }
  }
  const slug = dir.toLowerCase();

  let resolved;
  try {
    resolved = resolveToolCategories(config.category ?? "Other", slug);
  } catch (error) {
    categoryErrors.push(error.message);
    continue;
  }

  toolMeta[slug] = {
    name: cleanText(config.name) || dir.replace(/-/g, " "),
    description: cleanText(config.description),
    category:
      resolved.categories.length === 1 ? resolved.categories[0] : resolved.categories,
    ...(resolved.topics.length ? { topics: resolved.topics } : {}),
    icon: normalizeIcon(config.icon ?? "wrench"),
    iconColor: cleanText(config.iconColor) || "text-muted-foreground",
    // Opt-in flag: tools that need the full viewport (canvas/image/PDF/code
    // editors) set `wideWorkspace: true` in tool.config.js to disable the
    // detail-page ad rail and the workspace width cap.
    ...(config.wideWorkspace === true ? { wideWorkspace: true } : {}),
  };

}

if (categoryErrors.length) {
  console.error(`❌ toolMetaMap NOT generated — ${categoryErrors.length} category error(s):`);
  for (const message of categoryErrors) console.error(`   - ${message}`);
  process.exit(1);
}

const file = `// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
export const toolMetaMap = ${JSON.stringify(toolMeta, null, 2)};
`;

fs.writeFileSync(OUTPUT, file);

// The middleware only ever asks "is this a tool slug?", and importing the full
// map to answer that put 0.89 MiB of metadata into a bundle that runs on every
// request. Emitting the slugs here, in the same pass and from the same object,
// keeps the two from drifting — deriving them from a second source is how they
// would eventually disagree.
const slugs = Object.keys(toolMeta).sort();
fs.writeFileSync(
  SLUG_OUTPUT,
  `// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT\n` +
    `// Slugs only. Generated beside toolMetaMap from the same object; import\n` +
    `// this wherever a membership test is all that is needed.\n` +
    `export const toolSlugSet = new Set(\n  ${JSON.stringify(slugs.join(" "))}.split(" ")\n);\n`,
);

console.log(`✅ toolMetaMap generated (+ ${slugs.length} slugs)`);
