const seo = {
  title: "License Header Generator: 9 Licenses, SPDX Line",
  steps: [
    "Pick a License from the nine SPDX options — MIT, Apache-2.0, GPL-3.0-or-later, AGPL-3.0-or-later, LGPL-3.0-or-later, MPL-2.0, BSD-3-Clause, ISC or Unlicense — and a 'Language / comment style' such as 'Python / Shell / Ruby / YAML / TOML (#)'.",
    "Type the 'Copyright year or range' (2026 or 2020-2026) and the Copyright holder, and leave 'Include an SPDX-License-Identifier line (REUSE specification style)' ticked; the header regenerates on every keystroke.",
    "The Generated header panel shows the wrapped comment above rows for License, SPDX identifier, Header lines and Header wording ('Official per-file header text' or 'REUSE-style copyright + SPDX line') — press 'Copy header' to paste it into your file.",
  ],
  intro:
    "This generator produces the per-file license header comment for a chosen license, language and copyright holder, including the SPDX-License-Identifier line recommended by the REUSE specification. It covers nine common licenses — MIT, Apache-2.0, the GPL/LGPL/AGPL v3 family, MPL-2.0, BSD-3-Clause, ISC and the Unlicense — using each license's own official 'how to apply' header wording where one exists. It is built for developers who need consistent, correctly worded headers across JavaScript, Python, C, HTML, SQL and other comment syntaxes.",
  useCases: [
    "Adding the official Apache-2.0 boilerplate header to every source file in a new open source project",
    "Converting a codebase to REUSE compliance by stamping SPDX-License-Identifier lines in the right comment style per file type",
    "Generating a GPL-3.0-or-later header with the correct copyright year range when open-sourcing an internal library",
  ],
  benefits: [
    ["Official wording", "Uses each license's own appendix text (Apache-2.0, GPL family, MPL-2.0 Exhibit A) rather than paraphrases."],
    ["Ten comment styles", "Outputs //, #, --, ;;, %, block /* */ and <!-- --> comments so the header parses in any language."],
    ["SPDX / REUSE ready", "Adds the machine-readable SPDX-License-Identifier line that license scanners look for."],
  ],
  faqs: [
    [
      "What is an SPDX-License-Identifier line?",
      "It is a single machine-readable comment, such as // SPDX-License-Identifier: MIT, that states the file's license using an identifier from the SPDX license list. License scanners, the REUSE tool and the Linux kernel all rely on it, and the REUSE specification recommends pairing it with an SPDX-FileCopyrightText or copyright line in every file.",
    ],
    [
      "Does the MIT license require a header in every file?",
      "No. MIT only requires that the copyright notice and permission notice be included in copies of the software, which a LICENSE file at the repository root satisfies. Per-file headers are still good practice because files get copied out of context, and a one-line SPDX identifier plus a copyright line is the widely used minimal form.",
    ],
    [
      "Which licenses have an official per-file header text?",
      "Apache-2.0 (its appendix), the GNU GPL, LGPL and AGPL (their 'How to Apply These Terms' sections) and MPL-2.0 (Exhibit A) each publish exact header wording. MIT, BSD, ISC and the Unlicense do not, so for those the standard practice is a copyright line plus the SPDX identifier.",
    ],
    [
      "Should the copyright year be a single year or a range?",
      "Use the year of first publication, and extend it to a range like 2020-2026 when the file has been modified in later years. The year does not affect the license's validity — copyright arises automatically — but an accurate notice helps establish the protection timeline; consult a lawyer for jurisdiction-specific questions.",
    ],
  ],
};

export default seo;
