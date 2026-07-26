const seo = {
  intro:
    "This calculator tells you what filing your income tax return late actually costs: the Section 234F fee of ₹5,000, or ₹1,000 where total income is up to ₹5,00,000, plus Section 234A interest at 1% per month on any tax still unpaid. If your filing date is past 31 December of the assessment year it also works out the additional tax on an updated return under Section 139(8A). It is built for salaried filers, freelancers and small business owners catching up on a missed deadline.",
  useCases: [
    "A salaried filer who missed the 31 July deadline checking whether the ₹5,000 or the ₹1,000 fee applies to their income level.",
    "A freelancer with ₹45,000 of self-assessment tax outstanding seeing how much 234A interest each extra month of delay adds.",
    "Someone who has already crossed 31 December of the assessment year estimating the 25% additional tax on an ITR-U.",
  ],
  benefits: [
    ["Fee and interest separated", "Shows the flat 234F fee and the month-by-month 234A interest as distinct amounts."],
    ["Correct month counting", "Treats any part of a month as a full month and rounds the tax base down to ₹100 as the rules require."],
    ["Updated return window", "Flags when only an ITR-U is possible and applies the 25/50/60/70% additional tax bands."],
  ],
  faqs: [
    [
      "How much is the late fee for filing a belated return?",
      "Section 234F charges ₹5,000 for a return filed after the due date, reduced to ₹1,000 where total income does not exceed ₹5,00,000. No fee applies if your income is below the basic exemption limit and you were not otherwise required to file.",
    ],
    [
      "What is the last date to file a belated return?",
      "A belated return under Section 139(4) can be filed up to 31 December of the relevant assessment year. After that only an updated return under Section 139(8A) is possible, and it cannot be used to claim a refund or increase a reported loss.",
    ],
    [
      "How is Section 234A interest calculated?",
      "At 1% per month, simple, on the tax still unpaid after TDS and advance tax, from the day after the due date until the return is filed. Any part of a month counts as a whole month and the amount is rounded down to the nearest ₹100.",
    ],
    [
      "Do I lose anything else by filing late?",
      "Yes. Business losses and capital losses cannot be carried forward if the return is belated — only a house-property loss can. Refunds also take longer, and interest on the refund may be reduced for the period of delay.",
    ],
  ],
};

export default seo;
