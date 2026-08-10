const seo = {
  title: "Transitive Dependency Risk: Graph Size and Advisories",
  metaDescription:
    "Model how direct deps expand by branching factor and package reuse into the installed graph, then read expected advisories per year and audit hours.",
  steps: [
    "Start from a typical shape — npm application, Python service, Go module, Java / Maven or Rust crate — or type your own figures.",
    "Set 'Direct dependencies in your manifest', 'Average dependencies each package declares', 'Depth to expand (levels)' and 'Already-installed share at each new level (%)'.",
    "Read the packages actually installed with expansion factor, expected advisories per year, install-script packages and the exposure band, then press 'Copy summary'.",
  ],
  intro:
    "This tool models how a handful of direct dependencies expands into the full installed dependency graph, using a branching-tree model (direct deps x branching factor per level, collapsed for package reuse) plus a Poisson model for security-advisory arrivals. It is built for developers and security engineers who want to explain — to themselves or to a team — why a 25-package manifest turns into hundreds of installed packages, what that does to attack surface, and which supply-chain controls that size of graph actually justifies.",
  useCases: [
    "A tech lead explaining to stakeholders why a small npm manifest produces a node_modules tree with hundreds of packages and a recurring patching cost",
    "A security engineer estimating how many advisories per year a service's dependency graph should be expected to generate before setting an SLA for patching",
    "A developer comparing ecosystems (npm, Python, Go, Maven, Rust) to see how branching factor and package reuse change total exposure before choosing a stack",
  ],
  benefits: [
    ["Level-by-level expansion", "Shows reachable versus newly installed packages at every depth, so you can see exactly where the graph explodes."],
    ["Advisory forecasting", "Applies a Poisson model to your advisory rate to give expected advisories per year and the chance of at least one."],
    ["Justified controls", "Recommends only the supply-chain controls (lockfiles, script blocking, registry pinning, provenance) that your graph size warrants."],
  ],
  faqs: [
    [
      "What is a transitive dependency?",
      "A transitive dependency is a package you never declared yourself — it is installed because something you did declare depends on it, directly or through further layers. In most ecosystems transitive packages outnumber direct ones many times over; this tool models that expansion as direct deps multiplied by an average branching factor at each level, minus the share already installed.",
    ],
    [
      "Why do transitive dependencies increase security risk?",
      "Because every installed package is code that runs with your application's privileges, yet you only reviewed the packages you chose directly. A graph of 500 packages with an advisory rate of 0.05 per package per year should expect around 25 advisories annually, and in npm-style ecosystems some of those packages can also run arbitrary install scripts on your machine or CI runner.",
    ],
    [
      "How do I find my real dependency count instead of a model?",
      "Run your ecosystem's graph command: npm ls --all (or count entries in package-lock.json), pip list or pipdeptree for Python, go mod graph for Go, mvn dependency:tree for Maven, or cargo tree for Rust. This tool's presets are typical orders of magnitude, not measurements — feed the real numbers back in to score your actual project.",
    ],
    [
      "What is the most effective way to reduce transitive dependency risk?",
      "Removing a single direct dependency removes its entire subtree, which is the highest-leverage move — pruning one package with an expansion factor of 10 removes roughly ten installed packages. After that, the baseline controls are committing your lockfile, enabling automated advisory alerts, and disabling install scripts in CI; treat this tool as informational modelling, not a substitute for a real dependency scan.",
    ],
  ],
};

export default seo;
