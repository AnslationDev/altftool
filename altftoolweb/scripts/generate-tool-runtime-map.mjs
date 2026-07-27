import fs from "fs";
import path from "path";

const TOOLS_DIR = "src/tools";
const OUTPUT = "src/platform/registry/toolRuntimeMap.js";
const ignoredToolDirs = new Set([
  "_shared",
  "_toolfk-suite",
  "candy-crush",
]);

const validEntryFiles = [
  "entry.js",
  "entry.jsx",
  "entry.ts",
  "entry.tsx",
];

// What `entry` resolves `./pages` to, in the order Node/webpack would try.
const validPageFiles = [
  "pages/index.js",
  "pages/index.jsx",
  "pages/index.ts",
  "pages/index.tsx",
  "pages.js",
  "pages.jsx",
  "pages.ts",
  "pages.tsx",
];

const map = {};
const orphanToolDirs = [];
const pagelessToolDirs = [];

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

  // An entry file is not enough. The common entry does `import ToolHome from
  // "./pages"`, so a tool with an entry but no page passes this generator and
  // then kills the webpack build minutes later with "Module not found: Can't
  // resolve './pages'". Catch it here, where the message names the tool.
  //
  // Only tools that actually import "./pages" are checked — plenty of entries
  // legitimately render a shared component (e.g. _shared/advanced/AdvancedWorkbench)
  // and have no pages/ directory at all.
  const entrySource = fs.readFileSync(path.join(toolPath, entryFile), "utf8");
  if (/from\s+["']\.\/pages["']|import\(\s*["']\.\/pages["']\s*\)/.test(entrySource)) {
    const hasPage = validPageFiles.some((file) =>
      fs.existsSync(path.join(toolPath, file)),
    );
    if (!hasPage) {
      pagelessToolDirs.push(toolName);
      continue;
    }
  }

  map[toolName] = `() => import("@/tools/${toolName}/entry")`;
}

if (orphanToolDirs.length) {
  console.error("❌ Tool registry NOT generated — source folders are missing entry files:");
  for (const toolName of orphanToolDirs.sort()) console.error(`   - ${toolName}`);
  process.exit(1);
}

if (pagelessToolDirs.length) {
  console.error(
    "❌ Tool registry NOT generated — these tools have an entry file but no page,\n" +
      "   so entry's `import ToolHome from \"./pages\"` cannot resolve and the build will fail:",
  );
  for (const toolName of pagelessToolDirs.sort()) console.error(`   - ${toolName}`);
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
