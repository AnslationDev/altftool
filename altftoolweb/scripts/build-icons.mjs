import fs from "fs";
import path from "path";
import { toolMetaMap } from "../src/platform/registry/toolMetaMap.js";

const LUCIDE_DIR = "node_modules/lucide-static/icons";
const OUTPUT = "public/icons.svg";
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

/* ---------------- COLLECT ICONS ---------------- */
const icons = new Set();

for (const tool of Object.values(toolMetaMap)) {
  if (typeof tool.icon === "string") {
    icons.add(tool.icon);
  }
}

// Always include a fallback icon
icons.add("wrench");

/* ---------------- BUILD SPRITE ---------------- */
let sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n`;

for (const icon of icons) {
  const sourceIcon = ICON_ALIASES[icon] ?? icon;
  const svgPath = path.join(LUCIDE_DIR, `${sourceIcon}.svg`);

  if (!fs.existsSync(svgPath)) {
    console.warn(`⚠️ Icon "${icon}" not found in lucide-static, using wrench`);
  }

  const svg = fs.readFileSync(
    fs.existsSync(svgPath) ? svgPath : path.join(LUCIDE_DIR, "wrench.svg"),
    "utf8"
  );

  const inner = svg
    .replace(/<svg[^>]*>/, "")
    .replace("</svg>", "");

  sprite += `<symbol id="${icon}" viewBox="0 0 24 24">\n${inner}\n</symbol>\n`;
}

sprite += `</svg>`;

fs.writeFileSync(OUTPUT, sprite);
console.log(`✅ icons.svg generated (${icons.size} icons)`);
