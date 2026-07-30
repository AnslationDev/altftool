/**
 * Git Error Message Decoder — data and pure lookup/search logic.
 *
 * SOURCES. Every behavioural claim below is taken from the Git manual pages
 * installed on this machine (git version 2.50.1) — `man git-merge`,
 * `man git-push`, `man git-reset`, `man git-reflog`, `man git-gc`,
 * `man git-config`, `man git-submodule` — read 2026-07-29. Quoted fragments are
 * marked with quotation marks and the page they come from. Two version facts
 * that are not in the man pages are noted at their entry:
 *   - the "divergent branches" hint was added in Git 2.27 and the unconfigured
 *     case became fatal in the Git 2.34 series;
 *   - the repository-ownership check and `safe.directory` shipped in the
 *     April 2022 coordinated security releases (2.30.3, 2.31.2, 2.32.1, 2.33.3,
 *     2.34.3, 2.35.2) as the fix for CVE-2022-24765.
 * Both checked 2026-07-29.
 *
 * This module is pure: no Date, no DOM, no network. Same input -> same output.
 */

/* ------------------------------------------------------------------ *
 * Blast radius grading
 * ------------------------------------------------------------------ */

/** The three grades every suggested command carries. */
export const BLAST_LEVELS = {
  SAFE: "safe",
  REWRITE: "rewrite",
  DESTRUCTIVE: "destructive",
};

/**
 * Ordered least -> most dangerous. `rank` is used to compute the worst grade in
 * a command list; nothing else depends on the order.
 *
 * The grading rule, stated once so every badge on the page means the same thing:
 *
 *  SAFE        Local only and reversible. Publishes nothing, rewrites no commit
 *              and discards no uncommitted work. Anything it moves is still in
 *              the reflog, which keeps reachable entries 90 days and unreachable
 *              entries 30 days by default (gc.reflogExpire /
 *              gc.reflogExpireUnreachable, man git-gc).
 *  REWRITE     Replaces commits with new object ids, or moves a ref other people
 *              have already fetched. Your own reflog can undo it; every other
 *              clone of that branch diverges and has to be repaired by hand.
 *  DESTRUCTIVE Discards work no reflog can return: uncommitted working-tree or
 *              index changes, untracked files, or commits that existed only on
 *              the remote you overwrote. The reflog records commits, not the
 *              working tree — `git reset --hard` "Resets the index and working
 *              tree. Any changes to tracked files in the working tree since
 *              <commit> are discarded." (man git-reset).
 */
export const BLAST_RADIUS = [
  {
    id: BLAST_LEVELS.SAFE,
    rank: 0,
    label: "SAFE",
    tone: "success",
    short: "Local only, reversible",
    rule: "Publishes nothing, rewrites no commit, discards no uncommitted work. Whatever it moves is still findable in the reflog (90 days for reachable entries, 30 for unreachable — gc.reflogExpire, man git-gc).",
  },
  {
    id: BLAST_LEVELS.REWRITE,
    rank: 1,
    label: "REWRITES HISTORY",
    tone: "warning",
    short: "Breaks other people's clones",
    rule: "Gives commits new object ids, or moves a ref other people have already fetched. Recoverable for you through the reflog; everyone else's clone diverges and must be repaired by hand.",
  },
  {
    id: BLAST_LEVELS.DESTRUCTIVE,
    rank: 2,
    label: "DESTRUCTIVE",
    tone: "danger",
    short: "Discards work irrecoverably",
    rule: "Throws away something the reflog never held: uncommitted edits, staged-but-uncommitted content, untracked files, or commits that existed only on the remote being overwritten.",
  },
];

const BLAST_BY_ID = BLAST_RADIUS.reduce((acc, level) => {
  acc[level.id] = level;
  return acc;
}, {});

/** Look up a blast-radius descriptor. Returns null for an unknown id. */
export function getBlastLevel(id) {
  return BLAST_BY_ID[id] || null;
}

/* ------------------------------------------------------------------ *
 * The catalogue: 20 real git failures
 * ------------------------------------------------------------------ */

