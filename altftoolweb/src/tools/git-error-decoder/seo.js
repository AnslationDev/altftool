const seo = {
  intro:
    "This decoder takes a git error message — pasted verbatim or picked from a list of 20 — and returns three things: what actually happened inside git's object and ref model, the commands that resolve it, and a blast radius grade on every one of those commands. The grades are fixed: SAFE means local only and reversible, REWRITES HISTORY means commits get new object ids or a published ref moves so other clones diverge, and DESTRUCTIVE means work no reflog can return — uncommitted edits, untracked files, or commits that existed only on the remote you overwrote. Every behavioural claim is quoted from the git 2.50.1 manual pages (git-merge, git-push, git-reset, git-reflog, git-gc, git-config, git-submodule), read 2026-07-29. It is for the moment when a command has failed, the terminal is red, and the real question is not which command to run but which command is safe to run.",
  useCases: [
    "Deciding whether the Stack Overflow answer telling you to run git reset --hard will lose the file you have been editing for two hours",
    "Working out why 'Updates were rejected' appeared and what merge, rebase and force-with-lease each do to the commits on the server",
    "Finding commits after an amend, a bad rebase or a detached HEAD, using the reflog window of 90 days for reachable entries and 30 for unreachable",
    "Sending a teammate a direct link to one specific error — every entry has a stable anchor id",
  ],
  benefits: [
    [
      "Every command is graded",
      "SAFE, REWRITES HISTORY or DESTRUCTIVE on each suggested command, with one sentence saying exactly what it would cost.",
    ],
    [
      "The model, not just the fix",
      "Each entry explains the ref, index or object state git is actually in — why HEAD holds a raw object id, why a merge conflict is three index stages, why index.lock exists at all.",
    ],
    [
      "Quoted from the manual",
      "Claims are quoted from the git 2.50.1 man pages and stamped with the date they were read, not paraphrased from memory.",
    ],
    [
      "Recovery first",
      "A reflog section spells out what the reflog can bring back (commits) and what it cannot (uncommitted working-tree edits) before you run anything.",
    ],
  ],
  faqs: [
    [
      "Which git commands are actually destructive?",
      "The ones that touch content that was never a commit: git reset --hard, git checkout -- <file>, git restore <file>, git clean -fd, git checkout --ours/--theirs during a conflict, and git submodule update --force. Man git-reset states it plainly for --hard: \"Any changes to tracked files in the working tree since <commit> are discarded.\" The reflog is a journal of commits, so it cannot help with any of these. Rebase, commit --amend and push --force-with-lease are a different category — they rewrite history and break other people's clones, but your own reflog can still undo them.",
    ],
    [
      "Can I get my commits back after git reset --hard?",
      "Yes for the commits, no for uncommitted edits. The commits are still in the object database and listed in git reflog; git branch rescue HEAD@{1} gives them a name again without moving anything you have checked out. Default retention comes from man git-gc: gc.reflogExpire \"defaults to 90 days\" for entries reachable from the current tip and gc.reflogExpireUnreachable \"defaults to 30 days\" for entries that are not. Anything that was only ever a modified file on disk was never an object and cannot be recovered.",
    ],
    [
      "What does 'Updates were rejected because the remote contains work that you do not have locally' mean?",
      "It means your push was not a fast-forward: the branch on the server has commits that are not ancestors of what you are sending, so completing the push would make them unreachable. Man git-push puts it as \"Usually, 'git push' refuses to update a remote ref that is not an ancestor of the local ref used to overwrite it.\" git fetch then git merge origin/main is the SAFE resolution, git pull --rebase REWRITES HISTORY, and git push --force-with-lease is DESTRUCTIVE because it discards the server's commits.",
    ],
    [
      "Why does git say 'fatal: refusing to merge unrelated histories'?",
      "Because the two branches have no commit in common, so there is no merge base for a three-way merge — man git-merge: \"By default, git merge command refuses to merge histories that do not share a common ancestor.\" It nearly always means you ran git init and committed locally against a hosted repo that was created with its own initial README or LICENSE commit. Adding --allow-unrelated-histories to the merge or pull joins them with one merge commit and is SAFE; nothing is discarded.",
    ],
  ],
};

export default seo;
