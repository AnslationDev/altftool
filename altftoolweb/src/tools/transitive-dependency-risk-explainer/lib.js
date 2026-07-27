/**
 * Transitive dependency risk model.
 *
 * The dependency graph is modelled as a branching tree that is then collapsed
 * for reuse, because in a real lockfile the same library appears at many
 * points in the tree but is installed once.
 *
 *   raw(d)    = D * b^(d-1)                 packages reachable at depth d
 *   unique(d) = raw(d) * k^(d-1)            after collapsing duplicates
 *   total     = D_direct_included ? sum over d = 1..L of unique(d)
 *
 * where
 *   D = direct dependencies you declared,
 *   b = average dependencies each package declares itself,
 *   k = 1 - sharing, the share of nodes at each new level that turn out to be
 *       packages you do not already have.
 *
 * Every parameter is your assumption, not a measurement: run
 * `npm ls --all`, `pip list`, `go mod graph` or `mvn dependency:tree` to get
 * the real numbers for your project and feed them in.
 *
 * Advisory arrivals are treated as a Poisson process, which is the standard
 * model for independent, rare events over time:
 *   expected advisories per year   = total * r
 *   P(at least one in a year)      = 1 - e^(-total * r)
 * with r the advisories-per-package-per-year rate you supply.
 */

/** Above this the model is no longer describing a real project. */
export const MAX_MODELLED_PACKAGES = 5_000_000;

/** Depth beyond which almost no ecosystem resolves further. */
export const MAX_DEPTH = 15;

/**
 * Reference points for the branching factor, useful as presets.
 * These are typical orders of magnitude, not measurements of your project.
 */
export const ECOSYSTEM_PRESETS = [
  { id: "npm-app", label: "npm application", direct: 25, branching: 2.6, sharing: 55, scriptShare: 8 },
  { id: "npm-lib", label: "npm library", direct: 6, branching: 2.2, sharing: 50, scriptShare: 6 },
  { id: "python", label: "Python service", direct: 20, branching: 1.4, sharing: 45, scriptShare: 4 },
  { id: "go", label: "Go module", direct: 15, branching: 1.2, sharing: 60, scriptShare: 0 },
  { id: "maven", label: "Java / Maven", direct: 30, branching: 1.6, sharing: 55, scriptShare: 0 },
  { id: "rust", label: "Rust crate", direct: 12, branching: 2.0, sharing: 55, scriptShare: 3 },
];