export const GIT_ERRORS = [
  {
    id: "updates-were-rejected",
    title: "Updates were rejected because the remote contains work you do not have",
    group: "Push and remotes",
    message:
      "! [rejected]        main -> main (fetch first)\nerror: failed to push some refs to 'github.com:you/repo.git'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. This is usually caused by another repository pushing to\nhint: the same ref.",
    aliases: [
      "rejected fetch first",
      "non-fast-forward",
      "remote contains work that you do not have locally",
      "push rejected",
    ],
    tags: ["push", "remote", "fast-forward", "diverged"],
    model:
      "git push only fast-forwards by default: the ref on the server must be an ancestor of the ref you are sending. Man git-push says of --force-with-lease, \"Usually, 'git push' refuses to update a remote ref that is not an ancestor of the local ref used to overwrite it.\" Someone pushed to origin after your last fetch, so origin/main and your main now share a common ancestor but each holds commits the other does not. Nothing is broken and nothing is lost — git refused because completing the push would have made the server's commits unreachable.",
    causes: [
      "A teammate (or a web-UI edit, or a CI bot) pushed to the same branch after you last fetched.",
      "You amended or rebased commits you had already pushed, so your rewritten commits no longer descend from the remote tip.",
      "You are pushing to a branch that a merge queue or bot force-updates.",
    ],
    commands: [
      {
        cmd: "git fetch origin",
        blast: BLAST_LEVELS.SAFE,
        why: "Updates refs/remotes/origin/* only. Your branch, index and working tree are not touched.",
      },
      {
        cmd: "git log --oneline --graph --left-right HEAD...origin/main",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. '<' marks commits only you have, '>' marks commits only the remote has — this tells you the size of the divergence before you choose.",
      },
      {
        cmd: "git merge origin/main",
        blast: BLAST_LEVELS.SAFE,
        why: "Records a merge commit locally. Both sets of commits keep their object ids and survive; you can still `git reset --hard ORIG_HEAD` afterwards.",
      },
      {
        cmd: "git pull --rebase origin main",
        blast: BLAST_LEVELS.REWRITE,
        why: "Replays your commits on top of theirs, giving each a new object id. Harmless while those commits are unpushed; if the branch was already pushed and fetched by someone, their copy diverges.",
      },
      {
        cmd: "git push --force-with-lease origin main",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Makes the server's commits unreachable. --force-with-lease refuses if origin moved since your last fetch — \"It is like taking a 'lease' on the ref\" (man git-push) — but if the lease holds, whatever those commits contained is gone for anyone who never fetched them.",
      },
    ],
    source: "man git-push (git 2.50.1), --force-with-lease — read 2026-07-29",
  },

  {
    id: "failed-to-push-some-refs",
    title: "error: failed to push some refs to <url>",
    group: "Push and remotes",
    message:
      "error: failed to push some refs to 'git@github.com:you/repo.git'\nhint: Updates were rejected because the tip of your current branch is behind\nhint: its remote counterpart.",
    aliases: [
      "failed to push some refs",
      "tip of your current branch is behind",
      "denyCurrentBranch",
      "protected branch",
    ],
    tags: ["push", "remote", "permissions", "hook"],
    model:
      "This line is only git push's summary; the actual reason is the '! [rejected]' or 'remote:' line printed above it. Four different failures print this same summary: (1) non-fast-forward — the remote has commits you lack; (2) your remote-tracking ref is stale and git wants you to fetch first; (3) you pushed into the branch that a non-bare repository currently has checked out — receive.denyCurrentBranch \"Defaults to 'refuse'\" because \"Such a push is potentially dangerous because it brings the HEAD out of sync with the index and working tree\" (man git-config); (4) the server said no — protected branch, no write permission, or a pre-receive hook.",
    causes: [
      "Non-fast-forward push (see the separate 'Updates were rejected' entry).",
      "Pushing into a non-bare repository's checked-out branch — receive.denyCurrentBranch defaults to refuse.",
      "Branch protection, required reviews or required status checks on the hosting side.",
      "Read-only access: a deploy key without write, or an expired token.",
    ],
    commands: [
      {
        cmd: "git push origin main 2>&1 | head -20",
        blast: BLAST_LEVELS.SAFE,
        why: "The '! [rejected] ... (reason)' and 'remote:' lines name the actual cause. Everything else is guesswork until you read them.",
      },
      {
        cmd: "git ls-remote origin",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. If this succeeds, the URL and your credentials are fine and the problem is history or permissions, not connectivity.",
      },
      {
        cmd: "git remote -v",
        blast: BLAST_LEVELS.SAFE,
        why: "Shows the fetch and push URLs. Pushing to someone else's repo instead of your fork produces a permission rejection with this same summary line.",
      },
      {
        cmd: "git config receive.denyCurrentBranch updateInstead",
        blast: BLAST_LEVELS.SAFE,
        why: "Run inside the RECEIVING repository. Config change only, reversible. 'updateInstead' updates that repo's working tree on push and requires it to be clean (man git-config).",
      },
      {
        cmd: "git push --force-with-lease origin main",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Only relevant when the rejection is non-fast-forward, and it discards the remote commits you do not have.",
      },
    ],
    source: "man git-config (git 2.50.1), receive.denyCurrentBranch — read 2026-07-29",
  },

  {
    id: "detached-head",
    title: "You are in 'detached HEAD' state",
    group: "History and HEAD",
    message:
      "Note: switching to 'a1b2c3d'.\n\nYou are in 'detached HEAD' state. You can look around, make experimental\nchanges and commit them, and you can discard any commits you make in this\nstate without impacting any branches by switching back to a branch.",
    aliases: ["detached head", "switching to", "HEAD detached at", "not on any branch"],
    tags: ["head", "branch", "checkout", "switch", "reflog"],
    model:
      ".git/HEAD normally holds a symbolic ref — the literal text 'ref: refs/heads/main'. After checking out a raw commit, a tag, or a remote-tracking ref, it holds an object id instead. Commits you make still get written into the object database and HEAD still advances, but no branch ref points at them. The moment you check out something else, that chain of commits becomes unreachable — findable only through the reflog, which keeps unreachable entries 30 days by default (gc.reflogExpireUnreachable, man git-gc).",
    causes: [
      "git checkout <sha>, git checkout v1.2.0, or git checkout origin/main.",
      "An interactive rebase, bisect, or `git submodule update` — all of which check out commits, not branches.",
      "CI systems that clone at a fixed commit id.",
    ],
    commands: [
      {
        cmd: "git switch -c rescue/my-work",
        blast: BLAST_LEVELS.SAFE,
        why: "Creates a branch at the commit you are sitting on. Nothing moves, nothing is rewritten — the commits now have a ref keeping them alive.",
      },
      {
        cmd: "git branch rescue/my-work a1b2c3d",
        blast: BLAST_LEVELS.SAFE,
        why: "Same rescue, from anywhere: points a new branch at a specific commit id without changing your current checkout.",
      },
      {
        cmd: "git switch -",
        blast: BLAST_LEVELS.SAFE,
        why: "Returns to the branch you were on. If you made commits while detached, git prints a warning naming the commit id you are leaving behind — copy it before it scrolls away.",
      },
      {
        cmd: "git reflog",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Every position HEAD has held is listed here, so a detached commit you already walked away from is still addressable by its id.",
      },
    ],
    source: "man git-gc (git 2.50.1), gc.reflogExpireUnreachable — read 2026-07-29",
  },

  {
    id: "refusing-to-merge-unrelated-histories",
    title: "fatal: refusing to merge unrelated histories",
    group: "Merge and rebase",
    message: "fatal: refusing to merge unrelated histories",
    aliases: [
      "refusing to merge unrelated histories",
      "refusing to merge histories",
      "allow-unrelated-histories",
      "no common ancestor",
    ],
    tags: ["merge", "pull", "clone", "init"],
    model:
      "A three-way merge needs a merge base — a commit reachable from both tips. These two tips have none: they are two separate root commits, two histories that never touched. Man git-merge, --allow-unrelated-histories: \"By default, git merge command refuses to merge histories that do not share a common ancestor. This option can be used to override this safety when merging histories of two projects that started their lives independently.\" The overwhelmingly common cause is a local `git init` plus a first commit, pointed at a hosted repo that was created with its own initial commit (README, LICENSE or .gitignore).",
    causes: [
      "You ran git init and committed locally, then added a remote that already had an auto-generated initial commit.",
      "You replaced a repository's history (fresh init) and pushed to the old remote.",
      "You are genuinely merging two separate projects into one repository.",
    ],
    commands: [
      {
        cmd: "git fetch origin && git log --oneline origin/main",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Shows exactly what is in the other history — usually one auto-generated commit, which tells you the merge will be trivial.",
      },
      {
        cmd: "git merge origin/main --allow-unrelated-histories",
        blast: BLAST_LEVELS.SAFE,
        why: "Creates one merge commit joining both roots. Both histories survive intact; you may have to resolve conflicts if both sides added the same filename.",
      },
      {
        cmd: "git pull origin main --allow-unrelated-histories",
        blast: BLAST_LEVELS.SAFE,
        why: "The same merge, with the fetch folded in. Man git-merge notes no config variable exists to enable this by default \"and will not be added\" — it is deliberately a per-command decision.",
      },
      {
        cmd: "git push --force-with-lease origin main",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "The other route: keep only your history and make the remote's root commit unreachable. Whatever was in that README-only commit is gone from the server.",
      },
      {
        cmd: "git reset --hard origin/main",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "The opposite route: adopt the remote history and drop yours. Your commits stay in the reflog, but any uncommitted edit in the working tree is discarded with no way back (man git-reset, --hard).",
      },
    ],
    source: "man git-merge (git 2.50.1), --allow-unrelated-histories — read 2026-07-29",
  },

  {
    id: "merge-conflict",
    title: "CONFLICT (content) — Automatic merge failed; fix conflicts and then commit the result",
    group: "Merge and rebase",
    message:
      "Auto-merging src/app.js\nCONFLICT (content): Merge conflict in src/app.js\nAutomatic merge failed; fix conflicts and then commit the result.",
    aliases: [
      "automatic merge failed",
      "conflict content",
      "merge conflict in",
      "fix conflicts and then commit",
      "unmerged paths",
    ],
    tags: ["merge", "conflict", "index", "stages"],
    model:
      "A merge is in progress and has stopped. Git wrote MERGE_HEAD into .git, and for each conflicted path it put three versions into the index: stage 1 the merge base, stage 2 yours (HEAD), stage 3 theirs. The file on disk holds all three woven together with <<<<<<< HEAD / ======= / >>>>>>> markers. No commit has been made and no version has been lost — this is a paused state you can leave in either direction.",
    causes: [
      "Both sides changed overlapping lines in the same file.",
      "One side deleted a file the other side modified (CONFLICT (modify/delete)).",
      "Both sides added a different file at the same path (CONFLICT (add/add)).",
    ],
    commands: [
      {
        cmd: "git status",
        blast: BLAST_LEVELS.SAFE,
        why: "Lists the paths under 'Unmerged paths' and reminds you of the exact continue/abort commands for the operation you are in.",
      },
      {
        cmd: "git diff --diff-filter=U",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Shows only the conflicted hunks — the combined diff of stage 2 against stage 3.",
      },
      {
        cmd: "git add src/app.js",
        blast: BLAST_LEVELS.SAFE,
        why: "Collapses the three index stages for that path into one resolved entry. This is what 'marking as resolved' actually is.",
      },
      {
        cmd: "git merge --continue",
        blast: BLAST_LEVELS.SAFE,
        why: "Writes the merge commit once every path is resolved. Nothing is rewritten; the merge commit is a new commit with two parents.",
      },
      {
        cmd: "git merge --abort",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Restores the pre-merge state, but man git-merge warns: \"If there were uncommitted worktree changes present when the merge started, git merge --abort will in some cases be unable to reconstruct these changes.\" It is equivalent to git reset --merge.",
      },
      {
        cmd: "git checkout --theirs src/app.js",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Overwrites the working-tree file with stage 3 wholesale. Any manual conflict resolution you had already typed into that file is discarded and was never in a commit.",
      },
    ],
    source: "man git-merge (git 2.50.1), --abort and HOW CONFLICTS ARE PRESENTED — read 2026-07-29",
  },

  {
    id: "local-changes-would-be-overwritten",
    title: "Your local changes to the following files would be overwritten by merge",
    group: "Working tree",
    message:
      "error: Your local changes to the following files would be overwritten by merge:\n\tsrc/app.js\nPlease commit your changes or stash them before you merge.\nAborting",
    aliases: [
      "local changes would be overwritten",
      "please commit your changes or stash them",
      "overwritten by merge",
      "overwritten by checkout",
      "aborting",
    ],
    tags: ["merge", "checkout", "pull", "stash", "working tree"],
    model:
      "Git was about to write a new version of a tracked file that you have modified but not committed. That edit exists in exactly one place — the file on disk — and in no commit, so no reflog could bring it back. Rather than lose it, git aborted before starting. Your repository is completely unchanged; the operation never began.",
    causes: [
      "Uncommitted edits to a file that the incoming merge, pull or checkout also changes.",
      "A build step or formatter that rewrote files you did not intend to modify.",
      "Line-ending or file-mode churn that makes files look modified (see the CRLF entry).",
    ],
    commands: [
      {
        cmd: "git status --short",
        blast: BLAST_LEVELS.SAFE,
        why: "Names every modified path so you can see whether the changes are yours or incidental churn.",
      },
      {
        cmd: "git stash push -m 'before merge'",
        blast: BLAST_LEVELS.SAFE,
        why: "Records the changes as real commits under refs/stash and cleans the working tree. Recoverable with `git stash list` / `git fsck --unreachable` even if you later drop it.",
      },
      {
        cmd: "git commit -am 'wip: save before merge'",
        blast: BLAST_LEVELS.SAFE,
        why: "The most durable option: the edits become a commit with an object id, which the reflog protects.",
      },
      {
        cmd: "git merge origin/main && git stash pop",
        blast: BLAST_LEVELS.SAFE,
        why: "Runs the merge on a clean tree, then replays your saved edits on top. A conflict at pop keeps the stash entry in place.",
      },
      {
        cmd: "git restore src/app.js",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Throws the local edits away and takes the committed version. This is the one command in this list with no undo — the content was never in the object database.",
      },
    ],
    source: "man git-merge / man git-stash (git 2.50.1) — read 2026-07-29",
  },

  {
    id: "not-a-git-repository",
    title: "fatal: not a git repository (or any of the parent directories): .git",
    group: "Setup",
    message: "fatal: not a git repository (or any of the parent directories): .git",
    aliases: ["not a git repository", "any of the parent directories", "no .git directory"],
    tags: ["init", "clone", "setup", "path"],
    model:
      "Git resolves the repository by walking up from the current directory looking for a .git directory (or a .git file pointing at one), stopping at a filesystem boundary or at a path listed in GIT_CEILING_DIRECTORIES. It reached the top without finding one, so as far as git is concerned there is no repository here at all. No data is at risk; git did nothing.",
    causes: [
      "You are one directory above (or beside) the repository — very common right after `git clone` without cd.",
      "The clone was interrupted, so the target directory exists but .git does not.",
      "A tool, template or archive extraction removed or never included .git.",
      "You are inside a submodule directory that was never initialised.",
    ],
    commands: [
      {
        cmd: "pwd && ls -a",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Confirms where you actually are and whether a .git entry exists here.",
      },
      {
        cmd: "git rev-parse --show-toplevel",
        blast: BLAST_LEVELS.SAFE,
        why: "Prints the repository root if you are anywhere inside one. Failing with the same fatal message proves you are outside every repository.",
      },
      {
        cmd: "git clone git@github.com:you/repo.git",
        blast: BLAST_LEVELS.SAFE,
        why: "Creates a fresh working copy in a new directory. Touches nothing that already exists.",
      },
      {
        cmd: "git init",
        blast: BLAST_LEVELS.SAFE,
        why: "Creates a brand-new empty repository here. Worth naming what it does not do: it recovers no previous history — an init in the wrong place is why the next entry's 'unrelated histories' error appears.",
      },
    ],
    source: "man git (git 2.50.1), repository discovery / GIT_CEILING_DIRECTORIES — read 2026-07-29",
  },

  {
    id: "permission-denied-publickey",
    title: "git@github.com: Permission denied (publickey)",
    group: "Setup",
    message:
      "git@github.com: Permission denied (publickey).\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.",
    aliases: [
      "permission denied publickey",
      "could not read from remote repository",
      "correct access rights",
      "ssh key",
    ],
    tags: ["ssh", "auth", "clone", "fetch", "push"],
    model:
      "This failure happens before git does anything. The SSH transport connected, the server offered publickey authentication, and your SSH client had no key the server would accept — so the connection closed and git reported that it could not read from the remote. The second sentence, 'or the repository exists', is generic text: an authenticated user without access to a private repo gets the same message so the server does not leak which repositories exist.",
    causes: [
      "No key loaded in the agent, or the key on disk is not the one registered with the host.",
      "A key exists but has wrong permissions, so ssh silently ignores it.",
      "The remote URL is https:// (which uses tokens) while your credentials are an SSH key, or vice versa.",
      "You have access to the org but the repository is private and your account was never added.",
    ],
    commands: [
      {
        cmd: "ssh -T git@github.com",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only handshake test. A successful key returns a greeting naming your account; that isolates the failure to git or to repo permissions.",
      },
      {
        cmd: "ssh -vT git@github.com",
        blast: BLAST_LEVELS.SAFE,
        why: "The verbose trace lists every 'Offering public key:' line, which shows exactly which key files ssh tried and in what order.",
      },
      {
        cmd: "ssh-add -l",
        blast: BLAST_LEVELS.SAFE,
        why: "Lists the identities the agent currently holds. An empty agent is the single most common cause of this message.",
      },
      {
        cmd: "git remote -v",
        blast: BLAST_LEVELS.SAFE,
        why: "Confirms the transport. An https:// URL will never use your SSH key, no matter how correctly the key is configured.",
      },
    ],
    source: "OpenSSH publickey authentication behaviour; git transport layer, man git-fetch (git 2.50.1) — read 2026-07-29",
  },

  {
    id: "cannot-lock-ref",
    title: "error: cannot lock ref 'refs/...'",
    group: "Repository state",
    message:
      "error: cannot lock ref 'refs/remotes/origin/feature': 'refs/remotes/origin/feature/login' exists;\ncannot create 'refs/remotes/origin/feature'\n! [new branch]      feature -> origin/feature  (unable to update local ref)",
    aliases: [
      "cannot lock ref",
      "unable to update local ref",
      "unable to create ref file exists",
      "ref lock",
    ],
    tags: ["refs", "fetch", "branch", "lock"],
    model:
      "Loose refs are files under .git/refs, and git takes a <ref>.lock file before updating one. Two different situations produce this message. (1) A name collision: a branch called 'feature' cannot coexist with 'feature/login', because the first needs to be a file at refs/heads/feature and the second needs that same path to be a directory. (2) A stale lock: a git process was killed or crashed and left the .lock file behind, or a second git process is holding it right now.",
    causes: [
      "Someone deleted branch 'feature' and created 'feature/login' (or the reverse), and your remote-tracking refs still hold the old shape.",
      "A crashed fetch, an editor plugin, or an IDE background fetch left a .lock file.",
      "Two git processes writing the same ref at the same time.",
    ],
    commands: [
      {
        cmd: "git remote prune origin --dry-run",
        blast: BLAST_LEVELS.SAFE,
        why: "Lists which remote-tracking refs would be deleted without deleting anything. For the name-collision case this shows the stale ref that is in the way.",
      },
      {
        cmd: "git remote prune origin",
        blast: BLAST_LEVELS.SAFE,
        why: "Deletes only refs/remotes/origin/* entries whose branches no longer exist on the server. Local branches and commits are untouched, and a fetch recreates them.",
      },
      {
        cmd: "git branch -a --list 'feature*'",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Shows the collision directly — you will see both the file-shaped and directory-shaped names.",
      },
      {
        cmd: "ls -l .git/refs/heads .git/refs/remotes/origin",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. The timestamps on any .lock file tell you whether it is seconds old (a live process) or days old (a crash leftover).",
      },
      {
        cmd: "rm .git/refs/heads/main.lock",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Graded destructive on purpose: if a git process still holds that lock, removing it lets two writers update the same ref and one update is silently lost. Only defensible after `ps` shows no running git.",
      },
    ],
    source: "man git-update-ref / man git-remote (git 2.50.1), loose ref locking — read 2026-07-29",
  },

  {
    id: "index-lock-exists",
    title: "fatal: Unable to create '.git/index.lock': File exists",
    group: "Repository state",
    message:
      "fatal: Unable to create '/path/to/repo/.git/index.lock': File exists.\n\nAnother git process seems to be running in this repository, e.g.\nan editor opened by 'git commit'. Please make sure all processes\nare terminated then try again. If it still fails, a git process\nmay have crashed in this repository earlier:\nremove the file manually to continue.",
    aliases: [
      "index.lock",
      "unable to create index lock",
      "another git process seems to be running",
      "file exists",
    ],
    tags: ["index", "lock", "commit", "add", "crash"],
    model:
      "Every command that writes the index — add, rm, commit, checkout, merge, rebase, stash — creates .git/index.lock first and renames it over .git/index at the end. That file is still present, which means either a git process is genuinely running (an editor waiting on `git commit`, a GUI client, an IDE's background fetch, a hook) or one died before it could clean up. Your index, your commits and your working tree are all intact; the lock is only a mutex.",
    causes: [
      "An editor is still open for a commit message.",
      "An IDE or GUI (VS Code, JetBrains, GitHub Desktop) is running a background git command.",
      "A previous git command was killed, or the machine lost power mid-write.",
      "A long-running hook or a filesystem sync tool holding the file.",
    ],
    commands: [
      {
        cmd: "ps -ef | grep '[g]it'",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Answers the only question that matters: is a git process alive right now?",
      },
      {
        cmd: "ls -l .git/index.lock",
        blast: BLAST_LEVELS.SAFE,
        why: "The modification time distinguishes a lock from three seconds ago from one left over three days ago.",
      },
      {
        cmd: "rm -f .git/index.lock",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Graded destructive because it is only safe once the previous command shows nothing running. Deleting a live lock lets a second process write the index concurrently, which can lose staged content that exists nowhere else.",
      },
      {
        cmd: "git status",
        blast: BLAST_LEVELS.SAFE,
        why: "Rebuilds nothing but confirms the index is readable and your staged changes are still staged.",
      },
    ],
    source: "git lockfile mechanism; message text from git 2.50.1 — read 2026-07-29",
  },

  {
    id: "divergent-branches",
    title: "You have divergent branches and need to specify how to reconcile them",
    group: "Merge and rebase",
    message:
      "hint: You have divergent branches and need to specify how to reconcile them.\nhint: You can do so by running one of the following commands sometime before\nhint: your next pull:\nhint:\nhint:   git config pull.rebase false  # merge\nhint:   git config pull.rebase true   # rebase\nhint:   git config pull.ff only       # fast-forward only\nfatal: Need to specify how to reconcile divergent branches.",
    aliases: [
      "divergent branches",
      "need to specify how to reconcile",
      "pull.rebase",
      "pull.ff only",
    ],
    tags: ["pull", "merge", "rebase", "config"],
    model:
      "git pull is a fetch followed by an integration step. Your branch and its upstream have each gained commits since they parted, so the integration cannot be a fast-forward, and git will not pick between a merge and a rebase for you because the two produce different history and different object ids. The hint was added in Git 2.27 and the unconfigured divergent case became fatal in the Git 2.34 series (checked 2026-07-29); before that, git silently merged.",
    causes: [
      "You committed locally while the upstream branch also moved.",
      "A fresh machine or fresh clone with no pull.rebase set in any config scope.",
      "You rebased locally, so your commits no longer descend from the upstream tip.",
    ],
    commands: [
      {
        cmd: "git log --oneline --left-right --graph HEAD...@{u}",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Shows how many commits each side has before you commit to a strategy.",
      },
      {
        cmd: "git config pull.rebase false",
        blast: BLAST_LEVELS.SAFE,
        why: "Per-repository config. Future pulls merge: your commits keep their object ids and a merge commit records the join.",
      },
      {
        cmd: "git config pull.ff only",
        blast: BLAST_LEVELS.SAFE,
        why: "The most conservative setting: pull refuses whenever it cannot fast-forward, so it can never surprise you with a merge or a rewrite.",
      },
      {
        cmd: "git pull --no-rebase",
        blast: BLAST_LEVELS.SAFE,
        why: "One-off merge without changing any config.",
      },
      {
        cmd: "git pull --rebase",
        blast: BLAST_LEVELS.REWRITE,
        why: "One-off rebase. Your local commits are replayed with new object ids — fine while unpushed, divergence-inducing for anyone who already fetched them.",
      },
    ],
    source:
      "man git-config (git 2.50.1) pull.rebase / pull.ff; version history from Git release notes 2.27 and 2.34 — read 2026-07-29",
  },

  {
    id: "nothing-to-commit-clean",
    title: "nothing to commit, working tree clean (but you expected changes)",
    group: "Working tree",
    message: "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean",
    aliases: [
      "nothing to commit working tree clean",
      "no changes added to commit",
      "working tree clean",
      "changes not showing",
    ],
    tags: ["status", "gitignore", "submodule", "worktree"],
    model:
      "git status compared the working tree with the index and the index with HEAD, and both comparisons came back empty: every tracked file on disk is byte-identical to what HEAD records. When you were sure you edited something, one of five things is true — you edited files in a different directory or a different clone; the paths match a .gitignore rule, so status hides them entirely; the change is inside a submodule, which is a separate repository with its own status; you already committed it; or the only difference was line endings that the CRLF filters normalise away before comparison.",
    causes: [
      "Edited files in another checkout, a worktree, or a copied folder.",
      "The files are ignored — status does not list ignored paths without --ignored.",
      "The change is inside a submodule.",
      "The commit already happened (check `git log -1`).",
      "Line-ending-only difference cancelled out by core.autocrlf or a text attribute.",
    ],
    commands: [
      {
        cmd: "git rev-parse --show-toplevel",
        blast: BLAST_LEVELS.SAFE,
        why: "Prints which repository you are actually in. Two clones of the same project is the most common explanation.",
      },
      {
        cmd: "git status --ignored --short",
        blast: BLAST_LEVELS.SAFE,
        why: "Adds the ignored paths that plain status silently omits, marked '!!'.",
      },
      {
        cmd: "git check-ignore -v path/to/file",
        blast: BLAST_LEVELS.SAFE,
        why: "Prints the exact ignore file, line number and pattern that is hiding the file — a definitive answer rather than a guess.",
      },
      {
        cmd: "git submodule status",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. A '+' prefix means the submodule is at a different commit than the parent records, which the parent's status summarises as a single line at most.",
      },
      {
        cmd: "git log --oneline -3",
        blast: BLAST_LEVELS.SAFE,
        why: "Confirms whether the work is already committed — the cleanest possible explanation for a clean tree.",
      },
    ],
    source: "man git-status / man git-check-ignore (git 2.50.1) — read 2026-07-29",
  },

  {
    id: "submodule-detached-pointer",
    title: "modified: vendor/lib (new commits) — submodule pointer moved / detached",
    group: "Repository state",
    message:
      "Changes not staged for commit:\n\tmodified:   vendor/lib (new commits)\n\n$ cd vendor/lib && git status\nHEAD detached at a1b2c3d",
    aliases: [
      "submodule new commits",
      "modified submodule",
      "HEAD detached at submodule",
      "submodule pointer",
    ],
    tags: ["submodule", "gitlink", "detached", "pointer"],
    model:
      "A submodule appears in the superproject as a gitlink: one tree entry holding a single commit id, plus a URL in .gitmodules. `git submodule update` checks the submodule out at exactly that recorded id, and man git-submodule states the checkout mode leaves \"the commit recorded in the superproject ... checked out in the submodule on a detached HEAD\" — the detachment is the design, not a fault. 'modified: vendor/lib (new commits)' means the submodule's HEAD is now at a different commit than the id the parent records; the pointer only actually moves when you commit that change in the parent.",
    causes: [
      "You committed inside the submodule but not in the superproject.",
      "You ran `git submodule update --remote`, which moves the submodule to its remote branch tip.",
      "A branch switch in the parent changed the recorded id while the submodule stayed where it was.",
    ],
    commands: [
      {
        cmd: "git submodule status",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only, and the legend is precise: '-' means not initialised, '+' means \"the currently checked out submodule commit does not match the SHA-1 found in the index of the containing repository\", 'U' means merge conflicts (man git-submodule).",
      },
      {
        cmd: "git diff --submodule=short vendor/lib",
        blast: BLAST_LEVELS.SAFE,
        why: "Shows the old and new commit ids for the pointer, so you can see whether it moved forward, backward or sideways.",
      },
      {
        cmd: "git -C vendor/lib switch main",
        blast: BLAST_LEVELS.SAFE,
        why: "Attaches the submodule's HEAD to a branch so future commits there are not orphaned.",
      },
      {
        cmd: "git add vendor/lib && git commit -m 'chore: bump vendor/lib'",
        blast: BLAST_LEVELS.SAFE,
        why: "Records the new gitlink in the superproject. This is the only way the pointer change becomes real for anyone else.",
      },
      {
        cmd: "git submodule update --init --recursive",
        blast: BLAST_LEVELS.SAFE,
        why: "Moves the submodule back to the id the parent records, in detached HEAD. A plain checkout refuses rather than clobber modified files.",
      },
      {
        cmd: "git submodule update --force",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Uses `git checkout --force` inside the submodule (man git-submodule), so uncommitted changes there are discarded. Commits made in the submodule survive in its own reflog; edits on disk do not.",
      },
    ],
    source: "man git-submodule (git 2.50.1), status legend and update checkout/--force — read 2026-07-29",
  },

  {
    id: "crlf-warning",
    title: "warning: LF will be replaced by CRLF in <file>",
    group: "Working tree",
    message:
      "warning: LF will be replaced by CRLF in README.md.\nThe file will have its original line endings in your working directory.",
    aliases: [
      "LF will be replaced by CRLF",
      "CRLF will be replaced by LF",
      "original line endings in your working directory",
      "line endings",
    ],
    tags: ["crlf", "line endings", "autocrlf", "gitattributes"],
    model:
      "Not an error — a notice from the line-ending filter. With core.autocrlf=true (the Windows installer default), git stores LF in the object database and writes CRLF into the working tree; man git-config states that setting it to true \"is the same as setting the text attribute to auto on all files and core.eol to crlf\". The warning means the blob about to be stored differs from the file on disk only in line endings, and the second sentence promises your file on disk is not being modified. It turns into a real problem when two machines disagree about the setting, which shows up as diffs where every line changed.",
    causes: [
      "core.autocrlf=true on Windows with a repository that stores LF.",
      "A repository with no .gitattributes, so each clone relies on that user's local config.",
      "An editor that saved a file with the other platform's line endings.",
    ],
    commands: [
      {
        cmd: "git config core.autocrlf",
        blast: BLAST_LEVELS.SAFE,
        why: "Prints the current value. 'input' converts CRLF to LF on commit and performs no output conversion (man git-config).",
      },
      {
        cmd: "git ls-files --eol path/to/file",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Reports the endings in the index (i/) and in the working tree (w/) side by side, which settles the argument about which side is 'wrong'.",
      },
      {
        cmd: "printf '* text=auto\\n' >> .gitattributes",
        blast: BLAST_LEVELS.SAFE,
        why: "The portable form: attributes are committed and apply to every clone, unlike core.autocrlf which is per-user and per-machine.",
      },
      {
        cmd: "git add --renormalize .",
        blast: BLAST_LEVELS.SAFE,
        why: "Re-applies the current filters to every tracked file and stages the result. It produces one large normalising commit; content is unchanged apart from line endings.",
      },
    ],
    source: "man git-config (git 2.50.1) core.autocrlf / core.eol; man gitattributes 'text' — read 2026-07-29",
  },

  {
    id: "pathspec-did-not-match",
    title: "error: pathspec '<name>' did not match any file(s) known to git",
    group: "Working tree",
    message: "error: pathspec 'featuer' did not match any file(s) known to git",
    aliases: [
      "pathspec did not match",
      "did not match any file(s) known to git",
      "pathspec",
      "unknown revision or path",
    ],
    tags: ["checkout", "switch", "add", "branch", "pathspec"],
    model:
      "Git could not read the argument as a ref, so it fell back to treating it as a path — and no tracked file matches that path either. From checkout or switch this means no local branch or tag has that name; a branch that exists only on the server is not a local ref, though git will create one for you when exactly one remote has a branch with that name and you ask for it by that bare name. From `git add` it means the file is untracked and does not exist at that path, or your shell expanded the glob to nothing.",
    causes: [
      "A typo, or a branch that exists on the remote but has never been fetched.",
      "Checking out a branch by its remote-tracking name shape without fetching first.",
      "A quoted glob the shell expanded to nothing, or a path relative to the wrong directory.",
      "The file was deleted, or never added.",
    ],
    commands: [
      {
        cmd: "git fetch origin",
        blast: BLAST_LEVELS.SAFE,
        why: "Downloads refs you have never seen. A branch created by someone else simply does not exist locally until you fetch.",
      },
      {
        cmd: "git branch -a --list '*feature*'",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Lists local and remote-tracking branches matching a pattern, which usually surfaces the exact spelling.",
      },
      {
        cmd: "git switch -c feature origin/feature",
        blast: BLAST_LEVELS.SAFE,
        why: "Creates the local branch explicitly from the remote-tracking ref, and sets it up to track.",
      },
      {
        cmd: "git ls-files 'src/**'",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Shows exactly which paths git considers tracked — the set 'pathspec ... known to git' refers to.",
      },
    ],
    source: "man gitglossary 'pathspec'; man git-switch (git 2.50.1) — read 2026-07-29",
  },

  {
    id: "no-upstream-branch",
    title: "fatal: The current branch <name> has no upstream branch",
    group: "Push and remotes",
    message:
      "fatal: The current branch feature has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin feature\n\nTo have this happen automatically for branches without a tracking\nupstream, see 'push.autoSetupRemote' in 'git help config'.",
    aliases: [
      "no upstream branch",
      "set-upstream",
      "push.autoSetupRemote",
      "there is no tracking information for the current branch",
    ],
    tags: ["push", "pull", "upstream", "tracking", "config"],
    model:
      "A branch's upstream is two config keys — branch.<name>.remote and branch.<name>.merge. They are unset for this branch, so with the default push.default=simple git has no @{upstream} to send to and refuses to guess a destination. The same two keys are what make a bare `git pull` work and what produce the 'ahead 2, behind 1' line in git status.",
    causes: [
      "You created the branch locally and have never pushed it.",
      "The branch was created from a detached HEAD or copied from another repository.",
      "push.autoSetupRemote is unset, so the first push does not set tracking for you.",
    ],
    commands: [
      {
        cmd: "git push -u origin feature",
        blast: BLAST_LEVELS.SAFE,
        why: "Creates the branch on the remote and writes both tracking config keys. Publishes new commits but overwrites nothing — it is a fast-forward creation of a ref that did not exist.",
      },
      {
        cmd: "git branch -vv",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Lists every local branch with its upstream in brackets, so you can see which branches lack one.",
      },
      {
        cmd: "git branch --set-upstream-to=origin/feature",
        blast: BLAST_LEVELS.SAFE,
        why: "Writes the tracking config for an already-pushed branch without pushing anything.",
      },
      {
        cmd: "git config --global push.autoSetupRemote true",
        blast: BLAST_LEVELS.SAFE,
        why: "Man git-config: it makes git \"assume --set-upstream on default push when no upstream tracking exists for the current branch\", with push.default simple, upstream or current. Config only, reversible.",
      },
    ],
    source: "man git-config (git 2.50.1), push.autoSetupRemote / push.default — read 2026-07-29",
  },

  {
    id: "cannot-rebase-unstaged-changes",
    title: "error: cannot rebase: You have unstaged changes",
    group: "Merge and rebase",
    message: "error: cannot rebase: You have unstaged changes.\nerror: Please commit or stash them.",
    aliases: [
      "cannot rebase you have unstaged changes",
      "please commit or stash them",
      "cannot pull with rebase",
      "unstaged changes",
    ],
    tags: ["rebase", "pull", "stash", "working tree"],
    model:
      "A rebase works by checking out the upstream commit and replaying each of your commits onto it. That first checkout would overwrite files you have modified but not committed, and those edits exist in no commit — so git refuses before it starts rather than lose them. The same clean-tree requirement is why `git pull --rebase`, `git cherry-pick` and `git merge` frequently stop with the same complaint.",
    causes: [
      "Uncommitted edits (or a dirty index) when starting the rebase.",
      "Generated files, build output or formatter churn that is tracked but should not be.",
      "A previous rebase that stopped and left the tree modified.",
    ],
    commands: [
      {
        cmd: "git status --short",
        blast: BLAST_LEVELS.SAFE,
        why: "Names the paths blocking the rebase, and whether they are staged (first column) or unstaged (second).",
      },
      {
        cmd: "git stash push -u -m 'pre-rebase'",
        blast: BLAST_LEVELS.SAFE,
        why: "Saves tracked and, with -u, untracked changes as stash commits and cleans the tree. Recoverable from `git stash list`.",
      },
      {
        cmd: "git config rebase.autoStash true",
        blast: BLAST_LEVELS.SAFE,
        why: "Config only. Rebase then stashes before and re-applies after automatically; if the re-apply conflicts, the stash entry is kept rather than dropped.",
      },
      {
        cmd: "git rebase --autostash origin/main",
        blast: BLAST_LEVELS.REWRITE,
        why: "The autostash part is safe; the rebase itself replays your commits with new object ids, which is what breaks other people's copies of a shared branch.",
      },
      {
        cmd: "git checkout .",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Clears the tree by throwing the uncommitted edits away. It works, and there is no undo.",
      },
    ],
    source: "man git-rebase (git 2.50.1), --autostash and the clean-tree requirement — read 2026-07-29",
  },

  {
    id: "bad-object",
    title: "fatal: bad object <sha> / loose object is corrupt",
    group: "Repository state",
    message:
      "fatal: bad object 1a2b3c4\n\nerror: object file .git/objects/ab/cdef0123... is empty\nfatal: loose object abcdef0123... (stored in .git/objects/ab/cdef0123...) is corrupt",
    aliases: [
      "bad object",
      "loose object is corrupt",
      "object file is empty",
      "fatal bad object",
      "unable to read tree",
    ],
    tags: ["objects", "corruption", "fsck", "clone"],
    model:
      "Git looked up an object id and either found nothing, or found a file it could not decompress. 'bad object' with a short hex string usually means the id names nothing in THIS repository — a truncated or mistyped id, an id from a different clone, or a ref pointing at a commit that was never fetched (shallow clones do this). 'object file ... is empty' means the loose object file exists at zero length, the classic result of a crash, a full disk, or a killed process mid-write. Objects are immutable and content-addressed, so a healthy copy of the same object anywhere else is byte-identical and interchangeable.",
    causes: [
      "A truncated, mistyped, or foreign commit id.",
      "A shallow or partial clone that genuinely lacks the object.",
      "Power loss, a full filesystem, or a killed git process leaving a zero-length object.",
      "A network filesystem or backup tool corrupting .git.",
    ],
    commands: [
      {
        cmd: "git fsck --full",
        blast: BLAST_LEVELS.SAFE,
        why: "A read-only integrity walk over every object and ref. It names the corrupt or missing ids instead of leaving you guessing.",
      },
      {
        cmd: "git cat-file -t 1a2b3c4",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Prints the object type, or fails — which distinguishes 'wrong id' from 'corrupt file'.",
      },
      {
        cmd: "find .git/objects -type f -size 0",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Zero-length object files are always damage; this lists exactly which ones.",
      },
      {
        cmd: "git fetch --all",
        blast: BLAST_LEVELS.SAFE,
        why: "A remote that still has the object can resupply it. Because objects are content-addressed, the refetched copy is identical to what was lost.",
      },
      {
        cmd: "rm .git/objects/ab/cdef0123 && git fetch --all",
        blast: BLAST_LEVELS.DESTRUCTIVE,
        why: "Removing the damaged file lets a fetch replace it — but if no remote and no other clone holds that object, the content it stored is gone permanently.",
      },
    ],
    source: "man git-fsck / man git-cat-file (git 2.50.1) — read 2026-07-29",
  },

  {
    id: "remote-head-nonexistent-ref",
    title: "warning: remote HEAD refers to nonexistent ref, unable to checkout",
    group: "Push and remotes",
    message:
      "Cloning into 'repo'...\nremote: Enumerating objects: 128, done.\nReceiving objects: 100% (128/128), done.\nwarning: remote HEAD refers to nonexistent ref, unable to checkout",
    aliases: [
      "remote HEAD refers to nonexistent ref",
      "unable to checkout",
      "empty clone",
      "default branch missing",
    ],
    tags: ["clone", "head", "default branch", "remote"],
    model:
      "The clone succeeded — all objects and refs arrived. But the server's symbolic HEAD points at a branch that is not in the ref advertisement, so git had nothing to check out: your working tree is empty and you are on an unborn branch. Almost always the repository's default branch was renamed or deleted (master to main) without the server-side HEAD being updated, or the repository has branches under names nobody set as default.",
    causes: [
      "The default branch was renamed or deleted on the hosting side.",
      "The repository is genuinely empty of the branch HEAD names.",
      "A mirror or self-hosted repo whose HEAD symref was never set.",
    ],
    commands: [
      {
        cmd: "git branch -r",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Lists the branches that DID arrive — the objects are already local, only the checkout did not happen.",
      },
      {
        cmd: "git ls-remote --symref origin HEAD",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Prints the ref the server's HEAD points at, which names the missing branch exactly.",
      },
      {
        cmd: "git remote set-head origin --auto",
        blast: BLAST_LEVELS.SAFE,
        why: "Re-queries the server and rewrites your local refs/remotes/origin/HEAD. Local metadata only.",
      },
      {
        cmd: "git switch main",
        blast: BLAST_LEVELS.SAFE,
        why: "With one matching remote branch, this creates the local branch from origin/main and populates the working tree from objects you already have.",
      },
    ],
    source: "man git-remote (git 2.50.1), set-head --auto; clone HEAD resolution — read 2026-07-29",
  },

  {
    id: "dubious-ownership",
    title: "fatal: detected dubious ownership in repository at '<path>'",
    group: "Setup",
    message:
      "fatal: detected dubious ownership in repository at '/srv/app'\nTo add an exception for this directory, call:\n\n\tgit config --global --add safe.directory /srv/app",
    aliases: [
      "dubious ownership",
      "safe.directory",
      "unsafe repository",
      "is owned by someone else",
    ],
    tags: ["ownership", "permissions", "security", "docker", "wsl"],
    model:
      "Git checked who owns the repository directory, found a different user than the one running git, and stopped before reading any config. Man git-config, safe.directory: \"By default, Git will refuse to even parse a Git config of a repository owned by someone else, let alone run its hooks, and this config setting allows users to specify exceptions.\" The check shipped in the April 2022 coordinated security releases (2.30.3, 2.31.2, 2.32.1, 2.33.3, 2.34.3 and 2.35.2) as the fix for CVE-2022-24765 — a repo you do not own could otherwise run its own hooks and config as you. Checked 2026-07-29.",
    causes: [
      "A container or CI runner whose UID differs from the mounted volume's owner.",
      "A repository cloned as root or with sudo, then used as a normal user.",
      "A Windows drive mounted in WSL, or a repository on a network share.",
      "A shared repository on a multi-user machine.",
    ],
    commands: [
      {
        cmd: "ls -ld . && id",
        blast: BLAST_LEVELS.SAFE,
        why: "Read-only. Compares the directory's owner with your uid, which is the entire content of git's complaint.",
      },
      {
        cmd: "git config --global --add safe.directory /srv/app",
        blast: BLAST_LEVELS.SAFE,
        why: "Reversible config. It exempts exactly one path; the setting is multi-valued and \"is only respected in protected configuration\" so an untrusted repo cannot add itself (man git-config).",
      },
      {
        cmd: "sudo chown -R \"$(id -u):$(id -g)\" /srv/app",
        blast: BLAST_LEVELS.SAFE,
        why: "Changes filesystem ownership rather than turning the check off. No git object, ref or working-tree content is modified.",
      },
      {
        cmd: "git config --global --add safe.directory '*'",
        blast: BLAST_LEVELS.SAFE,
        why: "Reversible in one command, but worth naming precisely: it disables the ownership check for every repository on the machine, which is the check CVE-2022-24765 exists to provide.",
      },
    ],
    source: "man git-config (git 2.50.1), safe.directory; Git 2.35.2 security release notes — read 2026-07-29",
  },
];

