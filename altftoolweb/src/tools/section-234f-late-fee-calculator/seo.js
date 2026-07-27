const seo = {
  intro:
    "This calculator works out the fee payable under section 234F of the Income-tax Act, 1961 when an income tax return is filed after the due date under section 139(1) — Rs 1,000 where total income does not exceed Rs 5,00,000 and Rs 5,000 where it is higher. It also adds simple interest under section 234A at 1% for every month or part of a month of delay on any self-assessment tax still unpaid. It is built for salaried taxpayers, freelancers and small business owners who missed the 31 July deadline and want to know what the belated return will cost before they file.",
  useCases: [
    "A salaried taxpayer with Rs 9 lakh total income who missed 31 July and wants the exact fee before submitting a belated return in September",
    "A student or part-time earner below the basic exemption limit checking whether section 234F applies to them at all",
    "A business owner with unpaid self-assessment tax estimating the combined 234F fee and 234A interest for each extra month of delay",
  ],
  benefits: [
    ["Both fee slabs handled", "Applies the Rs 1,000 cap below Rs 5 lakh of total income and Rs 5,000 above it."],
    ["Interest included", "Adds section 234A interest at 1% per month or part month on outstanding self-assessment tax."],
    ["Exemption limit aware", "No fee is shown when income is below the basic exemption limit and no other filing trigger applies."],
  ],
  faqs: [
    [
      "How much is the late fee for filing ITR after the due date?",
      "Rs 5,000 under section 234F if your total income exceeds Rs 5,00,000, and Rs 1,000 if it does not. The two-tier Rs 5,000 / Rs 10,000 structure that existed earlier was replaced by this single Rs 5,000 ceiling by the Finance Act, 2021, applicable from assessment year 2021-22.",
    ],
    [
      "Do I have to pay section 234F fee if my income is below the taxable limit?",
      "No. Section 234F is triggered only where a return was required under section 139(1), so a person whose total income is below the basic exemption limit normally pays nothing. The exception is the seventh proviso to section 139(1), which makes filing compulsory for high-value transactions such as current account deposits above Rs 1 crore, foreign travel spending above Rs 2 lakh or electricity bills above Rs 1 lakh.",
    ],
    [
      "What is the difference between section 234F and section 234A?",
      "Section 234F is a flat fee for filing late; section 234A is interest at 1% for every month or part of a month on the tax that remains unpaid after the due date. You can owe 234F with zero 234A interest if all your tax was already paid through TDS or advance tax.",
    ],
    [
      "Can the section 234F late fee be waived?",
      "The fee is mandatory and self-computed in the return, so the assessing officer has no general power to waive it, unlike interest under section 220(2) which the Board can reduce in specified cases. If you believe the levy is wrong because a due date was extended by CBDT notification, raise it in a rectification request or speak to a chartered accountant.",
    ],
  ],
};

export default seo;
