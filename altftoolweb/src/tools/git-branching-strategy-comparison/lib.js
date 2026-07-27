/**
 * Git branching strategy comparison.
 *
 * The strategies and the traits scored here come from their canonical sources:
 * - Git flow: Vincent Driessen, "A successful Git branching model" (nvie.com,
 *   2010) — plus his 2020 "note of reflection" advising against it for web apps
 *   that are continuously delivered, and for versioned/multi-release software.
 * - GitHub flow: GitHub's docs — one main branch, short-lived feature branches,
 *   deploy after (or before) merge; designed for continuous deployment.
 * - Trunk-based development: trunkbaseddevelopment.com — everyone commits to
 *   one trunk in small batches; requires strong CI and feature flags; the model
 *   correlated with elite delivery performance in the DORA/Accelerate research.
 * - Release branching (GitLab flow style): GitLab docs — cut a release branch
 *   per version from main, cherry-pick fixes back; for software that must
 *   maintain several released versions at once.
 *
 * Scoring is a transparent weighted-trait model: each answer adds the weights
 * below to the strategies it favours. Weights are heuristics encoded from the
 * guidance in those sources, not measurements.
 */

/** A strongly favouring signal. */
export const WEIGHT_STRONG = 3;
/** A moderately favouring signal. */
export const WEIGHT_MEDIUM = 2;
/** A weakly favouring signal. */
export const WEIGHT_WEAK = 1;

export const TEAM_SIZES = [
  { id: "solo", label: "1-3 people" },
  { id: "small", label: "4-10 people" },
  { id: "medium", label: "11-30 people" },
  { id: "large", label: "30+ people" },
];

export const RELEASE_CADENCES = [
  { id: "continuous", label: "Continuously — every merge can deploy" },
  { id: "weekly", label: "About weekly" },
  { id: "scheduled", label: "Scheduled — every few weeks or months" },
];

export const CI_LEVELS = [
  { id: "none", label: "Little or none — mostly manual testing" },
  { id: "basic", label: "Basic — CI runs tests on pull requests" },
  { id: "strong", label: "Strong — fast suite, feature flags, automated deploy" },
];

export const STRATEGIES = [
  {
    id: "trunk",
    name: "Trunk-based development",
    summary:
      "Everyone merges small changes into one trunk at least daily; releases cut straight from trunk, risky work hidden behind feature flags.",
  },
  {
    id: "github-flow",
    name: "GitHub flow",
    summary:
      "One long-lived main branch; short-lived feature branches merged via pull request and deployed immediately.",
  },
  {
    id: "release-branch",
    name: "Release branching (GitLab flow)",
    summary:
      "Main plus a branch per release or environment; fixes land on main and are cherry-picked into the releases that need them.",
  },
  {
    id: "git-flow",
    name: "Git flow",
    summary:
      "Long-lived develop and main branches with feature, release and hotfix branches — a heavyweight model for versioned, scheduled releases.",
  },
];

/**
 * Score all four strategies for a team profile.
 *
 * @param {object} input
 * @param {string}  input.teamSize       One of TEAM_SIZES ids.
 * @param {string}  input.releaseCadence One of RELEASE_CADENCES ids.
 * @param {string}  input.ciLevel        One of CI_LEVELS ids.
 * @param {boolean} input.multiVersion   Must support several released versions in parallel.
 * @param {boolean} input.regulated      Formal sign-off / QA gate before any release.
 * @returns {object} { ranking:[{id,name,summary,score,reasons,cautions}], maxScore } or { error }.
 */