/* ------------------------------------------------------------------ *
 * Recovery: what the reflog can and cannot bring back
 * ------------------------------------------------------------------ */

export const REFLOG_RECOVERY = {
  headline:
    "Almost every commit you think you destroyed is still in the object database, referenced by the reflog.",
  explainer:
    "The reflog is a per-ref journal of every position HEAD and each branch has held, written locally on every commit, checkout, merge, rebase, reset and pull. A commit that no branch points at is unreachable, not deleted: it survives until git gc removes it. Defaults from man git-gc: gc.reflogExpire \"defaults to 90 days\" for entries reachable from the current tip, and gc.reflogExpireUnreachable \"defaults to 30 days\" for entries that are not — the shorter window covers exactly the commits left behind by amend and rebase.",
  steps: [
    {
      cmd: "git reflog",
      blast: BLAST_LEVELS.SAFE,
      why: "Read-only. Lists every position HEAD has held, newest first, with the operation that moved it (commit, rebase, reset, checkout).",
    },
    {
      cmd: "git reflog show main",
      blast: BLAST_LEVELS.SAFE,
      why: "The same journal for one branch, which is what you need after a bad reset or a force-push on that branch.",
    },
    {
      cmd: "git show HEAD@{2}",
      blast: BLAST_LEVELS.SAFE,
      why: "Read-only. Inspect a reflog entry before acting on it — confirm it is the work you want back.",
    },
    {
      cmd: "git branch rescue HEAD@{2}",
      blast: BLAST_LEVELS.SAFE,
      why: "The lowest-risk recovery: give the lost commit a branch name. Nothing currently checked out moves at all.",
    },
    {
      cmd: "git fsck --lost-found",
      blast: BLAST_LEVELS.SAFE,
      why: "Read-only. Finds dangling commits and blobs that no ref and no reflog entry mentions — the last resort after a dropped stash.",
    },
    {
      cmd: "git reset --hard HEAD@{2}",
      blast: BLAST_LEVELS.DESTRUCTIVE,
      why: "Moves the branch back AND overwrites the working tree: \"Any changes to tracked files in the working tree since <commit> are discarded\" (man git-reset). Commit or stash first, then this becomes recoverable.",
    },
  ],
  limits: [
    "The reflog is local and never pushed — a fresh clone has none of your history of moves.",
    "It records commits, not the working tree. An uncommitted edit destroyed by `git restore`, `git checkout --`, `git clean -fd` or `git reset --hard` was never an object and cannot be recovered by git.",
    "A stash is a commit, so a dropped stash is usually findable with `git fsck --unreachable`; unstaged edits that were never stashed are not.",
    "Expiry defaults are 90 days (reachable) and 30 days (unreachable), and `git gc` can run automatically — recovery gets harder with time, not easier.",
  ],
  source: "man git-reflog and man git-gc (git 2.50.1), gc.reflogExpire / gc.reflogExpireUnreachable — read 2026-07-29",
};

