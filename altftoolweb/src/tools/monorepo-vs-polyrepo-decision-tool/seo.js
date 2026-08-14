const seo = {
  title: "Monorepo vs Polyrepo: 8-Question Decision Scorecard",
  metaDescription:
    "Answer eight questions on code sharing, CI investment, release coupling and access control for scored monorepo and polyrepo fit percentages.",
  steps: [
    "Answer all eight questions covering code sharing, cross-project changes, build tooling, release coupling and access control.",
    "Every choice awards monorepo and polyrepo points, listed answer by answer in the Mono pts and Poly pts table.",
    "Read the Recommendation with Monorepo fit and Polyrepo fit percentages — a gap under 15 points is borderline — then press Copy result.",
  ],
  intro:
    "This tool scores your team on the eight factors that actually decide between a monorepo and a polyrepo — code sharing, frequency of cross-project changes, build-tooling investment, release coupling, access control, projected scale, dependency policy and team autonomy. Each answer awards points to one side and the result is two comparable fit percentages plus a recommendation, with a 15-point margin treated as a toss-up. Engineering leads get a defensible, written-down rationale instead of a whiteboard argument.",
  useCases: [
    "A startup CTO with three services and a shared TypeScript core deciding whether to consolidate into one repository",
    "A platform team building the case to leadership for a monorepo migration, using the per-question breakdown as the evidence",
    "An enterprise architect checking whether compliance-driven access isolation outweighs the cost of coordinating twelve separate repos",
  ],
  benefits: [
    ["Transparent scoring", "Every answer's monorepo and polyrepo points are shown in a breakdown table — no black-box verdict."],
    ["Honest about ties", "A gap under 15 percentage points is reported as borderline with a lean, because migrations are rarely worth a coin-flip advantage."],
    ["Covers the real blockers", "Access control, CI investment and release coupling are weighted alongside the usual code-sharing argument."],
  ],
  faqs: [
    [
      "When is a monorepo better than multiple repositories?",
      "When projects share significant code, one change regularly needs to land atomically across several projects, and you can invest in affected-only CI tooling like Nx, Turborepo or Bazel. Those three conditions are why Google and Meta run monorepos — without them, a monorepo is mostly a very large folder with slow CI.",
    ],
    [
      "What are the main disadvantages of a monorepo?",
      "Access control is coarse (most Git hosts gate at repository level, so everyone typically sees everything), CI must be engineered to build only affected projects or pipelines become unbearably slow, and Git operations degrade at very large scale without extra tooling like sparse checkout. Teams that need contractor isolation or fully independent release trains often land on polyrepo for exactly these reasons.",
    ],
    [
      "Does a monorepo mean all projects release together?",
      "No — a monorepo is a storage and integration strategy, not a release strategy; tools like Changesets, Lerna and Nx release ship independently versioned packages from one repo every day. However, if your cadences are fully independent and products never change together, one of the monorepo's biggest benefits (atomic cross-project commits) goes unused, which this tool scores accordingly.",
    ],
    [
      "Is it worth migrating from polyrepo to monorepo?",
      "Only when the pain is concrete and recurring: coordinated changes across repos every week, version drift between shared libraries, or duplicated CI maintenance. A borderline score here usually means the migration cost — history rewriting, CI redesign, retraining — exceeds the benefit, and improving tooling inside your current structure is the better first move.",
    ],
  ],
};

export default seo;
