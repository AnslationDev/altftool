const seo = {
  title: "NuGet PackageReference & Version Range Builder",
  metaDescription:
    "Compose PackageReference XML with version ranges decoded into plain >= and < bounds, asset flags validated, plus Directory.Packages.props for CPM.",
  steps: [
    "Enter each package id and Version or range — bracket notation like [1.0,2.0) is accepted — with optional PrivateAssets, IncludeAssets and ExcludeAssets; Add package appends rows.",
    "Optionally tick Central Package Management (and Pin transitive dependencies) and set the indent from 0 to 8 spaces.",
    "Click Copy ItemGroup for the .csproj XML — and Copy props for Directory.Packages.props — then read the table decoding what each version range allows.",
  ],
  intro:
    "This builder writes the PackageReference items a .NET project file uses to declare NuGet dependencies, and translates each version range into the interval it really matches. NuGet's interval notation is easy to misread: 1.0 is a minimum, [1.0] is exact, [1.0,2.0) means at least 1.0 and below 2.0, and a square bracket is inclusive while a round bracket is exclusive. It also emits a Directory.Packages.props file when you switch on Central Package Management.",
  useCases: [
    "Adding an analyzer package with PrivateAssets=\"all\" so it never flows to consumers of your own NuGet package",
    "Migrating a solution to Central Package Management by moving every version into Directory.Packages.props and stripping the Version attribute from project files",
    "Checking whether [8.0.0,9.0.0) is the constraint you meant before committing a dependency bump",
  ],
  benefits: [
    ["Range notation decoded", "Every bracketed range is restated as a plain >= and < interval."],
    ["Invalid ranges rejected", "Catches (,), a lower bound above the upper bound, and ranges that can never match."],
    ["Asset flags validated", "Only real NuGet asset groups are accepted, and all cannot be mixed with others."],
  ],
  faqs: [
    [
      "What is the difference between [1.0] and 1.0 in a NuGet version?",
      "1.0 is a minimum version — NuGet may resolve 1.0 or anything higher — whereas [1.0] pins the reference to exactly 1.0 and restore fails if that version is unavailable. Square brackets are inclusive bounds and round brackets are exclusive, so [1.0,2.0) means at least 1.0 and strictly below 2.0.",
    ],
    [
      "What does PrivateAssets=\"all\" do?",
      "It stops the dependency flowing to projects and packages that consume yours: the reference is used while you build, but it is not written into your package's dependency list. It is the standard setting for analyzers, source generators and build-only tooling such as StyleCop.Analyzers.",
    ],
    [
      "How does Central Package Management work?",
      "Set ManagePackageVersionsCentrally to true in a Directory.Packages.props file at the repository root, declare each version once with a PackageVersion item, and remove the Version attribute from every PackageReference. Every project below that directory then resolves the same version, and floating versions are not allowed.",
    ],
    [
      "Should I use floating versions like 6.0.*?",
      "Only when you actively want the newest patch on every restore, and only with a committed lock file, because otherwise two machines can resolve different versions from the same source. For reproducible CI builds pin an explicit version or a bounded range instead.",
    ],
  ],
};

export default seo;
