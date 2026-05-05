import fs from "fs";
import path from "path";

const TOOLS_DIR = "src/tools";
const OUTPUT = "src/platform/registry/toolRuntimeMap.js";

const validEntryFiles = [
  "entry.js",
  "entry.jsx",
  "entry.ts",
  "entry.tsx",
];

const map = {};

const toolDirs = fs.readdirSync(TOOLS_DIR, {
  withFileTypes: true,
});

for (const dir of toolDirs) {
  if (!dir.isDirectory()) continue;

  const toolName = dir.name;
  const toolPath = path.join(TOOLS_DIR, toolName);

  const entryFile = validEntryFiles.find((file) =>
    fs.existsSync(path.join(toolPath, file))
  );

  if (!entryFile) {
    console.warn(
      `⚠️ Skipping "${toolName}" (no entry file)`
    );
    continue;
  }

  map[toolName] = `() => import("@/tools/${toolName}/entry")`;
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
