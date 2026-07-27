/**
 * Open source license chooser.
 *
 * License facts below are drawn from the license texts themselves (SPDX ids)
 * and the summaries maintained by the Open Source Initiative and
 * choosealicense.com. Key distinctions encoded:
 * - Copyleft scope: none (permissive) / file (MPL-2.0 §3.3) / library
 *   (LGPL-3.0 §4 combined works) / strong (GPL-3.0 §5) / network
 *   (AGPL-3.0 §13 "Remote Network Interaction").
 * - Express patent grant: Apache-2.0 §3, MPL-2.0 §2.1(b), and GPL/LGPL/AGPL
 *   v3 §11 include one; MIT, BSD and ISC do not (any grant is implied at
 *   best); CC0 §4(a) and the Unlicense expressly grant or address no patent
 *   rights.
 * - GPL compatibility: Apache-2.0 is one-way compatible with GPLv3 but NOT
 *   GPLv2 (FSF license list).
 *
 * This module is informational — it encodes the common selection logic, not
 * legal advice.
 */

export const COPYLEFT_OPTIONS = [
  { id: "none", label: "No — anyone may use it in closed-source software (permissive)" },
  { id: "file", label: "Only changes to my files must stay open (file-level copyleft)" },
  { id: "library", label: "The library itself stays open, but apps may link to it (LGPL-style)" },
  { id: "strong", label: "Any distributed derivative must be open source (strong copyleft)" },
  { id: "network", label: "Even SaaS/hosted use must share source (network copyleft)" },
];

export const LICENSES = [
  {
    id: "MIT",
    name: "MIT License",
    copyleft: "none",
    patentGrant: false,
    approxWords: 170, // license text length, a proxy for simplicity
    conditions: ["Keep the copyright and license notice"],
    notes: "The most widely used permissive license; no express patent grant.",
  },
  {
    id: "ISC",
    name: "ISC License",
    copyleft: "none",
    patentGrant: false,
    approxWords: 120,
    conditions: ["Keep the copyright and license notice"],
    notes: "Functionally equivalent to MIT with simpler wording; default for npm scaffolding.",
  },
  {
    id: "BSD-3-Clause",
    name: "BSD 3-Clause License",
    copyleft: "none",
    patentGrant: false,
    approxWords: 220,
    conditions: [
      "Keep the copyright and license notice",
      "No use of contributor names for endorsement (clause 3)",
    ],
    notes: "MIT-like, plus an explicit non-endorsement clause.",
  },
  {
    id: "Apache-2.0",
    name: "Apache License 2.0",
    copyleft: "none",
    patentGrant: true,
    approxWords: 1580,
    conditions: [
      "Keep license and NOTICE files",
      "State significant changes you made (§4b)",
      "Patent grant terminates if you sue over the covered work (§3)",
    ],
    notes:
      "Permissive with an express patent grant and retaliation clause; compatible with GPLv3 but not GPLv2.",
  },
  {
    id: "MPL-2.0",
    name: "Mozilla Public License 2.0",
    copyleft: "file",
    patentGrant: true,
    approxWords: 2300,
    conditions: [
      "Modified MPL-licensed FILES must be published under MPL (§3.3)",
      "Larger works may combine MPL and proprietary files",
    ],
    notes: "File-level copyleft middle ground with a patent grant (§2.1b).",
  },
  {
    id: "LGPL-3.0",
    name: "GNU Lesser General Public License v3.0",
    copyleft: "library",
    patentGrant: true,
    approxWords: 1300, // plus incorporated GPLv3 terms
    conditions: [
      "Changes to the library itself must be shared",
      "Applications may link to it without becoming LGPL (§4)",
      "Users must be able to relink against a modified library",
    ],
    notes: "Copyleft for the library, permissive for applications that link to it.",
  },
  {
    id: "GPL-3.0",
    name: "GNU General Public License v3.0",
    copyleft: "strong",
    patentGrant: true,
    approxWords: 5600,
    conditions: [
      "Distributed derivatives must be GPL-3.0 with full source (§5)",
      "Express patent grant (§11) and anti-tivoization terms (§6)",
    ],
    notes: "Strong copyleft: the whole distributed program must stay free software.",
  },
  {
    id: "AGPL-3.0",
    name: "GNU Affero General Public License v3.0",
    copyleft: "network",
    patentGrant: true,
    approxWords: 5900,
    conditions: [
      "Everything GPL-3.0 requires",
      "Users interacting over a network must be offered the source (§13)",
    ],
    notes: "Closes the SaaS loophole: hosting a modified version triggers the source obligation.",
  },
  {
    id: "Unlicense",
    name: "The Unlicense",
    copyleft: "none",
    patentGrant: false,
    approxWords: 200,
    conditions: [],
    notes: "Public-domain dedication with a fallback license; no conditions at all.",
  },
  {
    id: "CC0-1.0",
    name: "CC0 1.0 Universal",
    copyleft: "none",
    patentGrant: false,
    approxWords: 1100,
    conditions: [],
    notes:
      "Thorough public-domain dedication; §4(a) expressly does NOT waive the author's patent rights.",
  },
];

