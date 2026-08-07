/**
 * pnpm-workspace.yaml generator.
 *
 * Schema per pnpm docs (pnpm.io/pnpm-workspace_yaml):
 *  - packages: array of directory globs; a leading "!" excludes matches.
 *  - catalog: map of dependency name -> version range (the default catalog),
 *    referenced from package.json as "catalog:". Catalogs shipped in pnpm 9.5.
 *  - catalogs: named catalogs referenced as "catalog:<name>".
 * The file lives in the repository root next to the root package.json.
 */

/** Filename pnpm looks for in the workspace root (pnpm docs). */
export const WORKSPACE_FILE = "pnpm-workspace.yaml";

/** Catalogs require pnpm >= 9.5 (pnpm 9.5.0 release notes). */
export const CATALOG_MIN_PNPM = "9.5.0";

/** Common starting globs used in the UI. */
export const GLOB_PRESETS = [
  { id: "apps-packages", label: "apps/* + packages/*", globs: ["apps/*", "packages/*"] },
  { id: "packages", label: "packages/* only", globs: ["packages/*"] },
  { id: "deep", label: "packages/**", globs: ["packages/**"] },
];

/** npm package-name rule (npm docs: lowercase, URL-safe, optional @scope/). */
const PACKAGE_NAME_RE = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/** Very loose semver-range check: rejects spaces-only and YAML-breaking chars. */
const RANGE_RE = /^[\w^~><=*.+\-|() ]+$/;

