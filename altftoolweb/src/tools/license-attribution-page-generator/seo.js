const seo = {
  title: "Third-Party License Attribution Page Generator",
  metaDescription:
    "Paste dependency lines like react@19.0.0 MIT and get a third-party licenses page grouped by SPDX license, as Markdown, an HTML fragment or plain text.",
  steps: [
    "Paste your dependency list into the 'Dependency manifest — one per line' box as name@version license, name version license or pipe-separated lines (lines starting with # are ignored), and set the Project / product name.",
    "Pick Markdown, HTML fragment or Plain text under Output format; the page regenerates live, grouping components by SPDX license and classifying each as permissive, weak copyleft or strong copyleft.",
    "Check the Components, Distinct licenses, Copyleft components and Unrecognised licenses counts, then press Copy page to copy the finished third-party licenses page.",
  ],
  intro:
    "This generator converts a dependency manifest into a ready-to-publish third-party licenses page, grouping components by SPDX license and labelling each license as permissive, weak copyleft, strong copyleft or public-domain equivalent. It exists because MIT, BSD, ISC and Apache-2.0 all require the copyright and permission notices of bundled components to be preserved in distributions. Paste lines like react@19.0.0 MIT and export the page as Markdown, an HTML fragment or plain text.",
  useCases: [
    "Publishing an open-source acknowledgements page for a web or mobile app before a store release review asks for one",
    "Auditing a pasted npm dependency list to spot GPL or AGPL components that a proprietary product cannot safely bundle",
    "Regenerating the third-party licenses page at each release from a pipe-separated inventory kept in the repository",
  ],
  benefits: [
    ["License classification", "Each license is tagged permissive, weak copyleft, strong copyleft or public-domain using the standard SPDX grouping."],
    ["Flexible input", "Accepts name@version license, space-separated and pipe-separated manifest lines, including scoped npm packages."],
    ["Three output formats", "Markdown for docs sites, an escaped HTML fragment for web pages, or plain text for an in-app screen."],
  ],
  faqs: [
    [
      "Do I have to publish a third-party licenses page for MIT dependencies?",
      "Yes, in substance: the MIT license requires that its copyright notice and permission notice 'be included in all copies or substantial portions of the Software'. A third-party licenses page, an about screen or a bundled THIRD-PARTY-LICENSES file are all accepted ways of meeting that requirement when you distribute an app that includes MIT code.",
    ],
    [
      "What is the difference between permissive and copyleft licenses?",
      "Permissive licenses (MIT, BSD, ISC, Apache-2.0) only require attribution and notice preservation. Weak copyleft (MPL-2.0, LGPL) requires changes to the licensed component itself to remain open. Strong copyleft (GPL, AGPL) requires the entire combined work to be released under the same license, which is why GPL dependencies are usually barred from proprietary browser bundles.",
    ],
    [
      "Where do I get the dependency list to paste in?",
      "For npm projects, license-checker or 'npm ls --all' style output reduces to name@version plus license; for Python, pip-licenses prints name, version and license columns. Any output that puts one dependency per line in name version license order parses directly, and a pipe-separated form lets you add a project URL per component.",
    ],
    [
      "Does a website need to show licenses for server-side dependencies?",
      "Generally no. Most license obligations, including MIT and Apache-2.0 notice preservation, trigger on distribution of the software, and running code on your own server is not distribution. The AGPL is the notable exception: it extends source obligations to network use. Client-side JavaScript shipped to the browser is distributed, so its notices should be preserved — confirm specifics with a lawyer.",
    ],
  ],
};

export default seo;