/* ------------------------------------------------------------------ *
 * Derived helpers
 * ------------------------------------------------------------------ */

/** Stable, deep-linkable anchor id for an error entry. */
export function anchorId(errorId) {
  if (typeof errorId !== "string" || errorId.trim() === "") return "";
  return `err-${errorId.trim()}`;
}

/** Fetch one entry by id. Returns null when the id is unknown. */
export function getErrorById(id) {
  if (typeof id !== "string") return null;
  const wanted = id.trim().replace(/^err-/, "");
  return GIT_ERRORS.find((entry) => entry.id === wanted) || null;
}

/**
 * Count commands by blast grade for one entry and report the worst grade
 * present. Returns { error } for anything that is not an entry with commands.
 */
export function blastSummary(entry) {
  if (!entry || typeof entry !== "object" || !Array.isArray(entry.commands)) {
    return { error: "No command list to grade — pass one of the catalogue entries." };
  }
  if (entry.commands.length === 0) {
    return { error: "This entry has no suggested commands to grade." };
  }
  const counts = { safe: 0, rewrite: 0, destructive: 0 };
  let worstRank = -1;
  let worst = null;
  for (const command of entry.commands) {
    const level = BLAST_BY_ID[command.blast];
    if (!level) {
      return { error: `Unknown blast grade "${String(command.blast)}" on command "${String(command.cmd)}".` };
    }
    counts[level.id] += 1;
    if (level.rank > worstRank) {
      worstRank = level.rank;
      worst = level.id;
    }
  }
  return { counts, worst, total: entry.commands.length };
}

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

