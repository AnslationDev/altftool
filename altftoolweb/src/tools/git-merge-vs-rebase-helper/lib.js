/**
 * Merge vs rebase vs squash decision helper.
 *
 * The decision rules encoded here come from the git documentation and the
 * standard guidance in git-scm.com/book (Pro Git, "Rebasing" chapter):
 * - The golden rule: "Do not rebase commits that exist outside your repository
 *   and that people may have based work on" (Pro Git). Rewriting published
 *   history forces every collaborator to recover — so shared/pushed-and-pulled
 *   branches get merged, never rebased.
 * - Rebase rewrites commits (new SHAs) to produce a linear history; merge
 *   preserves history exactly and records the integration in a merge commit.
 * - Squash merge collapses a branch to a single commit on the target — useful
 *   when intermediate commits are noise (GitHub/GitLab both offer it as a
 *   merge-method option for this reason).
 */

export const HISTORY_PREFERENCES = [
  { id: "linear", label: "Linear — one straight line, no merge commits" },
  { id: "context", label: "Preserve context — keep branch shape and merge points" },
  { id: "none", label: "No strong preference" },
];

/** Options the helper can recommend. */
export const OPTIONS = {
  merge: {
    id: "merge",
    name: "Merge (merge commit)",
    commands: ["git checkout main", "git merge --no-ff feature"],
  },
  rebase: {
    id: "rebase",
    name: "Rebase, then fast-forward merge",
    commands: [
      "git checkout feature",
      "git rebase main",
      "git checkout main",
      "git merge --ff-only feature",
    ],
  },
  squash: {
    id: "squash",
    name: "Squash merge",
    commands: ["git checkout main", "git merge --squash feature", 'git commit -m "feat: one summary commit"'],
  },
};

/** Cap used only for drawing the ASCII previews. */
const PREVIEW_COMMIT_CAP = 3;

/** Draw ASCII history previews for all three options. */
export function historyPreviews(commitCount) {
  const n = Math.max(1, Math.min(PREVIEW_COMMIT_CAP, commitCount));
  const featureCommits = Array.from({ length: n }, (_, i) => `F${i + 1}`);
  const extra = commitCount > PREVIEW_COMMIT_CAP ? "…" : "";

  const merge = [
    "A---B---------M   main",
    `     \\       /`,
    `      ${featureCommits.join("--")}${extra}      feature`,
  ].join("\n");

  const rebase = `A---B---${featureCommits.map((c) => `${c}'`).join("--")}${extra}   main (feature commits replayed, new SHAs)`;

  const squash = `A---B---S   main (S = all ${commitCount} feature commit${commitCount === 1 ? "" : "s"} squashed into one)`;

  return { merge, rebase, squash };
}

/**
 * Recommend an integration method.
 *
 * @param {object} input
 * @param {boolean} input.branchShared      Others have pulled/based work on this branch.
 * @param {number}  input.commitCount       Commits on the branch not on the target.
 * @param {boolean} input.commitsClean      Each commit is meaningful on its own (good messages, builds).
 * @param {string}  input.historyPreference One of HISTORY_PREFERENCES ids.
 * @returns {object} { recommendation, name, commands, reasons, cautions, previews, ruling } or { error }.
 */
export function recommendIntegration({
  branchShared,
  commitCount,
  commitsClean,
  historyPreference,
}) {
  const count = Number(commitCount);
  if (!Number.isFinite(count) || !Number.isInteger(count)) {
    return { error: "Enter the number of commits on your branch as a whole number." };
  }
  if (count <= 0) {
    return { error: "The branch has no commits to integrate — nothing to merge or rebase." };
  }
  if (!HISTORY_PREFERENCES.some((h) => h.id === historyPreference)) {
    return { error: "Choose a history preference." };
  }

  const reasons = [];
  const cautions = [];
  let recommendation;
  let ruling;

  if (branchShared) {
    // Golden rule: never rewrite commits others may have based work on.
    recommendation = "merge";
    ruling =
      "The golden rule of rebasing decides this one: never rebase commits that exist outside your repository and that people may have based work on (Pro Git).";
    reasons.push(
      "Rebasing or squashing would rewrite commits your collaborators already have, forcing every one of them to repair their local history.",
    );
    reasons.push("A merge commit integrates the branch without touching any existing commit.");
    if (historyPreference === "linear") {
      cautions.push(
        "You wanted linear history — you can still get it next time by rebasing before the branch is ever pushed and shared.",
      );
    }
  } else if (count > 1 && !commitsClean) {
    recommendation = "squash";
    ruling = `The branch's ${count} commits are not individually meaningful, so collapse them into one.`;
    reasons.push(
      "Squash merging turns fixup/wip commits into a single reviewable commit on the target branch.",
    );
    reasons.push("The target history stays linear and every commit on it builds and makes sense.");
    cautions.push(
      "The branch's individual commits are lost from the target history — do not squash if you need to bisect within the branch later.",
    );
  } else if (historyPreference === "context") {
    recommendation = "merge";
    ruling = "You want the branch shape and integration point preserved — that is what a merge commit records.";
    reasons.push("merge --no-ff keeps the feature's commits grouped under an explicit merge commit.");
    reasons.push("History is never rewritten, so SHAs remain stable for bisect and revert.");
    cautions.push("Many active branches produce a busy graph; git log --first-parent tames it.");
  } else {
    // Private branch, clean commits, linear (or no) preference → rebase.
    recommendation = "rebase";
    ruling =
      "The branch is private and its commits are clean, so replaying them onto the target gives a linear history at no cost.";
    reasons.push(
      "Rebase rewrites only your own unpublished commits — the golden rule is not violated.",
    );
    reasons.push("After rebasing, the target can fast-forward: no merge commit, a straight line.");
    if (count > 1) {
      cautions.push(
        "Each replayed commit can conflict separately; resolve as you go or use git rebase --interactive to tidy first.",
      );
    }
    if (historyPreference === "none") {
      cautions.push("Merging is equally correct here — rebase is chosen only for the tidier log.");
    }
  }

  const option = OPTIONS[recommendation];
  return {
    recommendation,
    name: option.name,
    commands: option.commands,
    reasons,
    cautions,
    ruling,
    previews: historyPreviews(count),
  };
}
