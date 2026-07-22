import fs from "fs";
import path from "path";

const TOOLS_DIR = "src/tools";
const OUTPUT = "src/platform/registry/toolRuntimeMap.js";
const ignoredToolDirs = new Set([
  "_shared",
  "_toolfk-suite",
]);

const validEntryFiles = [
  "entry.js",
  "entry.jsx",
  "entry.ts",
  "entry.tsx",
];

const map = {};
const orphanToolDirs = [];

function hasSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).some((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return hasSourceFiles(entryPath);
    return /\.[cm]?[jt]sx?$/.test(entry.name);
  });
}

const toolDirs = fs.readdirSync(TOOLS_DIR, {
  withFileTypes: true,
});

for (const dir of toolDirs) {
  if (!dir.isDirectory() || ignoredToolDirs.has(dir.name)) continue;

  const toolName = dir.name;
  const toolPath = path.join(TOOLS_DIR, toolName);

  const entryFile = validEntryFiles.find((file) =>
    fs.existsSync(path.join(toolPath, file))
  );

  if (!entryFile) {
    if (hasSourceFiles(toolPath)) orphanToolDirs.push(toolName);
    continue;
  }

  map[toolName] = `() => import("@/tools/${toolName}/entry")`;
}

if (orphanToolDirs.length) {
  console.error("❌ Tool registry NOT generated — source folders are missing entry files:");
  for (const toolName of orphanToolDirs.sort()) console.error(`   - ${toolName}`);
  process.exit(1);
}

/* ---------------- WRITE FILE ---------------- */

const content = `// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
// Generated from filesystem

export const toolRuntimeMap = {
${Object.entries(map)
  .map(([key, value]) => `  "${key}": ${value},`)
  .join("\n")}
};
`;

fs.writeFileSync(OUTPUT, content);
console.log(
  `✅ toolRuntimeMap generated (${Object.keys(map).length} tools)`
);
