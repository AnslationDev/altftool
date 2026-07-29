// Guards the two manifest fields that /transform publishes as fact.
//
// Every converter page states, in prose, in a spec table and in JSON-LD, which
// library produced the output and whether the input leaves the browser. Both
// sentences are generated from transform.manifest.json, so a stale field there
// becomes a false claim on a page built to be cited by answer engines.
//
// That is not hypothetical. The manifest credited html-to-pug to "html2pug", a
// package this repo has never depended on — the converter emits Pug by hand on
// top of node-html-parser. Three more entries named packages that were never
// installed, and four converters returned "Cannot find module" for their own
// sample input while shipping a page that said they worked.
//
// So this asserts three things at build time:
//   1. every declared `lib` is resolvable and actually reachable from that
//      converter's own import graph;
//   2. every `engine` agrees with the client-loader registry, which is what
//      decides whether the input is uploaded;
//   3. every converter still produces output for its own sample.
//
// (3) is the check that would have caught all of it, and it costs a few seconds.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const projectRoot = path.resolve(process.cwd());
const transformRoot = path.join(projectRoot, "src/app/transform");
const transformersDir = path.join(transformRoot, "_lib/transformers");
const manifestPath = path.join(transformRoot, "_data/transform.manifest.json");

const requireFrom = createRequire(path.join(transformersDir, "noop.js"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const problems = [];

/** Resolve a relative specifier the way Node would, trying the usual endings. */
function resolveLocal(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const candidate of [base, `${base}.js`, path.join(base, "index.js")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/**
 * Every bare package specifier reachable from `file`, following relative
 * imports transitively — a converter that pulls its library in through a shared
 * helper still counts as using it.
 */
function reachablePackages(file, seen = new Set()) {
  const found = new Set();
  if (!file || seen.has(file) || !fs.existsSync(file)) return found;
  seen.add(file);
  const source = fs.readFileSync(file, "utf8");
  const specifiers = [
    ...source.matchAll(/(?:from\s+|import\s*\(\s*|require(?:Fn)?\s*(?:\.resolve)?\s*\(\s*)["']([^"']+)["']/g),
  ].map((match) => match[1]);

  for (const specifier of specifiers) {
    if (specifier.startsWith(".")) {
      for (const pkg of reachablePackages(resolveLocal(file, specifier), seen)) found.add(pkg);
    } else {
      found.add(specifier);
    }
  }
  return found;
}

const clientRegistry = fs.readFileSync(
  path.join(transformRoot, "_lib/registry.client.js"),
  "utf8",
);

for (const tool of manifest.tools) {
  const file = path.join(transformersDir, `${tool.slug}.js`);
  if (!fs.existsSync(file)) {
    problems.push(`${tool.slug}: manifest lists it, but ${path.relative(projectRoot, file)} does not exist`);
    continue;
  }

  const packages = reachablePackages(file);

  // 1. lib attribution
  if (tool.lib && tool.lib !== "custom") {
    const matching = [...packages].filter(
      (pkg) => pkg === tool.lib || pkg.startsWith(`${tool.lib}/`),
    );
    if (!matching.length) {
      problems.push(
        `${tool.slug}: manifest credits "${tool.lib}", but nothing in its import graph uses it. ` +
          `It reaches: ${[...packages].join(", ") || "(no package at all — it is hand-written, so lib should be \"custom\")"}`,
      );
    } else {
      // Resolve the specifier the converter actually writes, not the bare
      // package name: several of these deep-import a built file, and a package
      // with an `exports` map need not expose its own root.
      const unresolvable = matching.filter((specifier) => {
        try {
          requireFrom.resolve(specifier);
          return false;
        } catch {
          return true;
        }
      });
      if (unresolvable.length === matching.length) {
        problems.push(
          `${tool.slug}: credits "${tool.lib}" but none of ${matching.join(", ")} resolves — add it to package.json`,
        );
      }
    }
  }

  // 2. engine vs the client loader registry, which decides if input is uploaded
  const hasClientLoader = new RegExp(`["']${tool.slug}["']\\s*:`).test(clientRegistry);
  if (tool.engine === "browser" && !hasClientLoader) {
    problems.push(
      `${tool.slug}: engine "browser" (its page says the input is never uploaded) but registry.client.js has no loader, so it would run on the server`,
    );
  }
  if (tool.engine === "server" && hasClientLoader) {
    problems.push(
      `${tool.slug}: engine "server" (its page says the input is sent to the API) but registry.client.js has a loader, so it actually runs locally`,
    );
  }
}

// 3. does each converter still work on its own sample?
for (const tool of manifest.tools) {
  const file = path.join(transformersDir, `${tool.slug}.js`);
  if (!fs.existsSync(file)) continue;
  try {
    const mod = await import(pathToFileURL(file).href);
    const run = mod.transform || mod.default;
    if (typeof run !== "function") {
      problems.push(`${tool.slug}: exports no transform function`);
      continue;
    }
    const result = await run(mod.sample ?? "", {});
    if (result && result.ok === false) {
      problems.push(`${tool.slug}: returns an error for its own sample — ${String(result.error).split("\n")[0]}`);
    }
  } catch (error) {
    problems.push(`${tool.slug}: threw on import or run — ${String(error.message).split("\n")[0]}`);
  }
}

if (problems.length) {
  console.error(
    `Transform manifest guard: ${problems.length} problem(s).\n` +
      problems.map((problem) => `  - ${problem}`).join("\n") +
      "\n\nThe manifest is what /transform publishes as fact about each converter. " +
      "Fix the manifest or the converter — do not ship a page that says something untrue.",
  );
  process.exit(1);
}

console.log(
  `Transform manifest guard: OK (${manifest.tools.length} converters — library attribution, engine, and sample output all verified).`,
);
