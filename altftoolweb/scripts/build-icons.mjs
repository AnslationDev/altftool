import fs from "fs";
import path from "path";
import { toolMetaMap } from "../src/platform/registry/toolMetaMap.js";

const LUCIDE_DIR = "node_modules/lucide-static/icons";
const OUTPUT = "public/icons.svg";

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
  const svgPath = path.join(LUCIDE_DIR, `${icon}.svg`);

  if (!fs.existsSync(svgPath)) {
    throw new Error(
      `❌ Icon "${icon}" not found in lucide-static`
    );
  }

  const svg = fs.readFileSync(svgPath, "utf8");

  const inner = svg
    .replace(/<svg[^>]*>/, "")
    .replace("</svg>", "");

  sprite += `<symbol id="${icon}" viewBox="0 0 24 24">\n${inner}\n</symbol>\n`;
}

sprite += `</svg>`;

fs.writeFileSync(OUTPUT, sprite);
console.log(`✅ icons.svg generated (${icons.size} icons)`);
