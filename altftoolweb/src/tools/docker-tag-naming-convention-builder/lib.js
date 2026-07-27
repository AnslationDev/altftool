/**
 * Docker / OCI image reference grammar, from the OCI distribution spec and
 * github.com/distribution/reference (reference.go), which Docker uses:
 *
 *   reference  := name [":" tag] ["@" digest]
 *   name       := [domain "/"] path-component ("/" path-component)*
 *   path-comp  := [a-z0-9]+ ((\.|_|__|-+) [a-z0-9]+)*     (lowercase only)
 *   tag        := [A-Za-z0-9_][A-Za-z0-9._-]{0,127}        (max 128 chars,
 *                 must NOT start with "." or "-")
 *
 * Pure functions only. No React, no DOM, no Date.now().
 */

/** Tag grammar per distribution/reference: 128 chars max, no leading "." or "-". */
export const TAG_MAX_LENGTH = 128;
export const TAG_REGEX = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

/** Repository path component per distribution/reference (lowercase only). */
export const REPO_COMPONENT_REGEX = /^[a-z0-9]+((\.|_|__|-+)[a-z0-9]+)*$/;

/** The whole name (path without domain) is limited to 255 chars in the spec. */
export const NAME_MAX_LENGTH = 255;

/** Git short SHA conventions: git defaults to 7 hex chars, CI often uses 8-12. */
export const GIT_SHA_REGEX = /^[0-9a-f]{7,40}$/;

/** SemVer 2.0.0 core version: MAJOR.MINOR.PATCH, no leading zeros (semver.org). */
export const SEMVER_CORE_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** Calendar-date component convention: YYYYMMDD or YYYY-MM-DD → YYYYMMDD. */
export const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Components a team can compose a tag from, in display order. */
export const TAG_COMPONENT_DEFS = [
  { id: "semver", label: "SemVer version (e.g. 1.4.2)", placeholder: "1.4.2" },
  { id: "branch", label: "Git branch (sanitised)", placeholder: "feature/login" },
  { id: "sha", label: "Git commit SHA (short)", placeholder: "9fceb02" },
  { id: "date", label: "Build date (YYYYMMDD)", placeholder: "2026-07-26" },
  { id: "env", label: "Environment / channel", placeholder: "staging" },
];

/** Separators the tag grammar allows between components. */
export const SEPARATORS = ["-", ".", "_"];

/**
 * Make an arbitrary string safe to use INSIDE a tag: replace every character
 * outside [A-Za-z0-9_.-] with "-", collapse runs, and trim leading "." / "-"
 * so the final tag cannot start with them. Branch names like
 * "feature/login" become "feature-login".
 */
export function sanitizeTagComponent(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/[^A-Za-z0-9_.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[.-]+/, "")
    .replace(/[.-]+$/, "");
}

/** Validate a full tag against the distribution/reference grammar. */
export function validateTag(tag) {
  if (typeof tag !== "string" || tag.length === 0) return "Tag is empty.";
  if (tag.length > TAG_MAX_LENGTH) {
    return `Tag is ${tag.length} characters; the maximum is ${TAG_MAX_LENGTH}.`;
  }
  if (!TAG_REGEX.test(tag)) {
    return "Tag may only contain letters, digits, '_', '.', '-' and must not start with '.' or '-'.";
  }
  return null;
}

/** Validate a repository path (namespace/name, without registry domain). */
export function validateRepositoryPath(path) {
  if (typeof path !== "string" || path.length === 0) return "Repository name is empty.";
  if (path.length > NAME_MAX_LENGTH) {
    return `Repository path is ${path.length} characters; the maximum is ${NAME_MAX_LENGTH}.`;
  }
  const components = path.split("/");
  for (const component of components) {
    if (!REPO_COMPONENT_REGEX.test(component)) {
      return `Repository component "${component}" is invalid: use lowercase letters and digits, separated by '.', '_', '__' or '-'.`;
    }
  }
  return null;
}