/** Longest paste accepted. A full git error block is well under this. */
export const MAX_QUERY_LENGTH = 2000;
/** Tokens shorter than this are dropped as noise ("in", "to", "a"). */
export const MIN_TOKEN_LENGTH = 3;
/** Upper bound on tokens scored, so a huge paste cannot blow up the work. */
export const MAX_TOKENS = 40;

/**
 * Words that appear in almost every git message and therefore carry no
 * discriminating power. Dropping them stops a paste of any error from matching
 * every entry equally.
 */
const STOP_WORDS = new Set([
  "the", "and", "but", "for", "you", "your", "yours", "was", "were", "are", "not",
  "have", "has", "had", "this", "that", "these", "those", "with", "from", "into",
  "any", "all", "can", "will", "would", "should", "there", "then", "them", "they",
  "use", "using", "please", "make", "sure", "try", "run", "running", "one", "some",
  "hint", "fatal", "error", "warning", "git", "its", "his", "her", "out", "before",
  "after", "such", "also", "may", "must", "how", "why", "what", "which", "when",
]);

/** Field weights. Higher weight = a match there is a stronger signal. */
const FIELD_WEIGHTS = { title: 5, message: 4, aliases: 4, tags: 3, body: 1 };

function normalise(text) {
  return String(text).toLowerCase();
}

