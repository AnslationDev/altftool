/**
 * requirements.txt line construction.
 *
 * Rules encoded here and their sources:
 *  - Package names: PEP 508 — start/end with a letter or digit, interior may
 *    contain letters, digits, ".", "_", "-".
 *  - Version specifiers and operators: PEP 440 — ==, !=, ~=, >=, <=, >, <,
 *    === (arbitrary equality); ".*" wildcard suffix is only valid with == and !=.
 *  - Compatible release: "~= X.Y" means ">= X.Y, == X.*" (PEP 440 §Compatible release).
 *  - Extras go in square brackets after the name: name[extra1,extra2] (PEP 508).
 *  - Environment markers follow "; " and compare marker variables such as
 *    python_version or sys_platform to quoted strings (PEP 508 §Environment markers).
 *
 * Pure module — no React, no DOM.
 */

/** PEP 508 name pattern (also used for extra names). */
export const PEP508_NAME = /^[A-Za-z0-9]([A-Za-z0-9._-]*[A-Za-z0-9])?$/;

/** PEP 440 version: [epoch!]release[{a|b|rc}N][.postN][.devN][+local] (simplified but strict). */
export const PEP440_VERSION =
  /^([0-9]+!)?[0-9]+(\.[0-9]+)*((a|b|rc)[0-9]+)?(\.post[0-9]+)?(\.dev[0-9]+)?(\+[a-z0-9]+([._-][a-z0-9]+)*)?$/i;

/** PEP 440 comparison operators. */
export const OPERATORS = [
  { id: "==", label: "== exact pin (reproducible installs)" },
  { id: "~=", label: "~= compatible release (>= X.Y, == X.*)" },
  { id: ">=", label: ">= minimum version" },
  { id: "<=", label: "<= maximum version" },
  { id: ">", label: "> strictly greater" },
  { id: "<", label: "< strictly less (common as upper bound)" },
  { id: "!=", label: "!= exclude one version" },
  { id: "===", label: "=== arbitrary string equality" },
  { id: "", label: "any version (no specifier)" },
];

/** PEP 508 marker variables. */
export const MARKER_VARIABLES = [
  "python_version",
  "python_full_version",
  "os_name",
  "sys_platform",
  "platform_machine",
  "platform_system",
  "platform_release",
  "implementation_name",
];

/** Ready-made markers people reach for most. */
export const MARKER_PRESETS = [
  { value: "", label: "no marker (all environments)" },
  { value: 'python_version < "3.11"', label: 'python_version < "3.11" (backports)' },
  { value: 'python_version >= "3.12"', label: 'python_version >= "3.12"' },
  { value: 'sys_platform == "win32"', label: "Windows only" },
  { value: 'sys_platform == "darwin"', label: "macOS only" },
  { value: 'sys_platform == "linux"', label: "Linux only" },
  { value: 'platform_machine == "arm64"', label: "Apple Silicon / arm64 only" },
];

/** A marker must be: variable operator "quoted string" (optionally chained with and/or). */
const MARKER_CLAUSE = `(${MARKER_VARIABLES.join("|")})\\s*(==|!=|<=|>=|<|>|~=|===)\\s*("[^"]*"|'[^']*')`;
const MARKER_PATTERN = new RegExp(`^${MARKER_CLAUSE}(\\s+(and|or)\\s+${MARKER_CLAUSE})*$`);

/**
 * Build one requirement line.
 * @returns {{line:string, warnings:string[]}} | {error}
 */
export function buildRequirementLine({ name, extras = "", operator = "==", version = "", marker = "" }) {
  const pkg = String(name ?? "").trim();
  if (!pkg) return { error: "Enter a package name." };
  if (!PEP508_NAME.test(pkg)) {
    return {
      error: `"${pkg}" is not a valid package name — PEP 508 names start and end with a letter or digit and use only letters, digits, ".", "_" and "-".`,
    };
  }

  const warnings = [];

  const extraList = String(extras ?? "")
    .split(",")
    .map((extra) => extra.trim())
    .filter(Boolean);
  for (const extra of extraList) {
    if (!PEP508_NAME.test(extra)) return { error: `"${extra}" is not a valid extra name.` };
  }
  const extrasPart = extraList.length > 0 ? `[${extraList.join(",")}]` : "";

  const op = String(operator ?? "").trim();
  if (op && !OPERATORS.some((item) => item.id === op)) {
    return { error: `"${op}" is not a PEP 440 operator.` };
  }

  let specPart = "";
  const ver = String(version ?? "").trim();
  if (op === "") {
    if (ver) return { error: "You gave a version but chose \"any version\" — pick an operator like ==." };
    warnings.push(`${pkg} is unpinned — installs are not reproducible. Prefer == for applications.`);
  } else {
    if (!ver) return { error: `Operator ${op} needs a version number.` };
    const isWildcard = ver.endsWith(".*");
    const core = isWildcard ? ver.slice(0, -2) : ver;
    if (isWildcard && op !== "==" && op !== "!=") {
      return { error: `The ".*" wildcard is only valid with == or != (PEP 440), not ${op}.` };
    }
    if (op === "===") {
      if (/\s/.test(ver)) return { error: "=== takes an arbitrary version string without spaces." };
    } else if (!PEP440_VERSION.test(core)) {
      return { error: `"${ver}" is not a valid PEP 440 version (e.g. 2.31.0, 1.0.0rc1, 2.0.*).` };
    }
    if (op === "~=" && !core.includes(".")) {
      return { error: "~= needs at least two release segments (e.g. ~= 2.2), per PEP 440." };
    }
    specPart = `${op}${ver}`;
    if (op === ">=") {
      warnings.push(`${pkg}>= has no upper bound — a future major release can break the install.`);
    }
  }

  const markerText = String(marker ?? "").trim();
  let markerPart = "";
  if (markerText) {
    if (!MARKER_PATTERN.test(markerText)) {
      return {
        error:
          'Marker must look like: python_version < "3.11" (a PEP 508 variable, an operator, and a QUOTED value — quotes are required).',
      };
    }
    markerPart = ` ; ${markerText}`;
  }

  return { line: `${pkg}${extrasPart}${specPart}${markerPart}`, warnings };
}

/**
 * Build the whole requirements.txt.
 * @returns {{content:string, count:number, warnings:string[]}} or {error}
 */
export function buildRequirementsFile({ rows = [], sortAlpha = true, includeHeader = true }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Add at least one package." };
  }

  const lines = [];
  const warnings = [];
  const seen = new Set();

  for (const row of rows) {
    const built = buildRequirementLine(row);
    if (built.error) return { error: built.error };
    const key = String(row.name).trim().toLowerCase().replace(/[-_.]+/g, "-");
    if (seen.has(key)) {
      // PEP 503 normalisation: Foo_Bar, foo-bar and foo.bar are the same project.
      return { error: `"${row.name}" appears twice (names are compared case-insensitively with -, _ and . equivalent).` };
    }
    seen.add(key);
    lines.push(built.line);
    warnings.push(...built.warnings);
  }

  const ordered = sortAlpha ? [...lines].sort((a, b) => a.localeCompare(b)) : lines;
  const header = includeHeader
    ? ["# requirements.txt — install with: pip install -r requirements.txt", ""]
    : [];

  return {
    content: [...header, ...ordered].join("\n") + "\n",
    count: lines.length,
    warnings,
  };
}
