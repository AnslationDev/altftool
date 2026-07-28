const seo = {
  intro:
    "A one-way, or unilateral, NDA places confidentiality obligations on only one side: the party receiving the information. It is the correct structure when a single party is doing the sharing — a startup showing a deck to an investor, a company opening its codebase to a vendor, a manufacturer sending drawings to a supplier. This generator assembles the full draft with the standard architecture: definition of confidential information, four-limb exclusions, permitted disclosures to representatives, a term, a separately stated survival period, return or destruction, and governing law with a named forum.",
  useCases: [
    "Send a supplier or vendor an NDA before sharing drawings, specifications or pricing.",
    "Protect a pitch deck and financial model before a first investor conversation.",
    "Cover a due diligence data room where only the target company is disclosing.",
    "Add a 12-month non-solicitation clause when the other side will meet your engineering team.",
  ],
  benefits: [
    ["Term and survival kept separate", "The agreement can expire in two years while confidentiality runs for five — the generator computes both end dates and flags it if survival is shorter than the term."],
    ["Jurisdiction-aware", "Presets for India, England and Wales, Singapore, Delaware, New York and California, including an Indian stamp duty reminder and a California restraint-of-trade warning."],
    ["Correct clause numbering", "Optional clauses such as residuals, non-solicitation and the US trade secret immunity notice renumber the whole document when toggled."],
  ],
  faqs: [
    [
      "What is the difference between a one-way and a mutual NDA?",
      "A one-way NDA binds only the receiving party, because only one side is disclosing. A mutual NDA binds both, and is used when each party will share confidential information — for example in a joint venture or partnership discussion. Using a mutual NDA when only you are disclosing adds obligations to yourself for no benefit.",
    ],
    [
      "How long should an NDA last?",
      "Two to five years is the usual range for ordinary commercial information, and the survival period is often longer than the term of the agreement itself. Trade secrets are commonly carved out and protected for as long as they remain secret, since a fixed expiry would end protection the law would otherwise give indefinitely.",
    ],
    [
      "What should an NDA never restrict?",
      "Information the receiving party already had, that becomes public without their fault, that they lawfully get from a third party, or that they independently develop. Those four exclusions are standard, and an NDA without them is likely to be read narrowly or resisted. Disclosures required by law or a court also need to be carved out.",
    ],
    [
      "Do I need to stamp an NDA in India?",
      "Agreements in India attract stamp duty under the Indian Stamp Act, 1899 as adapted by the relevant state legislation, and an unstamped or insufficiently stamped agreement can face admissibility problems in evidence. Rates vary by state, so check the applicable schedule before signing. This tool produces a template only and is not legal advice — have a lawyer review it.",
    ],
  ],
};

export default seo;
