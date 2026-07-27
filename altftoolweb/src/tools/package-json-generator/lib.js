/**
 * package.json construction and validation.
 *
 * Rules encoded here and where they come from:
 *  - Package name rules: npm docs ("package.json" reference) as enforced by
 *    validate-npm-package-name — max 214 chars including any scope, lowercase,
 *    URL-safe, no leading "." or "_", optional @scope/ prefix.
 *  - Version: Semantic Versioning 2.0.0 (semver.org) — the official regex.
 *  - "type": Node.js ESM docs — "module" or "commonjs" (the default).
 *  - engines/exports/bin/files semantics: npm package.json reference.
 *
 * Pure module — no React, no DOM.
 */

/** npm: name length limit including scope (validate-npm-package-name). */
export const NAME_MAX_LENGTH = 214;

/** validate-npm-package-name's pattern for new (scoped or unscoped) packages. */
export const NAME_PATTERN = /^(?:@[a-z0-9-*~][a-z0-9-*~._]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** Official SemVer 2.0.0 regex (semver.org, FAQ "Is there a suggested regular expression…"). */
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/** Common SPDX license identifiers (spdx.org/licenses) offered in the picker. */
export const LICENSE_OPTIONS = [
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-3-Clause",
  "BSD-2-Clause",
  "GPL-3.0-only",
  "LGPL-3.0-only",
  "MPL-2.0",
  "Unlicense",
  "UNLICENSED",
];

export const TYPE_OPTIONS = [
  { id: "module", label: "module — .js files are ES modules (import/export)" },
  { id: "commonjs", label: "commonjs — .js files use require() (Node default)" },
];

/** Node.js release lines still commonly targeted; the engines hint is free-form. */
export const ENGINES_PRESETS = [">=18", ">=20", ">=22", "^20.0.0 || >=22.0.0"];

/**
 * Parse "name = command" or "name: command" lines into an ordered map.
 * @returns {{ok:true, entries:[string,string][]}} | {ok:false, message:string}
 */
export function parseScriptLines(text) {
  const entries = [];
  const seen = new Set();
  const lines = String(text ?? "").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z0-9:_.-]+)\s*[=:]\s*(.+)$/);
    if (!match) {
      return { ok: false, message: `Script line "${trimmed}" must look like: name = command` };
    }
    const [, key, command] = match;
    if (seen.has(key)) return { ok: false, message: `Script "${key}" is defined twice.` };
    seen.add(key);
    entries.push([key, command.trim()]);
  }
  return { ok: true, entries };
}

/**
 * Build the package.json object and its pretty-printed JSON.
 * @returns {{json:string, manifest:object, warnings:string[]}} or {error}
 */
export function buildPackageJson(options = {}) {
  const {
    name = "my-package",
    version = "1.0.0",
    description = "",
    type = "module",
    entryPoint = "index.js",
    addExports = true,
    scriptsText = "test = node --test\nbuild = tsc",
    keywordsText = "",
    author = "",
    license = "MIT",
    isPrivate = false,
    repositoryUrl = "",
    enginesNode = ">=18",
    addSideEffectsFalse = false,
  } = options;

  const pkgName = String(name ?? "").trim();
  if (!pkgName) return { error: "Enter a package name." };
  if (pkgName.length > NAME_MAX_LENGTH) {
    return { error: `npm limits names to ${NAME_MAX_LENGTH} characters including the scope.` };
  }
  if (!NAME_PATTERN.test(pkgName)) {
    return {
      error:
        "npm names must be lowercase and URL-safe, may not start with . or _, and a scope looks like @scope/name.",
    };
  }

  const pkgVersion = String(version ?? "").trim();
  if (!SEMVER_PATTERN.test(pkgVersion)) {
    return { error: "Version must be valid SemVer 2.0.0, e.g. 1.0.0 or 2.1.0-beta.1." };
  }

  if (type !== "module" && type !== "commonjs") {
    return { error: '"type" must be "module" or "commonjs".' };
  }

  const entry = String(entryPoint ?? "").trim();
  if (!entry) return { error: "Enter the entry point file, e.g. index.js." };

  const scripts = parseScriptLines(scriptsText);
  if (!scripts.ok) return { error: scripts.message };

  const repo = String(repositoryUrl ?? "").trim();
  if (repo && !/^(https?:\/\/|git\+|git@|git:\/\/)/.test(repo)) {
    return { error: "Repository should be a URL (https://... or git+https://... or git@host:...)." };
  }

  const engines = String(enginesNode ?? "").trim();

  const manifest = { name: pkgName, version: pkgVersion };
  const warnings = [];

  const desc = String(description ?? "").trim();
  if (desc) manifest.description = desc;
  else warnings.push("No description — npm search and the registry page will show nothing about the package.");

  const keywords = String(keywordsText ?? "")
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean);
  if (keywords.length > 0) manifest.keywords = keywords;

  if (isPrivate) {
    manifest.private = true;
    warnings.push('"private": true makes npm refuse to publish — right for apps, wrong for libraries.');
  }

  manifest.type = type;
  manifest.main = entry;
  if (addExports) {
    // "exports" wins over "main" in modern Node and locks deep imports out.
    manifest.exports = { ".": `./${entry.replace(/^\.\//, "")}` };
    warnings.push('"exports" blocks undeclared deep imports (require("pkg/lib/x")) — add subpaths there if consumers need them.');
  }
  if (addSideEffectsFalse) manifest.sideEffects = false;

  if (scripts.entries.length > 0) manifest.scripts = Object.fromEntries(scripts.entries);

  if (author.trim()) manifest.author = author.trim();

  const lic = String(license ?? "").trim();
  if (lic) {
    manifest.license = lic;
    if (lic === "UNLICENSED" && !isPrivate) {
      warnings.push('license "UNLICENSED" on a public package means nobody may legally use it — pair it with "private": true or pick a real license.');
    }
  } else {
    warnings.push("No license — under copyright default, others have no legal right to use the code.");
  }

  if (repo) manifest.repository = { type: "git", url: repo };

  if (engines) {
    manifest.engines = { node: engines };
    warnings.push("engines is only enforced when the consumer sets engine-strict=true (npm) — pnpm and yarn enforce it by default.");
  }

  if (pkgVersion.startsWith("0.")) {
    warnings.push("In the 0.x range, ^ ranges behave like ~ — ^0.2.3 allows only 0.2.x, so every minor is treated as breaking.");
  }
  if (pkgName.startsWith("@") && !isPrivate) {
    warnings.push("Scoped packages publish as private by default — run npm publish --access public the first time.");
  }

  return {
    json: JSON.stringify(manifest, null, 2),
    manifest,
    fieldCount: Object.keys(manifest).length,
    scriptCount: scripts.entries.length,
    warnings,
  };
}
