const seo = {
  title: "Open Source License Chooser: MIT, Apache, GPL, AGPL",
  steps: [
    "Answer question 1 by choosing a copyleft scope, from 'No — anyone may use it in closed-source software (permissive)' up to 'Even SaaS/hosted use must share source (network copyleft)'.",
    "Tick any of the three follow-ups: an express patent grant from contributors, the shortest simplest license text, or waiving everything including attribution.",
    "Read the recommended license (MIT, Apache-2.0, MPL-2.0, GPL-3.0, AGPL-3.0 …) with clause-level reasons under 'Why this license', then hit 'Copy result'.",
  ],
  intro:
    "This tool recommends an open source license — MIT, ISC, BSD-3-Clause, Apache-2.0, MPL-2.0, LGPL-3.0, GPL-3.0, AGPL-3.0, the Unlicense or CC0 — from four questions about copyleft scope, patent protection, simplicity and public-domain intent. The logic encodes each license's actual terms: MPL-2.0's file-level copyleft (§3.3), LGPL-3.0's linking exception (§4), AGPL-3.0's network clause (§13) and Apache-2.0's express patent grant (§3).",
  useCases: [
    "Pick a license for a new library where you want wide adoption but are unsure whether the Apache patent grant is worth its extra length over MIT.",
    "Decide between GPL-3.0 and AGPL-3.0 for a server application you do not want cloud providers to host as a closed service.",
    "Choose a middle-ground license like MPL-2.0 when you want your files to stay open without forcing the whole downstream product open.",
  ],
  benefits: [
    ["Terms, not vibes", "Every recommendation cites the specific clause that drives it — copyleft scope, patent grant, network trigger."],
    ["Full spectrum", "Covers permissive, file-level, library, strong and network copyleft, plus public-domain dedications."],
    ["Trade-offs surfaced", "Warnings flag real conflicts, like wanting a patent grant from CC0, which expressly reserves patent rights."],
  ],
  faqs: [
    [
      "What is the difference between MIT and Apache 2.0?",
      "Both are permissive, but Apache-2.0 adds an express patent license from every contributor (section 3) that terminates if the user sues over the project, plus a requirement to state significant changes. MIT is about 170 words with a single obligation — keep the notice — but grants no explicit patent rights.",
    ],
    [
      "When should I use the AGPL instead of the GPL?",
      "Use AGPL-3.0 when your software is likely to be run as a hosted service: its section 13 requires anyone who lets users interact with a modified version over a network to offer them the source. Plain GPL-3.0 obligations trigger only on distribution, so a SaaS operator can modify GPL code privately without sharing.",
    ],
    [
      "What does file-level copyleft in the MPL 2.0 mean?",
      "MPL-2.0 keeps copyleft at the boundary of individual files: any file you modify that carries the MPL header must be made available under MPL (section 3.3), but you may combine those files with proprietary code in a larger work. It is the common middle ground between MIT-style permissive and LGPL.",
    ],
    [
      "Can I just put my code in the public domain?",
      "You can dedicate it with the Unlicense or CC0-1.0, which impose no conditions at all — not even attribution. Two caveats: some jurisdictions do not recognise public-domain dedication (both licenses include fallback grants for that), and CC0 section 4(a) expressly does not waive the author's patent rights, so projects needing patent safety usually prefer Apache-2.0.",
    ],
  ],
};

export default seo;
