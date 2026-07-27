/**
 * go.mod generator.
 *
 * Rules implemented from the Go Modules Reference (https://go.dev/ref/mod):
 *  - "go.mod file" grammar: module / go / toolchain / require / exclude /
 *    replace / retract directives, blocks written with parentheses.
 *  - "Major version suffixes": a module path whose major version is 2 or
 *    higher MUST end with the element /vN (v0 and v1 carry no suffix).
 *  - "Versions": canonical semantic versions are vMAJOR.MINOR.PATCH with an
 *    optional pre-release and build suffix; pseudo-versions have the shape
 *    vX.Y.Z-yyyymmddhhmmss-abcdefabcdef (12 hex digits of the commit).
 *  - The `toolchain` directive was added in Go 1.21; it is meaningless on
 *    older `go` lines, so it is only emitted for go >= 1.21.
 */

/** First Go release that understands the `toolchain` directive. */
export const TOOLCHAIN_MIN_MINOR = 21;

/** Go release lines commonly pinned in a go directive. */
export const GO_VERSIONS = [
  "1.25",
  "1.24",
  "1.23",
  "1.22",
  "1.21",
  "1.20",
  "1.19",
  "1.18",
  "1.17",
  "1.16",
];

/** Canonical semver as accepted by the go command (leading "v" is required). */
const SEMVER_RE =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

/** Pseudo-version: base version, UTC timestamp, 12-hex-digit commit prefix. */
const PSEUDO_RE = /-\d{14}-[0-9a-f]{12}$/;

/** go directive: "1.22" or "1.22.3" (patch allowed from Go 1.21 onwards). */
const GO_DIRECTIVE_RE = /^\d+\.\d+(\.\d+)?$/;

