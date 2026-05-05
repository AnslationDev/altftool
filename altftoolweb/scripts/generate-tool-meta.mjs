import fs from "fs";
import path from "path";

const TOOLS_DIR = "src/tools";
const OUTPUT = "src/platform/registry/toolMetaMap.js";

const toolMeta = {};

const toolDirs = fs.readdirSync(TOOLS_DIR);

for (const dir of toolDirs) {
  const configPath = path.join(
    TOOLS_DIR,
    dir,
    "tool.config.js"
  );

  if (!fs.existsSync(configPath)) continue;

  const config = (await import(
    path.resolve(configPath)
  )).default;
  const slug = dir.toLowerCase();

  toolMeta[slug] = {
  name: config.name ?? dir.replace(/-/g, " "),
  description: config.description ?? "",
  category: config.category ?? "Other",
  icon: config.icon ?? "wrench",
  iconColor: config.iconColor ?? "text-muted-foreground",
};

}

const file = `// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
export const toolMetaMap = ${JSON.stringify(toolMeta, null, 2)};
`;

fs.writeFileSync(OUTPUT, file);
console.log("✅ toolMetaMap generated");
