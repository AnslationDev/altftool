const seo = {
  title: "Git Commit Metadata Checker: Email, Timezone",
  metaDescription:
    "Paste git log output to see the author email, UTC offsets, your busiest 8-hour window and off-hours share, scored out of 100 — parsed in your browser.",
  steps: [
    "Paste output of git log --date=iso-strict --pretty=\"%aI %ae %s\" into the 'Paste git log output' box, which opens on a sample; plain git log output parses too.",
    "Parsing runs in the browser as you type, with no upload and no run button, scoring Identity out of 30, Location out of 20, Routine predictability out of 30 and Off-hours out of 20.",
    "Read the exposure score out of 100, the UTC offsets seen, the busiest 8-hour window, the Weekend and 00:00-05:59 shares and the commits-by-local-hour chart, then press Copy result.",
  ],
  intro:
    "Code Repository Metadata Explainer reads pasted git log output and reports the identity, location and routine it publishes: the author email attached to every commit, the UTC offset stored alongside each timestamp, the busiest eight-hour window of your day, and the share of commits landing at weekends or between midnight and 06:00. Parsing happens in your browser, and the score is a documented rubric — 30 points for identity, 20 for location, 30 for how concentrated your commit hours are, 20 for off-hours patterns. For developers who publish under their own name and would rather know what the history says about them.",
  useCases: [
    "Check what a public repository reveals about your working hours before applying for a role that would notice weekend commits.",
    "See whether your commit email is a routable company address rather than the platform's noreply alias.",
    "Spot the UTC offsets in your history that show when you moved or travelled.",
    "Show a team why branch names and commit messages need the same review as the code they carry.",
  ],
  benefits: [
    [
      "Runs on your own log",
      "Paste real output — it parses both iso-strict and plain git log formats without sending anything anywhere.",
    ],
    [
      "Transparent scoring",
      "Each of the four components has a published maximum and stated thresholds, so you can see how the number was reached.",
    ],
    [
      "Fixes that work",
      "Points to the noreply commit address and the push protection setting, and is honest that timestamps need a history rewrite.",
    ],
  ],
  faqs: [
    [
      "What personal information does a git commit store?",
      "Each commit records an author name, an author email and an author timestamp with the UTC offset of the machine that made it, plus the same three fields for the committer. All of it is published the moment the repository is pushed public, and it stays in the history after you change your git config.",
    ],
    [
      "How do I hide my email address in git commits?",
      "Set a per-repository noreply address with git config user.email \"ID+handle@users.noreply.github.com\" and turn on the hosting platform's setting that blocks pushes exposing your real address. Existing commits keep the old address until the history is rewritten.",
    ],
    [
      "Can someone work out my time zone from my commits?",
      "Yes. Git stores the committer's UTC offset in the timestamp itself, so a consistent +05:30 or -04:00 across a history pins you to one band of longitude, and a change in offset marks a move or a trip.",
    ],
    [
      "Does rewriting git history remove the old commits?",
      "It replaces them with new commits that have new hashes, but the originals survive in every existing clone, in fork networks and often in the platform's cached views. Rotate any exposed credential first and treat the rewrite as damage limitation, not deletion.",
    ],
  ],
};

export default seo;
