const seo = {
  title: "ITR-U: Section 139(8A) Bars and Section 140B Cost",
  metaDescription:
    "Check the twelve section 139(8A) bars, get the 24- or 48-month deadline, and price the return: tax, 234A/234B interest, 234F fee and 140B tax.",
  steps: [
    "In \"Step 1 — the section 139(8A) bars\" tick anything that is true of your year; a single tick closes the door, because the provisos are absolute rather than weighed against each other.",
    "In \"Step 2 — the year and the filing date\" pick the assessment year, the date the ITR-U would be furnished, which section 139(1) due date applied and whether a return was already filed; in \"Step 3 — the money\" enter the tax due, the total income and any section 234C interest already worked out.",
    "Read the verdict — either the bar with the proviso that produced it, or the deadline with days left, the section 140B(3) slab of 25%, 50%, 60% or 70% and the total payable itemised down to the section 234F fee — then press Copy result.",
  ],
  intro:
    "This page answers two questions about an updated Indian income tax return: whether section 139(8A) lets you file ITR-U for a given assessment year at all, and what section 140B makes it cost. It runs the statutory bars first, because for a large share of people the honest answer is no — an updated return cannot reduce the tax already determined, cannot create or increase a refund, cannot be a return of a loss, and cannot be filed where a search under section 132, a survey under section 133A, a pending or completed assessment, or Chapter XXII prosecution touches that year. If nothing bars you, it names which form of section 139(8A) governs the year (the 24-month window as enacted by the Finance Act 2022, or the 48-month window substituted by the Finance Act 2025 with effect from 1 April 2025), gives the exact deadline date, and adds up the tax, the section 234A and 234B interest at 1% per month or part month, the section 234C interest you enter, the section 234F fee and the section 140B(3) additional tax of 25%, 50%, 60% or 70%. It is built for people who missed income on an old return and for the accountants who have to price the fix.",
  useCases: [
    "Someone who forgot to report ₹4 lakh of freelance income in FY 2022-23 wants the exact rupee figure that has to be paid before an ITR-U for AY 2023-24 can be furnished.",
    "A taxpayer who overpaid and hopes an updated return will bring a refund needs to see the first proviso to section 139(8A) close that door before spending time on the form.",
    "An accountant checking an AY 2020-21 file wants confirmation that the year stayed on the pre-Finance-Act-2025 24-month rule and shut on 31 March 2023, rather than gaining the 48-month extension.",
  ],
  benefits: [
    [
      "The bars come first",
      "Twelve statutory bars from the provisos to section 139(8A), each labelled with the exact proviso that produces it, checked before any arithmetic runs.",
    ],
    [
      "Says which window applies",
      "Names whether the assessment year sits in the 24-month window as enacted by the Finance Act 2022 or the 48-month window substituted by the Finance Act 2025, and gives the deadline date.",
    ],
    [
      "Full section 140B bill",
      "Tax, 234A and 234B interest at 1% a month, 234C as entered, the 234F fee and the 25% / 50% / 60% / 70% additional tax, itemised and totalled.",
    ],
  ],
  faqs: [
    [
      "Can I file ITR-U to claim a refund or reduce my tax?",
      "No. The first proviso to section 139(8A) bars an updated return in three cases: where it is a return of a loss, where it has the effect of decreasing the total tax liability determined on the return already filed under section 139(1), 139(4) or 139(5), and where it results in a refund or increases the refund due on that return. An updated return can only move the tax figure upward.",
    ],
    [
      "How many years back can ITR-U be filed?",
      "Forty-eight months from the end of the relevant assessment year. The Finance Act 2025 substituted forty-eight months for twenty-four in section 139(8A) with effect from 1 April 2025, so AY 2021-22 runs to 31 March 2026, AY 2022-23 to 31 March 2027 and AY 2023-24 to 31 March 2028. AY 2020-21 is the exception: its 48-month period would have ended on 31 March 2025, one day before the amendment took effect, so it stayed on the old 24-month rule and closed on 31 March 2023.",
    ],
    [
      "How much extra tax does an ITR-U cost?",
      "Section 140B(3) charges additional income-tax on the aggregate of tax and interest payable: 25% if the return is furnished within 12 months of the end of the assessment year, 50% within 24 months, 60% within 36 months and 70% within 48 months, the last two tiers having been added by the Finance Act 2025. On ₹50,000 of tax plus ₹38,000 of section 234A and 234B interest, furnished 28 months after the end of the assessment year, that is 60% of ₹88,000, or ₹52,800 — with the ₹5,000 section 234F fee on top, giving ₹1,45,800 in all.",
    ],
    [
      "Does a search or survey stop me from filing an updated return?",
      "Yes. Under the second proviso to section 139(8A), an updated return cannot be furnished where a search was initiated under section 132, books or assets were requisitioned under section 132A, or a survey was conducted under section 133A other than a section 133A(2A) TDS survey. The bar covers the assessment year relevant to the previous year in which that action happened and every assessment year before it. The third proviso adds further bars, including a pending or completed assessment, reassessment, recomputation or revision, and prosecution proceedings under Chapter XXII.",
    ],
  ],
};

export default seo;
