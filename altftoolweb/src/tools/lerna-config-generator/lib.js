/**
 * lerna.json generator — targets Lerna v7/v8 (lerna.js.org).
 *
 * Rules encoded from the Lerna docs:
 *  - "version" is either a fixed semver applied to every package, or the string
 *    "independent" so each package versions on its own (lerna.js.org
 *    "Version and Publish" — fixed/locked vs independent mode).
 *  - Since Lerna v7, package discovery defaults to the package manager's
 *    workspaces; an explicit "packages" array in lerna.json overrides it
 *    (useWorkspaces was removed in v7).
 *  - Per-command options live under command.version / command.publish, e.g.
 *    conventionalCommits, allowBranch, message, registry, distTag,
 *    ignoreChanges (lerna.js.org configuration reference).
 *  - "$schema" points at the shipped lerna-schema.json for editor validation.
 */

/** Schema path shipped inside the lerna package (Lerna docs recommend it). */
export const LERNA_SCHEMA = "node_modules/lerna/schemas/lerna-schema.json";

export const VERSIONING_MODES = [
  {
    id: "fixed",
    label: "Fixed / locked — one version for every package",
    hint: "All packages share a single version line (the Babel model).",
  },
  {
    id: "independent",
    label: "Independent — each package versions separately",
    hint: "lerna version prompts per changed package.",
  },
];

export const NPM_CLIENTS = ["npm", "yarn", "pnpm"];

/** Loose semver: MAJOR.MINOR.PATCH with optional prerelease/build metadata. */
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

const JSON_INDENT = 2;

function toLines(value) {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Build lerna.json.
 *
 * @param {object} input
 * @param {"fixed"|"independent"} input.mode
 * @param {string} [input.fixedVersion]      Semver used when mode is fixed.
 * @param {string} [input.npmClient]         npm | yarn | pnpm.
 * @param {string} [input.packagesGlobs]     Newline/comma list; empty = use workspaces.
 * @param {boolean} [input.conventionalCommits] Drive bumps + changelogs from commits.
 * @param {string} [input.allowBranch]       Newline/comma list of allowed branches.
 * @param {string} [input.registry]          npm registry URL for publish.
 * @param {string} [input.distTag]           npm dist-tag used by lerna publish.
 * @param {string} [input.message]           Release commit message.
 * @param {string} [input.ignoreChanges]     Globs that never trigger a version bump.
 * @returns {{json: string, config: object, notes: string[]} | {error: string}}
 */
export function buildLernaJson({
  mode,
  fixedVersion = "0.0.0",
  npmClient = "npm",
  packagesGlobs = "",
  conventionalCommits = true,
  allowBranch = "main",
  registry = "",
  distTag = "",
  message = "chore(release): publish",
  ignoreChanges = "",
}) {
  if (!VERSIONING_MODES.some((m) => m.id === mode)) {
    return { error: "Choose fixed or independent versioning." };
  }
  if (!NPM_CLIENTS.includes(npmClient)) {
    return { error: "npmClient must be npm, yarn or pnpm." };
  }

  let version;
  if (mode === "independent") {
    version = "independent";
  } else {
    const v = String(fixedVersion).trim().replace(/^v/, "");
    if (!SEMVER_RE.test(v)) {
      return { error: `"${fixedVersion}" is not a valid semver version (expected MAJOR.MINOR.PATCH, e.g. 1.2.3).` };
    }
    version = v;
  }

  const reg = String(registry).trim();
  if (reg && !/^https?:\/\/\S+$/.test(reg)) {
    return { error: `"${reg}" is not a valid registry URL — it must start with http:// or https://.` };
  }
  const tag = String(distTag).trim();
  if (tag && !/^[a-z0-9][a-z0-9._-]*$/i.test(tag)) {
    return { error: `"${tag}" is not a valid npm dist-tag.` };
  }

  const branches = toLines(allowBranch);
  const globs = toLines(packagesGlobs);
  const ignores = toLines(ignoreChanges);
  const msg = String(message).trim();

  const config = { $schema: LERNA_SCHEMA, version };
  if (globs.length) config.packages = globs;
  if (npmClient !== "npm") config.npmClient = npmClient;

  const versionCmd = {};
  if (conventionalCommits) versionCmd.conventionalCommits = true;
  if (branches.length) versionCmd.allowBranch = branches.length === 1 ? branches[0] : branches;
  if (msg) versionCmd.message = msg;
  if (ignores.length) versionCmd.ignoreChanges = ignores;

  const publishCmd = {};
  if (reg) publishCmd.registry = reg;
  if (tag) publishCmd.distTag = tag;

  const command = {};
  if (Object.keys(versionCmd).length) command.version = versionCmd;
  if (Object.keys(publishCmd).length) command.publish = publishCmd;
  if (Object.keys(command).length) config.command = command;

  const notes = [];
  if (!globs.length) {
    notes.push(
      "No packages field emitted — Lerna v7+ discovers packages from your package manager's workspaces (package.json workspaces or pnpm-workspace.yaml).",
    );
  }
  if (mode === "independent") {
    notes.push("Independent mode: lerna version prompts a bump per changed package; changelogs stay per-package.");
  } else {
    notes.push(`Fixed mode: every publish moves all packages to one shared version (currently ${version}).`);
  }
  if (conventionalCommits) {
    notes.push(
      "conventionalCommits derives bumps (fix -> patch, feat -> minor, BREAKING CHANGE -> major) and writes CHANGELOG.md files.",
    );
  }
  if (tag) {
    notes.push(`lerna publish will tag releases as "${tag}" on the registry instead of "latest".`);
  }

  return {
    json: `${JSON.stringify(config, null, JSON_INDENT)}\n`,
    config,
    notes,
  };
}
