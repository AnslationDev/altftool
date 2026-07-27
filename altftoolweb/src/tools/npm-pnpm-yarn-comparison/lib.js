/**
 * npm vs pnpm vs Yarn — factual comparison data plus a weighted recommender.
 *
 * Facts below come from each manager's own documentation:
 *  - npm docs (docs.npmjs.com): flat hoisted node_modules since npm 3,
 *    package-lock.json, workspaces since npm 7, bundled with Node.js.
 *  - pnpm docs (pnpm.io): content-addressable global store with hard links,
 *    symlinked strict node_modules, pnpm-lock.yaml, pnpm-workspace.yaml.
 *  - Yarn docs (yarnpkg.com): yarn.lock, Plug'n'Play or node_modules linker,
 *    workspaces, distributed/enabled via Corepack.
 *
 * Relative speed/disk scores are qualitative rankings (1-5) that reflect the
 * mechanisms (hard links vs copying, cold vs warm cache) rather than any single
 * benchmark number — real timings vary by project and cache state.
 *
 * Pure module — no React, no DOM.
 */

export const MANAGERS = [
  {
    id: "npm",
    name: "npm",
    lockfile: "package-lock.json",
    installStrategy: "Copies every package into a flat, hoisted node_modules (npm 3+).",
    diskStrategy: "Full copy per project; global cache (~/.npm) only stores compressed tarballs.",
    workspaces: "Built-in workspaces since npm 7 (workspaces field in package.json).",
    strictness: "Hoisting exposes phantom dependencies — you can import packages you never declared.",
    distribution: "Ships with Node.js itself — zero setup.",
    monorepoTooling: "Basic: --workspace / --workspaces flags; no built-in task orchestration or filtering.",
    patching: "No built-in patching (community: patch-package).",
  },
  {
    id: "pnpm",
    name: "pnpm",
    lockfile: "pnpm-lock.yaml",
    installStrategy: "Hard-links files from a content-addressable global store; node_modules is a symlink tree.",
    diskStrategy: "Each file version stored ONCE on disk for all projects — the headline disk saving.",
    workspaces: "pnpm-workspace.yaml with powerful --filter selectors and catalogs.",
    strictness: "Strict by default: only declared dependencies are resolvable — phantom deps fail.",
    distribution: "Install via Corepack, npm, or standalone script.",
    monorepoTooling: "Strong: --filter by package, directory or git diff; topological run ordering.",
    patching: "Built-in pnpm patch / patchedDependencies.",
  },
  {
    id: "yarn",
    name: "Yarn (Berry)",
    lockfile: "yarn.lock",
    installStrategy: "Plug'n'Play by default (.pnp.cjs, zipped packages, no node_modules); node_modules linker optional.",
    diskStrategy: "PnP keeps packages as zips in .yarn/cache — compact, and committable for zero-install.",
    workspaces: "Mature workspaces plus constraints engine and release workflow (version plugin).",
    strictness: "PnP is the strictest model — every dependency edge is checked at resolution time.",
    distribution: "Enabled via Corepack (yarn set version); Yarn 1 'Classic' is in maintenance mode.",
    monorepoTooling: "Strong: workspaces foreach, constraints, focused installs.",
    patching: "Built-in yarn patch.",
  },
];

/** Command equivalents across the three managers (each manager's CLI docs). */
export const COMMAND_MAP = [
  { action: "Install everything", npm: "npm install", pnpm: "pnpm install", yarn: "yarn install" },
  { action: "Add a dependency", npm: "npm i lodash", pnpm: "pnpm add lodash", yarn: "yarn add lodash" },
  { action: "Add a dev dependency", npm: "npm i -D vitest", pnpm: "pnpm add -D vitest", yarn: "yarn add -D vitest" },
  { action: "Remove", npm: "npm uninstall lodash", pnpm: "pnpm remove lodash", yarn: "yarn remove lodash" },
  { action: "Run a script", npm: "npm run build", pnpm: "pnpm build", yarn: "yarn build" },
  { action: "One-off binary", npm: "npx create-vite", pnpm: "pnpm dlx create-vite", yarn: "yarn dlx create-vite" },
  { action: "Update deps", npm: "npm update", pnpm: "pnpm update", yarn: "yarn up" },
  { action: "Why is X installed?", npm: "npm explain x", pnpm: "pnpm why x", yarn: "yarn why x" },
  { action: "CI clean install", npm: "npm ci", pnpm: "pnpm install --frozen-lockfile", yarn: "yarn install --immutable" },
];

