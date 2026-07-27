/**
 * Submodule vs subtree vs package-dependency chooser.
 *
 * Trait facts encoded here come from the tools' own documentation:
 * - git submodules (git-scm.com/book, "Git Tools - Submodules"): the parent
 *   repo records an exact commit pointer; clones need `--recurse-submodules`
 *   (or `git submodule update --init`) or the directory is empty; every
 *   consumer needs submodule-aware workflows.
 * - git subtree (contrib/subtree in git; `git subtree add/pull/push`): the
 *   shared history is copied into the parent repo, so plain `git clone` just
 *   works and no extra tooling is needed by consumers; pushing changes back
 *   upstream is possible but slower (`git subtree push` re-splits history).
 * - Package dependency (npm/pip/maven-style): shared code is versioned and
 *   published to a registry; consumers upgrade explicitly via semver ranges —
 *   the standard recommendation once code is a stable library.
 *
 * Scoring is a transparent weighted-trait model; weights are heuristics
 * encoding that guidance, not measurements.
 */

export const WEIGHT_STRONG = 3;
export const WEIGHT_MEDIUM = 2;
export const WEIGHT_WEAK = 1;

export const EXPERTISE_LEVELS = [
  { id: "low", label: "Low — many contributors are new to git" },
  { id: "medium", label: "Medium — comfortable with branches and rebases" },
  { id: "high", label: "High — the team can debug detached HEADs happily" },
];

export const CHANGE_RATES = [
  { id: "rare", label: "Rarely — the shared code is stable" },
  { id: "monthly", label: "Sometimes — a few changes a month" },
  { id: "weekly", label: "Often — changes weekly or faster" },
];

export const OPTIONS = [
  {
    id: "package",
    name: "Package dependency (registry)",
    summary:
      "Publish the shared code as a versioned package (npm, PyPI, Maven, crates.io or a private registry); consumers upgrade via semver.",
  },
  {
    id: "submodule",
    name: "git submodule",
    summary:
      "The parent repo stores a pointer to an exact commit of the shared repo; contents live in a nested checkout.",
  },
  {
    id: "subtree",
    name: "git subtree",
    summary:
      "The shared repo's files (and optionally history) are merged into a subdirectory; plain clones just work.",
  },
];

/**
 * Score the three sharing mechanisms.
 *
 * @param {object} input
 * @param {boolean} input.hasRegistry     A package registry (public or private) is available.
 * @param {string}  input.changeRate      One of CHANGE_RATES ids.
 * @param {boolean} input.editInConsumer  Consumers need to edit the shared code and push changes back.
 * @param {string}  input.expertise       One of EXPERTISE_LEVELS ids.
 * @param {number}  input.consumerCount   How many repos consume the shared code.
 * @param {boolean} input.needExactPin    Consumers must pin an exact commit (not a version range).
 * @returns {object} { ranking, best, maxScore } or { error }.
 */
