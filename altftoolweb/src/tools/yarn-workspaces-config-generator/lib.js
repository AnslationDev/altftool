/**
 * Yarn workspaces configuration generator.
 *
 * Rules encoded from the Yarn documentation:
 *  - Yarn 1 (Classic, classic.yarnpkg.com): the root package.json must set
 *    "private": true and a "workspaces" field — either an array of globs or the
 *    object form { packages: [...], nohoist: [...] }. nohoist patterns (e.g.
 *    "**\/react-native") exist ONLY in Yarn 1.
 *  - Yarn Berry (2+, yarnpkg.com): "workspaces" stays in package.json; hoisting
 *    is controlled in .yarnrc.yml via nodeLinker (pnp | pnpm | node-modules)
 *    and nmHoistingLimits (workspaces | dependencies | none, node-modules
 *    linker only). nohoist is not supported in Berry.
 *  - Constraints: Yarn 4 uses a JavaScript yarn.config.cjs with a
 *    constraints({Yarn}) hook (Yarn 2/3 used Prolog constraints.pro).
 */

export const YARN_VERSIONS = [
  { id: "classic", label: "Yarn 1 (Classic)" },
  { id: "berry", label: "Yarn Berry (2+ / 4.x)" },
];

/** nodeLinker values accepted by .yarnrc.yml (Yarn Berry configuration docs). */
export const NODE_LINKERS = [
  { id: "node-modules", label: "node-modules (npm-style layout)" },
  { id: "pnp", label: "pnp (Plug'n'Play, zero-install capable)" },
  { id: "pnpm", label: "pnpm (content-addressed store)" },
];

/** nmHoistingLimits values — only meaningful with the node-modules linker. */
export const HOISTING_LIMITS = [
  { id: "none", label: "none (hoist to the root — default)" },
  { id: "workspaces", label: "workspaces (never hoist past a workspace)" },
  { id: "dependencies", label: "dependencies (keep deps with their package)" },
];

const JSON_INDENT = 2;

function toLines(value) {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Build the Yarn workspaces file set.
 *
 * @param {object} input
 * @param {"classic"|"berry"} input.yarnVersion
 * @param {string} input.globs          Newline-separated workspace globs.
 * @param {string} [input.nohoist]      Newline-separated nohoist patterns (classic only).
 * @param {string} [input.nodeLinker]   Berry: one of NODE_LINKERS ids.
 * @param {string} [input.hoistingLimit] Berry: one of HOISTING_LIMITS ids.
 * @param {boolean} [input.includeConstraints] Berry: emit yarn.config.cjs.
 * @param {string} [input.rootName]     Root package name.
 * @returns {{files: Array<{path: string, content: string}>, workspaceCount: number, notes: string[]} | {error: string}}
 */
export function buildYarnWorkspacesConfig({
  yarnVersion,
  globs,
  nohoist = "",
  nodeLinker = "node-modules",
  hoistingLimit = "none",
  includeConstraints = false,
  rootName = "my-monorepo",
}) {
  if (!YARN_VERSIONS.some((v) => v.id === yarnVersion)) {
    return { error: "Choose Yarn 1 (Classic) or Yarn Berry." };
  }
  const globList = toLines(globs);
  if (globList.length === 0) {
    return { error: "Add at least one workspace glob such as packages/*." };
  }
  const nohoistList = toLines(nohoist);
  const name = String(rootName).trim() || "my-monorepo";

  const notes = [];
  const files = [];

  if (yarnVersion === "classic") {
    // Yarn 1: array form unless nohoist patterns force the object form.
    const workspaces =
      nohoistList.length > 0
        ? { packages: globList, nohoist: nohoistList }
        : globList;
    const pkg = {
      name,
      private: true, // Yarn refuses workspaces in a non-private root package.
      workspaces,
    };
    files.push({
      path: "package.json",
      content: `${JSON.stringify(pkg, null, JSON_INDENT)}\n`,
    });
    notes.push(
      'Yarn 1 requires "private": true on the workspace root.',
      nohoistList.length > 0
        ? "nohoist uses the object form of the workspaces field — patterns are globs against the dependency path, e.g. **/react-native/**."
        : "No nohoist patterns, so the simple array form is used.",
    );
  } else {
    if (nohoistList.length > 0) {
      return {
        error:
          "nohoist is a Yarn 1 feature. On Yarn Berry use the node-modules linker with nmHoistingLimits instead.",
      };
    }
    if (!NODE_LINKERS.some((l) => l.id === nodeLinker)) {
      return { error: "Choose a valid nodeLinker: node-modules, pnp or pnpm." };
    }
    if (!HOISTING_LIMITS.some((h) => h.id === hoistingLimit)) {
      return { error: "Choose a valid nmHoistingLimits value: none, workspaces or dependencies." };
    }

    const pkg = {
      name,
      private: true,
      workspaces: globList,
      packageManager: "yarn@4.5.0", // corepack pin; update to your Yarn release
    };
    files.push({
      path: "package.json",
      content: `${JSON.stringify(pkg, null, JSON_INDENT)}\n`,
    });

    const rcLines = [`nodeLinker: ${nodeLinker}`];
    if (nodeLinker === "node-modules" && hoistingLimit !== "none") {
      rcLines.push(`nmHoistingLimits: ${hoistingLimit}`);
    }
    if (includeConstraints) {
      rcLines.push("enableConstraintsChecks: true");
    }
    files.push({ path: ".yarnrc.yml", content: `${rcLines.join("\n")}\n` });

    if (nodeLinker !== "node-modules" && hoistingLimit !== "none") {
      notes.push(
        `nmHoistingLimits only applies to the node-modules linker, so it was omitted for nodeLinker: ${nodeLinker}.`,
      );
    }
    notes.push(
      "packageManager pins the Yarn release via Corepack — adjust the version to your current Yarn 4.x.",
    );

    if (includeConstraints) {
      files.push({
        path: "yarn.config.cjs",
        content: `// Yarn 4 constraints — run with \`yarn constraints\` (add --fix to apply).
// Enforces that every workspace depends on the same version of a dependency.
module.exports = {
  async constraints({ Yarn }) {
    const seen = new Map();
    for (const dep of Yarn.dependencies()) {
      if (dep.type === "peerDependencies") continue;
      const existing = seen.get(dep.ident);
      if (existing === undefined) {
        seen.set(dep.ident, dep.range);
      } else if (existing !== dep.range) {
        dep.update(existing);
      }
    }
  },
};
`,
      });
      notes.push(
        "Constraints are a Yarn 4 feature (yarn.config.cjs); Yarn 2/3 used Prolog constraints.pro instead.",
      );
    }
  }

  return { files, workspaceCount: globList.length, notes };
}
