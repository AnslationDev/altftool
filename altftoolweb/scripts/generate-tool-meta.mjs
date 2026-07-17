import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const TOOLS_DIR = "src/tools";
const OUTPUT = "src/platform/registry/toolMetaMap.js";
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
const cleanText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const cleanCategory = (category) => {
  if (Array.isArray(category)) {
    const values = category.map(cleanText).filter(Boolean);
    return values.length ? values : "Other";
  }

  return cleanText(category) || "Other";
};
const normalizeIcon = (icon) => {
  const value = typeof icon === "string" ? icon.trim() : "";
  if (!value) return "wrench";
  if (ICON_ALIASES[value]) return ICON_ALIASES[value];
  return /^[a-z0-9-]+$/.test(value) ? value : "wrench";
};

const toolDirs = fs.readdirSync(TOOLS_DIR);

for (const dir of toolDirs) {
  const configPath = path.join(
    TOOLS_DIR,
    dir,
    "tool.config.js"
  );

  if (!fs.existsSync(configPath)) continue;

  let config = {};
  try {
    const configModule = await import(path.resolve(configPath));
    config = configModule.default ?? configModule.toolConfig ?? {};
  } catch {
    // Fallback for CommonJS-style configs (module.exports) under "type": "module".
    try {
      const code = fs.readFileSync(configPath, "utf8");
      const moduleShim = { exports: {} };
      // eslint-disable-next-line no-new-func
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
  const slug = dir.toLowerCase();

  toolMeta[slug] = {
    name: cleanText(config.name) || dir.replace(/-/g, " "),
    description: cleanText(config.description),
    category: cleanCategory(config.category),
    icon: normalizeIcon(config.icon ?? "wrench"),
    iconColor: cleanText(config.iconColor) || "text-muted-foreground",
    // Opt-in flag: tools that need the full viewport (canvas/image/PDF/code
    // editors) set `wideWorkspace: true` in tool.config.js to disable the
    // detail-page ad rail and the workspace width cap.
    ...(config.wideWorkspace === true ? { wideWorkspace: true } : {}),
  };

}

const file = `// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
export const toolMetaMap = ${JSON.stringify(toolMeta, null, 2)};
`;

fs.writeFileSync(OUTPUT, file);
console.log("✅ toolMetaMap generated");