/**
 * Qualitative 1-5 scores per criterion, justified by mechanism:
 *  - diskUsage: pnpm 5 (single store, hard links), yarn 4 (zip cache), npm 2 (full copies).
 *  - installSpeed: pnpm 5 (linking beats copying on warm store), yarn 4, npm 3.
 *  - compatibility: npm 5 (the default every tool tests against), pnpm 4 (symlinks
 *    occasionally trip tools), yarn 3 (PnP requires tool support or the nm linker).
 *  - monorepo: pnpm 5, yarn 5, npm 3 (no filtering/orchestration).
 *  - strictness: yarn 5 (PnP), pnpm 5 (symlink isolation), npm 2 (hoisting).
 *  - zeroSetup: npm 5 (bundled with Node), pnpm 3, yarn 3 (both need Corepack/install).
 */
export const CRITERIA = [
  { id: "diskUsage", label: "Disk usage matters (many projects, small SSD, CI cache)" },
  { id: "installSpeed", label: "Install speed matters (large dependency tree, frequent CI installs)" },
  { id: "compatibility", label: "Maximum ecosystem compatibility / least surprise" },
  { id: "monorepo", label: "Monorepo with many workspace packages" },
  { id: "strictness", label: "Catch phantom dependencies (library development)" },
  { id: "zeroSetup", label: "Zero setup for contributors (nothing beyond Node.js)" },
];

export const SCORES = {
  npm: { diskUsage: 2, installSpeed: 3, compatibility: 5, monorepo: 3, strictness: 2, zeroSetup: 5 },
  pnpm: { diskUsage: 5, installSpeed: 5, compatibility: 4, monorepo: 5, strictness: 5, zeroSetup: 3 },
  yarn: { diskUsage: 4, installSpeed: 4, compatibility: 3, monorepo: 5, strictness: 5, zeroSetup: 3 },
};

/**
 * Rank the managers for the selected criteria (unweighted sum of 1-5 scores;
 * with no criteria selected, all six count equally).
 * @returns {{ranking:[{id,name,score,maxScore,reasons:string[]}], criteriaUsed:string[]}} or {error}
 */
export function recommendManager({ selectedCriteria = [] } = {}) {
  const valid = new Set(CRITERIA.map((c) => c.id));
  for (const id of selectedCriteria) {
    if (!valid.has(id)) return { error: `Unknown criterion "${id}".` };
  }
  const used = selectedCriteria.length > 0 ? [...new Set(selectedCriteria)] : CRITERIA.map((c) => c.id);

  const reasonText = {
    diskUsage: {
      npm: "full copy of every package per project",
      pnpm: "one content-addressable store shared by all projects via hard links",
      yarn: "compressed zip cache, no unpacked node_modules under PnP",
    },
    installSpeed: {
      npm: "copies files on every install",
      pnpm: "links from the store instead of copying once the store is warm",
      yarn: "zip cache avoids much file I/O",
    },
    compatibility: {
      npm: "the default manager every tool is tested against",
      pnpm: "symlinked layout works with almost everything; rare tools mishandle symlinks",
      yarn: "PnP needs explicit tool support; the node_modules linker restores compatibility",
    },
    monorepo: {
      npm: "workspaces exist but lack filtering and task orchestration",
      pnpm: "--filter selectors, topological runs, catalogs",
      yarn: "workspaces foreach plus a constraints engine",
    },
    strictness: {
      npm: "hoisting lets undeclared (phantom) imports work until they break",
      pnpm: "only declared deps are resolvable from a package",
      yarn: "PnP validates every dependency edge at resolution",
    },
    zeroSetup: {
      npm: "bundled with every Node.js install",
      pnpm: "needs Corepack enable or a separate install",
      yarn: "needs Corepack enable or a separate install",
    },
  };

  const ranking = MANAGERS.map((manager) => {
    const score = used.reduce((sum, criterion) => sum + SCORES[manager.id][criterion], 0);
    return {
      id: manager.id,
      name: manager.name,
      score,
      maxScore: used.length * 5,
      reasons: used.map((criterion) => `${manager.name}: ${reasonText[criterion][manager.id]}.`),
    };
  }).sort((a, b) => b.score - a.score);

  return { ranking, criteriaUsed: used };
}