function tokenize(query) {
  const raw = normalise(query).split(/[^a-z0-9._/-]+/);
  const seen = new Set();
  const tokens = [];
  for (const piece of raw) {
    const token = piece.replace(/^[._/-]+|[._/-]+$/g, "");
    if (token.length < MIN_TOKEN_LENGTH) continue;
    if (STOP_WORDS.has(token)) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
    if (tokens.length >= MAX_TOKENS) break;
  }
  return tokens;
}

/** Pre-built lowercase haystacks, one per entry, built once at module load. */
const HAYSTACKS = GIT_ERRORS.map((entry) => ({
  id: entry.id,
  title: normalise(entry.title),
  message: normalise(entry.message),
  aliases: normalise(entry.aliases.join(" | ")),
  tags: normalise(entry.tags.join(" ")),
  body: normalise([entry.model, entry.causes.join(" "), entry.group].join(" ")),
}));

/**
 * Search the catalogue with a typed phrase or a pasted error block.
 *
 * Ranking: number of distinct query tokens matched first (a paste that hits five
 * distinct words of one entry beats one that hits two), then the summed field
 * weight, then catalogue order — so the result is fully deterministic.
 *
 * @param {string} query
 * @returns {{query:string, tokens:string[], matches:Array, count:number, showingAll:boolean}
 *          | {error:string}}
 */