/** Path element characters the go command allows without escaping. */
const PATH_ELEMENT_RE = /^[A-Za-z0-9!#$%&()+,\-.=@[\]^_{}~]+$/;

/** Reserved on Windows, so the go command refuses them as path elements. */
const WINDOWS_RESERVED = new Set([
  "con",
  "prn",
  "aux",
  "nul",
  "com1",
  "com2",
  "com3",
  "com4",
  "com5",
  "com6",
  "com7",
  "com8",
  "com9",
  "lpt1",
  "lpt2",
  "lpt3",
  "lpt4",
  "lpt5",
  "lpt6",
  "lpt7",
  "lpt8",
  "lpt9",
]);

/**
 * Validate a module path.
 * @returns {{ ok: boolean, reason?: string, major?: number, suffix?: string }}
 */
export function validateModulePath(rawPath) {
  const path = String(rawPath ?? "").trim();
  if (!path) return { ok: false, reason: "Module path is required." };
  if (path.startsWith("/") || path.endsWith("/")) {
    return { ok: false, reason: "Module path must not start or end with a slash." };
  }
  if (path.includes("//")) {
    return { ok: false, reason: "Module path must not contain an empty element (//)." };
  }
  if (/\s/.test(path)) {
    return { ok: false, reason: "Module path must not contain spaces." };
  }

  const elements = path.split("/");
  for (const element of elements) {
    if (!PATH_ELEMENT_RE.test(element)) {
      return { ok: false, reason: `Element "${element}" has characters the go command rejects.` };
    }
    if (element.startsWith(".") || element.endsWith(".")) {
      return { ok: false, reason: `Element "${element}" must not begin or end with a dot.` };
    }
    if (WINDOWS_RESERVED.has(element.toLowerCase())) {
      return { ok: false, reason: `"${element}" is a reserved Windows name and cannot be a path element.` };
    }
  }

  const last = elements[elements.length - 1];
  const suffixMatch = /^v([2-9]|[1-9]\d+)$/.exec(last);
  const major = suffixMatch ? Number(suffixMatch[1]) : 1;

  return {
    ok: true,
    major,
    suffix: suffixMatch ? last : "",
    hostLooksRemote: elements[0].includes("."),
  };
}

/** Validate a module version string. */
export function validateVersion(rawVersion) {
  const version = String(rawVersion ?? "").trim();
  if (!version) return { ok: false, reason: "Version is required." };
  if (!SEMVER_RE.test(version)) {
    return {
      ok: false,
      reason: `"${version}" is not a canonical version — use vMAJOR.MINOR.PATCH, e.g. v1.9.0.`,
    };
  }
  const major = Number(version.slice(1).split(".")[0]);
  return { ok: true, major, isPseudo: PSEUDO_RE.test(version) };
}

/** Major version implied by a require path (its /vN suffix, else 0-or-1). */
export function majorFromPath(path) {
  const check = validateModulePath(path);
  return check.ok ? check.major : null;
}

function quoteIfNeeded(value) {
  return /[\s"]/.test(value) ? JSON.stringify(value) : value;
}

function renderBlock(keyword, lines) {
  if (lines.length === 0) return "";
  if (lines.length === 1) return `${keyword} ${lines[0]}`;
  return `${keyword} (\n${lines.map((line) => `\t${line}`).join("\n")}\n)`;
}

/**
 * Build a go.mod file.
 *
 * @param {object} input
 * @param {string} input.modulePath
 * @param {string} input.goVersion            e.g. "1.22"
 * @param {string} [input.toolchain]          e.g. "go1.22.5" or "" for none
 * @param {Array<{path:string,version:string,indirect?:boolean}>} [input.requires]
 * @param {Array<{from:string,fromVersion?:string,to:string,toVersion?:string}>} [input.replaces]
 * @param {Array<{path:string,version:string}>} [input.excludes]
 * @param {Array<{version:string,reason?:string}>} [input.retracts]
 * @returns {{content:string,warnings:string[],directCount:number,indirectCount:number,lineCount:number}|{error:string}}
 */
export function buildGoMod(input = {}) {
  const {
    modulePath = "",
    goVersion = "",
    toolchain = "",
    requires = [],
    replaces = [],
    excludes = [],
    retracts = [],
  } = input;

  const moduleCheck = validateModulePath(modulePath);
  if (!moduleCheck.ok) return { error: moduleCheck.reason };

  const go = String(goVersion).trim();
  if (!GO_DIRECTIVE_RE.test(go)) {
    return { error: "The go directive needs a version like 1.22 or 1.22.3." };
  }
  const [goMajor, goMinor] = go.split(".").map(Number);
  if (goMajor !== 1) {
    return { error: "Only the Go 1.x release line exists — use a version such as 1.22." };
  }

  const warnings = [];
  if (!moduleCheck.hostLooksRemote) {
    warnings.push(
      "The first path element has no dot, so this module can only be resolved locally or through a replace directive.",
    );
  }
  if (/[A-Z]/.test(modulePath)) {
    warnings.push(
      "Uppercase letters are escaped with ! in the module cache — lowercase paths avoid case-folding surprises.",
    );
  }

  const requireLines = [];
  let directCount = 0;
  let indirectCount = 0;

  for (const item of requires) {
    const path = String(item?.path ?? "").trim();
    if (!path) continue;
    const pathCheck = validateModulePath(path);
    if (!pathCheck.ok) return { error: `Require "${path}": ${pathCheck.reason}` };

    const versionCheck = validateVersion(item?.version);
    if (!versionCheck.ok) return { error: `Require "${path}": ${versionCheck.reason}` };

    // Major version suffix rule: v2+ modules must carry the /vN element.
    if (versionCheck.major >= 2 && pathCheck.major !== versionCheck.major) {
      return {
        error: `Require "${path}" resolves to major v${versionCheck.major}, so the path must end with /v${versionCheck.major}.`,
      };
    }
    if (versionCheck.major <= 1 && pathCheck.suffix) {
      return {
        error: `Require "${path}" ends with ${pathCheck.suffix} but the version is ${item.version} — the suffix and the major version must match.`,
      };
    }

    if (item?.indirect) indirectCount += 1;
    else directCount += 1;

    requireLines.push(
      `${path} ${item.version.trim()}${item?.indirect ? " // indirect" : ""}`,
    );
  }

  const replaceLines = [];
  for (const item of replaces) {
    const from = String(item?.from ?? "").trim();
    const to = String(item?.to ?? "").trim();
    if (!from || !to) continue;

    const fromCheck = validateModulePath(from);
    if (!fromCheck.ok) return { error: `Replace source "${from}": ${fromCheck.reason}` };

    const fromVersion = String(item?.fromVersion ?? "").trim();
    if (fromVersion) {
      const check = validateVersion(fromVersion);
      if (!check.ok) return { error: `Replace source "${from}": ${check.reason}` };
    }

    const isLocal = to.startsWith("./") || to.startsWith("../") || to.startsWith("/");
    const toVersion = String(item?.toVersion ?? "").trim();
    if (isLocal && toVersion) {
      return { error: `Replace target "${to}" is a filesystem path, so it must not carry a version.` };
    }
    if (!isLocal) {
      const toCheck = validateModulePath(to);
      if (!toCheck.ok) return { error: `Replace target "${to}": ${toCheck.reason}` };
      if (!toVersion) {
        return { error: `Replace target "${to}" is a module path, so it needs a version such as v1.2.3.` };
      }
      const check = validateVersion(toVersion);
      if (!check.ok) return { error: `Replace target "${to}": ${check.reason}` };
    }

    const left = fromVersion ? `${quoteIfNeeded(from)} ${fromVersion}` : quoteIfNeeded(from);
    const right = toVersion ? `${quoteIfNeeded(to)} ${toVersion}` : quoteIfNeeded(to);
    replaceLines.push(`${left} => ${right}`);
  }

  const excludeLines = [];
  for (const item of excludes) {
    const path = String(item?.path ?? "").trim();
    if (!path) continue;
    const pathCheck = validateModulePath(path);
    if (!pathCheck.ok) return { error: `Exclude "${path}": ${pathCheck.reason}` };
    const versionCheck = validateVersion(item?.version);
    if (!versionCheck.ok) return { error: `Exclude "${path}": ${versionCheck.reason}` };
    excludeLines.push(`${path} ${item.version.trim()}`);
  }

  const retractLines = [];
  for (const item of retracts) {
    const version = String(item?.version ?? "").trim();
    if (!version) continue;
    const check = validateVersion(version);
    if (!check.ok) return { error: `Retract: ${check.reason}` };
    const reason = String(item?.reason ?? "").trim();
    retractLines.push(reason ? `${version} // ${reason}` : version);
  }

  const sections = [`module ${quoteIfNeeded(modulePath.trim())}`, "", `go ${go}`];

  const toolchainValue = String(toolchain ?? "").trim();
  if (toolchainValue) {
    if (goMinor < TOOLCHAIN_MIN_MINOR) {
      return {
        error: `The toolchain directive needs go 1.${TOOLCHAIN_MIN_MINOR} or newer on the go line.`,
      };
    }
    if (!/^go\d+\.\d+(\.\d+)?(rc\d+|beta\d+)?$/.test(toolchainValue)) {
      return { error: 'Toolchain must look like "go1.22.5".' };
    }
    sections.push("", `toolchain ${toolchainValue}`);
  }

  const blocks = [
    renderBlock("require", requireLines),
    renderBlock("replace", replaceLines),
    renderBlock("exclude", excludeLines),
    renderBlock("retract", retractLines),
  ].filter(Boolean);

  for (const block of blocks) sections.push("", block);

  const content = `${sections.join("\n")}\n`;

  if (indirectCount > 0 && directCount === 0) {
    warnings.push(
      "Every requirement is marked // indirect — go mod tidy will drop those that nothing imports.",
    );
  }
  if (retractLines.length > 0 && moduleCheck.major >= 2 && !moduleCheck.suffix) {
    warnings.push("Retract only affects the module path it is written in.");
  }

  return {
    content,
    warnings,
    directCount,
    indirectCount,
    lineCount: content.split("\n").length - 1,
  };
}
