const seo = {
  title: "Git Merge vs Rebase vs Squash: Which to Use and When",
  metaDescription:
    "Answer four questions about your branch and get a merge, rebase or squash recommendation with the reasoning, ASCII history previews and exact commands.",
  steps: [
    "Set \"Commits on your branch (not on target)\" and a history preference, then tick \"Others have pulled this branch or based work on it\" if it is shared.",
    "Tick \"Each commit is meaningful on its own\" to steer between rebase and squash — shared branches always get a merge recommendation under the golden rule.",
    "Compare the ASCII previews for merge commit, rebase + fast-forward and squash merge, then click \"Copy result\" to take the exact git commands.",
  ],
  intro:
    "This helper decides between git merge, rebase and squash merge for a specific branch by applying the golden rule of rebasing from Pro Git: never rewrite commits that exist outside your repository and that others may have based work on. Answer four questions — whether the branch is shared, how many commits it has, whether they are individually meaningful, and your history preference — and it returns a recommendation, the reasoning, ASCII history previews and the exact commands to run.",
  useCases: [
    "Deciding how to bring main into a long-running feature branch that a teammate has also pulled",
    "Choosing between rebase and squash before opening a pull request full of wip and fixup commits",
    "Settling a team argument about linear history with the actual rule and trade-offs written out",
  ],
  benefits: [
    ["Golden rule enforced", "Shared branches always get a merge recommendation — the one case where rebasing genuinely breaks collaborators."],
    ["History previews", "See the resulting commit graph for merge, rebase and squash side by side before choosing."],
    ["Commands included", "Each recommendation ships with the exact git commands, including --ff-only and --squash variants."],
  ],
  faqs: [
    [
      "When should I use git rebase instead of merge?",
      "Rebase when the branch is private — not yet pushed, or pushed but not pulled by anyone — and you want a linear history. Rebase rewrites your commits with new SHAs as it replays them onto the target, which is harmless for unpublished work and destructive for shared work; that boundary is the whole decision.",
    ],
    [
      "What is the golden rule of git rebase?",
      "Never rebase commits that exist outside your repository and that people may have based work on — as stated in the Rebasing chapter of Pro Git. Rewriting published commits gives every collaborator duplicate, divergent history that they must manually repair, usually with confused merges or a risky forced pull.",
    ],
    [
      "What does a squash merge do?",
      "git merge --squash stages all the changes from a branch as a single commit on the target, discarding the branch's individual commits from the target history. GitHub and GitLab offer it as a pull-request merge method; it is the right choice when a branch's commits are wip noise but the overall change is one logical unit.",
    ],
    [
      "Does rebasing change commit hashes?",
      "Yes — every replayed commit gets a new SHA because its parent (and often its content after conflict resolution) changes. That is why a rebased branch that was previously pushed needs git push --force-with-lease, and why rebasing anything a teammate has already fetched causes divergence.",
    ],
  ],
};

export default seo;