/**
 * Build a tag and full image reference from a chosen component order.
 *
 * @param {object} input
 * @param {string} [input.registry]    e.g. "ghcr.io" — may be empty for Docker Hub.
 * @param {string} [input.namespace]   e.g. "acme" — may be empty for official images.
 * @param {string} input.repository    e.g. "checkout-api".
 * @param {string[]} input.order       Component ids from TAG_COMPONENT_DEFS, in order.
 * @param {object} input.values        Raw values keyed by component id.
 * @param {string} [input.separator]   One of SEPARATORS. Default "-".
 * @returns {{tag, reference, warnings}|{error}}
 */
export function buildImageReference({ registry = "", namespace = "", repository, order, values, separator = "-" }) {
  if (!SEPARATORS.includes(separator)) {
    return { error: "Separator must be '-', '.' or '_' — the only characters the tag grammar allows between parts." };
  }
  if (!Array.isArray(order) || order.length === 0) {
    return { error: "Pick at least one tag component." };
  }

  const warnings = [];
  const parts = [];

  for (const id of order) {
    const def = TAG_COMPONENT_DEFS.find((d) => d.id === id);
    if (!def) return { error: `Unknown tag component "${id}".` };
    const raw = typeof values?.[id] === "string" ? values[id].trim() : "";
    if (raw === "") return { error: `Fill in a value for "${def.label}".` };

    let part;
    switch (id) {
      case "semver": {
        const clean = raw.replace(/^v/i, "");
        if (!SEMVER_CORE_REGEX.test(clean)) {
          return { error: `"${raw}" is not a SemVer core version (MAJOR.MINOR.PATCH, no leading zeros).` };
        }
        part = clean;
        break;
      }
      case "sha": {
        const clean = raw.toLowerCase();
        if (!GIT_SHA_REGEX.test(clean)) {
          return { error: `"${raw}" is not a git SHA (7-40 lowercase hex characters).` };
        }
        if (clean.length > 12) {
          warnings.push("A full 40-char SHA works but is unwieldy; git's short form (7-12 chars) is the common convention.");
        }
        part = clean;
        break;
      }
      case "date": {
        if (DATE_ISO_REGEX.test(raw)) {
          part = raw.replace(/-/g, "");
        } else if (/^\d{8}$/.test(raw)) {
          part = raw;
        } else {
          return { error: `"${raw}" is not a date — use YYYY-MM-DD or YYYYMMDD.` };
        }
        break;
      }
      case "branch":
      case "env": {
        part = sanitizeTagComponent(raw).toLowerCase();
        if (part === "") {
          return { error: `"${raw}" contains no characters usable in a tag after sanitising.` };
        }
        if (part !== raw) {
          warnings.push(`"${raw}" was sanitised to "${part}" (tags cannot contain '/', spaces or other special characters).`);
        }
        break;
      }
      default:
        return { error: `Unknown tag component "${id}".` };
    }
    parts.push(part);
  }

  const tag = parts.join(separator);
  const tagProblem = validateTag(tag);
  if (tagProblem) return { error: tagProblem };

  const path = [namespace.trim(), repository?.trim()].filter(Boolean).join("/");
  const pathProblem = validateRepositoryPath(path);
  if (pathProblem) return { error: pathProblem };

  const reg = registry.trim();
  if (reg !== "" && !/^[a-zA-Z0-9.-]+(:\d{1,5})?$/.test(reg)) {
    return { error: `"${reg}" is not a valid registry host (e.g. ghcr.io, registry.example.com:5000).` };
  }

  if (tag === "latest") {
    warnings.push("'latest' is mutable and tells you nothing about the build — avoid it for deployments.");
  }
  if (!order.includes("sha") && !order.includes("semver")) {
    warnings.push("Without a SHA or version, two different builds can produce the same tag — the tag is not traceable to a commit.");
  }
  if (order.includes("branch") && order.includes("semver")) {
    warnings.push("Branch + semver in one tag is unusual: releases are normally tagged from the version alone.");
  }

  const reference = `${reg ? `${reg}/` : ""}${path}:${tag}`;
  return { tag, reference, warnings };
}
