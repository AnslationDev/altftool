const seo = {
  title: "Apache NOTICE File Generator for Attribution",
  metaDescription:
    "Build an Apache-2.0 section 4(d) NOTICE file — product name, copyright year range and one attribution block per dependency — from pipe-separated lines.",
  steps: [
    "Enter the product name, copyright holder and first/last copyright years, plus an optional 'Developed at' organisation and URL.",
    "List dependencies one per line as 'Name | Copyright holder | URL | required notice text' — only the name is mandatory, and lines starting with # are ignored.",
    "Review the generated NOTICE preview with its attribution-block and total line counts, then click 'Copy NOTICE'.",
  ],
  intro:
    "This generator assembles an Apache-style NOTICE file — product name on line one, a Copyright <years> <owner> line, then one attribution block per bundled dependency — following the format required by section 4(d) of the Apache License 2.0 and the ASF Licensing How-To. It is built for maintainers and release engineers who ship software that bundles Apache-licensed components and must carry their attribution notices forward. Paste your dependency list and get a ready-to-commit NOTICE text.",
  useCases: [
    "Creating the first NOTICE file for a product that bundles Apache-2.0 licensed libraries whose own NOTICE entries must be propagated",
    "Adding an attribution block with required notice text (for example an Underscore.js credit inside lodash) when a new dependency is vendored in",
    "Regenerating the copyright year range and attribution list at release time from a maintained pipe-separated dependency inventory",
  ],
  benefits: [
    ["Correct ASF structure", "Product name, copyright line and 'This product includes software developed at' blocks in the canonical order."],
    ["Batch input", "One pipe-separated line per dependency — name, holder, URL and any required notice text — parsed automatically."],
    ["Attribution only", "Keeps license texts out of NOTICE, matching ASF guidance that NOTICE carries required notices and nothing else."],
  ],
  faqs: [
    [
      "What is a NOTICE file and when do I need one?",
      "A NOTICE file is a plain-text file of required attribution notices that section 4(d) of the Apache License 2.0 obliges you to pass on: if any work you redistribute includes a NOTICE file, your distribution must carry a readable copy of its attribution notices. You need one whenever you ship software bundling Apache-2.0 components that themselves provide a NOTICE file.",
    ],
    [
      "What goes into a NOTICE file and what stays out?",
      "In: the product name, a copyright line such as 'Copyright 2024-2026 Your Company', and the attribution notices required by bundled works. Out: full license texts, the list of every dependency, and anything merely informational — ASF guidance is that NOTICE must be kept to required notices only, because every downstream redistributor is forced to carry whatever you put there.",
    ],
    [
      "Do MIT or BSD licensed dependencies belong in the NOTICE file?",
      "Not usually. MIT and BSD require preservation of their copyright and permission notices, which is normally satisfied by a LICENSE or THIRD-PARTY-LICENSES file rather than NOTICE. The NOTICE mechanism is specific to the Apache License 2.0; putting extra content there imposes obligations on downstream users that those licenses do not demand.",
    ],
    [
      "What is the correct format of the copyright line in a NOTICE file?",
      "The ASF convention is 'Copyright <first year>-<last year> <owner>' on the second line, directly under the product name — for example 'Copyright 2024-2026 The Apache Software Foundation'. Use a single year if the product shipped in only one year, and extend the range whenever a new release year passes.",
    ],
  ],
};

export default seo;
