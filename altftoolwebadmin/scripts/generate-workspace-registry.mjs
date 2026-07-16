// Auto-discovers Workspace registration files and generates an import manifest.
//
// Scans src/projects/*/*.workspace.js and writes
// src/lib/workspace/registrations.generated.js, which simply imports each file
// for its side effect (each calls registerProject()). This is what makes
// onboarding a new project "drop a file" — no manual index editing.
//
// Runs as part of `npm run dev` / `npm run build` (see package.json). Also
// runnable by hand: node scripts/generate-workspace-registry.mjs
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.resolve(here, "../src/projects");
const outPath = path.resolve(here, "../src/lib/workspace/registrations.generated.js");

function findRegistrations() {
  if (!existsSync(projectsDir)) return [];
  const found = [];
  for (const entry of readdirSync(projectsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(projectsDir, entry.name);
    for (const file of readdirSync(dir)) {
      if (file.endsWith(".workspace.js")) {
        found.push(`@/projects/${entry.name}/${file.replace(/\.js$/, "")}`);
      }
    }
  }
  return found.sort();
}

const imports = findRegistrations();
const body =
  "// ⚠️ AUTO-GENERATED — DO NOT EDIT.\n" +
  "// Source: src/projects/*/*.workspace.js (each self-registers).\n" +
  "// Regenerate: node scripts/generate-workspace-registry.mjs\n\n" +
  (imports.length
    ? imports.map((m) => `import "${m}";`).join("\n") + "\n"
    : "// (no *.workspace.js files found yet)\n") +
  "\nexport const REGISTERED_COUNT = " + imports.length + ";\n";

writeFileSync(outPath, body);
console.log(`[generate-workspace-registry] Wrote ${imports.length} registration import(s) to ${path.relative(process.cwd(), outPath)}`);
