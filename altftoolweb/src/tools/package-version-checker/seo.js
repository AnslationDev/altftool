const seo = {
  title: "NPM Version Checker — Check Latest Version",
  h1: "NPM Package Version Checker",
  metaDescription:
    "Look up the latest published version of any npm package, including scoped ones, plus its last-updated date, author, and docs link. Free, no signup.",
  intro:
    "The Package Version Checker queries the public npm registry API (registry.npmjs.org) directly from your browser and reads the package's dist-tags.latest field — the exact version npm resolves to when you run npm install without a version range. Along with the version number it returns the package description, the registry's last-modified date, the author name recorded in the package metadata, and a link to the project homepage or docs when the package declares one. Scoped names like @angular/core work because the package name is URL-encoded before the request, and every lookup retries up to three times with a short backoff so a dropped connection doesn't come back as a false \"not found\".",
  useCases: [
    "Confirming the current latest version of a dependency before pinning it in package.json",
    "Checking whether a package still looks maintained — the last-updated date and author come back with the version",
    "Looking up a version number from a phone, a browser, or any machine where you can't run npm view",
  ],
  benefits: [
    [
      "Reads the same field npm does",
      "The version comes from dist-tags.latest in the registry metadata — the same value npm view <package> version returns, not a scraped or cached number.",
    ],
    [
      "Scoped packages included",
      "@angular/core, @types/node and other scoped names are URL-encoded before the request, so they resolve exactly like unscoped ones.",
    ],
    [
      "Retries instead of failing",
      "Each lookup makes up to three attempts with a 0.5s then 1s backoff, so a flaky connection doesn't surface a false \"package not found\".",
    ],
    [
      "No install, no signup",
      "The request goes from your browser straight to the public registry — no npm login, no package.json upload, and no account.",
    ],
  ],
  faqs: [
    [
      "How do I check the latest version of an npm package?",
      "Type the package name and press Check Version. The tool requests registry.npmjs.org/<package> and reads dist-tags.latest — the same version npm view react version reports and the version npm install react would resolve to.",
    ],
    [
      "Is the version number live or cached?",
      "Live. Every check fires a fresh request to the npm registry when you press the button, so the result reflects the current dist-tags.latest at that moment rather than a number stored in this page.",
    ],
    [
      "Does the package version checker work with scoped packages like @angular/core?",
      "Yes. Enter the full scoped name including the @ and the slash — the name is URL-encoded before it's sent, so @angular/core and @types/node resolve the same way unscoped packages do.",
    ],
    [
      "Can I check PyPI, Maven, or NuGet versions here?",
      "No. This checker queries the npm registry only, so Python, Java, and .NET package names won't resolve. Use it for anything published to npmjs.com, including scoped and monorepo packages.",
    ],
    [
      "Does it show the full version history or older releases?",
      "No — it returns the single latest published version, plus the description, last-updated date, author, and homepage link. For every published release, run npm view <package> versions in a terminal.",
    ],
    [
      "Why do I get \"Package not found or registry unavailable\"?",
      "That appears after three failed attempts, usually because of a typo or a package that is unpublished or private. Note that the name you type is lowercased before the lookup, so a legacy package published with capital letters is checked in its all-lowercase form — read the returned description to confirm it's the package you meant.",
    ],
    [
      "What does the \"Last Updated\" date mean?",
      "It's the registry's time.modified value for the package — the last time its metadata changed, which is normally the most recent publish. It's a quick signal of whether a dependency is still being released.",
    ],
    [
      "Is the Package Version Checker free?",
      "Yes — free, no account, and no npm login. The only thing sent anywhere is the package name you type, and it goes to the public npm registry; nothing is stored on AltFTool.",
    ],
  ],
  steps: [
    "Type an npm package name — react, lodash, or a scoped name like @angular/core.",
    "Press Check Version to query the npm registry live.",
    "Read the latest version, last-updated date, author, and docs link in the result card.",
  ],
};

export default seo;