export function searchErrors(query) {
  if (query === undefined || query === null) {
    return { error: "Enter or paste a git error message to search." };
  }
  if (typeof query !== "string") {
    return { error: "Search text must be plain text — paste the error message as it was printed." };
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      error: `That paste is ${query.length.toLocaleString("en-US")} characters. Trim it to the error itself — the limit is ${MAX_QUERY_LENGTH.toLocaleString("en-US")} characters.`,
    };
  }

  const trimmed = query.trim();
  if (trimmed === "") {
    return {
      query: "",
      tokens: [],
      matches: GIT_ERRORS.map((entry) => ({ entry, score: 0, matched: [] })),
      count: GIT_ERRORS.length,
      showingAll: true,
    };
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    return {
      query: trimmed,
      tokens: [],
      matches: [],
      count: 0,
      showingAll: false,
    };
  }

  const scored = [];
  for (let index = 0; index < HAYSTACKS.length; index += 1) {
    const hay = HAYSTACKS[index];
    const matched = [];
    let score = 0;
    for (const token of tokens) {
      let best = 0;
      if (hay.title.includes(token)) best = Math.max(best, FIELD_WEIGHTS.title);
      if (hay.message.includes(token)) best = Math.max(best, FIELD_WEIGHTS.message);
      if (hay.aliases.includes(token)) best = Math.max(best, FIELD_WEIGHTS.aliases);
      if (hay.tags.includes(token)) best = Math.max(best, FIELD_WEIGHTS.tags);
      if (hay.body.includes(token)) best = Math.max(best, FIELD_WEIGHTS.body);
      if (best > 0) {
        matched.push(token);
        score += best;
      }
    }
    if (matched.length > 0) {
      scored.push({ entry: GIT_ERRORS[index], score, matched, index });
    }
  }

  scored.sort((a, b) => {
    if (b.matched.length !== a.matched.length) return b.matched.length - a.matched.length;
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  return {
    query: trimmed,
    tokens,
    matches: scored.map(({ entry, score, matched }) => ({ entry, score, matched })),
    count: scored.length,
    showingAll: false,
  };
}

/** Plain-text rendering of one entry, for the copy button. */
export function formatErrorForCopy(entry) {
  if (!entry || typeof entry !== "object" || typeof entry.title !== "string") {
    return "";
  }
  const summary = blastSummary(entry);
  const worstLabel = summary.error ? "n/a" : (getBlastLevel(summary.worst) || {}).label;
  const lines = [
    entry.title,
    "",
    "WHAT HAPPENED",
    entry.model,
    "",
    "WHY IT SHOWS UP",
    ...entry.causes.map((cause) => `- ${cause}`),
    "",
    `COMMANDS (worst blast radius in this list: ${worstLabel})`,
    ...entry.commands.map((command) => {
      const level = getBlastLevel(command.blast);
      return `- [${level ? level.label : "?"}] ${command.cmd}\n    ${command.why}`;
    }),
    "",
    `Source: ${entry.source}`,
  ];
  return lines.join("\n");
}

/** Grouped catalogue, preserving first-seen group order — used for the index. */
export function groupedErrors() {
  const order = [];
  const byGroup = new Map();
  for (const entry of GIT_ERRORS) {
    if (!byGroup.has(entry.group)) {
      byGroup.set(entry.group, []);
      order.push(entry.group);
    }
    byGroup.get(entry.group).push(entry);
  }
  return order.map((group) => ({ group, entries: byGroup.get(group) }));
}
