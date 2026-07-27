/**
 * Changesets config generator — .changeset/config.json for @changesets/cli.
 *
 * Options encoded from the Changesets docs
 * (github.com/changesets/changesets, "config file options"):
 *  - changelog: false, a package name string, or [package, options]. The
 *    default generator is "@changesets/cli/changelog"; the GitHub-flavoured
 *    one is ["@changesets/changelog-github", { repo: "org/repo" }].
 *  - access: "restricted" (default; scoped packages stay private on npm) or
 *    "public".
 *  - baseBranch: branch that `changeset status` and bump detection diff
 *    against (default "main").
 *  - fixed: array of package-name/glob groups versioned in lockstep;
 *    linked: groups bumped together only when they change together.
 *  - updateInternalDependencies: "patch" | "minor" — the smallest bump that
 *    rewrites an internal dependency range.
 *  - ignore: packages never published or bumped by changesets.
 *  - commit: true lets `changeset add` / `changeset version` create commits.
 *  - privatePackages: { version, tag } controls handling of private packages.
 */

/** File location the CLI reads (created by `npx changeset init`). */
export const CONFIG_PATH = ".changeset/config.json";

/** Schema URL pinned to the config major used by @changesets/cli v2.27+. */
export const SCHEMA_URL = "https://unpkg.com/@changesets/config@3.1.1/schema.json";

export const CHANGELOG_TYPES = [
  { id: "default", label: "Default (@changesets/cli/changelog)" },
  { id: "github", label: "GitHub-linked (@changesets/changelog-github)" },
  { id: "none", label: "No changelog files" },
];

/** Allowed values per the config schema. */
export const ACCESS_VALUES = ["restricted", "public"];
export const INTERNAL_DEP_BUMPS = ["patch", "minor"];

const GITHUB_REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const JSON_INDENT = 2;

/**
 * Parse newline-separated groups of comma-separated package names/globs.
 * @returns {{groups: string[][]} | {error: string}}
 */
export function parseGroups(text, fieldLabel) {
  const groups = [];
  for (const line of String(text ?? "").split("\n")) {
    const entries = line
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (entries.length === 0) continue;
    const hasGlob = entries.some((e) => e.includes("*"));
    if (entries.length < 2 && !hasGlob) {
      return {
        error: `${fieldLabel}: a group needs at least two packages (or a * glob) — "${entries[0]}" is alone.`,
      };
    }
    groups.push(entries);
  }
  return { groups };
}

/**
 * Build .changeset/config.json.
 *
 * @param {object} input
 * @param {"default"|"github"|"none"} input.changelogType
 * @param {string} [input.githubRepo]   "org/repo", required for github type.
 * @param {boolean} [input.commit]
 * @param {"restricted"|"public"} [input.access]
 * @param {string} [input.baseBranch]
 * @param {"patch"|"minor"} [input.updateInternalDependencies]
 * @param {string} [input.fixed]   Newline-separated groups, comma-separated members.
 * @param {string} [input.linked]  Same format as fixed.
 * @param {string} [input.ignore]  Newline/comma-separated package names.
 * @param {boolean} [input.versionPrivatePackages] privatePackages.version.
 * @returns {{json: string, config: object, notes: string[]} | {error: string}}
 */
export function buildChangesetsConfig({
  changelogType,
  githubRepo = "",
  commit = false,
  access = "restricted",
  baseBranch = "main",
  updateInternalDependencies = "patch",
  fixed = "",
  linked = "",
  ignore = "",
  versionPrivatePackages = true,
}) {
  if (!CHANGELOG_TYPES.some((t) => t.id === changelogType)) {
    return { error: "Choose a changelog generator." };
  }
  if (!ACCESS_VALUES.includes(access)) {
    return { error: 'access must be "restricted" or "public".' };
  }
  if (!INTERNAL_DEP_BUMPS.includes(updateInternalDependencies)) {
    return { error: 'updateInternalDependencies must be "patch" or "minor".' };
  }
  const branch = String(baseBranch).trim();
  if (!branch) {
    return { error: "Set the base branch changesets diffs against (usually main)." };
  }

  let changelog;
  if (changelogType === "none") {
    changelog = false;
  } else if (changelogType === "github") {
    const repo = String(githubRepo).trim();
    if (!GITHUB_REPO_RE.test(repo)) {
      return { error: 'The GitHub changelog needs the repository as "org/repo" (it links commits and PRs).' };
    }
    changelog = ["@changesets/changelog-github", { repo }];
  } else {
    changelog = "@changesets/cli/changelog";
  }

  const fixedParsed = parseGroups(fixed, "Fixed groups");
  if (fixedParsed.error) return { error: fixedParsed.error };
  const linkedParsed = parseGroups(linked, "Linked groups");
  if (linkedParsed.error) return { error: linkedParsed.error };

  const ignoreList = String(ignore)
    .split(/[\n,]/)
    .map((e) => e.trim())
    .filter(Boolean);

  const overlap = fixedParsed.groups
    .flat()
    .filter((p) => linkedParsed.groups.flat().includes(p) && !p.includes("*"));
  if (overlap.length) {
    return { error: `"${overlap[0]}" cannot be in both fixed and linked groups.` };
  }

  const config = {
    $schema: SCHEMA_URL,
    changelog,
    commit: Boolean(commit),
    fixed: fixedParsed.groups,
    linked: linkedParsed.groups,
    access,
    baseBranch: branch,
    updateInternalDependencies,
    ignore: ignoreList,
  };
  if (!versionPrivatePackages) {
    config.privatePackages = { version: false, tag: false };
  }

  const notes = [];
  if (changelogType === "github") {
    notes.push(
      "Install the generator: npm i -D @changesets/changelog-github. It needs a GITHUB_TOKEN in CI to resolve PR links.",
    );
  }
  if (access === "restricted") {
    notes.push(
      'access "restricted" keeps scoped packages private on npm — switch to "public" to publish open-source scoped packages.',
    );
  }
  if (fixedParsed.groups.length) {
    notes.push("Fixed groups always share one version number, even when only one member changed.");
  }
  if (linkedParsed.groups.length) {
    notes.push("Linked groups get the same bump only when released together; unchanged members are left alone.");
  }
  if (ignoreList.length) {
    notes.push("Ignored packages are never bumped or published; changesets touching them and a published package will error.");
  }

  return {
    json: `${JSON.stringify(config, null, JSON_INDENT)}\n`,
    config,
    notes,
  };
}
