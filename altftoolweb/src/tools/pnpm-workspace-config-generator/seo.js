const seo = {
  intro:
    "This tool generates a valid pnpm-workspace.yaml — the root file that tells pnpm which directories are workspace packages and, since pnpm 9.5, which dependency versions live in shared catalogs. It emits the packages glob list (including ! exclusions), a default catalog and an optional named catalog, plus the exact catalog: reference snippet for a package.json. Monorepo maintainers get a copy-paste config that keeps every package on the same dependency versions.",
  useCases: [
    "Setting up a new monorepo with apps/* and packages/* globs and a shared catalog pinning react and typescript once for every package",
    "Adding a catalog to an existing pnpm workspace so 30 package.json files stop drifting to different versions of the same dependency",
    "Creating a named catalog like react17 so a legacy app can stay on an older major while the rest of the workspace moves on",
  ],
  benefits: [
    ["Valid globs, quoted right", "Wildcard globs are quoted so YAML parses them as strings, and exclusions get the leading ! pnpm expects."],
    ["Catalog syntax checked", "Every entry is validated as a real npm package name plus a usable version range before it lands in the file."],
    ["Usage snippet included", "Shows the catalog: and catalog:<name> protocol lines to paste into a package.json dependencies block."],
  ],
  faqs: [
    [
      "What goes in pnpm-workspace.yaml?",
      "At minimum a packages key: a list of directory globs such as apps/* and packages/* that mark workspace members, with ! prefixes to exclude paths like test folders. The same file can also hold catalog (default) and catalogs (named) maps of dependency versions, and in pnpm 10 it absorbed many settings that previously lived under pnpm in package.json.",
    ],
    [
      "What is a pnpm catalog and which version supports it?",
      "A catalog is a workspace-level map of dependency name to version range, defined in pnpm-workspace.yaml and referenced from any package.json as \"catalog:\" (default) or \"catalog:name\" (named). Catalogs shipped in pnpm 9.5.0, so older pnpm versions ignore the field and the catalog: protocol will fail to resolve.",
    ],
    [
      "How do I exclude a folder from a pnpm workspace?",
      "Add a glob prefixed with ! to the packages list, for example \"!**/test/**\" — pnpm applies includes first, then removes anything matching the negated globs. This is the documented way to keep fixtures or example apps from being treated as workspace packages.",
    ],
    [
      "Do pnpm workspaces need a tool like Turborepo or Nx?",
      "Not for linking and installs — pnpm alone resolves workspace: and catalog: protocols and runs scripts topologically with pnpm -r and --filter. What pnpm does not provide is task-output caching or affected-only builds, which is why larger monorepos commonly layer Turborepo or Nx on top of the pnpm workspace this file defines.",
    ],
  ],
};

export default seo;
