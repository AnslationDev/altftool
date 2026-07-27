/**
 * Husky v9 + lint-staged setup generator.
 *
 * Rules encoded here come from the official docs:
 * - Husky v9 getting-started (typicode.github.io/husky): `husky init` creates
 *   `.husky/pre-commit` and adds a `"prepare": "husky"` script. Since v9 hook
 *   files are plain shell snippets — the old `#!/usr/bin/env sh` +
 *   `. "$(dirname -- "$0")/_/husky.sh"` boilerplate is no longer needed and is
 *   deprecated (it fails in v10).
 * - lint-staged README (github.com/lint-staged/lint-staged): configuration is a
 *   `"lint-staged"` object in package.json mapping glob patterns to commands.
 * - commitlint docs (commitlint.js.org): the commit-msg hook runs
 *   `commitlint --edit "$1"` (Husky passes the commit-message file path as $1
 *   via the standard git commit-msg hook contract).
 */

/** Per-package-manager commands, from each tool's install docs. */
export const PACKAGE_MANAGERS = [
  {
    id: "npm",
    label: "npm",
    installDev: (pkgs) => `npm install --save-dev ${pkgs.join(" ")}`,
    init: "npx husky init",
    exec: (cmd) => `npx ${cmd}`,
    // commitlint docs recommend `--no` so npx never installs on the fly inside a hook.
    execNoInstall: (cmd) => `npx --no -- ${cmd}`,
  },
  {
    id: "pnpm",
    label: "pnpm",
    installDev: (pkgs) => `pnpm add --save-dev ${pkgs.join(" ")}`,
    init: "pnpm exec husky init",
    exec: (cmd) => `pnpm exec ${cmd}`,
    execNoInstall: (cmd) => `pnpm exec ${cmd}`,
  },
  {
    id: "yarn",
    label: "Yarn",
    installDev: (pkgs) => `yarn add --dev ${pkgs.join(" ")}`,
    // Husky docs: yarn does not support prepare the same way; `yarn husky init` works for v1/berry with node-modules linker.
    init: "yarn husky init",
    exec: (cmd) => `yarn ${cmd}`,
    execNoInstall: (cmd) => `yarn ${cmd}`,
  },
  {
    id: "bun",
    label: "Bun",
    installDev: (pkgs) => `bun add --dev ${pkgs.join(" ")}`,
    init: "bunx husky init",
    exec: (cmd) => `bunx ${cmd}`,
    execNoInstall: (cmd) => `bunx ${cmd}`,
  },
];

/** Default lint-staged rows — the two examples from the lint-staged README. */
export const DEFAULT_LINT_STAGED_ROWS = [
  { pattern: "*.{js,jsx,ts,tsx}", command: "eslint --fix" },
  { pattern: "*.{css,md,json}", command: "prettier --write" },
];

/** Packages needed by the commit-msg hook, per commitlint's local-setup guide. */
export const COMMITLINT_PACKAGES = ["@commitlint/cli", "@commitlint/config-conventional"];

/**
 * Build the full setup: install commands, hook files, package.json snippet.
 *
 * @param {object} input
 * @param {string}  input.packageManagerId  One of PACKAGE_MANAGERS ids.
 * @param {boolean} input.preCommit         Add a pre-commit hook running lint-staged.
 * @param {boolean} input.commitMsg         Add a commit-msg hook running commitlint.
 * @param {boolean} input.prePush           Add a pre-push hook.
 * @param {string}  input.prePushCommand    Command the pre-push hook runs.
 * @param {Array<{pattern:string,command:string}>} input.lintStagedRows
 * @returns {object} { installCommands, files, packageJsonSnippet, hookCount } or { error }.
 */
export function generateHuskySetup({
  packageManagerId,
  preCommit = true,
  commitMsg = false,
  prePush = false,
  prePushCommand = "",
  lintStagedRows = [],
}) {
  const pm = PACKAGE_MANAGERS.find((p) => p.id === packageManagerId);
  if (!pm) return { error: "Choose a package manager." };

  if (!preCommit && !commitMsg && !prePush) {
    return { error: "Select at least one hook to generate." };
  }

  const rows = lintStagedRows
    .map((row) => ({
      pattern: String(row.pattern || "").trim(),
      command: String(row.command || "").trim(),
    }))
    .filter((row) => row.pattern !== "" || row.command !== "");

  if (preCommit) {
    if (rows.length === 0) {
      return { error: "Add at least one lint-staged pattern for the pre-commit hook." };
    }
    const bad = rows.find((row) => row.pattern === "" || row.command === "");
    if (bad) {
      return { error: "Every lint-staged row needs both a glob pattern and a command." };
    }
  }

  if (prePush && String(prePushCommand).trim() === "") {
    return { error: "Enter the command the pre-push hook should run (for example: npm test)." };
  }

  const packages = ["husky"];
  if (preCommit) packages.push("lint-staged");
  if (commitMsg) packages.push(...COMMITLINT_PACKAGES);

  const installCommands = [
    { label: "Install dev dependencies", command: pm.installDev(packages) },
    { label: "Initialise Husky (creates .husky/ and the prepare script)", command: pm.init },
  ];

  const files = [];

  if (preCommit) {
    files.push({ path: ".husky/pre-commit", content: `${pm.exec("lint-staged")}\n` });
  }
  if (commitMsg) {
    files.push({
      path: ".husky/commit-msg",
      content: `${pm.execNoInstall('commitlint --edit "$1"')}\n`,
    });
    files.push({
      path: "commitlint.config.js",
      content: `export default { extends: ["@commitlint/config-conventional"] };\n`,
    });
  }
  if (prePush) {
    files.push({ path: ".husky/pre-push", content: `${String(prePushCommand).trim()}\n` });
  }

  const packageJson = { scripts: { prepare: "husky" } };
  if (preCommit) {
    packageJson["lint-staged"] = Object.fromEntries(rows.map((r) => [r.pattern, r.command]));
  }
  const packageJsonSnippet = JSON.stringify(packageJson, null, 2);

  const hookCount = [preCommit, commitMsg, prePush].filter(Boolean).length;

  return {
    installCommands,
    files,
    packageJsonSnippet,
    hookCount,
    packages,
    notes: [
      'The "prepare": "husky" script installs the hooks for everyone who runs an install — commit it to the repository.',
      "Husky v9 hook files are plain shell lines; do not add the deprecated husky.sh sourcing boilerplate.",
      "Skip all hooks for one command with HUSKY=0, e.g. HUSKY=0 git commit.",
    ],
  };
}
