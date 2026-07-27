const seo = {
  intro:
    "This tool generates the files that set up Yarn workspaces: a root package.json with private: true and workspace globs, the object-form nohoist rules Yarn 1 requires, or a .yarnrc.yml with nodeLinker and nmHoistingLimits plus a Yarn 4 constraints file for Berry. It encodes the documented differences between Yarn Classic and Yarn Berry so you get config that your Yarn version actually understands. Monorepo maintainers get a correct starting point instead of piecing rules together from two generations of docs.",
  useCases: [
    "A React Native team on Yarn 1 adding **/react-native nohoist patterns so Metro can find unhoisted native packages",
    "A team migrating to Yarn 4 choosing between the pnp, pnpm and node-modules linkers and generating the matching .yarnrc.yml",
    "A platform engineer adding a yarn.config.cjs constraints hook that forces every workspace onto the same dependency versions",
  ],
  benefits: [
    ["Version-aware output", "Yarn 1 gets the object-form workspaces field with nohoist; Berry gets .yarnrc.yml settings — never an invalid mix."],
    ["Real constraints code", "The generated yarn.config.cjs uses the Yarn 4 constraints({Yarn}) API to align dependency ranges across workspaces."],
    ["Hoisting explained", "nmHoistingLimits is emitted only for the node-modules linker, with notes on why it was included or dropped."],
  ],
  faqs: [
    [
      "How do I set up Yarn workspaces in package.json?",
      "Add \"private\": true and a \"workspaces\" array of globs — for example [\"apps/*\", \"packages/*\"] — to the root package.json, then run yarn install. Yarn refuses to enable workspaces on a non-private root package, and each workspace is a folder with its own package.json matching one of the globs.",
    ],
    [
      "Does nohoist work in Yarn 2, 3 or 4?",
      "No — nohoist is a Yarn 1 (Classic) feature using the object form of the workspaces field. Yarn Berry replaced it with nmHoistingLimits in .yarnrc.yml, which with the node-modules linker can be set to workspaces or dependencies to stop packages being hoisted to the root.",
    ],
    [
      "What is nodeLinker in .yarnrc.yml and which should I pick?",
      "nodeLinker chooses how Yarn Berry lays out installed packages: pnp (Plug'n'Play, no node_modules, strictest and fastest), pnpm (content-addressed store with symlinks) or node-modules (classic npm-style layout with maximum compatibility). Teams with tooling that cannot resolve PnP typically choose node-modules; greenfield TypeScript projects often run pnp.",
    ],
    [
      "How do Yarn constraints keep dependency versions consistent?",
      "Yarn 4 runs the constraints hook exported from yarn.config.cjs against every workspace; the hook can inspect Yarn.dependencies() and call dep.update() to align ranges, and yarn constraints --fix rewrites the offending package.json files. Yarn 2 and 3 used a Prolog constraints.pro file for the same job, which Yarn 4 replaced with the JavaScript API.",
    ],
  ],
};

export default seo;
