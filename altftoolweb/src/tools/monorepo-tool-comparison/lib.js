/**
 * Monorepo build-tool comparison data and weighted scorer.
 *
 * Ratings are 0-5 editorial scores grounded in each tool's own documentation
 * (nx.dev, turbo.build, bazel.build, lerna.js.org, pnpm.io) as of mid-2026.
 * Notable factual anchors:
 *  - Lerna has been maintained by Nrwl (the Nx team) since May 2022, and since
 *    Lerna v6 its task running and caching are powered by Nx.
 *  - Turborepo is maintained by Vercel and offers free remote caching through
 *    Vercel Remote Cache (self-hosted API also documented).
 *  - Bazel supports remote caching AND remote execution and is multi-language
 *    by design (C++, Java, Go, Python, JS via rules).
 *  - pnpm workspaces link packages and run scripts topologically (pnpm -r,
 *    --filter) but have no build-output cache of their own; pnpm's docs
 *    recommend pairing with a task runner such as Nx or Turborepo.
 */

export const RATING_MAX = 5; // each criterion is scored 0..5

export const CRITERIA = [
  {
    id: "localCaching",
    label: "Local computation caching",
    hint: "Skips re-running a task when inputs have not changed.",
  },
  {
    id: "remoteCaching",
    label: "Remote / shared caching",
    hint: "Cache shared across CI and teammates.",
  },
  {
    id: "orchestration",
    label: "Task orchestration",
    hint: "Dependency-aware ordering, parallelism, affected-only runs.",
  },
  {
    id: "languages",
    label: "Multi-language support",
    hint: "First-class builds beyond JavaScript / TypeScript.",
  },
  {
    id: "setup",
    label: "Ease of setup",
    hint: "Time from zero to a working pipeline; learning curve.",
  },
  {
    id: "publishing",
    label: "Versioning & publishing",
    hint: "Bumping versions, changelogs and npm publishing.",
  },
  {
    id: "ecosystem",
    label: "Ecosystem & maintenance",
    hint: "Docs, community, plugin ecosystem, active development.",
  },
];

