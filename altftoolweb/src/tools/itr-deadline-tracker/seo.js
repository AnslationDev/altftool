const seo = {
  intro:
    "This tracker maps every filing window for one Indian assessment year onto a calendar: the original due date under section 139(1), the belated and revised return cut-off under sections 139(4) and 139(5), and the updated return (ITR-U) deadline under section 139(8A) with the section 140B additional tax that applies in each slab. Choose the assessment year and whether your accounts need a tax audit or a section 92E report, and it returns the exact dates plus how many days are left on each one. It is meant for salaried filers, small business owners and accountants who need to know which door is still open for an old year.",
  useCases: [
    "A salaried filer who missed 31 July wants to know how long the belated return window under section 139(4) stays open before only ITR-U is left.",
    "Someone who forgot to report interest income three years ago wants to see whether the 48-month ITR-U window is still open and what additional tax rate applies now.",
    "An accountant checking a client with a tax audit needs the 31 October due date and the matching belated cut-off for that assessment year.",
  ],
  benefits: [
    [
      "Every window in one view",
      "Original, belated, revised and updated return dates for the same assessment year side by side.",
    ],
    [
      "Section 140B slab shown",
      "See whether filing an updated return today costs 25%, 50%, 60% or 70% additional tax.",
    ],
    [
      "Historic rules respected",
      "Older assessment years get their own dates, including the 30 September audit date and the 31 March belated cut-off used before AY 2021-22.",
    ],
  ],
  faqs: [
    [
      "What is the last date to file a belated income tax return?",
      "31 December of the assessment year, under section 139(4). For income earned in FY 2024-25 (AY 2025-26) that is 31 December 2025. Before AY 2021-22 the window ran to 31 March, the end of the assessment year.",
    ],
    [
      "How many years back can I file an updated return under ITR-U?",
      "Four years. Section 139(8A) allows an updated return within 48 months from the end of the relevant assessment year, raised from 24 months by the Finance Act 2025, so a year ending 31 March 2026 stays open until 31 March 2030.",
    ],
    [
      "How much extra tax do I pay on an ITR-U?",
      "Section 140B charges additional tax on the aggregate of tax and interest due: 25% if the updated return is filed within 12 months of the end of the assessment year, 50% within 24 months, 60% within 36 months and 70% within 48 months. This is on top of the tax, interest and any section 234F fee.",
    ],
    [
      "Can I still revise my return after 31 December?",
      "No. A revised return under section 139(5) must be filed by the same 31 December cut-off as a belated return. After that, a mistake can only be corrected through an updated return under section 139(8A), which cannot reduce your income, cut your tax or create a refund — and where a return is genuinely defective the department may instead issue a notice under section 139(9). Take a chartered accountant's view before choosing a route.",
    ],
  ],
};

export default seo;
