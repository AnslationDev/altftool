const seo = {
  title: "npm Scripts Builder: Pre/Post Hooks",
  metaDescription:
    "Compose a package.json scripts block with automatic pre/post hooks, run-s/run-p or concurrently combos, and an audit for commands cmd.exe breaks.",
  steps: [
    "List scripts one per line as 'name = command' in the Scripts box — any pre<name> or post<name> entry is detected as a hook npm runs automatically.",
    "Name a combined script, list its member scripts comma separated, choose sequential or parallel execution and pick a Runner: 'npm-run-all (run-s / run-p)', concurrently or plain shell.",
    "Read the generated scripts JSON with its 'Dev dependencies needed' row and Windows cmd.exe warnings, then press 'Copy JSON' to paste into package.json.",
  ],
  intro:
    "This builder composes an npm scripts block with automatic pre/post hooks, combined sequential (run-s, &&) or parallel (run-p, concurrently) runners, and a cross-platform audit based on how npm executes scripts through cmd.exe on Windows. It is for JavaScript developers who want lint-test-build pipelines in package.json that behave identically on macOS, Linux and Windows, and it tells you exactly which devDependencies (npm-run-all, concurrently, cross-env, rimraf) the generated block needs.",
  useCases: [
    "Wiring pretest to run eslint automatically before every npm test without teammates having to remember it",
    "Creating a dev script that runs the API server and the bundler watcher in parallel with concurrently or run-p",
    "Auditing scripts like NODE_ENV=production node app.js or rm -rf dist that silently break for Windows contributors",
  ],
  benefits: [
    ["Hooks explained", "Detects pre/post pairs and shows which scripts npm will chain automatically — and which orphan hooks never fire."],
    ["Parallel done safely", "Generates run-p or concurrently commands instead of the & operator that cmd.exe treats as sequential."],
    ["Windows audit", "Flags inline env vars, rm/cp/mv, single quotes and $VAR expansion with the standard portable fix for each."],
  ],
  faqs: [
    [
      "How do pre and post scripts work in npm?",
      "For any script named X, npm automatically runs preX before it and postX after it whenever you invoke npm run X. So defining pretest = npm run lint makes every npm test run the linter first — no extra tooling needed. Note that pnpm does not run these hooks by default (enable-pre-post-scripts must be set).",
    ],
    [
      "How do I run two npm scripts in parallel?",
      "Use npm-run-all's run-p command (run-p watch:css watch:js) or concurrently (concurrently \"npm:watch:css\" \"npm:watch:js\"). The shell form npm run a & npm run b is not portable — on Windows cmd.exe a single & is a sequential separator, so the second command waits for the first.",
    ],
    [
      "Why does NODE_ENV=production not work on Windows?",
      "Because npm runs scripts through cmd.exe by default, and cmd has no VAR=value prefix syntax — it fails with \"'NODE_ENV' is not recognized\". The standard fix is the cross-env package: cross-env NODE_ENV=production node app.js works in every shell.",
    ],
    [
      "What is the difference between npm-run-all and concurrently?",
      "npm-run-all covers both directions: run-s runs scripts sequentially and run-p in parallel, with glob support like run-p watch:*. concurrently focuses on parallel execution with better output labelling, colouring and kill-others behaviour for long-running dev processes. Many projects use run-s for builds and concurrently for dev servers.",
    ],
  ],
};

export default seo;
