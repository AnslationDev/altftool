import fs from "fs";
import path from "path";

const TOOLS_DIR = "src/tools";

const toKebab = (str) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();

function migrateConfig(filePath) {
  let code = fs.readFileSync(filePath, "utf8");

  // 1. Match lucide import
  const importMatch = code.match(
    /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+["']lucide-react["'];?/m
  );

  if (!importMatch) return;

  const iconComponent = importMatch[1]; // FileText
  const iconName = toKebab(iconComponent); // file-text

  // 2. Extract color
  const colorMatch = code.match(
    /icon:\s*\{[\s\S]*?color:\s*["']([^"']+)["'][\s\S]*?\}/m
  );

  const color = colorMatch ? colorMatch[1] : null;

  // 3. Replace icon block
  const iconReplacement = color
    ? `icon: "${iconName}",\n  iconColor: "${color}",`
    : `icon: "${iconName}",`;

  code = code.replace(
    /icon:\s*\{[\s\S]*?\},?/m,
    iconReplacement
  );

  // 4. Remove lucide import
  code = code.replace(importMatch[0], "").trimStart();

  fs.writeFileSync(filePath, code);
  console.log("✅ Migrated:", filePath);
}

// Walk all tools
const toolDirs = fs.readdirSync(TOOLS_DIR);

for (const dir of toolDirs) {
  const configPath = path.join(
    TOOLS_DIR,
    dir,
    "tool.config.js"
  );

  if (fs.existsSync(configPath)) {
    migrateConfig(configPath);
  }
}