function toNumber(value) {
  if (typeof value === "string" && value.trim() === "") return NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

/**
 * Expand a dependency graph and score the exposure it creates.
 *
 * @param {object} input
 * @param {number} input.directDeps            packages in your manifest
 * @param {number} input.branchingFactor       average deps per package
 * @param {number} input.maxDepth              levels to expand (1 = direct only)
 * @param {number} input.sharingPercent        0-99: share of each level already installed
 * @param {number} input.advisoryRatePerYear   advisories per package per year
 * @param {number} input.installScriptPercent  0-100: packages that run install hooks
 * @param {number} input.reviewMinutes         minutes to review one package
 * @returns {object|{error:string}}
 */
export function modelDependencyRisk(input = {}) {
  const directDeps = toNumber(input.directDeps);
  const branchingFactor = toNumber(input.branchingFactor);
  const maxDepth = toNumber(input.maxDepth);
  const sharingPercent = toNumber(input.sharingPercent);
  const advisoryRatePerYear = toNumber(input.advisoryRatePerYear);
  const installScriptPercent = toNumber(input.installScriptPercent);
  const reviewMinutes = toNumber(input.reviewMinutes);

  const values = [
    directDeps,
    branchingFactor,
    maxDepth,
    sharingPercent,
    advisoryRatePerYear,
    installScriptPercent,
    reviewMinutes,
  ];
  if (values.some((value) => Number.isNaN(value))) {
    return { error: "Enter a number in every field." };
  }
  if (directDeps < 1) return { error: "You need at least one direct dependency to model." };
  if (!Number.isInteger(directDeps)) return { error: "Direct dependencies must be a whole number." };
  if (branchingFactor < 0) return { error: "The branching factor cannot be negative." };
  if (maxDepth < 1 || !Number.isInteger(maxDepth)) {
    return { error: "Depth must be a whole number of at least 1." };
  }
  if (maxDepth > MAX_DEPTH) return { error: `Depth above ${MAX_DEPTH} levels is not realistic in any ecosystem.` };
  if (sharingPercent < 0 || sharingPercent > 99) {
    return { error: "Sharing must be between 0% and 99% — at 100% no new package would ever appear." };
  }
  if (advisoryRatePerYear < 0 || advisoryRatePerYear > 5) {
    return { error: "Advisory rate should be between 0 and 5 advisories per package per year." };
  }
  if (installScriptPercent < 0 || installScriptPercent > 100) {
    return { error: "Install-script share must be between 0% and 100%." };
  }
  if (reviewMinutes < 0) return { error: "Review time cannot be negative." };

  const keepRate = 1 - sharingPercent / 100;

  const levels = [];
  let total = 0;
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const raw = directDeps * branchingFactor ** (depth - 1);
    const unique = raw * keepRate ** (depth - 1);
    if (!Number.isFinite(raw) || total + unique > MAX_MODELLED_PACKAGES) {
      return {
        error: `These assumptions expand past ${MAX_MODELLED_PACKAGES.toLocaleString("en-US")} packages — lower the branching factor or the depth.`,
      };
    }
    total += unique;
    levels.push({
      depth,
      raw: Math.round(raw),
      unique: Math.round(unique),
      cumulative: Math.round(total),
    });
  }

  const totalPackages = Math.round(total);
  const transitivePackages = Math.max(0, totalPackages - directDeps);
  const expansionFactor = totalPackages / directDeps;
  const vettedShare = (directDeps / totalPackages) * 100;

  const expectedAdvisories = totalPackages * advisoryRatePerYear;
  // Poisson: P(N >= 1) = 1 - e^(-lambda)
  const advisoryProbability = (1 - Math.exp(-expectedAdvisories)) * 100;

  const scriptPackages = Math.round((totalPackages * installScriptPercent) / 100);
  const auditHours = (totalPackages * reviewMinutes) / 60;

  // Risk banding is a reading of the numbers above, not an independent metric.
  let band = "Contained";
  let bandNote = "A graph this size can genuinely be reviewed by a small team.";
  if (totalPackages > 200 || expansionFactor > 12) {
    band = "Watch";
    bandNote = "Too large to read end to end — rely on automated advisories and a lock file.";
  }
  if (totalPackages > 800 || expansionFactor > 30 || advisoryProbability > 95) {
    band = "Elevated";
    bandNote = "Assume an advisory lands most months; budget standing time for updates.";
  }
  if (totalPackages > 2500 || expansionFactor > 60) {
    band = "Heavy";
    bandNote = "The graph is the product's largest untested surface — consider removing dependencies.";
  }

  return {
    levels,
    totalPackages,
    transitivePackages,
    expansionFactor,
    vettedShare,
    expectedAdvisories,
    advisoryProbability,
    scriptPackages,
    auditHours,
    band,
    bandNote,
  };
}

/**
 * Practical controls, filtered to the ones this graph actually justifies.
 * @param {object} model result of modelDependencyRisk
 */
export function recommendedControls(model) {
  if (!model || model.error) return [];
  const controls = [
    {
      id: "lockfile",
      title: "Commit the lock file",
      detail: "It is the only record of which transitive versions you actually shipped, and the input every scanner needs.",
      always: true,
    },
    {
      id: "advisories",
      title: "Turn on automated advisory alerts",
      detail: "At this graph size you cannot track upstream releases by hand.",
      when: (m) => m.totalPackages > 60,
    },
    {
      id: "ignore-scripts",
      title: "Disable install scripts in CI",
      detail: "Lifecycle hooks run with your credentials before any code review happens.",
      when: (m) => m.scriptPackages > 0,
    },
    {
      id: "pin-registry",
      title: "Pin the registry and use a proxy or mirror",
      detail: "It gives you one chokepoint for blocking a compromised release and keeps builds working if upstream disappears.",
      when: (m) => m.totalPackages > 200,
    },
    {
      id: "budget",
      title: "Give updates a standing time budget",
      detail: "Advisory volume at this size makes patching a recurring cost, not an interrupt.",
      when: (m) => m.expectedAdvisories >= 3,
    },
    {
      id: "prune",
      title: "Prune single-function dependencies",
      detail: "Removing one direct package removes its whole subtree, which is where the leverage is.",
      when: (m) => m.expansionFactor > 15,
    },
    {
      id: "provenance",
      title: "Require signed or attested builds",
      detail: "Provenance checks are the practical answer once the graph is too big to read.",
      when: (m) => m.totalPackages > 800,
    },
  ];

  return controls
    .filter((control) => control.always || control.when(model))
    .map(({ id, title, detail }) => ({ id, title, detail }));
}