/** Look up a license by SPDX id. */
export function getLicense(id) {
  return LICENSES.find((l) => l.id === id) ?? null;
}

/**
 * Recommend a license from four answers.
 *
 * @param {object} answers
 * @param {"none"|"file"|"library"|"strong"|"network"} answers.copyleft
 * @param {boolean} [answers.patentGrant=false]  Need an express patent grant.
 * @param {boolean} [answers.simplicity=false]   Prefer the shortest workable text.
 * @param {boolean} [answers.publicDomain=false] Waive everything, even attribution.
 * @returns {object} { recommended, alternatives, reasons, warnings } or { error }.
 */
export function chooseLicense({
  copyleft,
  patentGrant = false,
  simplicity = false,
  publicDomain = false,
} = {}) {
  if (!COPYLEFT_OPTIONS.some((o) => o.id === copyleft)) {
    return { error: "Choose how much copyleft you want." };
  }
  if (publicDomain && copyleft !== "none") {
    return {
      error:
        "Contradictory answers: a public-domain dedication imposes no conditions, so it cannot enforce copyleft. Pick one or the other.",
    };
  }

  const reasons = [];
  const warnings = [];
  let recommendedId;
  let alternativeIds = [];

  if (copyleft === "network") {
    recommendedId = "AGPL-3.0";
    alternativeIds = ["GPL-3.0"];
    reasons.push(
      "Only AGPL-3.0 extends copyleft to network use: §13 obliges anyone running a modified version as a service to offer users the source.",
    );
  } else if (copyleft === "strong") {
    recommendedId = "GPL-3.0";
    alternativeIds = ["AGPL-3.0"];
    reasons.push(
      "GPL-3.0 §5 requires every distributed derivative to carry the same license with full source — the classic strong copyleft.",
    );
    reasons.push("If SaaS use without sharing source worries you, step up to AGPL-3.0.");
  } else if (copyleft === "library") {
    recommendedId = "LGPL-3.0";
    alternativeIds = ["MPL-2.0", "GPL-3.0"];
    reasons.push(
      "LGPL-3.0 keeps the library itself copyleft while §4 lets proprietary applications link against it — the standard choice for libraries that want adoption plus shared improvements.",
    );
  } else if (copyleft === "file") {
    recommendedId = "MPL-2.0";
    alternativeIds = ["LGPL-3.0"];
    reasons.push(
      "MPL-2.0 §3.3 keeps copyleft at the file boundary: modified MPL files must be published, but they can ship inside a larger proprietary work.",
    );
  } else if (publicDomain) {
    recommendedId = "Unlicense";
    alternativeIds = ["CC0-1.0", "MIT"];
    reasons.push(
      "The Unlicense dedicates the work to the public domain with a permissive fallback for jurisdictions that do not recognise dedication; CC0-1.0 is the more rigorously drafted alternative.",
    );
    if (patentGrant) {
      warnings.push(
        "Neither the Unlicense nor CC0 grants patent rights — CC0 §4(a) expressly reserves them. If an express patent grant matters, use Apache-2.0 instead of a public-domain dedication.",
      );
    }
  } else if (patentGrant) {
    recommendedId = "Apache-2.0";
    alternativeIds = ["MIT", "BSD-3-Clause"];
    reasons.push(
      "Apache-2.0 §3 gives every user an express, irrevocable patent license from each contributor, with termination if they sue — the protection MIT and BSD only arguably imply.",
    );
    if (simplicity) {
      warnings.push(
        "Apache-2.0 is ~1,600 words with NOTICE-file mechanics; the patent grant is what you pay the extra length for.",
      );
    }
  } else {
    recommendedId = simplicity ? "ISC" : "MIT";
    alternativeIds = simplicity ? ["MIT", "BSD-3-Clause"] : ["ISC", "BSD-3-Clause", "Apache-2.0"];
    reasons.push(
      simplicity
        ? "ISC is the shortest OSI-approved permissive license that still requires attribution — functionally identical to MIT."
        : "MIT is the most widely used and best understood permissive license: one obligation (keep the notice), maximal compatibility.",
    );
    reasons.push(
      "If your project is patent-adjacent (codecs, ML, protocols), consider Apache-2.0 for its express patent grant.",
    );
  }

  const recommended = getLicense(recommendedId);
  const alternatives = alternativeIds.map(getLicense).filter(Boolean);

  return { recommended, alternatives, reasons, warnings };
}
