const seo = {
  title: "CODEOWNERS File Generator with Last-Match Rule Preview",
  metaDescription:
    "Build a CODEOWNERS file from path patterns and validated @user, @org/team or email owners, then test any path to see which rule wins under last-match.",
  steps: [
    "Set the 'Default owner for everything (optional)' field — written first as * so every later rule overrides it — and add rows under 'Rules (pattern → owners) — order matters', using the 'Add rule' button for more.",
    "Type any file path into 'Match preview — who owns this path?' to see the winning rule under GitHub's last-match precedence, shown as 'Owned by … — winning rule: …'.",
    "Read the generated file in the CODEOWNERS pane and click 'Copy file' to copy it; owners that are not @username, @org/team or an email are rejected before you export.",
  ],
  intro:
    "This generator builds a CODEOWNERS file — the file GitHub, GitLab and Bitbucket use to auto-request reviewers when matching files change — from path patterns and owner handles. It validates each owner as @username, @org/team or an email, applies the gitignore-style pattern rules from GitHub's documentation (minus the unsupported ! negation and [..] ranges), and includes a live match preview showing which rule wins for any file path, since the last matching rule takes precedence.",
  useCases: [
    "Setting up review routing so backend changes ping @org/backend and docs changes ping the docs team",
    "Debugging why the wrong team keeps getting review requests by testing paths against each rule",
    "Adding a catch-all default owner while letting specific directories override it correctly",
  ],
  benefits: [
    ["Last-match preview", "Type any path and see exactly which rule wins — the subtlety that breaks most hand-written files."],
    ["Owner validation", "Rejects handles that are not @username, @org/team or an email before GitHub silently ignores them."],
    ["Correct pattern subset", "Enforces GitHub's documented limits: no ! negation, no [..] character ranges."],
  ],
  faqs: [
    [
      "Where does the CODEOWNERS file go?",
      "In the repository's root, the .github/ directory, or docs/ — on the branch being targeted; GitHub uses the copy on the base branch of each pull request. If files exist in more than one location, the .github/ copy wins, then root, then docs/.",
    ],
    [
      "What happens when multiple CODEOWNERS rules match the same file?",
      "The last matching pattern in the file takes precedence — order matters, unlike gitignore where more specific rules do not simply win by position for ownership. That is why a catch-all * rule must be the first line: every later, more specific rule then overrides it for its paths.",
    ],
    [
      "Who can be listed as a code owner?",
      "GitHub accepts @username, @org/team-name, or an email address associated with a GitHub account. Users must have write access to the repository, and teams must have explicit write access — otherwise the entry is silently ignored and no review is requested.",
    ],
    [
      "Do CODEOWNERS patterns work exactly like .gitignore?",
      "Almost. The same wildcard rules apply — * (not crossing /), ** (crossing directories), ?, root-anchoring with a leading or embedded slash — but GitHub's docs state two exceptions: you cannot negate a pattern with ! and you cannot use character ranges like [0-9]. A trailing slash matches everything inside the directory.",
    ],
  ],
};

export default seo;