function quote(s) {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Quote YAML values that could be misparsed (globs with * must be quoted). */
function yamlString(s) {
  return /^[A-Za-z0-9_./-]+$/.test(s) ? s : quote(s);
}

/**
 * Parse one catalog line. Accepts "react ^18.3.1", "react@^18.3.1",
 * "react: ^18.3.1" and scoped names like "@types/node@^20.11.0".
 * @returns {{name: string, range: string} | {error: string}}
 */
export function parseCatalogLine(line) {
  const raw = String(line).trim();
  if (!raw) return { error: "Empty line." };
  let name = "";
  let range = "";
  if (raw.includes(":")) {
    const idx = raw.indexOf(":");
    name = raw.slice(0, idx).trim();
    range = raw.slice(idx + 1).trim();
  } else if (/\s/.test(raw)) {
    const idx = raw.search(/\s/);
    name = raw.slice(0, idx).trim();
    range = raw.slice(idx + 1).trim();
  } else {
    const at = raw.lastIndexOf("@");
    if (at > 0) {
      name = raw.slice(0, at).trim();
      range = raw.slice(at + 1).trim();
    } else {
      return { error: `"${raw}" has no version — write it as name@range or "name range".` };
    }
  }
  if (!PACKAGE_NAME_RE.test(name)) {
    return { error: `"${name}" is not a valid npm package name.` };
  }
  if (!range || !RANGE_RE.test(range)) {
    return { error: `"${range || "(empty)"}" is not a usable version range for ${name}.` };
  }
  return { name, range };
}

/**
 * Build pnpm-workspace.yaml.
 *
 * @param {object} input
 * @param {string} input.globs         Newline-separated include globs.
 * @param {string} [input.excludes]    Newline-separated exclude globs (no leading "!").
 * @param {string} [input.catalog]     Newline-separated default-catalog entries.
 * @param {string} [input.namedCatalog]      Optional named catalog name.
 * @param {string} [input.namedCatalogEntries] Newline-separated entries for it.
 * @returns {{yaml, usageSnippet, globCount, excludeCount, catalogCount, needsCatalogPnpm} | {error}}
 */
export function buildPnpmWorkspaceYaml({
  globs,
  excludes = "",
  catalog = "",
  namedCatalog = "",
  namedCatalogEntries = "",
}) {
  const toLines = (v) =>
    String(v ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  const includeGlobs = toLines(globs).map((g) => g.replace(/^!+/, ""));
  if (includeGlobs.length === 0) {
    return { error: "Add at least one package glob — pnpm needs the packages field to find workspace members." };
  }
  const excludeGlobs = toLines(excludes).map((g) => g.replace(/^!+/, ""));

  const catalogLines = toLines(catalog);
  const catalogEntries = [];
  for (const line of catalogLines) {
    const parsed = parseCatalogLine(line);
    if (parsed.error) return { error: `Catalog entry problem: ${parsed.error}` };
    catalogEntries.push(parsed);
  }
  const dupes = catalogEntries
    .map((e) => e.name)
    .filter((n, i, arr) => arr.indexOf(n) !== i);
  if (dupes.length) {
    return { error: `Duplicate catalog entry for "${dupes[0]}" — each package can appear once per catalog.` };
  }

  const namedName = String(namedCatalog).trim();
  const namedLines = toLines(namedCatalogEntries);
  if (namedLines.length > 0 && !namedName) {
    return { error: "Give the named catalog a name, or clear its entries." };
  }
  if (namedName && !/^[a-z0-9][a-z0-9._-]*$/i.test(namedName)) {
    return { error: `"${namedName}" is not a valid catalog name — use letters, digits, dots, dashes.` };
  }
  const namedEntries = [];
  for (const line of namedLines) {
    const parsed = parseCatalogLine(line);
    if (parsed.error) return { error: `Named catalog problem: ${parsed.error}` };
    namedEntries.push(parsed);
  }
  const namedDupes = namedEntries
    .map((e) => e.name)
    .filter((n, i, arr) => arr.indexOf(n) !== i);
  if (namedDupes.length) {
    return {
      error: `Duplicate entry for "${namedDupes[0]}" in named catalog "${namedName}" — each package can appear once per catalog.`,
    };
  }

  const lines = ["packages:"];
  for (const g of includeGlobs) lines.push(`  - ${yamlString(g)}`);
  for (const g of excludeGlobs) lines.push(`  - ${yamlString(`!${g}`)}`);

  if (catalogEntries.length) {
    lines.push("");
    lines.push("catalog:");
    for (const e of catalogEntries) lines.push(`  ${yamlString(e.name)}: ${yamlString(e.range)}`);
  }
  if (namedName && namedEntries.length) {
    lines.push("");
    lines.push("catalogs:");
    lines.push(`  ${yamlString(namedName)}:`);
    for (const e of namedEntries) lines.push(`    ${yamlString(e.name)}: ${yamlString(e.range)}`);
  }

  const yaml = `${lines.join("\n")}\n`;

  const usageLines = [];
  const namedExample =
    namedName && namedEntries.length
      ? (namedEntries.find((e) => e.name !== catalogEntries[0]?.name) ?? null)
      : null;
  if (catalogEntries.length) {
    usageLines.push(
      "// package.json of any workspace package",
      "{",
      '  "dependencies": {',
      `    ${quote(catalogEntries[0].name)}: "catalog:"${namedExample ? "," : ""}`,
    );
    if (namedExample) {
      usageLines.push(`    ${quote(namedExample.name)}: "catalog:${namedName}"`);
    }
    usageLines.push("  }", "}");
    if (namedName && namedEntries.length && !namedExample) {
      usageLines.push(
        `// or pin to the named catalog instead: ${quote(namedEntries[0].name)}: "catalog:${namedName}"`,
      );
    }
  } else if (namedName && namedEntries.length) {
    usageLines.push(
      "// package.json of any workspace package",
      "{",
      '  "dependencies": {',
      `    ${quote(namedEntries[0].name)}: "catalog:${namedName}"`,
      "  }",
      "}",
    );
  }

  return {
    yaml,
    usageSnippet: usageLines.join("\n"),
    globCount: includeGlobs.length,
    excludeCount: excludeGlobs.length,
    catalogCount: catalogEntries.length + namedEntries.length,
    needsCatalogPnpm: catalogEntries.length + namedEntries.length > 0,
  };
}
