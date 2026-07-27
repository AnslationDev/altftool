/**
 * composer.json generator.
 *
 * Rules implemented from the Composer schema documentation
 * (https://getcomposer.org/doc/04-schema.md):
 *  - "name" must match ^[a-z0-9]([_.-]?[a-z0-9]+)*\/[a-z0-9](([_.]?|-{0,2})[a-z0-9]+)*$
 *    — vendor/package, lowercase only.
 *  - "type" defaults to "library"; "project", "metapackage" and
 *    "composer-plugin" are the other values Composer treats specially.
 *  - "minimum-stability" is one of dev, alpha, beta, RC, stable and defaults
 *    to stable; RC is the only value that is not lowercase.
 *  - PSR-4 autoload maps a namespace prefix, which must end with a backslash,
 *    to a directory (PSR-4 specification, php-fig.org/psr/psr-4).
 *  - Key order follows the order Composer itself writes when running
 *    `composer init` / `composer require`.
 */

/** Package name pattern taken verbatim from the Composer JSON schema. */
export const PACKAGE_NAME_RE =
  /^[a-z0-9]([_.-]?[a-z0-9]+)*\/[a-z0-9](([_.]?|-{0,2})[a-z0-9]+)*$/;

/** Package types Composer gives special install behaviour to. */
export const PACKAGE_TYPES = ["library", "project", "metapackage", "composer-plugin"];

/** minimum-stability values, ordered least to most stable. */
export const STABILITIES = ["dev", "alpha", "beta", "RC", "stable"];

/** Common SPDX identifiers accepted by Composer's "license" field. */
export const LICENSES = [
  "MIT",
  "Apache-2.0",
  "BSD-3-Clause",
  "BSD-2-Clause",
  "GPL-2.0-or-later",
  "GPL-3.0-or-later",
  "LGPL-3.0-or-later",
  "MPL-2.0",
  "ISC",
  "Unlicense",
  "proprietary",
];

/** PHP branches worth pinning as a platform requirement. */
export const PHP_CONSTRAINTS = ["^8.4", "^8.3", "^8.2", "^8.1", "^8.0", "^7.4", ">=8.1"];

/**
 * One version-constraint token. Composer accepts exact versions, wildcards,
 * ranges with comparison operators, caret and tilde operators, branch names
 * prefixed with dev- and the "*" any-version token.
 */
const CONSTRAINT_TOKEN_RE =
  /^(\*|dev-[A-Za-z0-9._/-]+|[A-Za-z0-9._/-]+-dev|[\^~]?v?\d+(\.\d+)*(\.\*)?(-(dev|alpha|beta|RC|patch|p|stable)[0-9.]*)?|(>=|<=|!=|>|<|==?)\s*v?\d+(\.\d+)*(-(dev|alpha|beta|RC|patch|p|stable)[0-9.]*)?)$/;

/** PSR-4 namespace prefix: PHP labels separated by backslashes, trailing "\". */
const NAMESPACE_RE = /^([A-Za-z_][A-Za-z0-9_]*\\)+$/;

/** Validate a Composer version constraint such as "^8.2" or ">=1.0 <2.0". */
export function validateConstraint(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: false, reason: "Version constraint is required." };
  const alternatives = value.split("||");
  for (const alternative of alternatives) {
    const tokens = alternative.replace(/,/g, " ").trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      return { ok: false, reason: `"${value}" has an empty branch around ||.` };
    }
    for (const token of tokens) {
      if (token === "-") continue; // hyphenated range: 1.0 - 2.0
      if (!CONSTRAINT_TOKEN_RE.test(token)) {
        return { ok: false, reason: `"${token}" is not a valid Composer version constraint.` };
      }
    }
  }
  return { ok: true };
}

/** Validate a vendor/package name. */
export function validatePackageName(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: false, reason: "Package name is required." };
  if (!value.includes("/")) {
    return { ok: false, reason: `"${value}" needs a vendor prefix, for example acme/${value}.` };
  }
  if (value !== value.toLowerCase()) {
    return { ok: false, reason: `Package names are lowercase — use "${value.toLowerCase()}".` };
  }
  if (!PACKAGE_NAME_RE.test(value)) {
    return { ok: false, reason: `"${value}" does not match the vendor/package pattern Composer requires.` };
  }
  return { ok: true };
}

/** Validate a PSR-4 namespace prefix (must end with a backslash). */
export function validateNamespace(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return { ok: false, reason: "Namespace prefix is required." };
  if (!value.endsWith("\\")) {
    return { ok: false, reason: `PSR-4 namespace prefixes end with a backslash — use "${value}\\".` };
  }
  if (!NAMESPACE_RE.test(value)) {
    return { ok: false, reason: `"${value}" is not a valid PHP namespace prefix.` };
  }
  return { ok: true };
}

