// Guards the invariant that lets next.config.mjs stub
// src/platform/registry/toolRuntimeMap.js out of the server compilation.
//
// The stub removes ~36 MiB of unreachable SSR chunk twins from
// .next/server/chunks. It is only correct while every module that reaches
// src/app/tools/toolLoaderResolver.js is a "use client" module. If a server
// component, a route handler, generateStaticParams, middleware or any other
// server-evaluated file starts importing the resolver (directly or through the
// runtime map), the server would see an empty map and tools would fail at
// runtime instead of at build time. Fail the build loudly instead.

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const srcRoot = path.join(projectRoot, "src");

const GUARDED_SPECIFIERS = [
  "toolLoaderResolver",
  "platform/registry/toolRuntimeMap",
];

// The stub itself and the generated map are allowed to mention the names.
const ALLOWLIST = new Set(
  [
    "src/platform/registry/toolRuntimeMap.js",
    "src/platform/registry/toolRuntimeMap.server-stub.js",
    "src/app/tools/toolLoaderResolver.js",
  ].map((relativePath) => path.join(projectRoot, relativePath))
);

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs"]);

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(entryPath);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      yield entryPath;
    }
  }
}

function isClientModule(source) {
  // "use client" must be the first statement, so it lands in the opening
  // directive prologue ahead of any import.
  return /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/u.test(source);
}

const violations = [];

if (fs.existsSync(srcRoot)) {
  for (const filePath of walk(srcRoot)) {
    if (ALLOWLIST.has(filePath)) continue;

    const source = fs.readFileSync(filePath, "utf8");
    const mentionsGuarded = GUARDED_SPECIFIERS.some((specifier) =>
      source.includes(specifier)
    );
    if (!mentionsGuarded) continue;
    if (isClientModule(source)) continue;

    violations.push(path.relative(projectRoot, filePath));
  }
}

if (violations.length > 0) {
  console.error(
    "Server-side tool loader guard failed. These non-client modules reference " +
      "the tool runtime map or its resolver, but next.config.mjs stubs the map " +
      "out of the server compilation, so they would read an empty map:\n" +
      violations.map((file) => `  - ${file}`).join("\n") +
      "\n\nEither mark the module \"use client\", or remove the server stub in " +
      "next.config.mjs (which costs ~36 MiB of Amplify artifact)."
  );
  process.exit(1);
}

console.log(
  `Server tool-loader guard: OK (no non-client importer of the tool runtime map).`
);