export const TOOLS = [
  {
    id: "nx",
    name: "Nx",
    config: "nx.json + project.json",
    ratings: {
      localCaching: 5,
      remoteCaching: 5,
      orchestration: 5,
      languages: 3,
      setup: 3,
      publishing: 3,
      ecosystem: 5,
    },
    notes: {
      localCaching: "Built-in computation cache keyed on inputs.",
      remoteCaching: "Nx Cloud remote cache and distributed task execution.",
      orchestration: "Project graph, affected commands, task pipelines.",
      languages: "JS/TS-first; official and community plugins extend further.",
      setup: "Powerful but concept-heavy: executors, generators, plugins.",
      publishing: "nx release handles versioning and changelogs.",
      ecosystem: "Large plugin ecosystem; also powers Lerna internally.",
    },
    bestFor: "Large JS/TS monorepos that want generators, affected-only CI and remote caching.",
  },
  {
    id: "turborepo",
    name: "Turborepo",
    config: "turbo.json",
    ratings: {
      localCaching: 5,
      remoteCaching: 5,
      orchestration: 4,
      languages: 2,
      setup: 5,
      publishing: 1,
      ecosystem: 4,
    },
    notes: {
      localCaching: "Content-addressed cache of task outputs and logs.",
      remoteCaching: "Free Vercel Remote Cache; self-hostable cache API.",
      orchestration: "Task pipeline with topological ordering and filters.",
      languages: "JavaScript / TypeScript package scripts only.",
      setup: "Single turbo.json on top of existing package scripts.",
      publishing: "No versioning story — pair with Changesets.",
      ecosystem: "Backed by Vercel, Rust core, active development.",
    },
    bestFor: "JS/TS teams that want caching and parallel runs with minimal configuration.",
  },
  {
    id: "bazel",
    name: "Bazel",
    config: "MODULE.bazel + BUILD files (Starlark)",
    ratings: {
      localCaching: 5,
      remoteCaching: 5,
      orchestration: 5,
      languages: 5,
      setup: 1,
      publishing: 1,
      ecosystem: 4,
    },
    notes: {
      localCaching: "Hermetic, sandboxed actions cached by content hash.",
      remoteCaching: "Remote cache plus remote execution of build actions.",
      orchestration: "Full action graph; scales to tens of thousands of targets.",
      languages: "C++, Java, Go, Python, JS and more via rule sets.",
      setup: "Steepest learning curve; every target declared in BUILD files.",
      publishing: "No npm versioning/publishing workflow built in.",
      ecosystem: "Google-backed; strong in polyglot, large-scale shops.",
    },
    bestFor: "Polyglot monorepos at large scale that need hermetic, remotely executed builds.",
  },
  {
    id: "lerna",
    name: "Lerna",
    config: "lerna.json",
    ratings: {
      localCaching: 4,
      remoteCaching: 3,
      orchestration: 3,
      languages: 2,
      setup: 4,
      publishing: 5,
      ecosystem: 3,
    },
    notes: {
      localCaching: "Since v6, task running and caching are delegated to Nx.",
      remoteCaching: "Available by connecting the underlying Nx runner to Nx Cloud.",
      orchestration: "lerna run with topological ordering via Nx.",
      languages: "JavaScript / TypeScript packages only.",
      setup: "Small lerna.json; familiar to long-lived JS monorepos.",
      publishing: "The reference tool for fixed/independent versioning and npm publish.",
      ecosystem: "Maintained by Nrwl (Nx team) since May 2022.",
    },
    bestFor: "Publishing many npm packages with coordinated fixed or independent versions.",
  },
  {
    id: "pnpm",
    name: "pnpm workspaces",
    config: "pnpm-workspace.yaml",
    ratings: {
      localCaching: 1,
      remoteCaching: 0,
      orchestration: 2,
      languages: 2,
      setup: 5,
      publishing: 3,
      ecosystem: 4,
    },
    notes: {
      localCaching: "Content-addressable install store only — no task output cache.",
      remoteCaching: "None built in; add Nx or Turborepo on top.",
      orchestration: "pnpm -r runs scripts topologically with --filter selectors.",
      languages: "npm package scripts only.",
      setup: "One YAML file listing package globs; nothing else to learn.",
      publishing: "pnpm publish -r plus workspace: protocol; no changelog automation.",
      ecosystem: "The de-facto workspace layer most other tools sit on.",
    },
    bestFor: "The workspace foundation itself — linking packages, often under Nx or Turborepo.",
  },
];

export const DEFAULT_WEIGHTS = Object.fromEntries(CRITERIA.map((c) => [c.id, 3]));

/**
 * Rank the tools by weighted score.
 *
 * score = 100 * sum(rating_i * weight_i) / (RATING_MAX * sum(weight_i))
 *
 * @param {object} weights  Map criterion id -> importance 0..5.
 * @returns {{ranking: Array<{id,name,score,weightedPoints,maxPoints,bestFor,config}>, totalWeight:number} | {error:string}}
 */
export function scoreTools(weights) {
  if (!weights || typeof weights !== "object") {
    return { error: "Set at least one criterion weight above zero." };
  }
  const clean = {};
  for (const c of CRITERIA) {
    const w = Number(weights[c.id]);
    if (!Number.isFinite(w) || w < 0) {
      return { error: `Weight for "${c.label}" must be a number of 0 or more.` };
    }
    clean[c.id] = Math.min(RATING_MAX, w);
  }
  const totalWeight = CRITERIA.reduce((sum, c) => sum + clean[c.id], 0);
  if (totalWeight === 0) {
    return { error: "All weights are zero — raise at least one criterion above zero to rank the tools." };
  }

  const maxPoints = RATING_MAX * totalWeight;
  const ranking = TOOLS.map((tool) => {
    const weightedPoints = CRITERIA.reduce(
      (sum, c) => sum + tool.ratings[c.id] * clean[c.id],
      0,
    );
    return {
      id: tool.id,
      name: tool.name,
      config: tool.config,
      bestFor: tool.bestFor,
      weightedPoints,
      maxPoints,
      score: Math.round((weightedPoints / maxPoints) * 1000) / 10,
    };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return { ranking, totalWeight };
}
