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
const fallbackToolDirs = [];

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
    if (hasSourceFiles(toolPath)) {
      map[toolName] = `() => import("@/tools/_shared/QuickUtilityEntry")`;
      fallbackToolDirs.push(`${toolName} (missing entry)`);
    }
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
      map[toolName] = `() => import("@/tools/_shared/QuickUtilityEntry")`;
      fallbackToolDirs.push(`${toolName} (missing page)`);
      continue;
    }
  }

  // Emit the file this resolved to, not a bare "entry". Five tools carry both
  // entry.js and entry.jsx, and an extensionless import left the choice to
  // webpack's resolve order — which silently boots the .js one and makes the
  // .jsx dead code. validEntryFiles is ordered to match webpack, so naming the
  // file changes nothing today; it just stops the decision being invisible.
  map[toolName] = `() => import("@/tools/${toolName}/${entryFile}")`;
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
if (fallbackToolDirs.length) {
  console.warn("⚠️ Tool runtime fallback used for incomplete source folders:");
  for (const toolName of fallbackToolDirs.sort()) console.warn(`   - ${toolName}`);
}
console.log(
  `✅ toolRuntimeMap generated (${Object.keys(map).length} tools)`
);
