const seo = {
  title: "Nx vs Turborepo vs Bazel vs Lerna: Weighted",
  metaDescription:
    "Set 0-5 weights on seven criteria to rank Nx, Turborepo, Bazel, Lerna and pnpm workspaces — weighted scores plus a full 35-cell ratings matrix.",
  steps: [
    "Drag the seven 0-5 sliders under 'How much does each criterion matter?' to weight caching, orchestration, languages, setup, publishing and ecosystem for your team.",
    "Hover any cell of the 'Feature ratings (0-5)' table to read the documented reasoning behind each of the 35 tool-criterion scores.",
    "Read 'Best match for your weights' and each tool's percentage bar, then press 'Copy ranking' for the ordered list with points.",
  ],
  intro:
    "This tool compares the five major monorepo build tools — Nx, Turborepo, Bazel, Lerna and pnpm workspaces — across seven criteria and ranks them with a weighted score you control. Each tool is rated 0-5 on local caching, remote caching, task orchestration, multi-language support, ease of setup, publishing workflow and ecosystem health, based on the tools' own documentation. Engineering leads get a ranked shortlist that reflects their team's priorities instead of a generic 'best monorepo tool' verdict.",
  useCases: [
    "A frontend team choosing between Turborepo and Nx for a Next.js monorepo where remote caching in CI is the deciding factor",
    "A platform engineer evaluating whether Bazel's hermetic multi-language builds justify its learning curve versus staying on pnpm plus Turborepo",
    "A library author deciding if Lerna's versioning and publishing workflow still beats Changesets for a 20-package npm monorepo",
  ],
  benefits: [
    ["Weighted to your team", "Slide seven importance weights and the ranking recomputes as a transparent percentage, not a black-box verdict."],
    ["Documented ratings", "Every score carries a note explaining it — e.g. Lerna's caching is rated via the Nx runner it has delegated to since v6."],
    ["Full matrix included", "A side-by-side 0-5 feature table covers all 35 tool-criterion combinations for your own analysis."],
  ],
  faqs: [
    [
      "Which is better, Nx or Turborepo?",
      "Turborepo wins on simplicity — one turbo.json over existing package scripts with free Vercel remote caching — while Nx wins on depth, with code generators, a project graph, affected-only commands and Nx Cloud distributed execution. Small-to-mid JS teams usually pick Turborepo; large monorepos that want scaffolding and plugin structure usually pick Nx.",
    ],
    [
      "Is Lerna still maintained and worth using?",
      "Yes — Lerna has been maintained by Nrwl, the company behind Nx, since May 2022, and since Lerna v6 its task running and caching are powered by Nx under the hood. Its remaining edge is versioning and publishing: coordinated fixed or independent version bumps with changelogs across many npm packages.",
    ],
    [
      "Do pnpm workspaces replace a tool like Turborepo?",
      "No — pnpm workspaces handle package linking, the workspace: protocol and topological script runs (pnpm -r with --filter), but they keep no cache of task outputs, so nothing is skipped when inputs are unchanged. Most teams use pnpm workspaces as the foundation and add Turborepo or Nx on top for caching and orchestration.",
    ],
    [
      "When does Bazel make sense for a monorepo?",
      "When the repository spans multiple languages (C++, Java, Go, Python, JS) at large scale and you need hermetic, reproducible builds with remote caching and remote execution. Its cost is the steepest setup of any tool here — every target is declared in Starlark BUILD files — so JS-only teams are usually better served by Nx or Turborepo.",
    ],
  ],
};

export default seo;
