import fs from "fs";
import path from "path";

const TOOLS_DIR = "src/tools";
const OUTPUT = "src/platform/registry/toolRuntimeMap.js";
const NEW_TASKS_MANIFEST = "automation/new-tasks-backlog.json";
const NEW_TASKS_SPEC_CATALOG =
  "src/tools/_shared/newtasks/specCatalog.js";
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

const map = {};
const orphanToolDirs = [];
const newTaskSlugs = new Set(
  fs.existsSync(NEW_TASKS_MANIFEST)
    ? JSON.parse(fs.readFileSync(NEW_TASKS_MANIFEST, "utf8")).tools.map(
        (tool) => tool.slug,
      )
    : [],
);
const newTaskSpecSlugs = [];

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

  if (newTaskSlugs.has(toolName)) {
    // The NEW TASKS backlog shares one route runtime. This prevents hundreds
    // of near-identical async entry chunks from exhausting hosted-build RAM.
    // The shared entry reads the slug from useParams and dispatches to its
    // local spec/assistive/advanced implementation.
    map[toolName] =
      `() => import("@/tools/_shared/newtasks/entry")`;
    if (fs.existsSync(path.join(toolPath, "spec.js"))) {
      newTaskSpecSlugs.push(toolName);
    }
  } else {
    map[toolName] = `() => import("@/tools/${toolName}/entry")`;
  }
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

fs.mkdirSync(path.dirname(NEW_TASKS_SPEC_CATALOG), { recursive: true });
const specImports = newTaskSpecSlugs
  .sort()
  .map(
    (slug, index) =>
      `import { spec as spec${index} } from "@/tools/${slug}/spec";`,
  )
  .join("\n");
const specEntries = newTaskSpecSlugs
  .sort()
  .map((slug, index) => `  ${JSON.stringify(slug)}: spec${index},`)
  .join("\n");
fs.writeFileSync(
  NEW_TASKS_SPEC_CATALOG,
  `// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
// Coalesces generated NEW TASKS specs into one lazy runtime chunk.
${specImports}

export const newTaskSpecCatalog = {
${specEntries}
};
`,
);
console.log(
  `✅ toolRuntimeMap generated (${Object.keys(map).length} tools; ${newTaskSlugs.size} NEW TASKS share one runtime)`
);
