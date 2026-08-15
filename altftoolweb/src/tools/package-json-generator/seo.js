const seo = {
  title: "package.json Generator with Real npm Name",
  metaDescription:
    "Builds a package.json validated by npm's actual rules — lowercase names ≤214 chars, SemVer 2.0.0 — with type, exports map, engines and trap warnings.",
  steps: [
    "Fill 'Package name' and 'Version (SemVer)' — checked against npm's rules (lowercase, URL-safe, ≤214 chars) — plus 'Module type', 'Entry point (main)' and 'License (SPDX)'.",
    "Add scripts one per line as name = command, and tick '\"private\": true', 'Add \"exports\" map' or '\"sideEffects\": false (tree-shaking)' as needed.",
    "The generated file previews with its field count and trap warnings (UNLICENSED, 0.x carets); press 'Copy JSON' to take it.",
  ],
  intro:
    "This generator builds a complete package.json validated against npm's real rules: names must be lowercase, URL-safe and at most 214 characters including the scope, and versions must satisfy Semantic Versioning 2.0.0. It assembles metadata, scripts, the \"type\" field, an exports map, engines and license for developers starting a new Node.js package or tidying an existing manifest — and warns about traps like UNLICENSED public packages and how caret ranges behave on 0.x versions.",
  useCases: [
    "Starting a new ESM library and getting name, exports, type: module and engines right in one pass instead of copying an old manifest",
    "Checking whether a chosen package name is even legal on npm before building a project around it",
    "Preparing a first npm publish and learning that a scoped package needs --access public to go live",
  ],
  benefits: [
    ["Real npm validation", "Name and version are checked with the same rules npm itself enforces, not a loose guess."],
    ["Modern fields included", "Emits type, an exports map and optional sideEffects: false for bundler tree-shaking."],
    ["Trap warnings", "Flags UNLICENSED without private, 0.x caret behaviour, and the deep-import lockout that exports causes."],
  ],
  faqs: [
    [
      "What are the rules for an npm package name?",
      "It must be lowercase, contain only URL-safe characters (letters, digits, hyphens, dots, underscores and tildes), not start with a dot or underscore, and be at most 214 characters including a scope like @org/. Uppercase names were allowed historically but new packages cannot use them.",
    ],
    [
      "What does \"type\": \"module\" do in package.json?",
      "It makes Node.js treat every .js file in the package as an ES module, so import/export work natively and require() is unavailable in those files. Without it the default is commonjs; .mjs and .cjs extensions override the setting either way.",
    ],
    [
      "What is the difference between main and exports in package.json?",
      "main names a single entry file and leaves the whole package open to deep imports; exports is the modern replacement that takes precedence in Node 12.7+ and explicitly maps every importable path. Once you add exports, undeclared subpaths like pkg/lib/util can no longer be imported — declare each one you want public.",
    ],
    [
      "Does the engines field actually block installs on the wrong Node version?",
      "Only sometimes. npm treats engines as a warning unless the user sets engine-strict=true, while pnpm and Yarn enforce it by default and fail the install. It is still worth declaring, both as documentation and for the managers that respect it.",
    ],
  ],
};

export default seo;