export function compareStrategies({ teamSize, releaseCadence, ciLevel, multiVersion, regulated }) {
  if (!TEAM_SIZES.some((t) => t.id === teamSize)) return { error: "Choose your team size." };
  if (!RELEASE_CADENCES.some((c) => c.id === releaseCadence)) {
    return { error: "Choose how often you release." };
  }
  if (!CI_LEVELS.some((c) => c.id === ciLevel)) {
    return { error: "Choose your CI/automation maturity." };
  }

  // score map + per-strategy explanations
  const scores = Object.fromEntries(STRATEGIES.map((s) => [s.id, 0]));
  const reasons = Object.fromEntries(STRATEGIES.map((s) => [s.id, []]));
  const cautions = Object.fromEntries(STRATEGIES.map((s) => [s.id, []]));
  let awarded = 0;

  const add = (id, weight, why) => {
    scores[id] += weight;
    reasons[id].push(why);
  };
  const warn = (id, why) => cautions[id].push(why);

  // --- Release cadence -----------------------------------------------------
  awarded += WEIGHT_STRONG;
  if (releaseCadence === "continuous") {
    add("trunk", WEIGHT_STRONG, "Continuous deployment is the environment trunk-based development is built for.");
    add("github-flow", WEIGHT_STRONG, "GitHub flow was designed around deploying every merged pull request.");
    warn("git-flow", "Driessen's own 2020 note says git flow is a poor fit for continuously delivered web apps.");
  } else if (releaseCadence === "weekly") {
    add("github-flow", WEIGHT_MEDIUM, "Weekly releases still suit short-lived branches off one main branch.");
    add("trunk", WEIGHT_MEDIUM, "Trunk with lightweight release tags handles a weekly train well.");
    add("release-branch", WEIGHT_WEAK, "A short-lived release branch can stabilise each weekly cut.");
  } else {
    add("git-flow", WEIGHT_STRONG, "Scheduled, versioned releases are the case git flow was designed for.");
    add("release-branch", WEIGHT_MEDIUM, "A release branch per cut gives a place to stabilise between scheduled releases.");
  }

  // --- Multiple maintained versions ---------------------------------------
  awarded += WEIGHT_STRONG;
  if (multiVersion) {
    add("release-branch", WEIGHT_STRONG, "Per-version branches with cherry-picked fixes are exactly the multi-version pattern.");
    add("git-flow", WEIGHT_MEDIUM, "Release and hotfix branches give each shipped version a maintenance line.");
    warn("github-flow", "GitHub flow assumes a single deployed version — it has no story for maintaining v1 and v2 in parallel.");
    warn("trunk", "Supporting old versions from trunk needs disciplined release branches anyway.");
  } else {
    add("github-flow", WEIGHT_MEDIUM, "With a single live version there is no need for parallel release lines.");
    add("trunk", WEIGHT_MEDIUM, "One deployable trunk is sufficient when only the latest version is supported.");
    warn("git-flow", "develop + release + hotfix branches add ceremony you do not need for a single live version.");
  }

  // --- CI maturity ---------------------------------------------------------
  awarded += WEIGHT_STRONG;
  if (ciLevel === "strong") {
    add("trunk", WEIGHT_STRONG, "Strong CI and feature flags are the stated prerequisites on trunkbaseddevelopment.com.");
    add("github-flow", WEIGHT_MEDIUM, "Automated deploys make merge-then-deploy safe.");
  } else if (ciLevel === "basic") {
    add("github-flow", WEIGHT_MEDIUM, "PR-level CI is enough to gate merges to main.");
    add("release-branch", WEIGHT_WEAK, "Release branches give extra stabilisation time when automation is partial.");
    warn("trunk", "Trunk-based development without fast, trustworthy CI puts broken code in everyone's way.");
  } else {
    add("release-branch", WEIGHT_MEDIUM, "Manual QA needs a frozen branch to test — a release branch provides it.");
    add("git-flow", WEIGHT_MEDIUM, "The release-branch stage in git flow accommodates a manual QA cycle.");
    warn("trunk", "Do not adopt trunk-based development before you have automated tests — its safety net is CI.");
    warn("github-flow", "Deploying every merge is risky with mostly manual testing.");
  }

  // --- Team size -----------------------------------------------------------
  awarded += WEIGHT_MEDIUM;
  if (teamSize === "solo" || teamSize === "small") {
    add("github-flow", WEIGHT_MEDIUM, "Small teams get the least overhead from a single main branch and short-lived PRs.");
    add("trunk", WEIGHT_WEAK, "Few contributors means merge conflicts on one trunk stay rare.");
    warn("git-flow", "For a small team, five branch types is process for its own sake.");
  } else if (teamSize === "medium") {
    add("trunk", WEIGHT_MEDIUM, "Small-batch merges to trunk scale better than long-lived branches as integration frequency rises.");
    add("github-flow", WEIGHT_WEAK, "Still workable if branches stay short-lived.");
  } else {
    add("trunk", WEIGHT_MEDIUM, "The large organisations documented on trunkbaseddevelopment.com (e.g. Google) use one trunk to avoid mega-merges.");
    add("release-branch", WEIGHT_WEAK, "Release branches isolate many teams' work at cut time.");
    warn("github-flow", "With 30+ contributors, main moves fast — branches must be merged within a day or two to avoid drift.");
  }

  // --- Regulated / sign-off gate ------------------------------------------
  awarded += WEIGHT_MEDIUM;
  if (regulated) {
    add("release-branch", WEIGHT_MEDIUM, "A release branch is a natural artifact to freeze, test and sign off.");
    add("git-flow", WEIGHT_WEAK, "The release branch stage maps onto a formal approval gate.");
    warn("trunk", "Continuous deployment needs the approval gate moved into the pipeline (automated checks, canary).");
  } else {
    add("trunk", WEIGHT_WEAK, "No formal gate means nothing blocks small, frequent merges.");
    add("github-flow", WEIGHT_WEAK, "Merge-and-deploy works when no external sign-off is required.");
  }

  const ranking = STRATEGIES.map((s) => ({
    ...s,
    score: scores[s.id],
    reasons: reasons[s.id],
    cautions: cautions[s.id],
  })).sort((a, b) => b.score - a.score);

  return { ranking, maxScore: awarded, best: ranking[0] };
}