function normaliseDir(raw, fallback) {
  const value = String(raw ?? "").trim().replace(/^\.\//, "").replace(/\/+$/, "");
  return value || fallback;
}

/**
 * Build a composer.json document.
 *
 * @param {object} input
 * @returns {{content:string,json:object,warnings:string[],requireCount:number,devCount:number,lineCount:number}|{error:string}}
 */
export function buildComposerJson(input = {}) {
  const {
    name = "",
    description = "",
    type = "library",
    license = "MIT",
    authorName = "",
    authorEmail = "",
    keywords = "",
    homepage = "",
    phpConstraint = "^8.2",
    requires = [],
    requireDev = [],
    namespace = "App\\",
    sourceDir = "src",
    testNamespace = "App\\Tests\\",
    testDir = "tests",
    minimumStability = "stable",
    preferStable = true,
    sortPackages = true,
    optimizeAutoloader = false,
    scripts = [],
  } = input;

  const nameCheck = validatePackageName(name);
  if (!nameCheck.ok) return { error: nameCheck.reason };

  if (!PACKAGE_TYPES.includes(type)) {
    return { error: `"${type}" is not one of the Composer package types: ${PACKAGE_TYPES.join(", ")}.` };
  }
  if (!STABILITIES.includes(minimumStability)) {
    return { error: `minimum-stability must be one of ${STABILITIES.join(", ")} (note the uppercase RC).` };
  }

  const phpCheck = validateConstraint(phpConstraint);
  if (!phpCheck.ok) return { error: `PHP requirement: ${phpCheck.reason}` };

  const nsCheck = validateNamespace(namespace);
  if (!nsCheck.ok) return { error: nsCheck.reason };

  const warnings = [];
  const requireBlock = { php: String(phpConstraint).trim() };
  let requireCount = 1;

  for (const item of requires) {
    const pkg = String(item?.name ?? "").trim();
    if (!pkg) continue;
    // ext-* and lib-* are virtual platform packages, not vendor/package names.
    const isPlatform = /^(ext|lib)-[a-z0-9_.-]+$/i.test(pkg);
    if (!isPlatform) {
      const check = validatePackageName(pkg);
      if (!check.ok) return { error: `require "${pkg}": ${check.reason}` };
    }
    const constraintCheck = validateConstraint(item?.constraint);
    if (!constraintCheck.ok) return { error: `require "${pkg}": ${constraintCheck.reason}` };
    if (pkg in requireBlock) return { error: `"${pkg}" is listed twice under require.` };
    requireBlock[pkg] = String(item.constraint).trim();
    requireCount += 1;
    // "*" is idiomatic for ext-* platform packages but risky for real libraries.
    if (!isPlatform && String(item.constraint).trim() === "*") {
      warnings.push(`"${pkg}" is constrained to *, which allows any future major version to break your build.`);
    }
  }

  const devBlock = {};
  let devCount = 0;
  for (const item of requireDev) {
    const pkg = String(item?.name ?? "").trim();
    if (!pkg) continue;
    const isPlatform = /^(ext|lib)-[a-z0-9_.-]+$/i.test(pkg);
    if (!isPlatform) {
      const check = validatePackageName(pkg);
      if (!check.ok) return { error: `require-dev "${pkg}": ${check.reason}` };
    }
    const constraintCheck = validateConstraint(item?.constraint);
    if (!constraintCheck.ok) return { error: `require-dev "${pkg}": ${constraintCheck.reason}` };
    if (pkg in requireBlock) {
      return { error: `"${pkg}" appears in both require and require-dev — keep it in one section only.` };
    }
    if (pkg in devBlock) return { error: `"${pkg}" is listed twice under require-dev.` };
    devBlock[pkg] = String(item.constraint).trim();
    devCount += 1;
  }

  const src = normaliseDir(sourceDir, "src");
  const tests = normaliseDir(testDir, "tests");

  const json = { name: String(name).trim() };

  const desc = String(description).trim();
  if (desc) json.description = desc;
  json.type = type;

  const keywordList = String(keywords)
    .split(",")
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
  if (keywordList.length > 0) json.keywords = keywordList;

  const home = String(homepage).trim();
  if (home) {
    if (!/^https?:\/\/\S+$/.test(home)) {
      return { error: "Homepage must be a full http:// or https:// URL." };
    }
    json.homepage = home;
  }

  json.license = license;

  const author = String(authorName).trim();
  const email = String(authorEmail).trim();
  if (author) {
    const entry = { name: author };
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Author email does not look like a valid address." };
      }
      entry.email = email;
    }
    json.authors = [entry];
  } else if (email) {
    return { error: "Add an author name to go with the author email." };
  }

  json.require = requireBlock;
  if (devCount > 0) json["require-dev"] = devBlock;

  json.autoload = { "psr-4": { [String(namespace).trim()]: `${src}/` } };

  const testNs = String(testNamespace).trim();
  if (testNs && devCount > 0) {
    const testCheck = validateNamespace(testNs);
    if (!testCheck.ok) return { error: `Test namespace: ${testCheck.reason}` };
    json["autoload-dev"] = { "psr-4": { [testNs]: `${tests}/` } };
  }

  const scriptEntries = {};
  for (const item of scripts) {
    const key = String(item?.name ?? "").trim();
    const command = String(item?.command ?? "").trim();
    if (!key || !command) continue;
    if (/\s/.test(key)) return { error: `Script name "${key}" must not contain spaces.` };
    scriptEntries[key] = command;
  }
  if (Object.keys(scriptEntries).length > 0) json.scripts = scriptEntries;

  const config = {};
  if (sortPackages) config["sort-packages"] = true;
  if (optimizeAutoloader) config["optimize-autoloader"] = true;
  if (Object.keys(config).length > 0) json.config = config;

  if (minimumStability !== "stable") {
    json["minimum-stability"] = minimumStability;
    if (!preferStable) {
      warnings.push(
        `minimum-stability is "${minimumStability}" without prefer-stable, so Composer may install a development release of every dependency.`,
      );
    }
  }
  if (preferStable) json["prefer-stable"] = true;

  if (type === "library" && json["prefer-stable"] && minimumStability === "stable") {
    // prefer-stable is the default effect at stable minimum-stability.
    warnings.push(
      "prefer-stable has no effect while minimum-stability is stable — it is harmless, just redundant.",
    );
  }

  const content = `${JSON.stringify(json, null, 4)}\n`;

  return {
    content,
    json,
    warnings,
    requireCount,
    devCount,
    lineCount: content.split("\n").length - 1,
  };
}
