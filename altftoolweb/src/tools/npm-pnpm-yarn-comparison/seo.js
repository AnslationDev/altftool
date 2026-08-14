const seo = {
  title: "npm vs pnpm vs Yarn: Feature & Command Comparison",
  metaDescription:
    "Tick what your project needs — disk, monorepo scale, strictness — to rank npm, pnpm and Yarn Berry, with a fact table and command cheat sheet.",
  steps: [
    "Tick the checkboxes under 'What matters for your project?' — leaving nothing ticked makes all six criteria count equally.",
    "Compare the 'Feature comparison' table across lockfile, install strategy, disk usage, workspaces, strictness and patching, plus the 'Command cheat sheet' of npm/pnpm/yarn equivalents.",
    "Read 'Best fit for your criteria' with each manager's score and per-point reasons, then press 'Copy ranking'.",
  ],
  intro:
    "This comparison puts npm, pnpm and Yarn (Berry) side by side on the things that actually differ: install strategy (flat copies vs a hard-linked content-addressable store vs Plug'n'Play zips), lockfile formats, disk usage, phantom-dependency strictness and workspace tooling. Tick the criteria that matter to your project — disk, speed, compatibility, monorepo scale, strictness or zero setup — and get a ranked recommendation with the mechanism behind each score, plus a command cheat sheet for switching.",
  useCases: [
    "Choosing a package manager for a new monorepo and weighing pnpm's --filter selectors against Yarn's constraints engine",
    "Cutting CI install time and disk on a machine that hosts dozens of Node projects sharing the same dependencies",
    "Translating commands like npm ci or yarn dlx when migrating a project from one manager to another",
  ],
  benefits: [
    ["Mechanism, not marketing", "Every difference is tied to how the manager actually stores and links packages, per its own docs."],
    ["Weighted recommendation", "Pick your criteria and get a ranked score out of 5 per criterion, with the reason for each point."],
    ["Migration cheat sheet", "Equivalent commands for install, add, remove, dlx, update and frozen-lockfile CI installs."],
  ],
  faqs: [
    [
      "Why does pnpm use so much less disk space than npm?",
      "pnpm keeps every package file once in a global content-addressable store and hard-links it into each project's node_modules, so ten projects using the same lodash version share one physical copy. npm copies the full package into every project; its global cache only holds compressed tarballs.",
    ],
    [
      "What is a phantom dependency and which manager prevents it?",
      "A phantom dependency is a package your code imports but never declared — it works only because npm's flat hoisting happened to place it at the top of node_modules. pnpm prevents this by default (only declared deps are resolvable through its symlink structure), and Yarn Plug'n'Play rejects it at resolution time.",
    ],
    [
      "Can npm, pnpm and Yarn lockfiles be mixed in one project?",
      "No — each manager reads only its own format (package-lock.json, pnpm-lock.yaml, yarn.lock), and keeping two lockfiles guarantees they drift apart. Pick one manager per repository, commit its lockfile, and add a packageManager field so Corepack pins the exact version for everyone.",
    ],
    [
      "Is Yarn 1 (Classic) still safe to use?",
      "Yarn 1 is in maintenance mode — it receives no new features and the Yarn team directs users to modern Yarn (Berry) via Corepack. Existing projects keep working, but new projects should choose npm, pnpm or current Yarn rather than starting on Classic.",
    ],
  ],
};

export default seo;
