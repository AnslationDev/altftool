import fs from "fs";
import path from "path";

const INPUT = "scripts/lucide-icons.json";
const OUTPUT = "scripts/lucide-icons.fixed.json";

// Resolve lucide-static icons directory
const LUCIDE_ICONS_DIR = path.resolve(
  "node_modules/lucide-static/icons"
);

// Load valid icon names from filesystem
const validIcons = new Set(
  fs
    .readdirSync(LUCIDE_ICONS_DIR)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.replace(".svg", ""))
);

// Load scanned icons
const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));

function normalize(name) {
  // FileText → file-text
  let kebab = name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();

  // bar-chart2 → bar-chart-2
  kebab = kebab.replace(/([a-z])(\d+)/g, "$1-$2");

  return kebab;
}

const fixed = new Set();
const unresolved = [];

for (const icon of raw.icons) {
  const normalized = normalize(icon);

  if (validIcons.has(normalized)) {
    fixed.add(normalized);
    continue;
  }

  // fallback: drop numeric suffix
  const fallback = normalized.replace(/-\d+$/, "");
  if (validIcons.has(fallback)) {
    fixed.add(fallback);
    continue;
  }

  unresolved.push({
    original: icon,
    normalized,
  });
}

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(
    {
      fixed: [...fixed].sort(),
      unresolved,
    },
    null,
    2
  )
);

console.log(`✅ Fixed ${fixed.size} icons`);

if (unresolved.length) {
  console.warn(
    `⚠️ ${unresolved.length} icons could not be resolved`
  );
}