export function chooseSharingStrategy({
  hasRegistry,
  changeRate,
  editInConsumer,
  expertise,
  consumerCount,
  needExactPin,
}) {
  if (!CHANGE_RATES.some((c) => c.id === changeRate)) {
    return { error: "Choose how often the shared code changes." };
  }
  if (!EXPERTISE_LEVELS.some((e) => e.id === expertise)) {
    return { error: "Choose your team's git expertise." };
  }
  const consumers = Number(consumerCount);
  if (!Number.isFinite(consumers) || !Number.isInteger(consumers) || consumers < 1) {
    return { error: "Number of consuming repositories must be a whole number of at least 1." };
  }

  const scores = { package: 0, submodule: 0, subtree: 0 };
  const reasons = { package: [], submodule: [], subtree: [] };
  const cautions = { package: [], submodule: [], subtree: [] };
  let maxScore = 0;

  const add = (id, w, why) => {
    scores[id] += w;
    reasons[id].push(why);
  };
  const warn = (id, why) => cautions[id].push(why);

  // --- Registry availability ----------------------------------------------
  maxScore += WEIGHT_STRONG;
  if (hasRegistry) {
    add("package", WEIGHT_STRONG, "A registry exists, so versioned publishing — the standard library workflow — is available.");
  } else {
    add("submodule", WEIGHT_WEAK, "No registry needed — the pointer references the git repo directly.");
    add("subtree", WEIGHT_WEAK, "No registry needed — content is vendored into the consumer repo.");
    warn("package", "Without a registry you would need to set one up (or use git URLs, losing semver discipline).");
  }

  // --- Change rate ----------------------------------------------------------
  maxScore += WEIGHT_MEDIUM;
  if (changeRate === "rare") {
    add("package", WEIGHT_MEDIUM, "Stable code suits published versions; consumers upgrade a pinned version occasionally.");
    add("subtree", WEIGHT_WEAK, "Rare updates mean rare subtree pulls — the vendored copy stays fresh with little effort.");
  } else if (changeRate === "monthly") {
    add("package", WEIGHT_WEAK, "A monthly release train is easy to maintain.");
    add("submodule", WEIGHT_WEAK, "Bumping the submodule pointer per change is a routine PR.");
    add("subtree", WEIGHT_WEAK, "Monthly `git subtree pull` keeps the copy current.");
  } else {
    add("submodule", WEIGHT_MEDIUM, "Fast-moving shared code favours tracking a branch tip and bumping pointers, not publishing a release per change.");
    warn("package", "Publishing a new version for every change adds release overhead at weekly-or-faster cadence.");
    warn("subtree", "Frequent subtree pulls create repeated merge commits in every consumer.");
  }

  // --- Editing shared code from inside consumers ---------------------------
  maxScore += WEIGHT_STRONG;
  if (editInConsumer) {
    add("subtree", WEIGHT_STRONG, "Subtree lets you edit the vendored code in place and `git subtree push` the changes back upstream.");
    add("submodule", WEIGHT_MEDIUM, "You can commit inside the submodule checkout and push to the shared repo directly.");
    warn("package", "Editing a published package from a consumer means a clone-edit-publish-upgrade round trip (or fragile link/workspace setups).");
  } else {
    add("package", WEIGHT_MEDIUM, "Consumers only ever consume — exactly the published-library model.");
  }

  // --- Git expertise --------------------------------------------------------
  maxScore += WEIGHT_MEDIUM;
  if (expertise === "low") {
    add("subtree", WEIGHT_MEDIUM, "Consumers of a subtree need no special commands — plain clone, pull and push all work.");
    add("package", WEIGHT_MEDIUM, "Installing a package is the workflow every developer already knows.");
    warn("submodule", "Pro Git itself warns submodules bite newcomers: forgetting --recurse-submodules leaves empty directories, and pointer updates confuse.");
  } else if (expertise === "medium") {
    add("subtree", WEIGHT_WEAK, "Only the person syncing needs to know the subtree commands.");
    add("package", WEIGHT_WEAK, "Standard tooling, no learning curve.");
    add("submodule", WEIGHT_WEAK, "Workable when the team knows to init and update submodules.");
  } else {
    add("submodule", WEIGHT_MEDIUM, "An expert team can exploit exact-commit pointers without tripping on the workflow.");
  }

  // --- Exact pinning --------------------------------------------------------
  maxScore += WEIGHT_MEDIUM;
  if (needExactPin) {
    add("submodule", WEIGHT_MEDIUM, "A submodule *is* an exact commit pin, recorded in the parent's tree.");
    add("package", WEIGHT_WEAK, "Lockfiles pin exact published versions, though only of released snapshots.");
  } else {
    add("package", WEIGHT_WEAK, "Semver ranges let consumers pick up fixes without a pointer bump.");
  }

  // --- Number of consumers --------------------------------------------------
  maxScore += WEIGHT_MEDIUM;
  if (consumers >= 5) {
    add("package", WEIGHT_MEDIUM, `With ${consumers} consumers, one published version beats ${consumers} vendored copies or pointers to keep in sync.`);
    warn("subtree", "Every consumer holds a full copy — divergence across many repos is hard to audit.");
  } else if (consumers >= 2) {
    add("package", WEIGHT_WEAK, "Several consumers still benefit from a single versioned source of truth.");
    add("submodule", WEIGHT_WEAK, "A handful of pointer bumps per release is manageable.");
  } else {
    add("subtree", WEIGHT_MEDIUM, "With one consumer, vendoring is the simplest thing that works.");
  }

  const ranking = OPTIONS.map((o) => ({
    ...o,
    score: scores[o.id],
    reasons: reasons[o.id],
    cautions: cautions[o.id],
  })).sort((a, b) => b.score - a.score);

  return { ranking, best: ranking[0], maxScore };
}
