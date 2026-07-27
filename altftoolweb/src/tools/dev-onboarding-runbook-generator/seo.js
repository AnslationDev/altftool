const seo = {
  intro:
    "A developer onboarding runbook is the ordered checklist a new engineer follows on their first day: access requests first because they queue, then the toolchain, then a clone that actually builds and runs. This generator writes that document for a chosen stack and operating system, using the real package-manager commands (Homebrew, apt or winget) and a verification command for each tool. Setup time is estimated at 15 minutes per access request and 20 minutes per repository so you can see whether day one is realistic.",
  useCases: [
    "Hand a joining backend engineer a single markdown file instead of six Confluence pages and a Slack thread",
    "Check before a start date whether the setup fits in one day or needs to spill into day two",
    "Standardise onboarding across teams that use different stacks but the same access-request process",
  ],
  benefits: [
    ["Access requests go first", "Approvals are the long pole, so they are raised before any installation begins."],
    ["Verified installs", "Every tool ships with the command that proves it worked, not just the command that installs it."],
    ["A real first task", "The runbook ends with something small enough to merge, which walks the whole branch-review-CI-deploy path."],
  ],
  faqs: [
    [
      "How long should developer onboarding take on day one?",
      "Aim for the environment to be running before the end of day one — typically three to four hours of hands-on work once access is granted. If the estimate crosses an eight-hour working day, split it: raise access and install the toolchain on day one, clone and run the services on day two.",
    ],
    [
      "What should a new developer get access to first?",
      "Identity (SSO), the chat workspace and source control, in that order — nothing else can be granted until the SSO account exists, and the repository is what unblocks all local work. Production console access should start read-only, and paging tools should be shadow-only until the first on-call handover.",
    ],
    [
      "What makes a good first task for a new engineer?",
      "Something small, real and shippable in a day or two — a misleading error message, a missing test, a stale README command. The purpose is not the code but the path: branch, open a pull request, get it reviewed, watch CI, merge and see it deploy.",
    ],
    [
      "Who keeps the onboarding runbook up to date?",
      "The most recent joiner. They are the only person who will notice a wrong command, because everyone else already has the tool installed. Make fixing the runbook part of their first week, and the document stays accurate without anyone owning it as a chore.",
    ],
  ],
};

export default seo;
